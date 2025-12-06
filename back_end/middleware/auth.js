import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//for actions that require authentication
export const authRequired = (req, res, next) => {
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({error: "missing auth token"});
    const token = auth.split(" ")[1];
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }catch (err) {
        return res.status(401).json({error: "Invalid token"});
    }
};

//for actions that require specific roles
export const requireRole = (role) => (req, res, next) =>{
    if(!req.user) return res.status(401).json({ error: "Not authenticated"});
    if (req.user.role !== "admin"){
        return res.status(403).json({error:"Forbidden"});
    }
    next();
}