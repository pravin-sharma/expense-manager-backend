require("dotenv").config();
const connectDb = require("./db");
const app = require('./app');

connectDb
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log(e.message));

app.listen(process.env.EXPRESS_PORT, ()=>{
    console.log(`Server listening on port: ${process.env.EXPRESS_PORT}`)
})