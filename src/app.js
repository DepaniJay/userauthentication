// Import .env file for security
require('dotenv').config();
// Import some modules for projects
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
// import connection file 
require('./db/connection');
const session = require('express-session')
// import router file 
const router = require('./routers/router');
// const { registerPartials } = require('hbs');

// define port dynamicaly for server using process.env.PORT method and for localhost we use 8000 port 
const port = process.env.PORT || 8000;


const publicFolderPath = path.join(__dirname,"../public");
const templatesFolderPath = path.join(__dirname,"../templates/views");
const partialsFolderPath = path.join(__dirname,"../templates/partials");
 
app.use(express.static(publicFolderPath));
app.set("view engine","hbs");
app.set("views",templatesFolderPath);
hbs.registerPartials(partialsFolderPath);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret:process.env.SECRET_VALUE,
    resave:false,
    saveUninitialized:true
}));
app.use(router);

app.listen(port,()=>{
    console.log(`listening to the port at ${port}`);
});