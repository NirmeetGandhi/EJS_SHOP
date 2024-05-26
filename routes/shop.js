const express = require('express');
const path = require('path');
const isAuth  = require('../middleware/is-auth')

const router = express.Router();

const shopController = require('../controllers/shop');

//Accessing all content of admin.js to this file , so that we can use it
const adminData = require('./admin')


router.get('/',shopController.getIndex);

router.get('/products',shopController.getProducts);

router.get('/products/:productId' , shopController.getProduct);

router.get('/cart' ,isAuth, shopController.getCart);

router.post('/cart' ,isAuth, shopController.postCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteProduct);

router.post('/create-order' ,isAuth, shopController.postOrder);

router.get('/orders' ,isAuth, shopController.getOrders);

router.get('/orders/:orderId' , isAuth , shopController.getInvoice);

// router.get('/checkout' , shopController.getCheckout);




// router.get('/about', (req,res)=>{
//     res.send('<h1 style="color: yellow;">About Us</h1>')
// })


module.exports = router;

