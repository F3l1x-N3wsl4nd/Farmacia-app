import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../frontend/dist/index.html")}`;

  mainWindow.loadURL(startURL);

  // 👉 Ativa DevTools só em dev (útil para depurar tela branca)
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

app.on("ready", async () => {
  // Caminho para o banco no diretório do usuário
  const userDb = path.join(app.getPath("userData"), "database.sqlite");
  const bundledDb = path.join(process.resourcesPath, "backend", "database.sqlite");

  // Copia DB inicial se não existir
  if (!fs.existsSync(userDb)) {
    try {
      fs.copyFileSync(bundledDb, userDb);
      console.log("Banco inicial copiado para:", userDb);
    } catch (err) {
      console.error("Erro ao copiar DB inicial:", err);
    }
  }

  // Define caminho do banco para o backend
  process.env.DB_PATH = userDb;

  try {
    // Importa e inicia backend
    await import("../backend/server.js");
    console.log("[Dev-Felix] Servidor backend carregado");
  } catch (err) {
    console.error("Erro ao iniciar backend:", err);
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
