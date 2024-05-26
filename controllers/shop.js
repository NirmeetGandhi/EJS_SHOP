const Product = require('../models/product');
// const Cart = require('../models/cart');
const Order = require('../models/order');

const PDFDocument = require('pdfkit');

const fs = require('fs');
const path  = require('path');

const ITEMS_PER_PAGE = 2;

//for all Products
exports.getProducts = (req,res)=>{
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts)=>{
            totalItems = numProducts;
            return Product.find()
            .skip((page-1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
        }).then((products)=>{
            res.render('shop/product-list' , {
                prods : products , 
                pageTitle: 'Products',
                isAuthenticated: req.session.isLoggedIn,
                currentPage : page,
                hasNextPage : (page * ITEMS_PER_PAGE) < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page +1,
                previousPage : page - 1,
                lastPage : Math.ceil((totalItems/ITEMS_PER_PAGE))
            })
        })
        .catch((err)=>{
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};

exports.getProduct = ((req,res)=>{
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product)=>{
            res.render('shop/product-detail' , {product:product , pageTitle: product.title, isAuthenticated: req.session.isLoggedIn})
        })
        .catch((err)=>{
            // console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        
        });

})

exports.getIndex = ((req,res)=>{
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((numProducts)=>{
            totalItems = numProducts;
            return Product.find()
            .skip((page-1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
        }).then((products)=>{
            res.render('shop/index' , {
                prods : products , 
                pageTitle: 'Home Page',
                isAuthenticated: req.session.isLoggedIn,
                currentPage : page,
                hasNextPage : (page * ITEMS_PER_PAGE) < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page +1,
                previousPage : page - 1,
                lastPage : Math.ceil((totalItems/ITEMS_PER_PAGE))
            })
        })
        .catch((err)=>{
            console.log(err);
        })
    });

exports.getCart = ((req,res)=>{

    req.user
        .populate('cart.items.productId')
        .then((user)=>{
            // console.log(user.cart.items);
            const products = user.cart.items;
            res.render('shop/cart', {
                pageTitle : 'Cart',
                products : products,
                isAuthenticated: req.session.isLoggedIn
            })
        }).catch((err)=>{
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
   
    

})




//when you click on add-to-cart button
exports.postCart = ((req,res)=>{
    const prodId = req.body.productId;

    Product.findById(prodId)
    .then((product)=>{
        return req.user.addToCart(product);
    }).then((result)=>{
        console.log(result);
        res.redirect('/cart')
    }).catch((err)=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
})


exports.postCartDeleteProduct = ((req,res)=>{

    const prodId = req.body.productId

    //If the user presses the delete button , that product should be deleted from cart only , not from entire product list
 
    req.user
        .removeFromCart(prodId)
       .then((result)=>{
            res.redirect('/cart');
        })
        .catch((err)=>{ 
            // console.log(err)
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
            
        });
  
})
exports.getOrders = ((req,res)=>{
    Order.find({'user.userId' : req.user._id})
        .then((orders)=>{
            res.render('shop/orders' , {pageTitle:"Your Orders" , orders : orders, isAuthenticated: req.session.isLoggedIn})
        }).catch((err)=>{
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
})

exports.postOrder = ((req,res)=>{
    let fetchedCart;
    req.user
        .populate('cart.items.productId')
        .then((user)=>{
            const products = user.cart.items.map((i)=>{
                return {quantity : i.quantity , product : {...i.productId._doc}}
            })
            const order  =new Order({
                user : {
                    email : req.user.email, 
                    userId : req.user
                },
                products : products
            })
            return order.save()
        }).then((result)=>{
            return req.user.clearCart();
        })
        .then(()=>{
            res.redirect('/orders')
        })
        .catch((err)=>{
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
})

exports.getCheckout = ((req,res)=>{

    res.render('shop/checkout' , {
        pageTitle : 'Checkout',
        isAuthenticated : req.session.isloggedIn
    })
})

exports.getInvoice = ((req,res,next)=>{
    const orderId = req.params.orderId;

    Order.findById(orderId)
    .then((order)=>{
        if (!order) {
            return next(new Error('No Orders Found.'))
        }
        if (order.user.userId.toString() !==req.user._id.toString()) {
            return next(new Error('Unauthorized'))
        }
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join('data' , 'invoices' , invoiceName);

        const pdfDoc = new PDFDocument();

        res.setHeader('Content-Type' , 'application/pdf')
        res.setHeader('Content-Disposition' , 'inline ; filename = " '+ invoiceName +' " ')


        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(25).text("Invoice" , {
            underline : true
        })

        pdfDoc.text("----------------------")
        let totalPrice = 0;

        order.products.forEach((prod)=>{
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.fontSize(15)
            .text(prod.product.title.trim() + " (Quantity)-" + prod.quantity + " x " + " $" + prod.product.price)
        })

        pdfDoc.text("---------------------------")

        pdfDoc
        .fontSize(18)
        .fillColor('red')
        .text("Total Price: $" + totalPrice);



        pdfDoc.fillColor('green')
        pdfDoc.fontSize(14)
        .text("Thank You very much for shopping with us!!!!!")

        
        pdfDoc.fontSize(14)
        .text("Please Do visit us again.")

        pdfDoc.end();

    // fs.readFile(invoicePath, (err,data)=>{
    //     if (err) {
    //         return next(err);
    //     }
    //     res.setHeader('Content-Type' , 'application/pdf')
    //     res.setHeader('Content-Disposition' , 'inline ; filename = " '+ invoiceName +' " ')
    //     res.send(data);
    // })
    
    // const file = fs.createReadStream(invoicePath);
    
    // file.pipe(res);

    }).catch((err)=>{
        next(err);
    })
    
})