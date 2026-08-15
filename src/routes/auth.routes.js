const express = require("express")
const router = express.Router()

const { registerUserController, loginUserController, logoutUserController } = require("../controllers/auth.controller")

router.post("/register", registerUserController)
router.post("/login", loginUserController)
router.post("/logout", logoutUserController)

module.exports = router
