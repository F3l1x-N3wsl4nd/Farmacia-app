 
import bcrypt from "bcryptjs";
import { User } from "../../models/User.js"; //

const createDefaultAdmin = async () => {
  try {
    // verifica se já existe admin
    const adminExiste = await User.findOne({
      where: { role: "admin" },
    });

    if (adminExiste) {
      console.log(" Usuário admin já existe.");
      return;
    }

    // criptografar senha
    const senhaHash = await bcrypt.hash("123456", 10);

    // criar admin padrão
    await User.create({
      nome: "Administrador",
      email: "admin@farmacia.com",
      senha: senhaHash,
      role: "admin",
    });

    console.log(" Admin padrão criado com sucesso.");
    console.log("Email: admin@farmacia.com");
    console.log("Senha: 123456");
  } catch (error) {
    console.error("Erro ao criar admin:", error);
  }
};

export default createDefaultAdmin;