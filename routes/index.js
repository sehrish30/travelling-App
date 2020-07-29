var express = require('express');
var router = express.Router();
const hotelController = require('../controllers/hotelController')

/* GET home page. */
router.get('/', hotelController.homePage);

router.get('/all', hotelController.listAllHotels);



// router.get('/all/*:name', (req, res) => {
//   const name = req.params.name;
//   res.render('all_hotels', {
//     title: 'All Hotels',
//     name
//   })
// })

module.exports = router;