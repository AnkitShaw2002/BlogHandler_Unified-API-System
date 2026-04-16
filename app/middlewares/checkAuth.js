const jwt = require("jsonwebtoken")

const CheckAuth = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) {
                // Token invalid but we allow the request to continue (route handler will check req.user)
                req.user = null;
            } else {
                req.user = data
                console.log(req.user);
            }

            next()
        });
    } else {
       
        next()
    }
}

module.exports = CheckAuth;