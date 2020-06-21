let stripeHelper = require('../helper/stripe.helper')
const { model } = require('mongoose')

// accept payment from customers
module.exports.createCharge = (req, res) => {

    if (req.body.email && req.body.amount && req.body.token && req.body.description && req.body.ownerId) {
        console.log('validated')

        stripeHelper.findOrCreateCustomer(req.body.email, req.body.token, req.body.name, req.body.address).then((customer, card) => {

            stripeHelper.createCharge(customer.id, req.body.amount, req.body.description, req.body.ownerId).then(charge => {
                console.log('charge created')

                if (charge.status == 'succeeded') {
                    res.status(200).send({ success: true, result: { message: 'Payment done successfully' } })
                }

            }).catch(err => {
                res.status(400).send({ success: false, result: { message: err.message } })
            })
        }).catch(err => {
            res.status(400).send({ success: false, result: { message: err.message } })
        })

    } else {

        if (!req.body.email) {
            res.status(400).send({ success: false, result: { message: 'Email is required' } })
        } else if (!req.body.amount) {
            res.status(400).send({ success: false, result: { message: 'Amount is required' } })
        } else if (!req.body.token) {
            res.status(400).send({ success: false, result: { message: 'Charge token is required' } })
        } else if (!req.body.description) {
            res.status(400).send({ success: false, result: { message: 'Description is required' } })
        } else if (!req.body.ownerId) {
            res.status(400).send({ success: false, result: { message: 'Owner Id is required' } })
        }
    }
}

// create owner
module.exports.createOwner = (req, res) => {
    if (req.body.email && req.body.name && req.body.taxId && req.body.routingNumber && req.body.accountNumber && req.body.ip && req.body.url) {
        stripeHelper.createStripeConnect(req.body).then(data => {
            res.status(200).send({ success: true, result: { data: data } })
        }).catch(err => {
            res.status(400).send({ success: false, result: { messge: err.message } })
        })
    } else {
        if (!req.body.email) {
            res.status(400).send({ success: false, result: { message: 'Email is required' } })
        } else if (!req.body.name) {
            res.status(400).send({ success: false, result: { message: 'Company Name is required' } })
        } else if (!req.body.routingNumber) {
            res.status(400).send({ success: false, result: { message: 'Routing Number is required' } })
        } else if (!req.body.accountNumber) {
            res.status(400).send({ success: false, result: { message: 'Account Number is required' } })
        } else if (!req.body.ip) {
            res.status(400).send({ success: false, result: { message: 'Ip address is required' } })
        } else if (!req.body.url) {
            res.status(400).send({ success: false, result: { message: 'Business URL is required' } })
        } else if (!req.body.taxId) {
            res.status(400).send({ success: false, result: { message: 'taxId is required' } })
        }
    }
}

// get all active owner
module.exports.getAllOwner = (req, res) => {
    stripeHelper.getAllConnectAccount().then(accounts => {
        let activeAccounts = accounts.data.filter((account) => {
            return account.capabilities.transfers == 'active'
        })
        res.status(200).send({ success: true, result: { data: activeAccounts } })
    }).catch(err => {
        res.status(400).send({ success: false, result: { message: err.message } })
    })
}

// manual payout
module.exports.payout = (req, res) => {
    console.log('request body', req.body)
    if (req.body.bank && req.body.amount && req.body.ownerId) {
        console.log('validated')

        //TODO get total available balance and bank id with stripe

        stripeHelper.payout(req.body.bank, req.body.amount, req.body.ownerId).then(payout => {
            console.log('payout done')
            res.status(200).send({ success: true, result: { data: payout } })
        }).catch(err => {
            res.status(400).send({ success: false, result: { message: err.message } })
        })
    } else {
        console.log('validation error')
        if (!req.body.bank) {
            res.status(400).send({ success: false, result: { message: 'Bank id required' } })
        } else if (!req.body.amount) {
            res.status(400).send({ success: false, result: { message: 'Payout amount is required' } })
        } else if(!req.body.ownerId) {
            res.status(400).send({ success: false, result: { message: 'OwnerId is required' } })
        }
    }
}

