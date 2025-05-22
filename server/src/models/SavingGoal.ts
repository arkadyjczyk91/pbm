import mongoose, { Schema } from 'mongoose';

const savingGoalSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, maxlength: 100 },
    targetAmount: { type: Number, required: true, min: 1 },
    savedAmount: { type: Number, required: true, min: 0 },
    deadline: { type: Date }
}, { timestamps: true });

savingGoalSchema.index({ user: 1 });

export default mongoose.model('SavingGoal', savingGoalSchema);