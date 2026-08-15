const express = require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccountController, getAccountsController, getAccountBalanceController } = require("../controllers/account.controller")

const router = express.Router()

router.post("/", authMiddleware, createAccountController)
router.get("/", authMiddleware, getAccountsController)
router.get("/balance/:accountId", authMiddleware, getAccountBalanceController)

module.exports = router
