import { Request, Response } from 'express'
import { getUser, createNewUser, loginUser, editUser, deleteAcount } from '../services/user.service.js'

export const userController = {
    async getUser(req: Request, res: Response) {
        const { userId } = req.params

        if (!userId){
            return res.status(400).json({ error: "há dados faltando" })
        }
        
        const userIdNum = Number(userId)
        try {
            const user = await getUser(userIdNum)
            return res.status(201).json(user);
        } catch (error: any) {
            return res.status(500).json({ error: error.message })
        }
    },

    async register(req: Request, res: Response) {
        if (!req.body) {
            return res.status(400).json({ error: "há dados faltando" })
        }
        try {
            const user = await createNewUser(req.body)
            return res.status(201).json(user);
        } catch (error: any) {
            return res.status(500).json({ error: error.message })
        }
    },

    async login(req: Request, res: Response) {
        const { email, pass } = req.body
        try {
            const result = await loginUser(email, pass);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    },

    async update(req: Request, res: Response) {
        const { userId } = req.params

        if (!userId){
            return res.status(404).json({ error: "Parametros faltando"})
        }

        const userIdNum = Number(userId)
        try {
            const user = await editUser(userIdNum, req.body);
            return res.status(200).json(user);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    },

    async delUser(req: Request, res: Response) {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(404).json({ error: "Parametros faltando." });
        }

        
        const userIdNum = Number(userId)

        try {
            await deleteAcount(userIdNum);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(404).json({ error: error.message });
        }
    }

}