var Group = require('../proxy').Group;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');


exports.groups = function (req, res, next) {
    Group.getAllGroups(function(err,groups){
        res.render('back/group/groups',{groups:groups});
    })
}

exports.show_create = function (req, res, next) {
        res.render('back/group/create');

}

exports.create = function (req, res, next) {
    var name = req.body.name;
    var id = req.body.id;
    if(id.length<=0||name.length<=0)
    {
        return  res.render('back/group/create', {
            msg: "信息不全，请重试"
        });
    }
    Group.newAndSave(id, name,function (err) {
        if (err) {
            return  res.render('back/group/create', {
                msg: "出现异常，请重试"
            });
        }
        return  res.redirect("/back/groups");
    })
}
