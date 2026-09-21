import prisma from "./client.js";
import { hashSenha } from "../utils/senha.js";

// upsert: o seed pode rodar várias vezes sem quebrar no email @unique
async function main() {
  const admin = await prisma.artista.upsert({
    where: { email: "admin@email.com" },
    update: {},
    create: {
      nome: "Gustavo",
      email: "admin@email.com",
      senhaHash: await hashSenha("admin123"), // ADMIN — senha de teste: admin123
      cidade: "Salinas",
      role: "ADMIN",
    },
  });
  console.log("Admin criado:", admin.nome);

  const clara = await prisma.artista.upsert({
    where: { email: "clara@email.com" },
    update: {},
    create: {
      nome: "Clara",
      email: "clara@email.com",
      senhaHash: await hashSenha("senha123"), // USER — senha de teste: senha123
      cidade: "Salinas",
    },
  });
  console.log("Artista criado:", clara.nome);

  console.log("Usuários de desenvolvimento:");
  console.log("Admin: admin@email.com / admin123");
  console.log("Clara: clara@email.com / senha123");

  const desenhos = [
    {
      titulo: "Autorretrato em nanquim",
      artistaId: clara.id,
    },
    {
      titulo: "Paisagem do interior",
      artistaId: clara.id,
    },
  ];

  for (const dados of desenhos) {
    const jaTemDesenho = await prisma.desenho.findFirst({
      where: dados,
    });

    if (!jaTemDesenho) {
      const desenho = await prisma.desenho.create({ data: dados });
      console.log("Desenho criado:", desenho.titulo);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error(erro);
    await prisma.$disconnect();
    process.exit(1);
  });