import express from 'express';
import cors from "cors";


const app = express();
const port = 3000;

app.get("/", (req,res)=>{
    console.log("hello");
})

app.listen(port, ()=>{
    console.log(`Lisening on port ${port}`)
})