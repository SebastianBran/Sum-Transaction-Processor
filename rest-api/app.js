var express = require('express');
var routes = require('./routes/index');

var app = express();

app.use(express.json());

app.listen(3000, function () {
    console.log("Server running on port 3000");
});

app.use("/", routes);
