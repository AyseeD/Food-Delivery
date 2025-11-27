import express from 'express';

const app = express();
const port = 3000;

app.get("/", (req,res)=>{
    console.log("hello");
})

app.listen(port, ()=>{
    console.log(`Lisening on port ${port}`)
})