import express from 'express';
import {
    getCurrentBudget,
    createOrUpdateBudget,
    getBudgetHistory,
    getBudgetStats,
    deleteBudget
} from '../controllers/budget.controller.js';

const router = express.Router();

// GET /api/budget/:userId - Get current month's budget
router.get('/:userId', getCurrentBudget);

// GET /api/budget/:userId/stats - Get budget statistics
router.get('/:userId/stats', getBudgetStats);

// GET /api/budget/:userId/history - Get budget history
router.get('/:userId/history', getBudgetHistory);

// POST /api/budget/:userId - Create or update budget
router.post('/:userId', createOrUpdateBudget);

// DELETE /api/budget/:userId/:month/:year - Delete specific budget
router.delete('/:userId/:month/:year', deleteBudget);

export default router;
