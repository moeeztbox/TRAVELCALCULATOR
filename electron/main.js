// electron/main.js — Electron main process.
//
// In development (electron:dev), Backend + Frontend run as their own dev
// servers (nodemon / vite) started by the npm script; this file just opens
// a window pointing at the Vite dev server (ELECTRON_START_URL) for HMR.
//
// In production (packaged app), there is no separate dev server — this
// file spawns the bundled Express server itself (which also serves the
// built React frontend, see Backend/server.js) and opens a window once it
// responds.
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");

const DEV_URL = process.env.ELECTRON_START_URL;
const PORT = process.env.PORT || 5000;

let backendProcess = null;
let mainWindow = null;

function waitForServer(url, callback, attemptsLeft = 40) {
  http
    .get(url, (res) => {
      res.resume();
      callback(null);
    })
    .on("error", () => {
      if (attemptsLeft <= 0) {
        callback(new Error(`Backend server never responded at ${url}`));
        return;
      }
      setTimeout(() => waitForServer(url, callback, attemptsLeft - 1), 300);
    });
}

function startBackend() {
  // Packaged app: Backend was copied to resources/Backend by electron-builder
  // (extraResources). Dev/unpackaged: fall back to the repo's Backend folder.
  const backendDir = app.isPackaged
    ? path.join(process.resourcesPath, "Backend")
    : path.join(__dirname, "..", "Backend");

  const serverEntry = path.join(backendDir, "server.js");

  // Log the backend's output to a file in userData so it can be inspected
  // after the fact — the packaged app is a Windows GUI-subsystem process
  // with no console, so `stdio: "inherit"` is unreliable here (the child
  // can fail to inherit non-existent handles). Piping instead and writing
  // to a file works regardless of whether a console is attached.
  const logPath = path.join(app.getPath("userData"), "backend.log");
  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  logStream.write(`\n--- launched ${new Date().toISOString()} ---\n`);

  // Run Electron's own bundled binary as a plain Node process (no separate
  // Node.js runtime needs to be installed on the user's machine or bundled
  // in the installer) to execute the existing Express server unmodified.
  backendProcess = spawn(process.execPath, [serverEntry], {
    cwd: backendDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      PORT: String(PORT),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Note: deliberately only writing to the log file here, not
  // process.stdout/stderr — in a packaged Windows GUI-subsystem app there's
  // no attached console, and writing to those raw streams directly (as
  // opposed to going through console.log, which Electron guards) can throw
  // and take down the whole main process.
  backendProcess.stdout.on("data", (chunk) => logStream.write(chunk));
  backendProcess.stderr.on("data", (chunk) => logStream.write(chunk));

  backendProcess.on("exit", (code) => {
    logStream.write(`Backend process exited with code ${code}\n`);
  });
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(url);
}

app.whenReady().then(() => {
  // A packaged Windows GUI app has no console — without this, an uncaught
  // exception here just silently kills the process with nothing to go on.
  process.on("uncaughtException", (err) => {
    try {
      fs.appendFileSync(
        path.join(app.getPath("userData"), "main-crash.log"),
        `${new Date().toISOString()} ${err.stack || err}\n`
      );
    } catch (_) {
      // last resort — nothing more we can do if even this fails
    }
  });

  if (DEV_URL) {
    createWindow(DEV_URL);
    return;
  }

  startBackend();
  waitForServer(`http://localhost:${PORT}`, (err) => {
    if (err) console.error(err);
    createWindow(`http://localhost:${PORT}`);
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});
