import express from "express";
import cors from "cors";
import restaurantRoutes from "./routes/restaurants.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/restaurants", restaurantRoutes);
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log(`Backend listening on port ${port}`));
