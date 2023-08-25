const express = require('express');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/test', (req, res, next) => {
    console.log("TEST");
    res.send("test")
})

const server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
})
