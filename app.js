
const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const ejs=require('ejs');
const md5=require('md5');
app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
    }
    mongoose.connect('mongodb://localhost:27017/royalUIdata',options);
    const userSchema={
      email:{type:String},
      password:{type:String},
      secret:{type:String}
    };
    const User=new mongoose.model('user',userSchema);
app.get('/',function(req,res){
    res.render('index',{userName:'Login/Register',href:'/login',accstatus:'none'});
});


app.get('/login',function(req,res){
    res.render('login',{pass:'',loginfo:''});
});


app.get('/register',function(req,res){
    res.render('register',{emailstat:''});
});


app.post('/register',function(req,res){
    console.log(req.body.email);
    console.log(req.body.password);
  const newuser = new User({
    email:req.body.email,
    secret:req.body.secret,
    password:md5(req.body.password)
  });
  User.findOne({email:req.body.email}).then((val)=>{
    if(val==null){
        newuser.save().then(()=>{
            res.render('index',{userName:req.body.email,href:"#",accstatus:'block'});
          })
          .catch((err)=>{
            console.log(err);
          })
    }
    else if(val.email==req.body.email){
        res.render('register',{emailstat:'email already exists log in to your account'});
    }
    else{
        newuser.save().then(()=>{
            res.render('index',{userName:req.body.email,href:"#",accstatus:'block'});
          })
          .catch((err)=>{
            console.log(err);
          })
    }
  })
  .catch((err)=>{
    console.log(err);
  })
  
  
  
});


app.post('/login',function(req,res){
  var logemail=req.body.email;
   var logpassword=md5(req.body.password);
   User.findOne({email:logemail})
 .then((docs)=>{
     if(docs.password==logpassword){
        res.render('index',{userName:logemail,href:"#",accstatus:'block'});
     }
     else{
        res.render('login',{pass:'wrong password',loginfo:''});
     }
 })
 .catch((err)=>{
     
     res.render('login',{loginfo:'you are not registered',pass:''});
 });
   

});
app.get('/forget',function(req,res){
  res.render('forget',{forginfo:''});
})

app.post('/forget',function(req,res){
  User.findOne({email:req.body.email}).then((docs)=>{
    if(docs.email==req.body.email){
      res.render('secret',{email:req.body.email,sec:''});
    }
    else{
      res.render('forget',{forginfo:'email not registered'});
    }
  })
  .catch((err)=>{
    res.render('forget',{forginfo:'email not registered'});
  })
});


app.post('/secret',function(req,res){
  
    User.findOne({email:req.body.email}).then((docs)=>{
    if(docs.secret==req.body.secret){
     res.render('reset',{email:req.body.email,secret:req.body.secret});
    }
    else{
      res.render('secret',{email:req.body.email,sec:'wrong secret'});
    }
  })
  .catch((err)=>{
     
     res.render('secret',{email:req.body.email,sec:'wrong secret'})
  })
});
app.post('/reset',function(req,res){
  
  const newuser = new User({
    email:req.body.email,
    secret:req.body.secret,
    password:md5(req.body.confirmpassword)
  });
  User.deleteOne({email:req.body.email}).then((err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log('ol');
    }
  });
  newuser.save();
  res.render('index',{userName:req.body.email,href:'#',accstatus:'block'});
  
 
  // if(User.updateOne({email:req.body.email},{$set:{password:req.body.confirmpassword}})){
  //   res.render('index',{userName:req.body.email,href:'#',accstatus:'block'});
  // }
});

app.get('/logout',  function (req, res)  {
      
        res.render('index',{userName:'Login/Register',href:'/login',accstatus:'none'});
       
});


app.listen(3000,function(){
    console.log('Server starts on port 3000');
})