
import express from 'express'
import cors from 'cors'

import { createImageTable, createUsersTable, createVideoTable} from './db/table';



const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));




 createUsersTable();
createVideoTable();
createImageTable();
// alterImageTable();

app.get("/",(req, res)=>{
    res.send("hello world")
})

import userRouter from './userAuth/Auth';
import videoRouter from './video/vedeoRouter';
import imageRouter from './image/imageRouter';

app.use('/api/v1/user', userRouter); 
app.use('/api/v1/video',videoRouter )
app.use('/api/v1/image',imageRouter )


const port =3000

app.listen( port ,function(){
    console.log(`server is listening on the port ${port}`)
})
