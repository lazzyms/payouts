const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));

require("./app/routes/routes")(app)

// set port, listen for requests
const PORT = 8003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
});

module.exports = app