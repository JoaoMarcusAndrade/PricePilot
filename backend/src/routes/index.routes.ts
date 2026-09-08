/*

 rotas necessárias:
    usuário : para cadastro e loggin
    histórico : assim como o GPT tem seus chats antigos
    search : query para as APIs e IA
    
*/
import { Router } from 'express'
import { __filename, _dirname } from '../app.js'
import path from 'path'
import userRoutes from './user.routes.js'
import historyRoutes from './history.routes.js'
import searchRoutes from './search.routes.js'


export const router = Router()

/**
 * @swagger
 * /:
 *   get:
 *     summary: Envia arquivo html base
 *     responses:
 *       200:
 *         description: index.html
 */
router.get('/', (req,res) => {
    res.sendFile(path.join(_dirname, "views", "index.html"))
});

// Each route group owns a distinct responsibility. A future /api/chat route should interpret
// natural-language requests before calling the existing /api/search flow.
router.use('/api/users', userRoutes)
router.use('/api/history', historyRoutes)
router.use('/api/search', searchRoutes)
