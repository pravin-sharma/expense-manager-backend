const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Types.ObjectId,
        ref: 'Category'
    },
    item:{
        type: String,
        required: [true,'Please provide item name']
    },
    cost:{
        type: Number,
        min: [0, 'Cost should be a positive number'],
        required: [true, 'Please provide cost for the item']
    },
    expenseDate:{
        type: Date,
        required: [true, 'Please provide date for this expense']
    },
    createdAt:{
        type: Date
    },
    updatedAt:{
        type: Date
    }
})

module.exports = mongoose.model('expense', expenseSchema);