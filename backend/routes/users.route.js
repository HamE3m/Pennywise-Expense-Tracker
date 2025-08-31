import express from 'express';
import {getUser, createUser, loginUser, updateUser, addIncome} from '../controllers/users.controller.js';

const router = express.Router();

router.post('/', createUser);
router.post('/login', loginUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.post('/:id/balance', addIncome);

export default router;