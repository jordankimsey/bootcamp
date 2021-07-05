const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(morgan('tiny'))

app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next();
})

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'chicken') {
        next();
    } 
    res.send('Sorry wrong password');
}

// app.use((req, res, next) => {
//     console.log("First middleware");
//     next();
// })

// app.use((req, res, next) => {
//     console.log("second middleware");
//     next();
// })

app.get('/', (req, res) => {
    console.log(`Request date: ${req.requestTime}`)
    res.send('Home Page');
})

app.get('/dogs', (req, res) => {
    res.send('Dog page');
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send('My secret is . . . ')
})

app.use((req, res) => {
    res.status(404).send("NOT FOUND");
})

app.listen(3000, () => {
    console.log('Port 3000 open');
})


