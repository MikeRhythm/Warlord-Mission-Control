const { spawn } = require("child_process"); const p = spawn("openclaw.cmd", ["gateway", "--port", "18789"], { stdio: "inherit", shell: true }); p.on("exit", (code) => process.exit(code));
