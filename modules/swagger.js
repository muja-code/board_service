const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "board service server",
            description:
                "내일배움캠프 express 게시판 프로젝트"
        },
        server: [
            {
                url: "http://127.0.0.1:3000",
                basePath: '/'

            },
        ],
    },
    apis: ["./routes/*.js"]
};

const specs = swaggerJSDoc(options);

module.exports = { swaggerUi, specs }