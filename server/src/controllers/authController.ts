import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ errors: [{ msg: "Email already registered" }] });
            return;
        }

        user = new User({
            username,
            email,
            password,
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "24h" });

        res.status(201).json({ token });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send("Server Error");
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
            return;
        }

        const payload = {
            user: {
                id: user.id,
            },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "24h" });

        res.json({ token });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send("Server Error");
    }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "User not authenticated" });
            return;
        }

        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send("Server Error");
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "User not authenticated" });
            return;
        }
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }
        if (username) user.username = username;
        if (email) user.email = email;
        await user.save({ validateModifiedOnly: true });
        res.json({ username: user.username, email: user.email });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send("Server Error");
    }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "User not authenticated" });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ msg: "Obecne hasło jest nieprawidłowe" });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ msg: "Hasło zmienione" });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error');
        res.status(500).send("Server Error");
    }
};