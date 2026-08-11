import { Request, Response } from 'express'
import { editChat, getHistory } from '../services/history.service'

export const historyController = {
    
    getHistory(req: Request, res:Response){
    
        const { userId } = req.params
        const userIdNum = Number(userId)
        try{

            const userHistory = getHistory(userIdNum)

            return res.status(200).json(userHistory) 
        } catch(error: any){
            return res.status(500).json({ error: error.message })
        }
    },

    addChat(req: Request, res:Response){
        const { userId } = req.params
    },

    async uptodateChat(req: Request, res: Response) {
            const { userId } = req.params
    
            if (!userId){
                return res.status(404).json({ error: "Parametros faltando"})
            }
    
            const userIdNum = Number(userId)
            try {
                const user = await editChat(userIdNum, req.body);
                return res.status(200).json(user);
            } catch (error: any) {
                return res.status(400).json({ error: error.message });
            }
        },

    delHistoryItem(req: Request, res:Response){
        const { userId, chatId } = req.params
    }

}