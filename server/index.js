import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";

// Routes
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import traitRoutes from "./routes/traitRoutes.js";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json());

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/traits", traitRoutes);

app.get("/", (req, res) => res.send("FCDBB API Ready!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
