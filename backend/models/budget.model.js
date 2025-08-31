import mongoose from 'mongoose';


const budgetSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    month: {type: Number, required: true, min: 1, max: 12},
    year: {type: Number, required: true},
    totalBudget: {type: Number, required: true, min: 0},
    spentAmount: {type: Number, default: 0, min: 0},
    remainingBudget: {type: Number, default: 0},
    categories: [{
        name: {type: String, required: true, enum: ['Rent', 'Food', 'Travel', 'Groceries', 'Shopping', 'Others']},
        budgetAmount: {type: Number, required: true, min: 0},
        spentAmount: {type: Number, default: 0, min: 0}
    }]
}, {
    timestamps: true
});

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
budgetSchema.pre('save', function(next) {
    if (this.totalBudget !== undefined && this.spentAmount !== undefined) {
        this.remainingBudget = this.totalBudget - this.spentAmount;
    }
    next();
});


const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
