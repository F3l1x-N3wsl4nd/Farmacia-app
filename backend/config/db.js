import { Sequelize } from "sequelize";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do banco que a app vai realmente usar
const databasePath = process.env.DB_PATH || path.join(__dirname, "database.sqlite");
console.log( databasePath)
// Caminho do banco inicial empacotado (dentro do backend)
const bundledDb = path.join(__dirname, "database.sqlite");

// Se o banco não existir, copia o inicial
if (!fs.existsSync(databasePath)) {
  try {
    fs.copyFileSync(bundledDb, databasePath);
    console.log("Banco inicial copiado para:", databasePath);
  } catch (err) {
    console.error("Erro ao copiar DB inicial:", err);
  }
}

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: false,
});
