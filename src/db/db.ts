import dotenv from 'dotenv';
import {Client} from 'pg';

dotenv.config();


const db = new Client({
    connectionString:process.env.DATABASE_URI
  });

  db.connect();
  export default db;
