import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess;

function startBackend() {
  const backendPath = path.join(process.resourcesPath, "backend", "server.js");

  backendProcess = spawn("node", [backendPath], {
    stdio: "inherit"
  });
}

// espera backend ficar pronto antes de abrir UI
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  startBackend();
  await wait(2000); //  garante backend pronto
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});