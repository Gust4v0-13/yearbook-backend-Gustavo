import { Router } from "express";
import {
  listarDesenhos,
  criarDesenho,
  deletarDesenho,
} from "../controllers/desenhosController.js";
import autenticar from "../middlewares/autenticar.js";

const router = Router();

router.get("/", listarDesenhos);
router.post("/", autenticar, criarDesenho);
router.delete("/:id", autenticar, deletarDesenho);

export default router;