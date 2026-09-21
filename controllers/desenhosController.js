import prisma from "../prisma/client.js";

export async function listarDesenhos(req, res, next) {
  try {
    const desenhos = await prisma.desenho.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        artista: {
          select: {
            nome: true,
            fotoUrl: true,
          },
        },
      },
    });
    res.json(desenhos);
  } catch (erro) {
    next(erro);
  }
}

export async function criarDesenho(req, res, next) {
  try {
    const { titulo, imagemUrl } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: "O campo titulo é obrigatório" });
    }

    const novoDesenho = await prisma.desenho.create({
      data: {
        titulo,
        imagemUrl,
        artistaId: req.artista.id, // artista = quem está logado
      },
    });
    res.status(201).json(novoDesenho);
  } catch (erro) {
    next(erro);
  }
}

export async function deletarDesenho(req, res, next) {
  const { id } = req.params;
  try {
    const desenho = await prisma.desenho.findUnique({
      where: { id: Number(id) },
    });

    if (!desenho) {
      return res.status(404).json({ erro: "Desenho não encontrado" });
    }

    const ehDono = desenho.artistaId === req.artista.id;
    const ehAdmin = req.artista.role === "ADMIN";
    if (!ehDono && !ehAdmin) {
      return res
        .status(403)
        .json({ erro: "Você não tem permissão para excluir este desenho" });
    }

    await prisma.desenho.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}