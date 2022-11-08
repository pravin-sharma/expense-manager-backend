const {register, login, getUser} = require('../controller/userController');
const {isAuth} = require('../middleware/isAuth')
const express = require('express');
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/user', isAuth, getUser);

//update user
//delete user - admin

module.exports = router;