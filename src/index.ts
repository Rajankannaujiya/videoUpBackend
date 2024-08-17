import db from './db/db';
import express from 'express'
import cors from 'cors'

import {createUsersTable, createVideoTable} from './db/table';



const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));


 db.connect();

 createUsersTable();
createVideoTable();

app.get("/",(req, res)=>{
    res.send("hello world")
})

import userRouter from './userAuth/Auth';
import videoRouter from '../src/video/vedeoRouter';

app.use('/api/v1/user', userRouter); 
app.use('/api/v1/video',videoRouter )

const port =3000

app.listen( port ,function(){
    console.log(`server is listening on the port ${port}`)
})