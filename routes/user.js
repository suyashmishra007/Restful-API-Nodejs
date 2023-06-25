const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const {isAuthenticatedUser , authorizedRole } = require('../middlewares/auth');

router.get('/me',isAuthenticatedUser,userController.getUserProfile);

router.put('/password/update',isAuthenticatedUser,userController.updateCurrentUserPassword)

router.put('/me/update',isAuthenticatedUser,userController.updateUserData);

// TODO: Testing left for below routes
router.delete('/me/delete',isAuthenticatedUser,userController.deleteUser);

router.get('/jobs/applied',isAuthenticatedUser,authorizedRole('user'),userController.getAppliedJobs);

router.get('/jobs/published',isAuthenticatedUser,authorizedRole('admin', 'employeer'),userController.getPublishedJobs);

// TODO: Postman route making pending.
router.get('/users',isAuthenticatedUser,authorizedRole('admin'),userController.getUsers);




module.exports = router;