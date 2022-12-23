const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User } = require("../models");

require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

const router = express.Router();

// 회원가입
router.post("/users", async (req, res) => {
    try {
        const { nickname, password, confirmPassword } = req.body;
        const nickname_re = /[^a-zA-Z0-9]/;
        const password_re = /[^a-zA-Z0-9\!\@\#]/

        const check_token = req.cookies.token;

        try {
            jwt.verify(check_token, JWT_SECRET_KEY)
            return res.status(412).json({
                msg: "이미 로그인이 되어있습니다."
            });
        } catch (e) {
            console.log(e);
        }

        if (!nickname || !password || !confirmPassword) {
            throw error;
        }

        const check_nickname = await User.findOne({
            where: { nickname: nickname }
        })

        if (check_nickname) {
            return res.status(412).json({
                msg: "중복된 닉네임입니다."
            });
        }

        if (nickname.length < 3 || nickname_re.test(nickname)) {
            return res.status(412).json({
                msg: "닉네임 형식이 일치하지 않습니다."
            });
        }

        if (password < 4 || password_re.test(password)) {
            return res.status(412).json({
                msg: "패스워드 형식이 일치하지 않습니다."
            });
        }

        if (password.includes(nickname)) {
            return res.status(412).json({
                msg: "패스워드에 닉네임이 포함되어 있습니다."
            });
        }

        if (password !== confirmPassword) {
            return res.status(412).json({
                msg: "패스워드가 일치하지 않습니다."
            });
        }

        const bcry_pw = await bcrypt.hashSync(password, 10);

        await User.create({ nickname, password: bcry_pw });

        res.status(201).json({
            msg: "회원가입에 성공했습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "요청한 데이터 형식이 올바르지 않습니다."
        });
    }
});

// 로그인
router.post("/users/login", async (req, res) => {
    try {
        const { nickname, password } = req.body;

        const check_token = req.cookies.token;

        try {
            jwt.verify(check_token, JWT_SECRET_KEY)
            return res.status(412).json({
                msg: "이미 로그인이 되어있습니다."
            });
        } catch (e) {
            console.log(e);
        }

        const user = await User.findOne({
            where: { nickname },
        });

        const check_pw = bcrypt.compareSync(password, user.password);

        if (!user || !check_pw) {
            return res.status(412).json({
                msg: "이미 로그인이 되어있습니다."
            });
        }

        const token = jwt.sign({
            type: "JWT",
            user_id: user.id,
            nickname: user.nickname
        }, JWT_SECRET_KEY, {
            expiresIn: "10m"
        });

        res.cookie("token", token);
        res.status(200).json({
            msg: "로그인 성공했습니다."
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "로그인에 실패하였습니다."
        });
    }
});

module.exports = router;