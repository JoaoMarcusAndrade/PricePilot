import { Router } from "express";
import { userController } from '../controllers/user.controller.js'
const router = Router();

//pega o json do usuário
router.get('/:userId', userController.getUser)

//cria usuário
router.post('/register', userController.register)

//loga usuário
router.post('/login', userController.login)

//atualiza usuário
router.patch('/:userId', userController.update)

//deleta o usuário
router.delete('/:userId', userController.delUser)

export default router