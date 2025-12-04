import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 15;

export const register = async (req, res) => {
    const { full_name, email, password, role, address } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db.query(`
            INSERT INTO users (full_name, email, password_hash, role, address) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id, full_name, email, role, address
        `, [full_name, email, hash, role || "customer", address || null]);

        const user = result.rows[0];
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({ user, token });
    } catch (err) {
        // PostgreSQL error code for unique violation
        if (err.code === "23505") return res.status(409).json({ error: "Email already exists" });
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    const result = await db.query(
        "SELECT user_id, full_name, email, password_hash, role, address FROM users WHERE email = $1", 
        [email]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
    res.json({ 
        user: { 
            user_id: user.user_id, 
            full_name: user.full_name, 
            email: user.email, 
            role: user.role,
            address: user.address 
        }, 
        token 
    });
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const result = await db.query(
        "SELECT user_id, full_name, email, password_hash, role, address FROM users WHERE email = $1",
        [email]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid password" });

    if (user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const token = jwt.sign(
        { user_id: user.user_id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            address: user.address
        },
        token,
    });
};

export const userInfo = async (req, res) => {
    const result = await db.query(
        "SELECT user_id, full_name, email, role, address, created_at FROM users WHERE user_id = $1", 
        [req.user.user_id]
    );
    res.json(result.rows[0]);
};

export const updateUser = async (req, res) => {
    const { full_name, email, address } = req.body;
    const userId = req.user.user_id;

    try {
        const result = await db.query(
            `UPDATE users 
             SET full_name = $1, email = $2, address = $3 
             WHERE user_id = $4 
             RETURNING user_id, full_name, email, role, address, created_at`,
            [full_name, email, address || null, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Email already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
};

export const updatePassword = async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user.user_id;

    // Validation
    if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ error: "All password fields are required" });
    }

    if (new_password !== confirm_password) {
        return res.status(400).json({ error: "New passwords do not match" });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    try {
        // First, verify current password
        const userRes = await db.query(
            "SELECT password_hash FROM users WHERE user_id = $1",
            [userId]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userRes.rows[0];
        
        // Check if current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

        // Update password in database
        await db.query(
            "UPDATE users SET password_hash = $1 WHERE user_id = $2",
            [newPasswordHash, userId]
        );

        res.json({ 
            success: true, 
            message: "Password updated successfully" 
        });
    } catch (err) {
        console.error("Password update error:", err);
        res.status(500).json({ error: "Failed to update password" });
    }
};