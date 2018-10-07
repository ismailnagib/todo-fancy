const listModel = require('../models/listModel')
const jwt = require('jsonwebtoken');

module.exports = {
    add: function(req, res) {
        let importancePossible = ['Very Important', 'Important', 'Unimportant']
        if (importancePossible.indexOf(req.body.importance) === -1) {
            req.body.importance = 'Unimportant'
        }
        listModel.find({
            name: req.body.name,
            userEmail: req.userEmail
        })
        .then(data => {
            if(data.length < 1) {
                listModel.create({
                    name: req.body.name,
                    desc: req.body.desc,
                    dueDate: req.body.dueDate,
                    importance: req.body.importance,
                    userEmail: req.userEmail
                })
                .then(() => {
                    res.status(201).json({})
                })
                .catch(err => {
                    res.status(500).json({message: err.message})
                })
            } else {
                res.status(500).json({message: 'Name has to be unique'})
            }
        })
        .catch(err => {
            res.status(500).json({message: err.message})
        })
    },

    show: function(req, res) {
        listModel.find({
            userEmail: req.userEmail
        })
        .then(data => {
            res.status(200).json({tasks: data})
        })
        .catch(err => {
            res.status(500).json({message: err.message})
        })
    },

    showImportance: function(req, res) {
        var result = [];
        if (req.params.dir === 'asc') {
            listModel.find({
                userEmail: req.userEmail,
                importance: 'Very Important'
            })
            .then(data => {
                listModel.find({
                    userEmail: req.userEmail,
                    importance: 'Important'
                })
                .then(data2 => {
                    listModel.find({
                        userEmail: req.userEmail,
                        importance: 'Unimportant'
                    })
                    .then(data3 => {
                        result.push(data, data2, data3)
                        res.status(200).json({tasks: result})
                    })
                })
            })
            .catch(err => {
                res.status(500).json({message: err.message})
            })
        } else if (req.params.dir === 'desc') {
            listModel.find({
                userEmail: req.userEmail,
                importance: 'Unimportant'
            })
            .then(data => {
                listModel.find({
                    userEmail: req.userEmail,
                    importance: 'Important'
                })
                .then(data2 => {
                    listModel.find({
                        userEmail: req.userEmail,
                        importance: 'Very Important'
                    })
                    .then(data3 => {
                        result.push(data, data2, data3)
                        res.status(200).json({tasks: result})
                    })
                })
            })
            .catch(err => {
                res.status(500).json({message: err.message})
            })
        }
    },

    showSorted: function(req, res) {
        listModel.find({
            userEmail: req.userEmail
        }).sort({
            [req.params.sort]: req.params.dir
        }).exec(function(err, data) {
            if (err) {
                res.status(500).json({message: err.message})
            } else {
                res.status(200).json({tasks: data})
            }
        });
    },

    complete: function(req, res) {
        listModel.updateOne({name: req.params.name, userEmail: req.userEmail}, {
            status: 'completed'
        })
        .then(() => {
            res.status(200).json({})
        })
        .catch(err => {
            res.status(500).json({message: err.message})
        })
    },

    remove: function(req, res) {
        listModel.deleteOne({name: req.params.name, userEmail: req.userEmail})
        .then(() => {
            res.status(200).json({})
        })
        .catch(err => {
            res.status(500).json({message: err.message})
        })
    },

    edit: function(req, res) {
        let importancePossible = ['Very Important', 'Important', 'Unimportant']
        if (importancePossible.indexOf(req.body.importance) === -1) {
            listModel.updateOne({name: req.params.name, userEmail: req.userEmail}, {
                name: req.body.name,
                desc: req.body.desc,
                dueDate: req.body.dueDate,
            })
            .then(() => {
                res.status(200).json({})
            })
            .catch(err => {
                res.status(500).json({message: err.message})
            })
        } else {
            listModel.updateOne({name: req.params.name, userEmail: req.userEmail}, {
                name: req.body.name,
                desc: req.body.desc,
                dueDate: req.body.dueDate,
                importance: req.body.importance
            })
            .then(() => {
                res.status(200).json({})
            })
            .catch(err => {
                res.status(500).json({message: err.message})
            })
        }
        
    }
}