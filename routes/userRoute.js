const express = require('express');
const { registerUser, loginUser, logoutUser, getAllUsers, getUserDetails, getSingleUser, updateUserRole, deleteUser, forgotPassword, resetPassword, updatePassword, updateProfile} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles, successResponse } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);

router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/private/auth').get(isAuthenticatedUser, successResponse)
module.exports = router;