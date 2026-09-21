import { Router } from "express";
import {
  listarArtistas,
  buscarArtista,
  atualizarArtista,
  deletarArtista,
} from "../controllers/artistasController.js";
import autenticar from "../middlewares/autenticar.js";
import autorizar from "../middlewares/autorizar.js";

const router = Router();

router.get("/", listarArtistas);
router.get("/:id", buscarArtista);
router.put("/:id", autenticar, atualizarArtista);
router.delete("/:id", autenticar, autorizar("ADMIN"), deletarArtista);

export default router;