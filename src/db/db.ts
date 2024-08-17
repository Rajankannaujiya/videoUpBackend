import dotenv from 'dotenv';
import {Client} from 'pg';

dotenv.config({ path: '../backend/.env' });


const db = new Client({
    connectionString:process.env.DATABASE_URI
  });

  export default db;

  db.connect();