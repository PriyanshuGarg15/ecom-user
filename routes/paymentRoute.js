const express = require('express');
const router = express.Router();
const { processPayment, paytmResponse, getPaymentStatus } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middleware/auth');


router.route('/payment/process').post(processPayment);
router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);
router.route('/callback').post(paytmResponse);

module.exports = router;