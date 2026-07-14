import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // For enable searching field these will becomes true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // We use cloudnary url which store our images and give the url of that image for access
        required: true,
    },
    coverImage: {
        type: String // We use cloudnary url which store our images and give the url of that image for access
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return 

    this.password = await bcrypt.hash(this.password, 10);
    // next(); // Don't use because of async...await
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema) 

// =========================================================================
// PASSWORD HASHING MIDDLEWARE (Pre-save Hook)
// =========================================================================
// 1. .pre("save"): Runs this function right BEFORE saving the user document to the database.
// 2. this.isModified("password"): Checks if the "password" field was created/changed. 
//    (Note: Casing must match the schema field name "password", not "Password").
//    If it has NOT been changed, we skip hashing and call next().
// 3. bcrypt.hash(): Encrypts the password securely. We use 'async/await' because it is asynchronous.
// 4. next(): Tells Mongoose we are done, so it can move to the next middleware or save the document.