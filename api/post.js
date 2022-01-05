const express = require("express")
const UserRouter = express.Router()
const User = require('../model/user-model')
const Post = require('../model/post-model')
const { check, validationResult } = require("express-validator")
const auth = require("../middleware/auth")

UserRouter.post("/", [auth,
    [check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save()
        res.json(post)
    } catch (err) {
        console.error("Error:", err)
        res.status(500).json({ msg: "Server error" })
    }
})

//@route  post/
//@desc   get all post
//@access  private

UserRouter.get('/', auth, async (req, res) => {
    try {
        const post = await Post.find().sort({ date: -1 })
        res.json(post)
    } catch (err) {
        console.error(err)
        res.status(500).json("Server Error!")
    }
})

//@route  post/:id
//@desc   get post by Id
//@access  private

UserRouter.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(400).json({ msg: "Post not found!" })
        res.json(post)
    } catch (err) {
        console.error(err)
        res.status(500).json("Server Error!")
    }
})

//@route  post/:id
//@desc   delete post by Id
//@access  private

UserRouter.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(400).json({ msg: "Post not found!" })
        if (post.user.toString() !== req.user.id)
            return res.status(401).json({ msg: "User is not authorized" })
        await post.remove()
        res.json("Post removed")
    } catch (err) {
        console.error(err)
        if (err.kind == "ObjectId") return res.status(400).json({ msg: "Post not found!" })
        res.status(500).json("Server Error!")
    }
})

//@route  like/:id
//@desc   Like post
//@access  private

UserRouter.put("/like/:id", auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
        // const postdata = post.likes.length > 0 && post.likes.filter(like => like.user.toString() === req.params.id)
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0)
            return res.status(400).json({ msg: "Post is already Liked!" })
        post.likes.unshift({ user: req.user.id })
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error("Error:", err)
        res.status(500).json("Server Error")
    }
})

//@route  unlike/:id
//@desc   Like post
//@access  private

UserRouter.put("/unlike/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const postdata = post.likes.filter(like => like.user.toString() === req.user.id)
        if (postdata.length === 0)
            return res.status(400).json({ msg: "Post has not Liked!" })
        let removeIndex = post.likes.map(x => x.user.toString()).indexOf(req.user.id)
        if (removeIndex == -1)
            return res.status(400).json({ msg: "Id not found" })
        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error("Error:", err)
        res.status(500).json("Server Error")
    }
})

//@route  comment/:id
//@desc   add post comment
//@access  private

UserRouter.post("/comment/:id", [auth,
    [check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.user.id).select('-password');
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.error("Error:", err)
        if (err.kind == "ObjectId") return res.status(400).json({ msg: "Post not found!" })
        res.status(500).json({ msg: "Server error" })
    }
})

//@route  comment/:id
//@desc   add post comment
//@access  private
UserRouter.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) return res.status(404).json({ msg: "Post not found" })
        const comment = post.comments.find(comment => comment.id.toString() === req.params.comment_id)
        if (!comment)
            return res.status(404).json({ msg: "Comment does not found!" })
        if (comment.user.toString() !== req.user.id)
            return res.status(401).json({ msg: "User not authorized !" })
        let removeIndex = post.comments.map(x => x.user.toString()).indexOf(req.user.id)
        if (removeIndex == -1)
            return res.status(400).json({ msg: "Id not found" })
        post.comments.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.error("Error:", err)
        if (err.kind == "ObjectId") return res.status(400).json({ msg: "Post not found!" })
        res.status(500).json({ msg: "Server error" })
    }
})
module.exports = UserRouter;