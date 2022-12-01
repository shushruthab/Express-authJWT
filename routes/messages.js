const express = require("express");
const router = new express.Router();
const expressError = require("../expressError");
const db = require("../db");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");
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

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        let username = req.user.username;
        const id = req.params.id;
        const message = await Message.get(id);
        if (message.from_user.username === username || message.to_user.username === username) {
            return res.json({message: message});
        } else {
            throw new ExpressError("Not authorized to view this message", 401);
        }
        
    } catch (e) {
        return next(e);
    }
    

})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", async (req, res, next) => {
    try {
        console.log(req.user)
        let fromUser = req.user.username;
        const { to_username, body} = req.body;
        let msg = await Message.create({
            from_username: fromUser, 
            to_username: to_username, 
            body: body});
        return res.json({message: msg})
    } catch (e) {
        return next(e);
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        let msg = await Message.get(req.params.id)
        if (req.user.username === msg.to_user.username) {
            let markmsg = await Message.markRead(req.params.id)
            return res.json({message: "Marked as read"})
        } else {
            throw new ExpressError("Not authorized", 401);
        }
    } catch (e) {
        return next(e);
    }
} )



module.exports = router;