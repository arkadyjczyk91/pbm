import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        minlength: [3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Podaj prawidłowy adres email']
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Hasło musi mieć co najmniej 8 znaków'],
        validate: {
            validator: function(v: string): boolean {
                return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(v);
            },
            message: 'Hasło musi zawierać co najmniej jedną literę, jedną cyfrę i jeden znak specjalny'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
});

export default mongoose.model<IUser>('User', userSchema);