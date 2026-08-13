import { Request, Response } from "express";
import {
    addNewChat,
    editChat,
    deleteChat,
    getHistory
} from "../services/history.service.js";

export const historyController = {

    async getHistory(req: Request, res: Response) {
        const { userId } = req.params;

        const userIdNum = Number(userId);

        if (!Number.isInteger(userIdNum)) {
            return res.status(400).json({
                error: "ID de usuário inválido."
            });
        }

        try {
            const userHistory = await getHistory(userIdNum);

            return res.status(200).json(userHistory);

        } catch (error: any) {
            return res.status(500).json({
                error: error.message
            });
        }
    },

    async addChat(req: Request, res: Response) {
        const { userId } = req.params;

        const userIdNum = Number(userId);

        if (!Number.isInteger(userIdNum)) {
            return res.status(400).json({
                error: "ID de usuário inválido."
            });
        }

        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                error: "Dados do chat não enviados."
            });
        }

        try {
            const chat = await addNewChat(
                data,
                userIdNum
            );

            return res.status(201).json(chat);

        } catch (error: any) {
            return res.status(500).json({
                error: error.message
            });
        }
    },
    
    async updateChat(req: Request, res: Response) {
        const { chatId } = req.params;

        const chatIdNum = Number(chatId);

        if (!Number.isInteger(chatIdNum)) {
            return res.status(400).json({
                error: "ID de chat inválido."
            });
        }

        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                error: "Dados do chat não enviados."
            });
        }

        try {
            const chat = await editChat(chatIdNum, data);

            return res.status(200).json(chat);

        } catch (error: any) {
            return res.status(404).json({
                error: error.message
            });
        }
    },
    async delHistoryItem(req: Request, res: Response) {
        const { chatId } = req.params;

        const chatIdNum = Number(chatId);

        if (!Number.isInteger(chatIdNum)) {
            return res.status(400).json({
                error: "ID de chat inválido."
            });
        }

        try {
            await deleteChat(chatIdNum);

            return res.status(204).send();

        } catch (error: any) {
            return res.status(404).json({
                error: error.message
            });
        }
    }
};