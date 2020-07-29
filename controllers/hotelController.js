const {
    NotExtended
} = require("http-errors");

exports.homePage = (req, res) => {
    res.render('index', {
        title: 'Easy Travelling'
    });
}

exports.listAllHotels = (req, res) => {
    res.render('all_hotels', {
        title: 'All hotels'
    });
}



// module.exports=name