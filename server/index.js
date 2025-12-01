// server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Cấu hình CORS để Frontend trên Vercel gọi được
app.use(
  cors({
    origin: "*", // Hoặc điền domain Vercel của bạn sau khi deploy (vd: https://fcdbb.vercel.app)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/funds", require("./routes/fundRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/traits", require("./routes/traitRoutes"));

app.get("/", (req, res) => {
  res.send("FCDBB API is running on Vercel with Aiven DB!");
});

// Chỉ chạy lệnh listen khi ở môi trường local (dev)
// Trên Vercel, nó sẽ export app để Vercel xử lý
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
