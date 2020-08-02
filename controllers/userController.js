const User = require('../models/user');
const Passport = require('passport');
const Hotel = require('../models/hotel');
const Order = require('../models/order');

//To parse the string into json
const querystring = require('querystring');

//Express validator
const {
    check,
    validationResult
} = require('express-validator');
const {
    sanitize
} = require('express-validator');

exports.signUpGet = (req, res) => {
    res.render('sign_up', {
        title: 'User Sign Up'
    });
}

exports.signUpPost = [
    //Validate data
    check('first_name').isLength({
        min: 1
    }).withMessage('Please specify first name').isAlphanumeric().withMessage('Please type alphanumeric characters'),

    check('surname').isLength({
        min: 1
    }).withMessage('Please specify surname').isAlphanumeric().withMessage('Please type alphanumeric characters'),

    check('email').isEmail().withMessage('Invalid email'),

    check('confirm_email').custom((value, {
        req
    }) => value === req.body.email).withMessage('Email adresses donot match'),
    //value is the value of confirm_email and req contains input of all fields

    check('password').isLength({
        min: 6
    }).withMessage('Password must exceed 5 characters'),

    check('confirm_password').custom((value, {
        req
    }) => value === req.body.password).withMessage('Passwords donot match'),

    sanitize('*').trim().escape(),
    //trim removes white spaces and escape html

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are error
            res.render('sign_up', {
                title: 'Please fix the errors!',
                errors: errors.array()
            });
            return;
            // res.json(req.body);
        } else {
            //No errors
            const newUser = new User(req.body);
            User.register(newUser, req.body.password, (err) => {
                if (err) {
                    console.log('error while registering!', err);
                    return next(err);
                }
                next();
                // next(); Move on to the next loginPost after registering
            })
        }
    }
]

exports.loginGet = (req, res) => {
    res.render('login', {
        title: 'Login to continue'
    });
}

exports.loginPost = Passport.authenticate('local', {
    successRedirect: '/',
    successFlash: 'You are now logged in!',
    failureRedirect: '/login',
    failureFlash: 'Login Failed, kindly try again'
});
//successredirect and failure are properties of passport

exports.logout = (req, res) => {
    req.logout();
    req.flash('info', 'You are now logged out');
    res.redirect('/');
}

exports.bookingConfirmation = async (req, res, next) => {
    try {
        const data = req.params.data;
        const searchData = querystring.parse(data);
        const hotel = await Hotel.find({
            _id: searchData.id
        })
        res.render('confirmation', {
            title: 'Confirm your booking',
            hotel,
            searchData
        });
    } catch (error) {
        next(error);
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        next();
        return;
    }
    res.redirect('/');
}

exports.orderPlaced = async (req, res, next) => {
    try {
        const data = req.params.data;
        const parsedData = querystring.parse(data);
        const order = new Order({
            user_id: req.user._id,
            hotel_id: parsedData.id,
            order_details: {
                duration: parsedData.duration,
                dateOfDeparture: parsedData.dateOfDeparture,
                numOfGuests: parsedData.numOfGuests
            }
        });
        await order.save();
        req.flash('info', 'Thank you, your order has been placed!');
        res.redirect('/my-account');
    } catch (error) {
        next(error);
    }
}

exports.myAccount = async (req, res, next) => {
    try {
        const orders = await Order.aggregate([{
                $match: {
                    user_id: req.user.id
                }
            },
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotel_id',
                    foreignField: '_id',
                    as: 'hotel_data'
                }
            }
        ])
        // res.json(orders);
        res.render('user_account', {
            title: 'My Account',
            orders
        });
    } catch (error) {
        next(error);
    }
}