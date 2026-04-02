import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- BATTERY ---
  app.get("/api/system/battery", async (req, res) => {
    try {
      const powerSupplyDir = "/sys/class/power_supply/";
      if (!fs.existsSync(powerSupplyDir)) return res.status(404).json({ error: "No battery found" });
      const supplies = fs.readdirSync(powerSupplyDir);
      const batDir = supplies.find(dir => dir.startsWith("BAT"));
      if (!batDir) return res.status(404).json({ error: "No battery found" });

      const capacity = fs.readFileSync(path.join(powerSupplyDir, batDir, "capacity"), "utf-8").trim();
      const status = fs.readFileSync(path.join(powerSupplyDir, batDir, "status"), "utf-8").trim();
      res.json({ capacity: parseInt(capacity, 10), status, device: batDir });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- WI-FI ---
  app.get("/api/system/wifi", async (req, res) => {
    try {
      const { stdout } = await execAsync("nmcli -t -f SSID,SIGNAL,SECURITY dev wifi");
      const networks = stdout.split("\n").filter(l => l.trim() !== "").map(line => {
        const [ssid, signal, security] = line.split(":");
        return { ssid, signal: parseInt(signal, 10), security };
      }).filter(n => n.ssid && n.ssid !== "--").reduce((acc, curr) => acc.find((i: any) => i.ssid === curr.ssid) ? acc : [...acc, curr], [] as any[]);
      res.json({ networks });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post("/api/system/wifi/connect", async (req, res) => {
    try {
      const { ssid, password } = req.body;
      const cmd = password ? `nmcli dev wifi connect "${ssid}" password "${password}"` : `nmcli dev wifi connect "${ssid}"`;
      const { stdout } = await execAsync(cmd);
      res.json({ success: true, output: stdout });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- AUDIO (Pipewire/Wireplumber) ---
  app.get("/api/system/audio", async (req, res) => {
    try {
      const { stdout } = await execAsync("wpctl get-volume @DEFAULT_AUDIO_SINK@");
      const match = stdout.match(/Volume:\s+([\d.]+)/);
      const isMuted = stdout.includes("[MUTED]");
      res.json({ volume: match ? Math.round(parseFloat(match[1]) * 100) : 0, muted: isMuted });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post("/api/system/audio", async (req, res) => {
    try {
      const { volume } = req.body;
      await execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${volume / 100}`);
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- SYSTEM INFO ---
  app.get("/api/system/info", async (req, res) => {
    try {
      const cpuinfo = fs.existsSync("/proc/cpuinfo") ? fs.readFileSync("/proc/cpuinfo", "utf-8") : "";
      const meminfo = fs.existsSync("/proc/meminfo") ? fs.readFileSync("/proc/meminfo", "utf-8") : "";
      
      const cpuMatch = cpuinfo.match(/model name\s+:\s+(.+)/);
      const memTotalMatch = meminfo.match(/MemTotal:\s+(\d+)\s+kB/);
      const memFreeMatch = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/);

      res.json({
        cpu: cpuMatch ? cpuMatch[1] : "Unknown CPU",
        memTotal: memTotalMatch ? Math.round(parseInt(memTotalMatch[1]) / 1024) : 0,
        memFree: memFreeMatch ? Math.round(parseInt(memFreeMatch[1]) / 1024) : 0,
      });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- BOOT TIME & USER INFO ---
  app.get("/api/system/boot", async (req, res) => {
    try {
      try {
        const { stdout } = await execAsync("systemd-analyze time");
        res.json({ bootTime: stdout.trim() });
        return;
      } catch (e) {
        if (fs.existsSync("/proc/uptime")) {
          const uptime = fs.readFileSync("/proc/uptime", "utf-8");
          const seconds = parseFloat(uptime.split(" ")[0]);
          res.json({ bootTime: `System up for ${seconds.toFixed(2)} seconds` });
          return;
        }
        res.json({ bootTime: "Boot time unavailable" });
      }
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.get("/api/system/user", (req, res) => {
    try {
      const username = require('os').userInfo().username;
      res.json({ username });
    } catch (error: any) {
      res.json({ username: "arcadegamer254" });
    }
  });

  // --- APP LAUNCHER ---
  app.get("/api/system/apps", async (req, res) => {
    try {
      const dirs = [
        "/usr/share/applications",
        path.join(process.env.HOME || "/root", ".local/share/applications")
      ];
      const apps: any[] = [];
      
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".desktop"));
        
        for (const file of files) {
          try {
            const content = fs.readFileSync(path.join(dir, file), "utf-8");
            const nameMatch = content.match(/^Name=(.+)$/m);
            const execMatch = content.match(/^Exec=(.+)$/m);
            const iconMatch = content.match(/^Icon=(.+)$/m);
            
            if (nameMatch && execMatch) {
              apps.push({
                name: nameMatch[1].trim(),
                exec: execMatch[1].trim().replace(/%[a-zA-Z]/g, "").trim(),
                icon: iconMatch ? iconMatch[1].trim() : ""
              });
            }
          } catch (e) { /* ignore unreadable files */ }
        }
      }
      
      // Deduplicate by name and sort
      const uniqueApps = Array.from(new Map(apps.map(a => [a.name, a])).values());
      uniqueApps.sort((a, b) => a.name.localeCompare(b.name));
      
      res.json({ apps: uniqueApps });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post("/api/system/apps/launch", async (req, res) => {
    try {
      const { exec: cmd } = req.body;
      const child = require('child_process').spawn(cmd, [], { shell: true, detached: true, stdio: 'ignore' });
      child.unref();
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- SYSTEM MONITOR (CPU & RAM) ---
  let lastCpu = { idle: 0, total: 0 };
  app.get("/api/system/monitor", async (req, res) => {
    try {
      const meminfo = fs.existsSync("/proc/meminfo") ? fs.readFileSync("/proc/meminfo", "utf-8") : "";
      const memTotalMatch = meminfo.match(/MemTotal:\s+(\d+)/);
      const memAvailMatch = meminfo.match(/MemAvailable:\s+(\d+)/);
      
      let ramUsage = 0, memTotal = 0, memAvail = 0;
      if (memTotalMatch && memAvailMatch) {
        memTotal = parseInt(memTotalMatch[1], 10);
        memAvail = parseInt(memAvailMatch[1], 10);
        ramUsage = ((memTotal - memAvail) / memTotal) * 100;
      }

      const stat = fs.existsSync("/proc/stat") ? fs.readFileSync("/proc/stat", "utf-8") : "";
      const cpuMatch = stat.match(/^cpu\s+(.*)$/m);
      let cpuUsage = 0;
      if (cpuMatch) {
        const parts = cpuMatch[1].trim().split(/\s+/).map(Number);
        const idle = parts[3] + (parts[4] || 0);
        const total = parts.reduce((a, b) => a + b, 0);
        
        const idleDiff = idle - lastCpu.idle;
        const totalDiff = total - lastCpu.total;
        if (totalDiff > 0) {
          cpuUsage = 100 * (1 - idleDiff / totalDiff);
        }
        lastCpu = { idle, total };
      }

      res.json({ cpu: cpuUsage, ram: ramUsage, memTotal, memAvail });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // --- PACKAGE MANAGER (Pacman) ---
  app.get("/api/system/packages/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json({ packages: [] });
      const { stdout } = await execAsync(`pacman -Ss ${q}`);
      const lines = stdout.split('\n');
      const packages = [];
      for (let i = 0; i < lines.length; i += 2) {
        if (!lines[i] || !lines[i].includes('/')) continue;
        const [repoAndName, version, installed] = lines[i].split(' ');
        const description = lines[i+1]?.trim() || '';
        packages.push({ name: repoAndName, version, description, installed: !!installed });
      }
      res.json({ packages });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post("/api/system/packages/install", async (req, res) => {
    try {
      const { pkg } = req.body;
      const { stdout } = await execAsync(`pkexec pacman -S --noconfirm ${pkg}`);
      res.json({ success: true, output: stdout });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.get("/api/system/packages/installed", async (req, res) => {
    try {
      const { stdout } = await execAsync(`pacman -Q`);
      const packages = stdout.split('\n').filter(l => l.trim()).map(line => {
        const [name, version] = line.split(' ');
        return { name, version };
      });
      res.json({ packages });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
