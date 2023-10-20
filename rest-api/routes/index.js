var express = require('express');
var router = express.Router();
var { SumClient } = require('./SumClient');

router.post('/sum', function (req, res) {
    var name = req.body.name;
    var num1 = req.body.num1;
    var num2 = req.body.num2;

    var client = new SumClient();
    client.sumTwoNumbers(name, num1, num2);
    res.send('Sum transaction submitted');
});

router.post('/show', function (req, res) {
    var name = req.body.name;
    var client = new SumClient();

    client.showSum(name).then(function (sum) {
        console.log("Sum: " + JSON.stringify(sum));
        res.send(sum);
    });
});

module.exports = router;