const mongoose = require('mongoose');
const { Schema } = mongoose;
const Product = require('./product')

const farmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Farm must have a name!']
    },
    city: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email Required']  
    },
    //two way relationship to DB
    //shows products available at specific farm
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
       } 
    ]
})
//dont have to call next if using async function
farmSchema.post('findOneAndDelete', async function (farm) {
    if (farm.products.length) {
        const res = await Product.deleteMany({ _id: { $in: farm.products } });
        console.log(res);
  }
})

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;

