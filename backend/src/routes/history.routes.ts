import { Router } from "express";
import { historyController } from "../controllers/history.controller.js";

const router = Router();

router.get(
    "/:userId",
    historyController.getHistory
);

router.put(
    "/:userId",
    historyController.addChat
);

router.delete(
    "/:userId/:chatId",
    historyController.delHistoryItem
);

router.put(
    "/:userId/:chatId",
    historyController.updateChat
);

export default router;