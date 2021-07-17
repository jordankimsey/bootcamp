
//error app practice
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const AppError = require('./AppError.js');


const Product = require('./models/product');
const Farm = require('./models/farm');

mongoose.connect('mongodb://localhost:27017/farmStandTake2', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo Connection Open!!')
    })
    .catch(err => {
        console.log('oh no Mongo connection error')
        console.log(err)
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//gives us access to post on route with req.body 
//empty if we request it without this
//middleware section
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));


//Farm Routes
app.get('/farms', async (req, res) => {
    const farms = await Farm.find({});
    res.render('farms/index', { farms });
})

app.get('/farms/new', (req, res) => {
    res.render('farms/new');
})

app.get('/farms/:id',  async (req, res) => {
    //.populate('products') comes from name on model that we gave 
    const farm = await Farm.findById(req.params.id).populate('products');
    res.render('farms/show', {farm})
})

app.delete('/farms/:id', async (req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    
    res.redirect('/farms');
})

//put error handling wrapper around and error handler at bottom
app.post('/farms', async (req, res) => {
    const farm = await new Farm(req.body);
    await farm.save();
    res.redirect('/farms');
})
//can name route what we want
app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', {categories, farm})
})

app.post('/farms/:id/products', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category });
    //connects both routes both ways with the data
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${farm._id}`);
})







//Products Routes
const categories = ['fruit', 'vegetable', 'dairy'];


//test to ensure app connected
app.get('/products', async (req, res) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
})

//creating products
//this route has to be before /:id route because otherwise it is treated as id='new' and not 
//the route follows the same format as /:id so node treats it the same
app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })

})

//route where new post is submited 
app.post('/products', wrapAsync(async (req, res, next) => {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect(`/products/${newProduct._id}`)   
}))

function wrapAsync(fn) {
    return function (req, res, next) {
       fn(req,res,next).catch(e => next(e)) 
    }
}

//details page route using mongo id
app.get('/products/:id', wrapAsync(async (req, res, next) => {
        const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    
    // console.log(product);
    if (!product) {
        throw next(new AppError('Product not found', 404));
    }
    console.log(product)
    res.render('products/show', { product })
}))

app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        throw next(new AppError('Cannot edit', 404))
    }
    res.render('products/edit', { product, categories })
}))

app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators: true, new:true})
    res.redirect(`/products/${product._id}`);
}))

app.delete('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
}))

const handleValidationErr = err => {
    console.log(err);
    return err;
}

app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something Went Wrong' } = err;
    res.status(status).send(message);
})



app.listen(3000, () => {
    console.log('app is listening on port 3000')
})













//orginal app
// const express = require('express');
// const app = express();
// const path = require('path');
// const mongoose = require('mongoose');
// const methodOverride = require('method-override');


// const Product = require('./models/product');

// mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('Mongo Connection Open!!')
//     })
//     .catch(err => {
//         console.log('oh no Mongo connection error')
//         console.log(err)
//     })

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// //gives us access to post on route with req.body 
// //empty if we request it without this
// //middleware section
// app.use(express.urlencoded({ extended: true }))
// app.use(methodOverride('_method'));

// const categories = ['fruit', 'vegetable', 'dairy'];


// //test to ensure app connected
// app.get('/products', async (req, res) => {
//     const { category } = req.query;
//     if (category) {
//         const products = await Product.find({ category })
//         res.render('products/index', { products, category })
//     } else {
//         const products = await Product.find({})
//         res.render('products/index', { products, category: 'All' })
//     }
// })

// //creating products
// //this route has to be before /:id route because otherwise it is treated as id='new' and not 
// //the route follows the same format as /:id so node treats it the same
// app.get('/products/new', (req, res) => {
//     res.render('products/new', { categories })
// })

// //route where new post is submited 
// app.post('/products', async (req, res) => {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     res.redirect(`/products/${newProduct._id}`)
// })

// //details page route using mongo id
// app.get('/products/:id', async (req, res) => {
//     const { id } = req.params;
//     const product = await Product.findById(id)
//     console.log(product)
//     res.render('products/show', { product })
// })

// app.get('/products/:id/edit', async (req, res) => {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     res.render('products/edit', { product, categories })
// })

// app.put('/products/:id', async (req, res) => {
//     const { id } = req.params;
//     const product = await Product.findByIdAndUpdate(id, req.body, {runValidators: true, new:true})
//     res.redirect(`/products/${product._id}`);
// })

// app.delete('/products/:id', async (req, res) => {
//     const { id } = req.params;
//     const deletedProduct = await Product.findByIdAndDelete(id);
//     res.redirect('/products');
// })



// app.listen(3000, () => {
//     console.log('app is listening on port 3000')
// })