const express = require('express')
const User = require('../models/user');
const ExpressError = require('../expressError');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const OPTIONS = { expiresIn: 60 * 60 };

let router = new express.Router();


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function(req, res, next){
  
    try {
        const { username, password } = req.body;

        if (await User.authenticate(username, password)) {

            let token = jwt.sign({ username }, SECRET_KEY, OPTIONS);
            await User.updateLoginTimestamp(username);

            return res.json({ token });

        } else {
            throw new ExpressError("Invalid user/password", 400);
        }
    } catch (err) {
        if(err.message.includes('arguments required')){
            err = new ExpressError('Missing key: password needed', 404);
        }
        
        return next(err);

    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next){
    try {
        const { username, password, first_name, last_name, phone } = req.body;

        let user = await User.register({ username, password, first_name, last_name, phone });
        let token = jwt.sign({ username: user.username }, SECRET_KEY, OPTIONS);

        await User.updateLoginTimestamp(username);

        return res.json({ token });

    } catch(err) {
        return next(err);
    }
})

module.exports = router;