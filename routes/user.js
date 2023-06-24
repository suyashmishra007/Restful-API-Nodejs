const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const {isAuthenticatedUser , authorizedRole } = require('../middlewares/auth');

router.get('/me',isAuthenticatedUser,userController.getUserProfile);

router.put('/password/update',isAuthenticatedUser,userController.updateCurrentUserPassword)

router.put('/me/update',isAuthenticatedUser,userController.updateUserData);

router.delete('/me/delete',isAuthenticatedUser,userController.deleteUser);




module.exports = router;