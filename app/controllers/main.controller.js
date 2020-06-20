let stripeHelper = require('../helper/stripe.helper')

// accept payment from customers
module.exports.createCharge = (req, res) => {

    console.log('current request body', req.body)
    if (req.body.email && req.body.amount && req.body.token && req.body.description) {
        console.log('validated')

        stripeHelper.findOrCreateCustomer(req.body.email, req.body.token, req.body.name, req.body.address).then((customer, card) => {

            stripeHelper.createCharge(customer.id, req.body.amount, card, req.body.description).then(charge => {
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
        }
    }
}


