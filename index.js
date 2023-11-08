const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = 5000;
require("dotenv").config(); //index.js file would identify .env file
require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const imageUploadRoute = require('./CONTROLLERS/imageUploadRoutes')
const app = express();

// const Todo = require("./Models/Todo");
const User = require("./Models/UserSchema");
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use('/',imageUploadRoute)

function authenticateToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  // const { id } = req.body;
  if (!token) {
    // return res.status(401).json({ message: "Auth Error" });
    const error = new Error("Auth Error");
    next(error);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // if (id && decoded.id !== id) {
    //   // return res.status(401).json({ message: "Auth Error" });
    //   const error = new Error("Invalid token");
    //   next(error);
    // }
    req.id = decoded.id;
    next();
  } catch (error) {
    // return res.status(500).json({ message: "Invalid token" });
    next(error);
  }
}




app.get("/", (req, res) => {
  res.json({message:"api is working"});
});



app.post("/register", async (req, res) => {
  const { password, email, age, name } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ email, password: hashedPassword, age, name });
  const savedUser = await newUser.save();
  res
    .status(201)
    .json({ message: "User registered successfully", savedUser: savedUser });
});



app.post("/login", async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
    const error = new Error("user doesn't exit");
    next(error)
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "User not found" });
    }

    const accessToken = await jwt.sign(
      { id: existingUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = await jwt.sign(
      { id: existingUser._id },
      process.env.JWT_REFRESH_SECRET_KEY
    );

    existingUser.refreshToken = refreshToken; //updating the refresh token
    await existingUser.save(); 

    //saving in the cookies for frontend
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/refresh_token",
    });

    res.status(200).json({
      message: "User logged in successfully",
        refreshToken,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//filter user on age
app.post('/getuserbyage', async (req,res)=>{
  const {age} = req.body;

  const user = await User.find({age:age});
  res.status(200).json(user);
});

//sort users

app.post('/sortusers', async (req,res)=>{
  const {sortby , order} = req.body;

  const sort = {
    [sortby] : order
  }

  const users = await User.find().sort(sort);
  res.status(200).json({users});
});

app.get("/getmyprofile", authenticateToken, async (req, res) => {
  const { id } = req;
  const user = await User.findById(id);
  user.password = undefined;
  res.status(200).json({ user: user });
});



// app.get("/gettodos/", async (req, res) => {
//   const allTodos = await Todo.find();
//   res.json(allTodos);
// });

// app.post("/addtodo/", async (req, res) => {
//      const {task,completed} = req.body;
//      const todo = new Todo({task,completed});
//      const savedTodo = await todo.save();
//      res.json({
//         message:'Task saved successfully',
//         savedTodo: savedTodo
//      });
// });

app.get('/refresh_token', (req, res) => {
   const token = req.cookies.refreshToken;
  //  console.log(token);
  //  res.send(token);
 
  if(!token){
    const error = new Error('Token not found');
    next(error);
  }
  jwt.verify(token , process.env.JWT_REFRESH_SECRET_KEY, async(err,decoded)=>{
    if(err){
      const error = new Error('Invalid Token');
      next(error);
    }
    const id = decoded.id; // during refresh token generation we  stored id
    const existingUser = await User.findById(id);

    if(!existingUser || token !== existingUser.refreshToken){
       const error = new Error("Invalid Token");
       next(error);
      }
     
     const accessToken = jwt.sign({id:existingUser._id},process.env.JWT_SECRET_KEY,{
      expiresIn:'1hr'
     });
     
     const refreshToken = jwt.sign({id:existingUser._id},process.env.JWT_REFRESH_SECRET_KEY);
     existingUser.refreshToken = refreshToken;
     await existingUser.save();

     res.cookie('refreshToken',refreshToken,{httpOnly:true,path:'/refresh_token'})

     res.status(200).json({
      accessToken,
      refreshToken,
      message:'Token refreshed successfully'
     });

  })

});




//ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.log("error middleware called ", err);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
