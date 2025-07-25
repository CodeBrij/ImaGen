import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json())

await connectDB();
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

app.get('/', (req,res)=>{
    res.send("API working");
})

app.listen(PORT, () => {
    console.log("Server started at port: "+ PORT);
    
})