"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db/db"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const table_1 = require("./db/table");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
db_1.default.connect();
(0, table_1.createUsersTable)();
(0, table_1.createVideoTable)();
app.get("/", (req, res) => {
    res.send("hello world");
});
const Auth_1 = __importDefault(require("./userAuth/Auth"));
const vedeoRouter_1 = __importDefault(require("../src/video/vedeoRouter"));
app.use('/api/v1/user', Auth_1.default);
app.use('/api/v1/video', vedeoRouter_1.default);
const port = 3000;
app.listen(port, function () {
    console.log(`server is listening on the port ${port}`);
});
