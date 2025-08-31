import express from 'express';
import {getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, getTransactionStats} from '../controllers/transactions.controller.js';


const router = express.Router();

router.get('/:userId', getTransactions);
router.get('/:userId/stats', getTransactionStats);
router.get('/:userId/:id', getTransaction);
router.post('/:userId', createTransaction);
router.put('/:userId/:id', updateTransaction);
router.delete('/:userId/:id', deleteTransaction);

export default router;
