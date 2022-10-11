const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    const {token} = req.body
    
    if (!token) {
        return res.status(401).send('Access denied. Not authenticateddd')
    }
    console.log('This is token : ' + token)

    try {
        const secretKey = process.env.JWT_SECRET_KEY
        const user = jwt.verify(token, secretKey)

        req.user = user

        next()

    } catch (error) {
        res.status(400).send('Access denied. Invalid auth token' + error)
    }

}

const isAdmin = (req, res, next) => {
    auth(req, res, () => {
        if(req.user.isAdmin) {
            next()
        } else {
            res.status(403).send('Access denied. Not authorized')
        }
    })
}

module.exports = {auth, isAdmin}