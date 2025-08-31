import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from "./config/db.js";
import userRoutes from './routes/users.route.js';
import transactionRoutes from './routes/transactions.route.js';
import budgetRoutes from './routes/budget.route.js';
import healthRoutes from './routes/health.route.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/health', healthRoutes);

app.listen(5000, () => {
    connectDB();
    console.log('Server is running on port http://localhost:5000');
});
