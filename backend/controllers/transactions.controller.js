import Transaction from '../models/transactions.model.js';
import User from '../models/users.model.js';
import Budget from '../models/budget.model.js';
import mongoose from 'mongoose';

// Helper function to update budget when expense transactions change
const updateBudgetForExpense = async (userId, transactionDate) => {
    try {
        const date = new Date(transactionDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Find budget for this month/year
        const budget = await Budget.findOne({ userId, month, year });
        if (!budget) return; // No budget set for this month

        // Calculate total expenses for this month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const expenseTransactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const totalSpent = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // Update budget
        budget.spentAmount = totalSpent;
        budget.remainingBudget = budget.totalBudget - totalSpent;
        await budget.save();
    } catch (error) {
        console.error('Error updating budget:', error);
    }
};

// Get all transactions for a user
export const getTransactions = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 10, type, startDate, endDate, month, year } = req.query;

        // Build filter object
        const filter = { userId };
        
        if (type && (type === 'income' || type === 'expense')) {
            filter.type = type;
        }
        
        // Handle month and year filtering
        if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            filter.date = { $gte: startOfMonth, $lte: endOfMonth };
        } else if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                transactions,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving transactions'
        });
    }
};

// Get a specific transaction by ID
export const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
        }

        const transaction = await Transaction.findOne({ _id: id, userId });
        
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving transaction'
        });
    }
};

// Add a new transaction
export const createTransaction = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { amount, type, category, description, date } = req.body;

        // Validation
        if (!amount || !type || !category) {
            return res.status(400).json({ 
                success: false,
                message: 'Amount, type, and category are required' 
            });
        }

        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ 
                success: false,
                message: 'Type must be either "income" or "expense"' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Amount must be greater than 0' 
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const transactionData = {
            userId,
            amount: parseFloat(amount),
            type,
            category,
            description: description || '',
            date: date ? new Date(date) : new Date()
        };

        const newTransaction = await Transaction.create(transactionData);

        // Update user balance
        const modifier = type === 'income' ? 1 : -1;
        const newBalance = (user.balance || 0) + (Number(amount) * modifier);

        // Check for negative balance on expenses
        if (type === 'expense' && newBalance < 0) {
            // Delete the transaction if it would cause negative balance
            await Transaction.findByIdAndDelete(newTransaction._id);
            return res.status(400).json({
                success: false, 
                message: 'Insufficient balance for this expense'
            });
        }

        user.balance = newBalance;
        await user.save();

        // Update budget if this is an expense
        if (type === 'expense') {
            await updateBudgetForExpense(userId, newTransaction.date);
        }

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            data: {
                transaction: newTransaction,
                newBalance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error adding transaction'
        });
    }
};

// Update an existing transaction
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.params.userId;
        const { amount, type, category, description, date } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
        }

        const existingTransaction = await Transaction.findOne({ _id: id, userId });
        if (!existingTransaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validation
        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({ 
                success: false,
                message: 'Type must be either "income" or "expense"' 
            });
        }

        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Amount must be greater than 0' 
            });
        }

        // Calculate balance change
        const oldAmount = existingTransaction.amount;
        const oldType = existingTransaction.type;
        const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
        const newType = type || oldType;

        // Revert old transaction effect on balance
        const oldModifier = oldType === 'income' ? -1 : 1;
        let newBalance = user.balance + (oldAmount * oldModifier);

        // Apply new transaction effect on balance
        const newModifier = newType === 'income' ? 1 : -1;
        newBalance = newBalance + (newAmount * newModifier);

        // Check for negative balance
        if (newBalance < 0) {
            return res.status(400).json({
                success: false, 
                message: 'Insufficient balance for this transaction'
            });
        }

        // Update transaction
        const updateData = {};
        if (amount !== undefined) updateData.amount = newAmount;
        if (type) updateData.type = newType;
        if (category) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (date) updateData.date = new Date(date);

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Update user balance
        user.balance = newBalance;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: {
                transaction: updatedTransaction,
                newBalance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating transaction'
        });
    }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
        }

        const transaction = await Transaction.findOne({ _id: id, userId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Revert transaction effect on balance
        const modifier = transaction.type === 'income' ? -1 : 1;
        const newBalance = user.balance + (transaction.amount * modifier);

        await Transaction.findByIdAndDelete(id);

        // Update user balance
        user.balance = newBalance;
        await user.save();

        // Update budget if this was an expense
        if (transaction.type === 'expense') {
            await updateBudgetForExpense(userId, transaction.date);
        }

        res.status(200).json({ 
            success: true,
            message: 'Transaction deleted successfully',
            data: {
                deletedTransaction: transaction,
                newBalance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting transaction'
        });
    }
};

// Get transaction statistics for a user
export const getTransactionStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const pipeline = [
            { $match: { userId: new mongoose.Types.ObjectId(userId), ...dateFilter } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ];

        const stats = await Transaction.aggregate(pipeline);

        let income = 0, expenses = 0, incomeCount = 0, expenseCount = 0;

        stats.forEach(stat => {
            if (stat._id === 'income') {
                income = stat.total;
                incomeCount = stat.count;
            } else if (stat._id === 'expense') {
                expenses = stat.total;
                expenseCount = stat.count;
            }
        });

        const user = await User.findById(userId);
        const currentBalance = user ? user.balance : 0;

        res.status(200).json({
            success: true,
            data: {
                income,
                expenses,
                balance: currentBalance,
                totalTransactions: incomeCount + expenseCount,
                incomeTransactions: incomeCount,
                expenseTransactions: expenseCount
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving transaction statistics'
        });
    }
};
