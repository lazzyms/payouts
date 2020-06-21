module.exports = app => {
    const main = require("../controllers/main.controller.js");
    var router = require("express").Router();

    router.post('/api/pay', main.createCharge)
    router.post('/api/payout', main.payout)
    router.post('/api/addOwner', main.createOwner)
    router.get('/api/getAllOwner', main.getAllOwner)

    app.use('/', router)
}