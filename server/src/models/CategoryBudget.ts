import mongoose, { Schema } from 'mongoose';

const categoryBudgetSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    color: { type: String }
}, { timestamps: true });

categoryBudgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('CategoryBudget', categoryBudgetSchema);