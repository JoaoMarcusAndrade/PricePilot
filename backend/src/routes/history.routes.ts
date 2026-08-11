import { Router } from "express";
import { historyController } from "../controllers/history.controller.js";
const router = Router();

//pega o histórico do usuário
router.get('/:userId', historyController.getHistory)

//cria e atualiza histórico
router.put('/:userId', historyController.addChat)

//deleta item do histórico
router.delete('/:userId/:chatId', historyController.delHistoryItem)

export default router