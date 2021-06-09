const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>{
    console.log("Connection Successful");
}).catch((e)=>{
    console.log("No Connection");
});

