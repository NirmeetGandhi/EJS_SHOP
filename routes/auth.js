const express=  require('express');
const router = express.Router();

const User = require('../models/user');
// const expValidator = require('express-validator/check');

const {check , body } = require('express-validator');

const authController = require('../controllers/auth');

router.get('/login'  ,authController.getLogin);

router.get('/signup' , authController.getSignup);

router.post('/login'  ,

[
body('email')
    .isEmail()
    .withMessage('Please Enter a Valid Email')
    .normalizeEmail(),
body('password' , 'Password has to be valid.')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()

],

authController.postLogin);


router.post('/signup' ,
[
check('email')
.isEmail()
.withMessage('Please Enter a valid Email')
.custom((value , {req})=>{
    // if (value === 'test@test.com') {
    //     throw new Error('You are not Authorized , Please contact Customer Support!!')
    // }
    // return true
    return User.findOne({email : value})
        .then((userDoc)=>{
            if (userDoc) {
                return Promise.reject('Email already exists , Pick a different One');
            }
        })        
}).normalizeEmail() , 
body('password' , 'Please Enter a Password that contains Numbers and text and total length >=5')
.isLength({min: 5})
.isAlphanumeric()
.trim(),

body('confirmPassword')
.trim()
.custom((value , {req})=>{
    if (value !== req.body.password) {
        throw new Error('Password and ConfirmPassword must match!!')
    }
    return true;
})

],
authController.postSignup);

router.post('/logout' , authController.postLogout);


router.get('/reset' , authController.getReset);

router.post('/reset' , authController.postReset);

router.get('/reset/:token' , authController.getNewPassword);

router.post('/new-password' , authController.postNewPassword);

module.exports = router;