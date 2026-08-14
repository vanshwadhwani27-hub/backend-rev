const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userModel = new mongoose.Schema({
    email:{
        type: String,
        required: [true,"email is required to create the user"],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        unique: [true,"email already exists login"]
    },
    name:{
        type: String,
        required: [true,"name is required"]
    },
    password:{
        type: String,
        required: [true,"password is required"],
        minLength: [8,"password length should be greater than 7"],
        maxLength: [32,"password length should be less than 33"],
        select: false
    }
},{
    timestamps: true
})

userModel.pre("save",async function (next) {
    if(!this.isModified("password")){
        return
    }

    this.password = await bcrypt.hash(this.password,10)
    return
})

userModel.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password) 
}

module.exports = mongoose.model("User",userModel)
