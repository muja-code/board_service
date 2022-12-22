const express = require("express");
const cookie_parser = require("cookie-parser");

const models = require("./models");
const postRouter = require("./routes/posts.js");
const userRouter = require("./routes/users.js");


const app = express();

app.use(express.json());
app.use(cookie_parser());
app.use("/api", [userRouter, postRouter]);

app.get("/", (req, res) => {
    res.send("안녕하세요!!")
});


models.sequelize.sync().then(() => {
    console.log(" DB 연결 성공");
}).catch(err => {
    console.log("연결 실패");
    console.log(err);
});

app.listen(3000, () => {
    console.log(3000, '포트로 서버가 열렸어요!');
});