const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, { apiVersion: '' });

// Find or create customer with adding card token to customer
let findOrCreateCustomer = (email, token) => {
    return new Promise((resolve, reject) => {
        stripe.customers.list(
            { email: email, limit: 1 },
            (err, customers) => {
                if (err) {
                    reject(err)
                    res.send(400).send({ success: false, result: { message: err.message } })
                } else {
                    if (customers.data.length > 0) {
                        console.log('customer found')
                        if (token) {
                            createCard(customers.data[0].id, token, customers.data[0].default_source).then(card => {
                                console.log('card created')
                                resolve(customers.data[0], card.id)
                            }).catch(err => {
                                reject(err)
                            })
                        } else {
                            resolve(customers.data[0], customers.data[0].default_source)
                        }
                    } else {
                        createStripeCustomer(email, token).then(data => {
                            console.log('new customer created')
                            resolve(data)
                        }).catch(err => {
                            reject(err)
                        })
                    }
                }
            }
        );
    })
}

// Create new stripe customer
let createStripeCustomer = (email, token) => {
    return new Promise((resolve, reject) => {
        stripe.customers.create({
            email: email,
            source: token,
        }, (err, customer) => {
            if (err) {
                reject(err)
            } else {
                resolve(customer)
            }
        })
    })
}

// Add new card and make it default for customer
let createCard = (customer, token, default_source) => {
    return new Promise((resolve, reject) => {
        stripe.customers.createSource(
            customer,
            { source: token },
            function (err, card) {
                if (err) {
                    reject(err)
                } else {
                    if (default_source) {
                        console.log('default source is not null')
                        stripe.customers.update(
                            customer,
                            { default_source: card.id },
                            function (err, customer) {
                                console.log('customer update with default source')
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(card)
                                }
                            }
                        );
                    } else {
                        console.log('default source is null')
                        resolve(card)
                    }
                }
            }
        );
    })
}

//create charge of customer card
let createCharge = (customer, amount, description, ownerId) => {
    return new Promise((resolve, reject) => {
        stripe.charges.create(
            {
                amount: amount * 100,
                currency: 'usd',
                // source: token,
                description: description,
                customer: customer,
                application_fee_amount: amount * 10,
                transfer_data: {
                    destination: ownerId,
                    // amount: amount * 90 // 90% of total to owner
                }
            },
            function (err, charge) {
                if (err) {
                    reject(err)
                } else {
                    resolve(charge)
                }
            }
        );
    })
}

// create stripe connect account
let createStripeConnect = (data) => {
    return new Promise((resolve, reject) => {
        stripe.accounts.create(
            {
                type: 'custom',
                country: 'US',
                email: data.email,
                requested_capabilities: [
                    'transfers',
                    'card_payments'
                ],
                business_type: 'company',
                // external_account: {
                //     object: 'bank_account',
                //     country: 'US',
                //     currency: 'usd',
                //     routing_number: data.routingNumber,
                //     account_number: data.accountNumber
                // },
                external_account: data.token,
                tos_acceptance: {
                    date: parseInt(Date.now() / 1000),
                    ip: data.ip
                },
                company: {
                    name: data.name,
                    tax_id: data.taxId,
                    address: {
                        line1: data.address,
                        city: 'Manchester',
                        postal_code: 123458,
                        state: 'Georgia'
                    },
                    phone:'0000000000'
                },
                business_profile: {
                    url: data.url
                },
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'manual'
                        }
                    }
                }
            },
            function (err, account) {
                if (err) {
                    reject(err)
                } else {
                    resolve(account)
                }
            }
        );
    })
}

// get all stripe connect accont
let getAllConnectAccount = () => {
    return new Promise((resolve, reject) => {

        stripe.accounts.list(
            function (err, accounts) {
                if (err) {
                    reject(err)
                } else {
                    resolve(accounts)
                }
            }
        );
    })
}

// Manual Payout
let payout = (bank, amount, ownerId) => {
    return new Promise((resolve, reject) => {
        stripe.payouts.create(
            { amount: amount * 100, currency: 'usd', destination: source },
            {
                stripeAccount: ownerId,
            },
            function (err, payout) {
                if (err) {
                    reject(err)
                } else {
                    resolve(payout)
                }
            }
        );
    })
}



module.exports = { findOrCreateCustomer, createStripeCustomer, createCard, createCharge, createStripeConnect, getAllConnectAccount, payout }