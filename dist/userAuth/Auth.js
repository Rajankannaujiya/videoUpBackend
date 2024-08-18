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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
const db_1 = __importDefault(require("../db/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config({ path: '../backend/.env' });
console.log("the env in auth", dotenv_1.default.config({ path: '../backend/.env' }));
const userRouter = (0, express_1.Router)();
// src/userAuth/Auth.ts
// Adjust the path as needed
const router = (0, express_1.Router)();
const saltRounds = 10;
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Request body:', req.body);
        const { username, email, password } = req.body;
        // Check if all required fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        // Check if the user already exists
        const existingUserResult = yield db_1.default.query('SELECT * FROM my_users WHERE email = $1;', [email]);
        if (existingUserResult.rowCount > 0) {
            console.log('Existing user:', existingUserResult.rows[0]);
            return res.status(400).json({ warning: 'User with this email already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        console.log("hashed pass", hashedPassword);
        // Insert the new user into the database
        const insertText = 'INSERT INTO my_users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
        const insertValues = [username, email, hashedPassword];
        const insertResult = yield db_1.default.query(insertText, insertValues);
        // Check if the insert was successful
        if (insertResult.rowCount > 0) {
            const userId = insertResult.rows[0].id;
            console.log("User signed up successfully:", insertResult.rows[0]);
            const secret = process.env.MY_SECRET;
            if (!secret) {
                throw new Error('JWT secret is not defined');
            }
            const token = jsonwebtoken_1.default.sign({ userId }, secret);
            return res.status(201).json({
                message: "User signed up successfully",
                userId,
                token,
            });
        }
        else {
            return res.status(500).json({ error: 'Failed to sign up user' });
        }
    }
    catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ error: 'An error occurred while signing up' });
    }
}));
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Request body:', req.body);
        const { email, password } = req.body;
        // Check if all required fields are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const selectText = 'SELECT * FROM my_users WHERE email = $1';
        const selectValues = [email];
        const result = yield db_1.default.query(selectText, selectValues);
        if (result.rowCount > 0) {
            const user = result.rows[0];
            const userId = user.id;
            const secret = process.env.MY_SECRET;
            if (!secret) {
                throw new Error('JWT secret is not defined');
            }
            yield bcrypt_1.default.compare(password, user.password);
            const token = jsonwebtoken_1.default.sign({ userId }, secret);
            return res.status(201).json({
                message: "User signed in successfully",
                userId,
                token,
            });
        }
        else {
            console.log("User not found");
        }
    }
    catch (error) {
        console.error('Error during signin:', error);
        return res.status(500).json({ error: 'An error occurred while signing in' });
    }
}));
exports.default = userRouter;
