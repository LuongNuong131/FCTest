const express = require("express");
const router = express.Router();
const traitController = require("../controllers/traitController"); // Import controller vừa tạo
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Đảm bảo traitController.getAllTraits và traitController.createTrait KHÔNG BỊ UNDEFINED
if (!traitController.getAllTraits || !traitController.createTrait) {
  console.error(
    "ERROR: Trait Controller functions are undefined. Check imports!"
  );
}

// Lấy tất cả custom traits (Ai cũng xem được)
router.get("/", verifyToken, traitController.getAllTraits);

// Admin tạo trait mới
router.post("/", verifyToken, isAdmin, traitController.createTrait);

module.exports = router;
