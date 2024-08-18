import dotenv from 'dotenv';
import {Client} from 'pg';

dotenv.config();


const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port:parseInt(process.env.DB_PORT || '5432')
  });

  export default db;
