const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
const Product = require("../models/product");
// const mongodb = require('mongodb');

// const objectId = mongodb.ObjectId;

exports.getAddProduuct = (req, res) => {
  // if (!req.session.isLoggedIn) {
  //     return res.redirect('/login');
  // }

  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    // isAuthenticated: req.session.isLoggedIn
  });
  //  path : '/admin/edit -product'
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      // editing: editMode ,
      editing: false,
      // product:product,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description.trim(),
      },
      errorMessage: "Attached File is not an Image",
      validationErrors: [],
      // isAuthenticated: req.session.isLoggedIn
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      // editing: editMode ,
      editing: false,
      // product:product,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      // isAuthenticated: req.session.isLoggedIn
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then((result) => {
      console.log("Produc created");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  // Product.findByPk(prodId)

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;

  // const product = new Product(updatedTitle,updatedPrice,updatedDescription,updatedImageUrl, new objectId(prodId));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      // editing: editMode ,
      editing: true,
      // product:product,
      hasError: true,
      product: {
        title: updatedTitle,
        // imageUrl : updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      // isAuthenticated: req.session.isLoggedIn
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product.save().then((result) => {
        console.log("Updated Product!!!");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getProducts = (req, res) => {
  // Product.findAll()

  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postDeleteProduct = ((req,res,next)=>{
//     const prodId = req.body.productId;

//     Product.findById(prodId)
//     .then((product)=>{
//         if (!product) {
//             return next(new Error("No Products Found!!"))
//         }
//         fileHelper.deleteFile(product.imageUrl);
//         return  Product.deleteOne({_id : prodId , userId : req.user._id})
//     })
//     .then(()=>{
//         console.log("Deleted Successfully");
//         res.redirect('/admin/products');
//     }).catch((err)=>{
//         // console.log(err);
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     })

//     // const productIndex = products.findIndex((product)=> product.id===prodId);
//     // const deleteProduct = products[productIndex];

// })

exports.deleteProduct = (req, res, next) => {
  // const prodId = req.params.productId;
  const prodId = req.body.productId;
  console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("No Products Found!!"));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      // console.log("Deleted Successfully");
      res.status(200).json({ message: "Success!!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Deletion Failed!!" });
    });

  // const productIndex = products.findIndex((product)=> product.id===prodId);
  // const deleteProduct = products[productIndex];
};
