// const sequelize = require('./util/database');
// const Product = require('./models/product')
// const User = require('./models/user')
// const Cart = require('./models/cart')
// const CartItem = require('./models/cart-item')
// const Order = require('./models/order')
// const OrderItem = require('./models/order-item')

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
//Using this package to stop csrf attacks
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();
//handling 404 route via controller
// const errorController = require('./controllers/404');
const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;
//Uncomment this when you want to connect with local database
// const MONGODB_URI = "mongodb://127.0.0.1:27017/myshop";

// const mongoConnect = require('./util/database').mongoConnect;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // cb(null , file.filename + '-' + file.originalname);
    // cb(null , new Date.now() + '-' + file.originalname);
    // const currentTime = Date.now();
    // const currentDate = new Date();
    cb(null, `${file.originalname}`);
    // cb(null , `${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// const bodyParser = require('body-parser')
// const http = require('http');
// const fs = require('fs');

// 314608a84e61455a7c5baf518b979f82

app.set("views", "views");
//Setting EJS as template negine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// db.execute('SELECT * FROM products')
//     .then((result)=> {
//         console.log(result);
//     })
//     .catch((err)=>{
//         console.log(err);
//     })

// Handler for getting body content
app.use(express.urlencoded({ extended: true }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Handler for giving access to the public folder , where are static files are , which are available to public
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

//setting session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  (res.locals.isAuthenticated = req.session.isLoggedIn),
    (res.locals.csrfToken = req.csrfToken());
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // console.log(err);
      next(new Error(err));
    });
});

// app.use((req,res,next)=>{
//     res.locals.isAuthenticated = req.session.isLoggedIn,
//     res.locals.csrfToken = req.csrfToken()
//     next();

// })

// app.use((req,res,next)=>{
//     User.findById('65c487b96cfb9776d9a3e95a')
//         .then((user)=> {
//             req.user = user;
//             next();
//         }).catch((err)=>{
//             console.log(err);
//         })
// })

//Setting pug as template negine - Testing Purpose
// app.set('view engine' , 'pug');

// =====> These two are admin routes , admin must be able to see and hanndle all these routes , so we have created a new file in folder named routes
// and there in admin.js file , we have included these routes

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
//use handler - handles both get and post request
app.use(errorController.get404);

//Special Error Handling middleware
app.use((error, req, res, next) => {
  // res.redirect('/500')
  res.render("500", {
    pageTitle: "Technical Error",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// User.hasMany(Product);
// Product.belongsTo(User, {constraints : true , onDelete : 'CASCADE'})

//will add user_id to cart table
// User.hasOne(Cart);
// Cart.belongsTo(User);

//A cart can hold multiple products
//will add cart_id in product

// Cart.belongsToMany(Product , {through : CartItem})

// many to many relationship between cart and product , so we will store both the information in cartitem table

//same product can be in multiple carts
// will add product_id in cart table
// Product.belongsToMany(Cart , {through : CartItem})

// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product , {through : OrderItem})
// Product.belongsToMany(Order , {through : OrderItem})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(PORT);
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

// mongoConnect(()=>{
//     // console.log(client);
//     app.listen(3000);
// })
