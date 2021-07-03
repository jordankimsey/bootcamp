const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

//do not put quotes around CampgroundSchema
module.exports = mongoose.model('Campground', CampgroundSchema);

