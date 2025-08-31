import Transaction from '../models/transactions.model.js';
import User from '../models/users.model.js';
import Budget from '../models/budget.model.js';
import mongoose from 'mongoose';


const updateBudgetForExpense = async (userId, transactionDate) => {
    try {
        const date = new Date(transactionDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const budget = await Budget.findOne({ userId, month, year });
        if (!budget) return;
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const expenseTransactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const totalSpent = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        budget.spentAmount = totalSpent;
        budget.remainingBudget = budget.totalBudget - totalSpent;
        await budget.save();
    } catch (error) {
        console.error('Error updating budget:', error);
    }
};


export const getTransactions = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 10, type, startDate, endDate, month, year } = req.query;
        const filter = { userId };
        if (type && (type === 'income' || type === 'expense')) {
            filter.type = type;
        }
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
        res.status(200).json({success: true,data: {transactions,totalPages: Math.ceil(total / limit),currentPage: Number(page),total}});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving transactions'});
    }
};


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
        res.status(200).json({success: true, data: transaction});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error retrieving transaction'});
    }
};


export const createTransaction = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { amount, type, category, description, date } = req.body;
        if (!amount || !type || !category) {
            return res.status(400).json({ success: false, message: 'Amount, type, and category are required' });
        }

        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ success: false, message: 'Type must be either "income" or "expense"' });
        }
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }
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
        const modifier = type === 'income' ? 1 : -1;
        const newBalance = (user.balance || 0) + (Number(amount) * modifier);
        if (type === 'expense' && newBalance < 0) {
            await Transaction.findByIdAndDelete(newTransaction._id);
            return res.status(400).json({
                success: false, 
                message: 'Insufficient balance for this expense'
            });
        }
        user.balance = newBalance;
        await user.save();
        if (type === 'expense') {
            await updateBudgetForExpense(userId, newTransaction.date);
        }
        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            data: {transaction: newTransaction,newBalance: user.balance}
        });
    } catch (error) {
        res.status(500).json({success: false, message: 'Error adding transaction'});
    }
};


export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.params.userId;
        const { amount, type, category, description, date } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid transaction ID'});
        }
        const existingTransaction = await Transaction.findOne({ _id: id, userId });
        if (!existingTransaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found'});
        }
        if (type && type !== 'income' && type !== 'expense') {
            return res.status(400).json({success: false, message: 'Type must be either "income" or "expense"'});
        }
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
        }

        const oldAmount = existingTransaction.amount;
        const oldType = existingTransaction.type;
        const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
        const newType = type || oldType;
        const oldModifier = oldType === 'income' ? -1 : 1;
        let newBalance = user.balance + (oldAmount * oldModifier);
        const newModifier = newType === 'income' ? 1 : -1;
        newBalance = newBalance + (newAmount * newModifier);
        if (newBalance < 0) {
            return res.status(400).json({success: false,  message: 'Insufficient balance for this transaction'});
        }

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

        user.balance = newBalance;
        await user.save();
        res.status(200).json({success: true, message: 'Transaction updated successfully', data: {transaction: updatedTransaction, newBalance: user.balance}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating transaction'});
    }
};


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
        const modifier = transaction.type === 'income' ? -1 : 1;
        const newBalance = user.balance + (transaction.amount * modifier);
        await Transaction.findByIdAndDelete(id);
        user.balance = newBalance;
        await user.save();
        if (transaction.type === 'expense') {
            await updateBudgetForExpense(userId, transaction.date);
        }
        res.status(200).json({ success: true, message: 'Transaction deleted successfully', data: {deletedTransaction: transaction, newBalance: user.balance}});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting transaction'});
    }
};


export const getTransactionStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }
        const pipeline = [
            {$match: { userId: new mongoose.Types.ObjectId(userId), ...dateFilter }},
            {$group: {_id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 }}}
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
        res.status(200).json({success: true, data: {
                income,
                expenses,
                balance: currentBalance,
                totalTransactions: incomeCount + expenseCount,
                incomeTransactions: incomeCount,
                expenseTransactions: expenseCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving transaction statistics'});
    }
};
