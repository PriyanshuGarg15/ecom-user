const express = require('express');
const { registerUser, loginUser, logoutUser} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);




router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), );

module.exports = router;