const User = require('../models/userModel')
const axios = require('axios')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CLIENT_ID = process.env.CLIENT_ID;

module.exports = {
    
    GLogin: function (req, res) {
        const {OAuth2Client} = require('google-auth-library');
        const client = new OAuth2Client(CLIENT_ID);
        const gToken = req.headers.id_token
        const ticket = new Promise ((resolve, reject) => {
            client.verifyIdToken({
                idToken: gToken,
                audience: CLIENT_ID,
            }, (err, ticket) => {
                if (err) {
                    reject(err)
                } else {
                    const payload = ticket.getPayload();
                    const userid = payload['sub'];
                    resolve(userid)
                }
            })
        })
        .then(userid => {
            axios({
                url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${gToken}`
            })
            .then(data => {
                User.findOne({
                    email: data.data.email
                })
                .then(user => {
                    if (user) {
                        if (user.gSignIn === 1) {
                            let token = jwt.sign({id: user._id}, process.env.JWT_KEY)
                            res.status(200).json({token: token})
                        } else {
                            res.status(500).json({message: 'Sorry, but please log in manually'})
                        }
                    } else {
                        User.create({
                            email: data.data.email,
                            name: data.data.name,
                            password: 'abcde12345',
                            gSignIn: 1
                        })
                        .then(newuser => {
                            let token = jwt.sign({id: newuser._id}, process.env.JWT_KEY)
                            res.status(200).json({token: token})
                        })
                        .catch(err => {
                            res.status(500).json({message: err})
                        })
                    }
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        })
        .catch(err => {let token = jwt.sign({id: user._id}, process.env.JWT_KEY)
        res.status(200).json({token: token})
            res.status(500).json({message: err})
        })
    },

    RLogin: function (req, res) {
        if(!req.body.email || !req.body.password) {
            res.status(500).json({message: 'You should input your email and password to log in'})
        } else {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if(user) {
                    if (user.gSignIn === 0) {
                        let passwordValid = bcrypt.compareSync(req.body.password.toString(), user.password)
                        if(passwordValid) {
                            let token = jwt.sign({id: user._id}, process.env.JWT_KEY);
                            res.status(200).json({token: token})
                        } else {
                            res.status(500).json({message: 'Incorrect email and/or password'})
                        }
                    } else {
                        res.status(500).json({message: 'Sorry, but you should sign in with Google'})
                    }
                } else {
                    res.status(500).json({message: 'Incorrect email and/or password'})
                }
            })
        }
    },

    RRegister: function (req, res) {
        if (/\S+@\S+\.\S+/.test(req.body.email) === false) {
            res.status(500).json({message: 'Please input a valid email address'})
        } else {
            var salt = bcrypt.genSaltSync(10);
            var hashedPassword = bcrypt.hashSync(req.body.password, salt);
            
            if (req.body.name && req.body.email && req.body.password) {
                User.findOne({
                        email: req.body.email
                    })
                    .then (data => {
                        if (data) {
                            res.status(500).json({message: 'Email has been registered before'})
                        } else {
                            if (req.body.password.length >= 6) {
                                User.create({
                                    name: req.body.name,
                                    email: req.body.email,
                                    password: hashedPassword
                                })
                                .then(data => {
                                    res.status(201).json({message: 'Email registration successful. Please sign in to continue.'})
                                })
                                .catch(err => {
                                    res.status(500).json({message: err})
                                })
                            } else {
                                res.status(500).json({message: 'Password should contain at least 6 characters'})
                            }
                        }
                    })
                    .catch (err => {
                        res.status(500).json({message: 'An error occured during the registration process. Please try again later.'})
                    })
            } else {
                res.status(500).json({message: 'You should input your name, email, and a password to register'})
            }
        }
    }
}