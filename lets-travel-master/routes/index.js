const express = require('express');
const router = express.Router();

// Require controllers:
const hotelController = require('../controllers/hotelController');
const userController = require('../controllers/userController');

const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncErrorHandler(hotelController.homePageFilters));

// HOTEL / COUNTRIES ROUTES
// ============

router.get('/all', asyncErrorHandler(hotelController.listAllHotels));
router.get('/all/:hotel', asyncErrorHandler(hotelController.hotelDetail));
router.get('/countries', asyncErrorHandler(hotelController.listAllCountries));
router.get('/countries/:country', asyncErrorHandler(hotelController.hotelsByCountry));
router.post('/results', asyncErrorHandler(hotelController.searchResults));

// ADMIN ROUTES
// ============

router.get('/admin', userController.isAdmin, hotelController.adminPage);
router.get('/admin/*', userController.isAdmin);

router.get('/admin/orders', asyncErrorHandler(userController.allOrders));

router.get('/admin/add', hotelController.createHotelGet);
router.post('/admin/add', 
  hotelController.upload, 
  hotelController.pushToCloudinary,
  asyncErrorHandler(hotelController.createHotelPost)
);

router.get('/admin/edit-remove', asyncErrorHandler(hotelController.editRemoveGet));
router.post('/admin/edit-remove', asyncErrorHandler(hotelController.editRemovePost));

router.get('/admin/:hotelId/update', asyncErrorHandler(hotelController.updateHotelGet));
router.post('/admin/:hotelId/update', 
  hotelController.upload, 
  hotelController.pushToCloudinary, 
  asyncErrorHandler(hotelController.updateHotelPost)
);

router.get('/admin/:hotelId/delete', asyncErrorHandler(hotelController.deleteHotelGet));
router.post('/admin/:hotelId/delete', asyncErrorHandler(hotelController.deleteHotelPost));

// USER ROUTES
// ============

router.get('/sign-up', userController.signUpGet);
router.post('/sign-up',  
  userController.signUpPost, 
  userController.loginPost);

router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

router.get('/logout', userController.logout);

router.get('/my-account', asyncErrorHandler(userController.myAccount));

router.get('/order-placed/:data', asyncErrorHandler(
  userController.orderPlaced )
);

// Booking confirmation page
router.get('/confirmation/:data', asyncErrorHandler(userController.bookingConfirmation));


// CATCH ALL OTHER ROUTES
// ======================

router.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = router;
