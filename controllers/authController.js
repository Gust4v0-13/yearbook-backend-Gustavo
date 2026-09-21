import prisma from "../prisma/client.js";
import { hashSenha, verificarSenha } from "../utils/senha.js";
import { gerarToken } from "../utils/jwt.js";

const selectSemSenha = {
  id: true,
  nome: true,
  email: true,
  cidade: true,
  bio: true,
  tecnica: true,
  fotoUrl: true,
  role: true,
  criadoEm: true,
};

// POST /auth/register
export async function register(req, res, next) {
  try {
    const { nome, email, senha, cidade, bio, tecnica } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "nome, email e senha são obrigatórios" });
    }

    const senhaHash = await hashSenha(senha);

    const artista = await prisma.artista.create({
      data: { nome, email, senhaHash, cidade, bio, tecnica },
      select: selectSemSenha,
    });

    res.status(201).json(artista);
  } catch (erro) {
    if (erro.code === "P2002") {
      return res.status(409).json({ erro: "Email já cadastrado" });
    }
    next(erro);
  }
}

// POST /auth/login
export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    // busca o artista COM senhaHash (único lugar que precisa dele)
    const artista = await prisma.artista.findUnique({ where: { email } });

    if (!artista) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const senhaConfere = await verificarSenha(senha, artista.senhaHash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = gerarToken(artista);
    res.json({ token });
  } catch (erro) {
    next(erro);
  }
}