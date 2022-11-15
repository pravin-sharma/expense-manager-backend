const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.MONGO_DB_URL,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
