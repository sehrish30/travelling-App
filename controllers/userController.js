const User = require('../models/user');

//Express validator
const {
    check,
    validationResult
} = require('express-validator/check');
const {
    sanitize
} = require('express-validator/filter');

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
    }) => value === req.body.email).withMessage('Email donot match'),
    //value is the value of confirm_email and req contains input of all fields

    check('password').isLength({
        min: 6
    }).withMessage('Password must exceed 5 characters'),

    check('confirm_password').custom((value, {
        req
    }) => value === req.body.password).withMessage('Passwords donot match'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //There are error
            res.render('sign_up', {
                title: 'Please fix the errors!'
            });
        } else {
            //No errors
        }
    }



]