import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function(v: number): boolean {
                return v !== 0;
            },
            message: 'Kwota nie może wynosić 0'
        }
    },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
        type: String,
        required: true,
        enum: ['wynagrodzenie', 'prezent', 'inne_przychody', 'jedzenie', 'transport',
               'rozrywka', 'rachunki', 'zdrowie', 'edukacja', 'odzież', 'inne_wydatki']
    },
    date: { type: Date, default: Date.now },
    description: { type: String, maxlength: 200 }
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

export default mongoose.model('Transaction', transactionSchema);