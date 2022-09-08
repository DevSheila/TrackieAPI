const express = require('express');
const app = express();

const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const cors = require('cors');

require('dotenv/config');

//body parser
app.use(cors());
app.use(bodyParser.json());

//Import Routes


//home route
app.get('/',(req,res)=>{
    res.send("we are on home!");
});

//connect to mongoose
mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser:true},()=>{
    console.log("Connected to DB!");
})
app.listen(3000,()=>{
    console.log(`running on port 3000`)
});