class ExpenseController {
    async getExpenses(req, res) {
        try {
            // Logic to retrieve expenses from the database
            const expenses = await Expense.find();
            res.status(200).json(expenses);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving expenses', error });
        }
    }

    async addExpense(req, res) {
        try {
            // Logic to add a new expense to the database
            const newExpense = new Expense(req.body);
            await newExpense.save();
            res.status(201).json(newExpense);
        } catch (error) {
            res.status(400).json({ message: 'Error adding expense', error });
        }
    }

    async updateExpense(req, res) {
        try {
            // Logic to update an existing expense in the database
            const { id } = req.params;
            const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
            if (!updatedExpense) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            res.status(200).json(updatedExpense);
        } catch (error) {
            res.status(400).json({ message: 'Error updating expense', error });
        }
    }

    async deleteExpense(req, res) {
        try {
            // Logic to delete an expense from the database
            const { id } = req.params;
            const deletedExpense = await Expense.findByIdAndDelete(id);
            if (!deletedExpense) {
                return res.status(404).json({ message: 'Expense not found' });
            }
            res.status(200).json({ message: 'Expense deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting expense', error });
        }
    }
}

export default new ExpenseController();