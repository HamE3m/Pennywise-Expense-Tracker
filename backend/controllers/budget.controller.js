import Budget from '../models/budget.model.js';
import Transaction from '../models/transactions.model.js';
import mongoose from 'mongoose';


export const getCurrentBudget = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { month, year } = req.query;
        const currentDate = new Date();
        const requestedMonth = month ? parseInt(month) : (currentDate.getMonth() + 1);
        const requestedYear = year ? parseInt(year) : currentDate.getFullYear();
        let budget = await Budget.findOne({ 
            userId, 
            month: requestedMonth, 
            year: requestedYear 
        });
        if (!budget) {
            const isCurrentMonth = requestedMonth === (currentDate.getMonth() + 1) && requestedYear === currentDate.getFullYear();  
            if (isCurrentMonth) {
                budget = new Budget({
                    userId,
                    month: requestedMonth,
                    year: requestedYear,
                    totalBudget: 0,
                    spentAmount: 0,
                    categories: []
                });
                await budget.save();
            } else {
                return res.status(200).json({
                    success: true,
                    data: {
                        userId,
                        month: requestedMonth,
                        year: requestedYear,
                        totalBudget: 0,
                        spentAmount: 0,
                        remainingBudget: 0,
                        categories: []
                    }
                });
            }
        }
        const startOfMonth = new Date(requestedYear, requestedMonth - 1, 1);
        const endOfMonth = new Date(requestedYear, requestedMonth, 0, 23, 59, 59);
        const expenseTransactions = await Transaction.find({
            userId: userId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const actualSpent = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        if (budget) {
            budget.spentAmount = actualSpent;
            budget.remainingBudget = (budget.totalBudget || 0) - actualSpent;
            await budget.save();
        }
        res.status(200).json({success: true, data: budget});
    } catch (error) {
        console.error('Error retrieving budget:', error);
        res.status(500).json({success: false, message: 'Error retrieving budget'});
    }
};


export const createOrUpdateBudget = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { totalBudget, categories, month, year } = req.body;
        console.log('Budget request received:', { userId, totalBudget, categories, month, year });
        console.log('Request body:', req.body);
        console.log('User ID type:', typeof userId);
        if (!userId) {
            return res.status(400).json({success: false, message: 'User ID is required'});
        }
        if (!totalBudget || totalBudget < 0 || isNaN(totalBudget)) {
            return res.status(400).json({success: false, message: 'Total budget must be a valid positive number'});
        }
        const budgetMonth = month || new Date().getMonth() + 1;
        const budgetYear = year || new Date().getFullYear();
        console.log('Budget month/year:', { budgetMonth, budgetYear });
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
            console.error('Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
            return res.status(500).json({success: false, message: 'Database connection error. Please check your MongoDB Atlas connection.', connectionState: mongoose.connection.readyState});
        }
        let validUserId;
        try {
            if (mongoose.Types.ObjectId.isValid(userId)) {
                validUserId = new mongoose.Types.ObjectId(userId);
                console.log('Valid ObjectId created:', validUserId);
            } else {
                console.error('Invalid userId format:', userId);
                return res.status(400).json({success: false, message: 'Invalid user ID format'});
            }
        } catch (error) {
            console.error('Error creating ObjectId:', error);
            return res.status(400).json({success: false, message: 'Invalid user ID format'});
        }
        const startOfMonth = new Date(budgetYear, budgetMonth - 1, 1);
        const endOfMonth = new Date(budgetYear, budgetMonth, 0, 23, 59, 59);
        console.log('Date range:', { startOfMonth, endOfMonth });
        const expenseTransactions = await Transaction.find({
            userId: validUserId,
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        console.log('Found expense transactions:', expenseTransactions.length);
        const actualSpent = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
        console.log('Actual spent amount:', actualSpent);
        const budgetData = {
            userId: validUserId,
            month: budgetMonth,
            year: budgetYear,
            totalBudget: parseFloat(totalBudget),
            spentAmount: actualSpent,
            remainingBudget: parseFloat(totalBudget) - actualSpent,
            categories: categories || []
        };
        console.log('Budget data to save:', budgetData);
        console.log('Query criteria:', { userId: validUserId, month: budgetMonth, year: budgetYear });
        let budget;
        try {
            budget = await Budget.findOneAndUpdate(
                { userId: validUserId, month: budgetMonth, year: budgetYear },
                budgetData,
                { new: true, upsert: true, runValidators: true }
            );
            console.log('Budget operation result:', budget);
        } catch (updateError) {
            console.error('Error during findOneAndUpdate:', updateError);
            throw updateError;
        }
        if (!budget) {
            console.error('Budget is null after update operation');
            return res.status(500).json({success: false, message: 'Failed to create or update budget - budget is null'});
        }
        console.log('Saved budget:', budget);
        res.status(200).json({success: true, message: 'Budget updated successfully', data: budget});
    } catch (error) {
        console.error('Budget creation error details:', {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
        });
        if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
            return res.status(500).json({success: false, message: 'Database connection failed. Please ensure MongoDB is running.', error: 'MongoDB connection error'});
        }
        if (error.code === 11000) {
            res.status(400).json({success: false, message: 'Budget for this month already exists'});
        } else if (error.name === 'ValidationError') {
            res.status(400).json({success: false, message: 'Validation error', error: error.message});
        } else if (error.name === 'CastError') {
            res.status(400).json({success: false, message: 'Invalid data format', error: error.message});
        } else {
            res.status(500).json({success: false, message: 'Error creating/updating budget', error: error.message});
        }
    }
};


export const getBudgetHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { limit = 12 } = req.query;
        const budgets = await Budget.find({ userId })
            .sort({ year: -1, month: -1 })
            .limit(parseInt(limit));
        res.status(200).json({success: true, data: budgets});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error retrieving budget history'});
    }
};


export const getBudgetStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const budget = await Budget.findOne({ 
            userId, 
            month: currentMonth, 
            year: currentYear 
        });
        if (!budget) {
            return res.status(404).json({success: false, message: 'No budget found for current month'});
        }
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
        const categoryStats = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: 'expense',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {_id: '$category', totalSpent: { $sum: '$amount' }, transactionCount: { $sum: 1 }}
            }
        ]);
        const budgetOverview = {
            totalBudget: budget.totalBudget,
            spentAmount: budget.spentAmount,
            remainingBudget: budget.remainingBudget,
            percentageUsed: budget.totalBudget > 0 ? (budget.spentAmount / budget.totalBudget) * 100 : 0,
            categoryBreakdown: categoryStats,
            month: currentMonth,
            year: currentYear
        };
        res.status(200).json({success: true, data: budgetOverview});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error retrieving budget statistics'});
    }
};


export const deleteBudget = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { month, year } = req.params;
        const budget = await Budget.findOneAndDelete({
            userId,
            month: parseInt(month),
            year: parseInt(year)
        });
        if (!budget) {
            return res.status(404).json({success: false, message: 'Budget not found'});
        }
        res.status(200).json({success: true, message: 'Budget deleted successfully', data: budget});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting budget'});
    }
};
