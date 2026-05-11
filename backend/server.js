import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import medicamentoRoutes from "./routes/medicamentoRoutes.js";
import vendaRoutes from "./routes/vendaRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import fornecedorRoutes from "./routes/fornecedorRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { sequelize } from "./models/index.js";
import createDefaultAdmin from "./src/init/createDefaultAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  carrega .env corretamente em dev e build
dotenv.config({
  path: path.join(__dirname, ".env")
});

const app = express();

app.use(cors());

app.use(express.json());

/* rota teste */
app.get("/", (req, res) => {
  res.send("Backend FarmaciaApp online");
});

/* rotas */
app.use("/api/auth", authRoutes);
app.use("/api/medicamentos", medicamentoRoutes);
app.use("/api/vendas", vendaRoutes);
app.use("/api/relatorios", relatorioRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/funcionarios", roleRoutes);

const PORT = process.env.PORT || 5000;

/* inicia servidor */

async function startServer() {
  try {
    await sequelize.sync();

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`[Dev-Felix] Servidor ON na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
  }
}

startServer();