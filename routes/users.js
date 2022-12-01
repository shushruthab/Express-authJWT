const express = require("express");
const router = new express.Router();
const expressError = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        let result = await User.all()
        return res.json({users: result})
    } catch (e) {
        return next(e);
    }
    
} )

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        const username = req.params.username;
        let result = await User.get(username);
        return res.json({result});
    } catch (e) {
        return next(e);
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
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try {
        let recievedMessages = await User.messagesTo(req.params.username);
        return res.json({recievedMessages});
    } catch (e) {
        return next(e);
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

router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
    try {
        let sentMessages = await User.messagesFrom(req.params.username);
        return res.json({sentMessages});
    } catch (e) {
        return next(e);
    }
})

module.exports = router;