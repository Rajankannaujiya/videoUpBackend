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
exports.createUsersTable = createUsersTable;
exports.createVideoTable = createVideoTable;
const db_1 = __importDefault(require("./db"));
function createUsersTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.default.query(`
        CREATE TABLE IF NOT EXISTS my_users(
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(300) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    });
}
function createVideoTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.default.query(`
        CREATE TABLE IF NOT EXISTS videos (
            id SERIAL PRIMARY KEY,
            video_public_id VARCHAR(255) NOT NULL,
            video_url TEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            duration FLOAT NOT NULL,
            owner_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_owner
            FOREIGN KEY(owner_id) 
            REFERENCES my_users(id)
        );
`);
    });
}
