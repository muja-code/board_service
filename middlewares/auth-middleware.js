
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

// 토큰 인증 미들웨어
module.exports = (req, res, next) => {
    try {
        const token = req.cookies.token;
        req.decoded = jwt.verify(token, JWT_SECRET_KEY);
        next();

    } catch (err) {
        res.status(401).send({
            msg: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};