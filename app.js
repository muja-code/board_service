const express = require("express");
const cookie_parser = require("cookie-parser");

const models = require("./models");
const postRouter = require("./routes/posts.js");
const userRouter = require("./routes/users.js");
const { swaggerUi, specs } = require("./modules/swagger.js")

require("dotenv").config();
const { PORT } = process.env;

const app = express();

app.use(express.json());
app.use(cookie_parser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
app.use("/api", [userRouter, postRouter]);

app.get("/", (req, res) => {
    res.send("안녕하세요!!");
});

models.sequelize.sync().then(() => {
    console.log(" DB 연결 성공");
}).catch(err => {
    console.log("연결 실패");
    console.log(err);
});

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});