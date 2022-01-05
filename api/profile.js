const express = require("express")
const UserRouter = express.Router()
const Profile = require("../model/profile-model")
const auth = require("../middleware/auth")
const { check, validationResult } = require("express-validator")
const User = require("../model/user-model")
const request = require('request')

require('dotenv').config()
//@route  profile/me
//@desc   get current User profile
//@access  private

UserRouter.get("/me", auth, async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
    if (!profile)
        return res.status(400).json({ msg: "There is not profile for this user" })
    res.json(profile)
})

//@route  profile/me
//@desc   get current User profile
//@access  private

UserRouter.post("/", [
    auth,
    [check('status', 'Status is Required ').not().isEmpty(),
    check('skills', 'Skill is Required !').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { company, webiste, bio, location, githubusername, skills, status, youtube, instagram, linkedin, twitter } = req.body
    const PorfileField = {};
    PorfileField.user = req.user.id;
    PorfileField.company = company && company;
    PorfileField.webiste = webiste && webiste;
    PorfileField.bio = bio && bio;
    PorfileField.location = location && location;
    PorfileField.skills = skills && skills.split(",").map(x => x.trim());
    PorfileField.status = status && status;
    PorfileField.githubusername = githubusername && githubusername;

    //Build Social Object
    PorfileField.social = {};
    PorfileField.social.youtube = youtube && youtube;
    PorfileField.social.instagram = instagram && instagram;
    PorfileField.social.instagram = instagram && instagram;
    PorfileField.social.linkedin = linkedin && linkedin;
    PorfileField.social.twitter = twitter && twitter;

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            //if profilel than update profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: PorfileField },
                { new: true })
            return res.json(profile)
        }
        // else Create new profile
        profile = new Profile(PorfileField)
        await profile.save()
        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).json("Error in server:", err)
    }

})

//@route  profile/
//@desc   get all User profile
//@access  public

UserRouter.get("/", async (req, res) => {
    try {
        let profile = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).json("Server Error")
    }
})

//@route  profile/
//@desc   get all User profile
//@access  public

UserRouter.get("/user/:id", async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.params.id }).populate('user', ['name', 'avatar'])
        if (!profile) return res.status(400).json({ msg: "Profie not found" })
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectId')
            return res.status(400).json({ msg: "Profie not found" })
        res.status(500).json("Server Error")
    }
})

//@route  profile/
//@desc   Delete User ,Profile ,Post 
//@access  private

UserRouter.delete("/", auth, async (req, res) => {
    try {
        await Profile.findOneAndDelete({ user: req.user.id })
        await User.findOneAndDelete({ _id: req.user.id })
        res.json({ msg: "User deleted!" })
    } catch (err) {
        console.error("Server Error")
    }
})

//@route  experience/
//@desc   Add profile experience 
//@access  private

UserRouter.put("/experience", [auth, [
    check('title', 'Title is Required').not().isEmpty(),
    check('company', 'Company is Required').not().isEmpty(),
    check('from', 'from is Required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req)
    if (!errors) return res.status(400).json({ msg: errors.array() })
    const { title, company, location, from, to, current, description } = req.body;
    const newExp = { title, company, location, from, to, current, description }
    let profile = await Profile.findOne({ user: req.user.id })
    profile.experience.unshift(newExp)
    await profile.save()
    res.json(profile)
})

//@route  experience/:id
//@desc   Delete profile experience 
//@access  private
UserRouter.delete("/experience/:id", auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (!profile) return res.status(400).json({ msg: "Id not found" })
        // Get Remove Index
        const removeIndex = profile.experience.map(x => x.id).indexOf(req.params.id)
        if (removeIndex == -1)
            return res.status(400).json({ msg: "Id not found" })
        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: "Server Error" })
    }
})

//@route  education/
//@desc   Add profile education 
//@access  private

UserRouter.put("/education", [auth, [
    check('school', 'school is Required').not().isEmpty(),
    check('degree', 'degree is Required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is Required').not().isEmpty(),
    check('from', 'from is Required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req)
    if (!errors) return res.status(400).json({ msg: errors.array() })
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = { school, degree, fieldofstudy, from, to, current, description }
    let profile = await Profile.findOne({ user: req.user.id })
    profile.education.unshift(newEdu)
    await profile.save()
    res.json(profile)
})

//@route  education/:id
//@desc   Delete profile education 
//@access  private
UserRouter.delete("/education/:id", auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (!profile) return res.status(400).json({ msg: "Id not found" })
        // Get Remove Index
        const removeIndex = profile.education.map(x => x.id).indexOf(req.params.id)
        if (removeIndex == -1)
            return res.status(400).json({ msg: "Id not found" })
        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: "Server Error" })
    }
})

//@route  education/:id
//@desc   Delete profile education 
//@access  private
UserRouter.get("/github/:name", async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.name}/repos?per_page=5&sort=created:asc
            client_id=${process.env.githubClientId}&client_secret=${process.env.githubSecretKey}`,
            method: "Get",
            headers: { 'user-agent': 'node.js' }
        }
        request(options, (error, response, body) => {
            if (error) console.error("Error :", error)
            if (response.statusCode !== 200) return res.status(404).json({ msg: "User not found" })
            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(err)
        res.json({ msg: "Server Error", err })
    }
})
module.exports = UserRouter;