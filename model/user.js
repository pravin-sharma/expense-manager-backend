const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
        maxLength: [40, "Max length for name is 40 characters"]
    },
    email:{
        type: String,
        required: [true, "Please enter email"],
        validate: [validator.isEmail, 'Please enter email with proper format' ],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'Please enter password'],
        minLength: [6, 'Min. length of password is 6 characters'],
        selected: false
    },
    passwordResetHash:{
        type: String,
        selected: false
    },
    passwordResetHashExpiry:{
        type: Date,
        selected: false
    },
    createdAt:{
        type: Date,
        default: ()=>Date.now()
    }
});

//middleware hook - encrypt password before save
userSchema.pre('save', async function (next){
    //hash password only when password is modified
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

//method - compare password
userSchema.method('isPasswordValid', async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
})

//generate jwt
userSchema.method('getJwt', function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY})
})

module.exports = mongoose.model('User', userSchema);