
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token;
        req.decoded = jwt.verify(token, "secret-key");
        next();
        
    } catch (err) {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};