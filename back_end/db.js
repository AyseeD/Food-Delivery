import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

//get database from postgreSQL
export const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

db.on("error", (err) => {
    console.error("Unexpected error on client", err);
});