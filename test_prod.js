import { execSync } from "child_process";
try {
  const output = execSync("NODE_ENV=production node dist/server.cjs & sleep 2 && kill $!", { encoding: "utf8" });
  console.log("Output:", output);
} catch (e) {
  console.error("Error:", e.stdout, e.stderr);
}
