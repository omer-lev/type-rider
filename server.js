const express = require('express');
const app = express();
const colors = require('colors');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT || 8000}`.magenta);
});