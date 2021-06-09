const express = require('express');
const app = express();
const router = new express.Router();
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const Userdata = require('../modules/authenticationModules');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

app.use(cookieParser());



router.use(express.static(path.join(__dirname,"../../public/")));

router.get('/',(req,res)=>{

    let hidelogoutbtn = "";
    let hideloginbtn = "";
    if(req.session.userID){
        hidelogoutbtn="";
        hideloginbtn="hidden";
    }else{
        hidelogoutbtn="hidden";
        hideloginbtn="";
    }

    res.render('index',{
        hidelogoutbtn,hideloginbtn
    });
});

router.get("/about",(req,res)=>{

    let hidelogoutbtn = "";
    let hideloginbtn = "";
    if(req.session.userID){
        hidelogoutbtn="";
        hideloginbtn="hidden";
    }else{
        hidelogoutbtn="hidden";
        hideloginbtn="";
    }
    res.render('about',{
        hidelogoutbtn,hideloginbtn
    });
});


router.get("/services", auth ,(req,res)=>{
    res.render('services',{
        hidelogoutbtn:'',
        hideloginbtn:'hidden'
    });
});

router.get("/register",(req,res)=>{

    let hidelogoutbtn = "";
    let hideloginbtn = "";
    if(req.session.userID){
        hidelogoutbtn="";
        hideloginbtn="hidden";
    }else{
        hidelogoutbtn="hidden";
        hideloginbtn="";
    }

    res.render('register',{
        hidelogoutbtn,hideloginbtn
    });
});

router.get("/login",(req,res)=>{

    let hidelogoutbtn = "";
    let hideloginbtn = "";
    if(req.session.userID){
        hidelogoutbtn="";
        hideloginbtn="hidden";
    }else{
        hidelogoutbtn="hidden";
        hideloginbtn="";
    }

    res.render('login',{
        hidelogoutbtn,hideloginbtn
    });
});

router.get("/profile",auth,(req,res)=>{
    let firstname = req.user.firstname;
    let lastname = req.user.lastname;
    let useremail = req.user.email;
    let userphoneno = req.user.phone;
    let username = `${firstname} ${lastname}`;
    let imagename = req.user.filename;

    res.render('profile',{
        hidelogoutbtn:'',
        hideloginbtn:'hidden',
        username,useremail,userphoneno,imagename
    });
});

router.get("/editProfile",auth,(req,res)=>{
    res.render('editProfile',{
        hidelogoutbtn:'',
        hideloginbtn:'hidden'
    });
});


var Storage = multer.diskStorage({
    destination:"./public/profileImages/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

var upload = multer({
    storage:Storage
}).single('filename'); 


router.post('/register',upload,async (req,res)=>{
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if(password === cpassword){
            
            const userRegister = new Userdata({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                phone:req.body.phone,
                filename:req.file.filename,
                password,cpassword
            });

            const token = await userRegister.generateToken();

            res.cookie('token',token,{
                expires:new Date(Date.now() + 86400000),
                httpOnly:true
            });

            const register = await userRegister.save();
            if(register){
                const userData = await Userdata.findOne({email:req.body.email});
                req.session.userID = userData._id;
            }

            res.status(201).render('index',{
               hideloginbtn:'hidden',
               hidelogoutbtn :''
            });
            
        }else{
            res.send('password are not matching');
        }
        
    } catch (error) {
        console.log(error);
    }
});

router.post('/login',async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const userData = await Userdata.findOne({email});

        if(userData != null){
            const isMatch = await bcrypt.compare(password,userData.password);

            if(isMatch){
                const token = await userData.generateToken();
                
                req.session.userID = userData._id;

                res.cookie('token',token,{
                    expires:new Date(Date.now() + 86400000),
                    httpOnly:true
                });

                res.status(200).render('index',{
                    hidelogoutbtn:'',
                    hideloginbtn:'hidden'

                });
            }else{
                res.send('Password are not matching');
            }
        }else{
            res.send('Email are not matching');
        }
    }catch(error){
        res.status(500).send(error);
    }
});

router.get("/logout",auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((element)=>{
            return element.token != req.token;
        });

        res.clearCookie('token');
        req.session.destroy(function(error){
            if(error){
                res.render('login',{
                    hidelogoutbtn:'hidden',
                    hideloginbtn:''
                });
            }
        });

        await req.user.save();
        res.render('login',{
            hidelogoutbtn:'hidden',
            hideloginbtn:''
        });
    } catch (error) {
        res.status(500).send(error)
    }
});


module.exports = router;