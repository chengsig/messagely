const express = require('express')
const Message = require('../models/message');
const ExpressError = require('../expressError');

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const OPTIONS = { expiresIn: 60 * 60 };
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
let router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id',
    ensureLoggedIn,
    async function (req, res, next) {
        try {
            const id = req.params.id;
            const messages = await Message.get(id);
            return res.json({ messages });
        } catch (err) {
            return next(err);
        }
    })


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/',
    ensureLoggedIn,
    ensureCorrectUser,
async function(req, res, next) {
    try {
        let { to_username, body } = req.body;
        let current_user = req.user.username;
        let new_message = Message.create(current_user, to_username, body)
        return res.json({ message: new_message });
    } catch (err) {
        return next(err);
    }
    }
)

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read',
    ensureLoggedIn,
    ensureCorrectUser,
async function(req, res, next) {
    try {
        let id = req.params.id;
        let message = Message.markRead(id);
        return res.json({ message });
    } catch (err) {
        return next(err);
    }
    }
)

module.exports = router;