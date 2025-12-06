import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/restaurants.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import promoRoutes from "./routes/promotions.js";
import homeRoutes from "./routes/home.js";
import tagsRoutes from "./routes/tags.js"
import cartRoutes from "./routes/cart.js"
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(cors());
app.use(express.json());

//add app the routes for each router for backend
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/promotions", promoRoutes);
app.use("/home", homeRoutes);
app.use("/tags", tagsRoutes);
app.use("/cart", cartRoutes);
app.use("/auth/admin", adminRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
