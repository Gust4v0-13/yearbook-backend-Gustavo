import prisma from "../prisma/client.js";

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

export async function listarArtistas(req, res, next) {
  try {
    const artistas = await prisma.artista.findMany({
      select: selectSemSenha,
    });
    res.json(artistas);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarArtista(req, res, next) {
  try {
    const { id } = req.params;
    const artista = await prisma.artista.findUnique({
      where: { id: Number(id) },
      select: selectSemSenha,
    });

    if (!artista) {
      return res.status(404).json({ erro: "Artista não encontrado" });
    }

    res.json(artista);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarArtista(req, res, next) {
  const { id } = req.params;

  // só o dono pode editar o próprio perfil
  if (Number(id) !== req.artista.id) {
    return res
      .status(403)
      .json({ erro: "Você só pode editar o próprio perfil" });
  }

  const dados = req.body;
  try {
    const artistaAtualizado = await prisma.artista.update({
      where: { id: Number(id) },
      data: dados,
      select: selectSemSenha,
    });
    res.json(artistaAtualizado);
  } catch (erro) {
    res.status(404).json({ erro: "Artista não encontrado" });
  }
}

export async function deletarArtista(req, res, next) {
  const { id } = req.params;
  try {
    await prisma.artista.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (erro) {
    res.status(404).json({ erro: "Artista não encontrado" });
  }
}