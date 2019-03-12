const express = require('express')
const User = require('../models/user');
const ExpressError = require('../expressError');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const OPTIONS = { expiresIn: 60 * 60 };
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
let router = new express.Router();
 

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', 
    ensureLoggedIn,
    async function(req, res, next){
    try {
        
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', 
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next){
    try {
        
        let current_username = req.params.username;
        const user = await User.get(current_username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', 
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next){
    try {
        let current_username = req.params.username;
        const messages = await User.messagesTo(current_username);
        return res.json({ messages });
    } catch (err) {
        return next(err);
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', 
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next){
    try {
        let current_username = req.params.username;
        const messages = await User.messagesFrom(current_username);
        return res.json({ messages });
    } catch (err) {
        return next(err);
    }
})

 module.exports = router;