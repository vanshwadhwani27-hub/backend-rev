const express = require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccountController, getAccountsController } = require("../controllers/account.controller")

const router = express.Router()

router.post("/", authMiddleware, createAccountController)
router.get("/", authMiddleware, getAccountsController)

module.exports = router
