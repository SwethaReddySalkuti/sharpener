const express = require('express');
const app = express()
const port = 3000;
const bodyparser = require('body-parser');
const Razorpay = require('razorpay');
app.use(require("body-parser").json());
var instance = new Razorpay({
    key_id:'RAZORPAY_KEY_ID',
    key_secret:'RAZORPAY_KEY_SECRET'
});


app.get('/',(req,res) => {
    res.sendFile("index.html",{root : __dirname})
})
