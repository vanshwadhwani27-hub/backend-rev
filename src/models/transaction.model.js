const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "transaction must be associated with a from account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "transaction must be associated with a to account"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message: "status can either be pending, completed, failed or reversed"
        },
        default: "PENDING"
    },
    amount:{
        type: Number,
        required: [true, "amount is required for creating an transaction"],
        min: [0.01,"transaction amount must be greater than zero"]
    },
    idempotencyKey:{
        type: String,
        required: [true,"idempotency key is required to complete a transaction"],
        index: true,
        unique: true
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model("Transaction",transactionSchema)
module.exports = transactionModel
