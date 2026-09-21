/*
  Warnings:

  - You are about to drop the `Aluno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mensagem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_autorId_fkey";

-- DropTable
DROP TABLE "Aluno";

-- DropTable
DROP TABLE "Mensagem";

-- CreateTable
CREATE TABLE "Desenho" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "artistaId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Desenho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artista" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "cidade" TEXT,
    "bio" TEXT,
    "tecnica" TEXT,
    "fotoUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artista_email_key" ON "Artista"("email");

-- AddForeignKey
ALTER TABLE "Desenho" ADD CONSTRAINT "Desenho_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
