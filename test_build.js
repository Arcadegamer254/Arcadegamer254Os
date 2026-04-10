import { execSync } from "child_process";
try {
  execSync("npx esbuild server.ts --bundle --platform=node --packages=external --format=cjs --outfile=dist/server.cjs");
  console.log("Build successful");
} catch (e) {
  console.error("Build failed", e);
}
