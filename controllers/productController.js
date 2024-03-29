const Product = require('../models/product');
const asyncErrorHandler = require('../middleware/ErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/SyncErrorHandler');
const cloudinary = require('cloudinary');

module.exports={
// Get All Products
getProducts : asyncErrorHandler(async (req, res, next) => {

    const productsCount = await Product.countDocuments();
    // console.log(req.query);

    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter();

    let products = await searchFeature.query;
    let filteredProductsCount = products.length;


    products = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        filteredProductsCount,
    });
}),

// Get All Products ---Product Sliders
getAllProducts : asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
})
}
