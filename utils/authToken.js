const jwt = require('jsonwebtoken')

const jwtAuthToken = (user) => {
    const secretKey = process.env.JWT_SECRET_KEY   

    const token = jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    }, secretKey)

    return token
}

module.exports = jwtAuthToken