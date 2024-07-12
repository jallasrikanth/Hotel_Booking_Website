const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressEror = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
    // console.log(req.user);
    // console.log(req.path, "..", req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be Logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let erMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressEror(400,erMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let erMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressEror(400,erMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next) =>{
    let {id,reviewID} = req.params;
    let review = await Review.findById(reviewID);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};