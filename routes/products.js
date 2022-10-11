const express = require('express')
const router = express.Router()

const { getProducts, createNewProduct } = require('../controllers/productController')
const { isAdmin } = require('../middleware/auth')

router.get('/products', getProducts)

router.post('/createProduct', isAdmin, createNewProduct)



module.exports = router