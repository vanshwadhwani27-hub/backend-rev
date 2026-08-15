const transactionModel = require("../models/transaction.model")
const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const { sendTransactionEmail } =
require("../services/email.services") 
const mongoose = require("mongoose")


async function createTransaction(req, res){
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if(!fromAccount || !toAccount || !idempotencyKey || !Number.isFinite(Number(amount)) || Number(amount) <= 0){
        return res.status(400).json({
            message: "fromAccount, toAccount, a positive amount, and idempotencyKey are required"
        })
    }

    if(String(fromAccount) === String(toAccount)){
        return res.status(400).json({
            message: "fromAccount and toAccount must be different"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })


    if(!fromUserAccount){
        return res.status(400).json({
            message: "fromAccount was not found"
        })
    }

    if(!toUserAccount){
        return res.status(400).json({
            message: "toAccount was not found"
        })
    }

    if(String(fromUserAccount.user) !== String(req.user._id)){
        return res.status(403).json({
            message: "you can only create transactions from your own account"
        })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "transaction under processed",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "previous transaction attempt failed, please try again later",
                transaction: isTransactionAlreadyExists
            })
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "transaction was reversed please try again"
            })
        }

        return res.status(400).json({
            message: "transaction already under process"
        })
    }

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "one of the account is not active"
        })
    }

    const balance = await fromUserAccount.getBalance()

    if(balance < Number(amount)){
        return res.status(400).json({
            message: `insufficient balance, current balance is ${balance}. requested amount is ${amount}`
        })
    }

    try {
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = (await transactionModel.create({
        fromAccount,
        toAccount,
        amount: Number(amount),
        idempotencyKey,
        status: "PENDING"
    },{ session }))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: Number(amount),
        transaction: transaction._id,
        type: "DEBIT"
    }],{ session })

    await (() => {
        return new Promise((resolve) => setTimeout(resolve,5 * 1000))
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: Number(amount),
        transaction: transaction._id,
        type: "CREDIT"
    }],{ session })

    
    await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session }
    )

    await session.commitTransaction()

    await sendTransactionEmail(
        req.user.email,
        req.user.name,
        amount,
        toAccount
    )

    return res.status(201).json({
        message: "transaction completed successfully",
        transaction: transaction
    })
    } catch (err) {

        await transactionModel.findOneAndUpdate(
            { idempotencyKey: idempotencyKey },
            { status: "FAILED"}
        )

        return res.status(500).json({
            message: "transaction could not be completed",
            err: err.message
        })
    } finally {
        await session.endSession()
    }
}  

module.exports = { createTransaction }
