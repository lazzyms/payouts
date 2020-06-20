const stripe = require('stripe')('sk_test_51Gw1NDHxy0YkUg1kag0auPww3r3mlH1GZ8www1kAXBvgGs0Oi5t04OuXGImxNsJ89RjgqoYDVxd47q9mL0PRZSGD00qiDZbtGo', { apiVersion: '' });

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
                        if(token) {
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
                    if(default_source) {
                        console.log('default source is not null')
                        stripe.customers.update(
                            customer,
                            {default_source: card.id},
                            function(err, customer) {
                                console.log('customer update with default source')
                              if(err) {
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
let createCharge = (customer, amount, token, description) => {
    return new Promise((resolve, reject) => {
        stripe.charges.create(
            {
                amount: amount * 100,
                currency: 'usd',
                // source: token,
                description: description,
                customer: customer
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

module.exports = { findOrCreateCustomer, createStripeCustomer, createCard, createCharge }