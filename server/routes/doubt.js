import express from 'express';
import { askDoubt } from '../controller/doubt.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/doubt', isAuth, askDoubt);

export default router;
