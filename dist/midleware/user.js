"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const expressAsyncHandler = require("express-async-handler");
const jsonwebtoken_1 = require("jsonwebtoken");
const userMiddleware = expressAsyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtToken = req.headers['authorization'];
    console.log(jwtToken);
    if (!jwtToken || typeof jwtToken !== 'string') {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = jwtToken.split(' ')[1];
    const secret = process.env.MY_SECRET;
    if (!secret) {
        res.status(404).json({ error: "Secret not found" });
        return;
    }
    let payload;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, secret);
    }
    catch (error) {
        res.status(401).json({ error: "Unauthorized! Invalid token" });
        return;
    }
    if (!payload) {
        res.status(401).json({ error: "Unauthorized! No payload" });
        return;
    }
    req.userId = payload.userId;
    next();
}));
exports.default = userMiddleware;
