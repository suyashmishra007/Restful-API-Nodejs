const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.post("/password/forgot", authController.forgotPassword);

router.post("/password/reset/:token", authController.resetPassword);

// TODO: Add isAuthenticated middleware
router.post("/logout", authController.logout);

module.exports = router;