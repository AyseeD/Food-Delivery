import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 15;

export const register = async (req, res) => {
    const {full_name, email, password, role} = req.body;
    if(!full_name || !email || !password) return res.status(400).json({error: "Missing fields"});

    try{
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db.query(`
            INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) 
            RETURNING user_id, full_name, email, role
        `, [full_name, email, hash, role || "customer"]);

        const user= result.rows[0];
        const token = jwt.sign({user_id: user.user_id, role: user.role, email: user.email}, JWT_SECRET, {expiresIn: "7d"});
        res.json({user, token});
    }catch (err){
        //postgresql error code for unique violation
        if(err.code === "23505") return res.status(409).json({ error: "Email already exists"});
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
}

export const login = async (req, res) =>{
    const {email, password} = req.body;
    const result = await db.query("SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if ( !user) return res.status(401).json({error: "Invalid credentials"});

    const ok =  await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({error: "Invalid password"});

    const token =  jwt.sign({user_id: user.user_id, role: user.role, email: user.email}, JWT_SECRET, {expiresIn: "7d"});
    res.json({user: {user_id: user.user_id, full_name: user.full_name, email: user.email, role: user.role}, token});
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const result = await db.query(
        "SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = $1",
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
        },
        token,
    });
};


export const userInfo = async (req, res) => {
    const result = await db.query("SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = $1", [req.user.user_id]);
    res.json(result.rows[0]);
};