const express = require('express')
const Stripe = require('stripe');
const Order = require('../models/order');



const router = express.Router()

const stripe = Stripe(process.env.STRIPE_KEY)



router.post('/create-checkout-session', async (req, res) => {

    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.userId,
      }
    })


    const line_items = req.body.cartItems.map(item => {
       return { price_data: {
            currency: 'inr',
            product_data: {
                name: item.name,
                images: [item.image.url],
                description: item.desc,
                metadata: {
                    id: item.id
                }
            },
            unit_amount: item.price * 100
            },
            quantity: item.cartQuantity
        }
    })


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
          allowed_countries: ['IN'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'inr',
              },
              display_name: 'Free shipping',
              // Delivers between 5-7 business days
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              }
            }
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 1500,
                currency: 'inr',
              },
              display_name: 'Next day air',
              // Delivers in exactly 1 business day
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 1,
                },
                maximum: {
                  unit: 'business_day',
                  value: 1,
                },
              }
            }
          },
        ],
        phone_number_collection: {
            enabled: true,
          },
        customer: customer.id,
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });
  
    res.send({url: session.url});
});



const endpointSecret = 'whsec_9e3feb39c04c60a25777484e3e5ba0e1b4a36cf3fd1fee50a546530ff6858bb5'

router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  let event = request.body;
  
  if (endpointSecret) {
    
    const signature = request.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,    
        endpointSecret
      );
      console.log('Webhook verified')
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    stripe.customers.retrieve(event.data.object.customer).then(customer => {
    
      stripe.checkout.sessions.listLineItems(
        event.data.object.id,
        { },
        function(err, lineItems) {
          console.log('Line Items : ' + lineItems + 'And this is event.data.object : ' + event.data.object)

          createOrder(customer, event.data.object, lineItems)
        }
      );



    }).catch(error => console.log(error.message))
  }



  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


// Create Order
const createOrder = async (customer, data, lineItems) => {

  const newOrder = new Order ({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: lineItems.data,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    shipping: data.customer_details,
    payment_status: data.payment_status
  })

  try {
    const savedOrder = await newOrder.save()
    console.log('Processed Order : ' + savedOrder)
  } catch (error) {
    console.log(error)
  }

}




module.exports = router