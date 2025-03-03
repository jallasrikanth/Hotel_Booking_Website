if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}

// console.log(process.env.SECRET) // remove this after you've confirmed it is working


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/Wrapasync.js");
const ExpressEror = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
 const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() =>{
        console.log("Connectedd to DB");
    })
    .catch((err) =>{
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view enjine" , "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() * 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly : true,
    }
};

// app.get("/" , (req,res) =>{
//     res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash()); //flash should be used before routes because routes uses flash

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
//    console.log(res.locals.success);
    res.locals.currUser = req.user;
    next();
});

// //demo user
// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"

//     });
//     let registeredUser = await User.register(fakeUser,"helloworld"); //helloworld is password
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter );
app.use("/listings/:id/reviews",reviewRouter );
app.use("/", userRouter );


// app.get("/testListing" , async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location : "Rameshwaram, Tamil Nadu",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });


//if user try to go any other page which does not exist
app.all("*",(req,res,next) =>{
    next(new ExpressEror(404,"Page Not Found"));
})

app.use((err,req,res,next) =>{
    // res.send("Something went wrong!");
    let{statusCode = 500, message = "Something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080,() =>{
    console.log("server is listening to port 8080");
});