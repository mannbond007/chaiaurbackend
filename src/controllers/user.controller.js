import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user exists : mail, username
    // check for images , check for avatar
    // upload them  on cloudinary
    // create user object - create entry in db
    // remove password and refresh token fields from response
    // check for user creation 
    // return response


    const { username, email, fullname, password } = req.body

   if(
    [username, email, fullname, password].some((field) => field?.trim() === "")
   ){

    throw new ApiError(400, "All fields are required");
   }

 const existingUser =  User.findOne({
      $or: [
         { username },
         { email }
      ]
   })

   if(existingUser) throw new ApiError(409, "User already exists");

   const avatatLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.cover[0]?.path;

   if(!avatatLocalPath){
    throw new ApiError(400, "Avatar is required");
   }


   const avatar = await uploadOnCloudinary(avatatLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);  
   
   if(!avatar){
    throw new ApiError(500, "Error uploading images on cloudinary");
   }

   const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
   })

 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )

 if(!createdUser){
    throw new ApiError(500, "something went wrong while creating user");
 }


 return res.status(201).json(
   new ApiResponse(200, createdUser, "User created successfully")
 )

});

export { registerUser };