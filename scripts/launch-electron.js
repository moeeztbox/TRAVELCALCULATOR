// scripts/launch-electron.js
//
// Launches the real Electron GUI binary directly via child_process, after
// stripping ELECTRON_RUN_AS_NODE from the environment.
//
// Why this exists: some terminals (VSCode's integrated terminal is the
// common culprit) set ELECTRON_RUN_AS_NODE=1 for their own tooling. If that
// variable is still set when `electron .` is invoked, Electron's binary
// launches in plain-Node mode instead of starting the app/BrowserWindow —
// `require("electron")` then resolves to a path string instead of the
// Electron API, and main.js crashes on `app.whenReady()`. Spawning the
// binary ourselves with a cleaned env sidesteps that regardless of what
// the parent shell had set.
const { spawn } = require("child_process");
const path = require("path");
const electronPath = require("electron");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, [path.join(__dirname, "..")], {
  stdio: "inherit",
  env,
});

child.on("exit", (code) => process.exit(code ?? 0));
