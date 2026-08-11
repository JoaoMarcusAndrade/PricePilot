import { Router } from "express";
import { search } from '../controllers/search.controller'

const router = Router();

//realiza a entrada da pesquisa
router.post('/search', search)

export default router