import express from 'express';
import {getCurrentBudget, createOrUpdateBudget, getBudgetHistory, getBudgetStats, deleteBudget} from '../controllers/budget.controller.js';


const router = express.Router();


router.get('/:userId', getCurrentBudget);
router.get('/:userId/stats', getBudgetStats);
router.get('/:userId/history', getBudgetHistory);
router.post('/:userId', createOrUpdateBudget);
router.delete('/:userId/:month/:year', deleteBudget);

export default router;
