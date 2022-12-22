const express = require("express");
const jwt = require("jsonwebtoken");

const { User } = require("../models");

const router = express.Router();

// 회원가입
router.post("/users", async (req, res) => {
    try {
        const { nickname, password, confirmPassword } = req.body;
        const re = /[^a-zA-Z0-9]/;

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

        if (nickname.length < 3 || re.test(nickname)) {
            return res.status(412).json({
                msg: "닉네임 형식이 일치하지 않습니다."
            });
        }

        if (password < 4) {
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

        await User.create({ nickname, password });

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

        const user = await User.findOne({
            where: { nickname },
        });

        if (!user || password !== user.password) {
            return res.status(412).json({
                msg: "닉네임 또는 비밀번호를 확인해주세요"
            });
        }

        const token = jwt.sign({
            type: "JWT",
            user_id: user.id,
            nickname: user.nickname
        }, "secret-key", {
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