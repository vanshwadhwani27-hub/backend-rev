const mongoose = require("mongoose");

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Server connected to MongoDB successfully");
    } catch (err) {
        console.log("There was an error while connecting to the database");
        throw err;
    }
};

module.exports = connectToDB;
