import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        fullname:{
            type: String,
            required: true,
        },

        username:{
            type: String,
            required:true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password:{
            type: String,
            required: true,
        },

        avatar:{ 
            type: String,  // cloudinary url
            required: true,
        },

        coverImage:{
            type: String,  // cloudinary url
        },

        role:{
            type: String,
            enum:["user","admin"],
            default:"user"
        },

        refreshToken:{
            type: String,
        }

    },
    {timestamps:true})

// hash the password
/*
What is .pre("save", fn)?
This is a Mongoose middleware (also called a "hook").
It runs before a document is saved to the database.
"save" is the event we're hooking into — it runs every time user.save() or User.create() is called.
*/

// writing mongodb query, before saving to db, should hash the passwprd
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);  // 10 is saltrounds
    next();
})

// This line -- "userSchema.methods.isPasswordCorrect" adds a method (isPasswordCorrect) to each instance of the User model (i.e., each user document).
userSchema.methods.isPasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // password= inputpass, this.pass = encrypted
} // return true or false.


// generate access and refresh token

userSchema.methods.generateAccessToken =  function () {
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
        return jwt.sign(
        {
            _id: this._id,
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema);