const userModel = require("../models/user.model")
const jwt = requrie("jsonwebtoken")

async function registerUserController(req,res) {
    const {email,name,password} = req.body

    const isExists = await userModel.findOne({ email: email })

    if(isExists){
        return res.status(422).json({
            message: "user already exists with this email",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "3d" }
    )
}

module.exports = registerUserController