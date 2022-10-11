const Product = require('../models/product')
const products = require('../products')
const cloudinary = require('../utils/cloudinary')

exports.getProducts = async (req, res) => {
    try{
        const products = await Product.find()
        res.status(200).send(products)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}

exports.createNewProduct = async (req, res) => {

    const {name, brand, price, desc, image} = req.body

    try {
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                upload_preset: 'smartShop'
            })
            if(uploadResponse) {
                const product = new Product({
                    name, brand, price, desc, image: uploadResponse
                })
                
                const savedProduct = await product.save()

                res.status(200).send(savedProduct)
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).send(error)        
    }

}

