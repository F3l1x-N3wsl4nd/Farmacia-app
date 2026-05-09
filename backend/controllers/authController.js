import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configura dotenv para garantir que o .env seja lido
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

export const register = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await User.create({ nome, email, senha: senhaHash, role });
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const nome = user.nome;
    const role = user.role;

    const valido = await bcrypt.compare(senha, user.senha);
    if (!valido) return res.status(401).json({ message: "Senha incorreta" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido no .env!");
      return res.status(500).json({ message: "Erro interno de configuração" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ nome, role, token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
};
