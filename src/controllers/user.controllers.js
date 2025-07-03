import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken" 
import {ApiResponse} from "../utils/ApiResponse.js"



// generate access and refresh token

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user  = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false}) // validateBeforeSave : false----> because password is required in user model and here not use of any pass while saving. that's why don't take any validation just save it.
        
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler (async(req,res)=>{
    // 1. Extract user details from the request body (matching UserSchema)
    
    // 2. Validate input fields:
    //    - Ensure required fields are present (username, email, password, etc.)
    //    - Validate email format and other constraints

    // 3. Check for existing user:
    //    - Ensure username and email are unique

    // 4. Handle avatar image:
    //    - Ensure an avatar image is provided (required)
    //    - Upload the avatar to Cloudinary (using multer and cloudinary integration)

    // 5. Create a new user:
    //    - Store user data in the database (with hashed password)

    // 6. Prepare response:
    //    - Exclude sensitive fields (e.g., password, refreshToken) from response

    // 7. Send success response:
    //    - Return created user details (excluding sensitive info)

     console.log("BODY:", req.body);
     console.log("FILES:", req.files); // 👈 Add this


    // 1.  only data of Form and Json not files --> for files, add middleware multer in user.route.js
    const {fullname, email,username,password} = req.body;

    // 2. validation
    if (!fullname || !email || !username || !password) {
        throw new ApiError(400, "All fields are required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // email format regex
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format.");
    }

    // 3.Check for existing user
    const existingUser = await User.findOne({
        $or : [{email},{username}]
    })

    if (existingUser) {
        throw new ApiError(409, "Email or username already exists.");
    }

    console.log("Handle avatar file")

    // 4. Handle avatar image
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0].path



    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar is required.");
    }

    //upload on cloudinary
    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar)
    {
        throw new ApiError(400, "Avatar is required.")
    }



    //5 . CREATE USER

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase
    })

    // 6. Exclude sensitive fields (e.g., password, refreshToken) from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 7. response

    if(!createdUser)
    {
        throw new ApiError (500, "Something went wrong while user creattion")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    )
})


const loginUser = asyncHandler(async(req,res)=>{
    // req->body -- data
    // username or email
    // find the user
    //password check
    //access and refresh token --> generate this and send to user
    // send access and refresh tkn  in cookies


    const {email,username,password} = req.body;

    if(!email || !username)
    {
        throw new ApiError(400,"Username or email is required");
    }

    const user = await User.findOne({
        $or: [{email},{username}]
    })

    if(!user)
    {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect (password) //isPasswordCorrect this is the method in user.model

    if(!isPasswordValid)
    {
        throw new ApiError(401, "password incorrect");
    }

   const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   
    //send cookies 
    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser  = asyncHandler(async(req,res)=>{
    // clear cookies httponly 
    // reset the refreshToken
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})



const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {

    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}