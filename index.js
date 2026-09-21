import "dotenv/config";
import express from "express"; // importa o Express
import cors from "cors"; // novo import
import logger from "./middlewares/logger.js"; // importa o middleware de log
import tratarErro from "./middlewares/erro.js"; // novo import
import artistasRouter from "./routes/artistas.js"; // importa o router de artistas
import desenhosRouter from "./routes/desenhos.js"; // importa o router de desenhos
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3000; // lê do .env, com fallback para 3000

app.use(cors()); // 1º — libera CORS para qualquer origem
app.use(express.json()); // 2º — parseia JSON do body
app.use(logger); // 3º — registra log de cada requisição

// rota raiz — boas-vindas
app.get("/", (req, res) => {
  res.json({ mensagem: "Galeria API está no ar! 🎨" });
});

// rota de health check
app.get("/status", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// monta as rotas em /auth/register e /auth/login
app.use("/auth", authRouter);

// registra as rotas de artistas com prefixo /artistas
app.use("/artistas", artistasRouter);

// registra as rotas de desenhos com prefixo /desenhos
app.use("/desenhos", desenhosRouter);

// Middleware de erro — SEMPRE por último, depois das rotas
app.use(tratarErro);

// inicia o servidor localmente — na Vercel essa parte é pulada
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// exporta o app para a Vercel usar como serverless function
export default app;