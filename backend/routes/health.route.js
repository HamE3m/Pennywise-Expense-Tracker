import express from 'express';
import { healthCheck } from '../controllers/health.controller.js';

const router = express.Router();

// GET /api/health - Check application health
router.get('/', healthCheck);

export default router;
