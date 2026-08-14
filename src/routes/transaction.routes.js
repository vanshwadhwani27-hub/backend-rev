const { Router } = require('express')
const { createTransaction } = require("../controllers/transaction.controller")
const { authMiddleware ,authSystemUserMiddleware } = require("../middleware/auth.middleware")

const transactionRoutes = Router()

transactionRoutes.post("/", authMiddleware, createTransaction)

module.exports = transactionRoutes
