import express from 'express';
import { 
    getTransactions, 
    getTransaction, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction, 
    getTransactionStats 
} from '../controllers/transactions.controller.js';

const router = express.Router();

// GET /api/transactions/:userId - Get all transactions for a user
router.get('/:userId', getTransactions);

// GET /api/transactions/:userId/stats - Get transaction statistics for a user
router.get('/:userId/stats', getTransactionStats);

// GET /api/transactions/:userId/:id - Get a specific transaction
router.get('/:userId/:id', getTransaction);

// POST /api/transactions/:userId - Add a new transaction
router.post('/:userId', createTransaction);

// PUT /api/transactions/:userId/:id - Update a transaction
router.put('/:userId/:id', updateTransaction);

// DELETE /api/transactions/:userId/:id - Delete a transaction
router.delete('/:userId/:id', deleteTransaction);

export default router;
