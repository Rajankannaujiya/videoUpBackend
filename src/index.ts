
import express from 'express'
import cors from 'cors'

import { createImageTable, createUsersTable, createVideoTable} from './db/table';



const app = express();
app.use(cors({
 origin: "*";
}
 ));

app.use(compression(
    {
        level:6,
        threshold:100 * 1000
    }
))

app.use(express.json()); 
app.use(express.urlencoded({ extended: false ,limit:1000000000}));




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
import { postRouter } from './post/postRouter';

app.use('/api/v1/user', userRouter); 
app.use('/api/v1/video',videoRouter )
app.use('/api/v1/image',imageRouter )
app.use('/api/v1/post',postRouter)


const port =3000

app.listen( port ,function(){
    console.log(`server is listening on the port ${port}`)
})
