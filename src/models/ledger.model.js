const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true,"ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true,"amount is required for creating ledger"],
        immutable: true
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true,"ledger must be associated with transaction"],
        index: true,
        immutable: true
    },
    type:{
        type: String,
        enum:{
            values: ["CREDIT","DEBIT"],
            message: "type can either be credit or debit"
        },
        required: [true,"ledger type is required"],
        immutable: true
    }
})

function preventLedgerModification() {
    throw new Error("ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndRemove',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);

const ledgerModel = mongoose.model("Ledger",ledgerSchema)
module.exports = ledgerModel