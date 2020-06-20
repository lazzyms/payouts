module.exports = app => {
    const main = require("../controllers/main.controller.js");
    var router = require("express").Router();

    router.post('/api/pay', main.createCharge)

    app.use('/', router)
}