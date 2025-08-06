import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from "./config/db.js";
import userRoutes from './routes/users.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(5000, () => {
    connectDB();
    console.log('Server is running on port http://localhost:5000');
});
