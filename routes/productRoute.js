const express = require('express');
const { getAllProducts, getProducts } = require('../controllers/productController');

const router = express.Router();

router.route('/products').get(getProducts);
router.route('/products/all').get(getAllProducts);

module.exports = router;