const express = require("express");
const router = express.Router();
const path = require("path");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");
// const {check} = require('express-validator')

// const products = [];
const adminController = require("../controllers/admin");

// // /admin/add-product -> GET request
router.get("/add-product", isAuth, adminController.getAddProduuct);

// // /admin/products -> GET request
router.get("/products", isAuth, adminController.getProducts);

// // /admin/add-product -> POST request
router.post(
  "/add-product",
  [
    body("title")
      // .isString()
      .isLength({ min: 3 })
      .trim(),

    body("imageUrl"),
    // .isURL() ,
    body("price"),
    // .isFloat() ,
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title")
      // .isString()
      .isLength({ min: 3 }),
    // .trim(),
    body("imageUrl"),
    // // .isURL() ,
    // ,

    body("price"),
    // .isFloat() ,
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// router.post("/delete-product", isAuth, adminController.deleteProduct);

router.post("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
// exports.routes = router;
// exports.products = products;
