require("dotenv").config()
const app =  require("./src/app")
const connectToDB = require("./src/config/db") 

const PORT = process.env.PORT || 3000

async function startServer() {
    await connectToDB()

    app.listen(PORT,() => {
        console.log(`server is running on port ${PORT}`)
    })
}

startServer().catch((err) => {
    console.error("Unable to start server", err)
    process.exit(1)
})
