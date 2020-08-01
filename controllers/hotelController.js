//USING MVC pattern controller

const {
    NotExtended
} = require("http-errors");

const cloudinary = require('cloudinary');
const multer = require('multer');

const storage = multer.diskStorage({}); //disc storage no need because cloudinary
//It will then user computers default directory
const upload = multer({
    storage
});
exports.upload = upload.single('image'); //Means justt single image will be uploaded

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

const Hotel = require('../models/hotel');

// exports.homePage = (req, res) => {
//     res.render('index', {
//         title: 'Easy Travelling'
//     });
// }

exports.listAllHotels = async (req, res, next) => {
    try {
        //eq mongo opeartor checks for equality
        const allHotels = await Hotel.find({
            available: {
                $eq: true
            }
        });
        res.render('all_hotels', {
            title: 'All hotels',
            allHotels
        });
    } catch (errors) {
        next(errors);
    }
}

exports.listAllCountries = async (req, res, next) => {
    try {
        const allCountries = await Hotel.distinct('country');
        res.render('all_countries', {
            title: 'Browse by country',
            allCountries
        });
    } catch (errors) {
        next(errors);
    }

}

exports.homePageFilters = async (req, res, next) => {
    try {
        const hotels = Hotel.aggregate([{
                $match: {
                    available: true
                }
            },
            {
                $sample: {
                    size: 9
                }
            }
        ]);
        const countries = Hotel.aggregate([{
                $group: {
                    _id: '$country'
                }
            },
            {
                $sample: {
                    size: 9
                }
            }
        ]);
        //Destructuring
        const [filteredCountries, filteredHotels] = await Promise.all([countries, hotels]);
        res.render('index', {
            filteredHotels,
            filteredCountries
        });
        // res.json(hotels)
    } catch (error) {
        next(error)
    }
}

exports.adminPage = (req, res) => {
    res.render('admin', {
        title: 'Admin'
    });
}

exports.createHotelGet = (req, res) => {
    res.render('add_hotel', {
        title: 'Add new hotel'
    })
}

exports.createHotelPost = async (req, res, next) => {
    // res.json(req.body);
    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.redirect(`/all/${hotel._id}`);
    } catch (error) {
        next(error);
    }
    //Sending our Form data to mongo db
}

exports.editRemoveGet = (req, res) => {
    res.render('edit_remove', {
        title: 'Search for hotel to edit or remove'
    });
}

exports.editRemovePost = async (req, res, next) => {
    try {
        const hotelId = req.body.hotel_id || null;
        const hotelName = req.body.hotel_name || null;

        const hotelData = await Hotel.find({
            $or: [{
                _id: hotelId
            }, {
                hotel_name: hotelName
            }]
        }).collation({
            locale: 'en',
            strength: 2
            //Collation helps to strength means case sensitive lacale means in english
        });

        if (hotelData.length > 0) {
            // res.json(hotelData);
            res.render('hotel_detail', {
                title: `Add/ Remove Hotel`,
                hotelData
            })
            return;
        } else {
            res.redirect('/admin/edit-remove')
        }
    } catch (errors) {
        next(errors)
    }
}

exports.updateHotelGet = async (req, res, next) => {
    try {
        const hotel = await Hotel.findOne({
            _id: req.params.hotelId
        });
        // res.json(hotel);
        res.render('add_hotel', {
            title: `Update Hotel`,
            hotel
        });
    } catch (error) {
        next(error)
    }
}

exports.updateHotelPost = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const hotel = await Hotel.findByIdAndUpdate(hotelId, req.body, {
            new: true
        }) //new:true will make sure we get all updated data
        res.redirect(`/all/${hotelId}`)
    } catch (error) {
        next(error);
    }
}

exports.deleteHotelGet = async (req, res, next) => {
    const hotelId = req.params.hotelId;
    const hotel = await Hotel.findOne({
        _id: hotelId
    })
    res.render('add_hotel', {
        title: 'Delete Hotel',
        hotel
    })

}

exports.hotelDetail = async (req, res, next) => {
    try {
        const hotelParam = req.params.hotel;
        const hotelData = await Hotel.find({
            _id: hotelParam
        });
        res.render('hotel_detail', {
            title: 'Cozy travelling',
            hotelData
        })
    } catch (error) {
        next(error)
    }
}

exports.hotelsByCountry = async (req, res, next) => {
    try {
        const countryParam = req.params.country;
        const countryList = await Hotel.find({
            country: countryParam
        })
        // res.json(countryList);
        res.render('hotels_by_country', {
            title: ` Browse by Country: ${countryParam}`,
            countryList
        })
    } catch (error) {
        next(error)
    }
}

exports.pushToCloudinary = (req, res, next) => {
    if (req.file) {
        cloudinary.uploader.upload(req.file.path)
            .then((result) => {
                req.body.image = result.public_id;
                next();
            })
            .catch(() => {
                res.redirect(`/admin/add`);
            })
    } else {
        next();
    }
}

exports.searchResults = async (req, res, next) => {
    try {
        //gte means > operater
        //text is also mentioned in the hotel.js database
        //star rating is stored as integer in db while string in json
        const searchQuery = req.body;
        const parsedStars = parseInt(searchQuery.stars) || 1;
        const parsedSort = parseInt(searchQuery.sort) || 1;
        const searchData = await Hotel.aggregate([{
                $match: {
                    $text: {
                        $search: `\"${searchQuery.destination}\"`
                    }
                }
            },
            {
                $match: {
                    available: true,
                    star_rating: {
                        $gte: parsedStars
                    }
                }
            },
            {
                $sort: {
                    cost_per_night: parsedSort
                }
            }
        ])
        // res.json(searchData);
        //   res.send(typeof searchQuery.stars);
        res.render('search_results', {
            title: 'Your Search Results',
            searchData,
            searchQuery
        });
    } catch (error) {
        next(error);
    }
}


// module.exports=name