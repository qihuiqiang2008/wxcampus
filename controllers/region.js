var Region = require('../proxy').Region;
var Group = require('../proxy').Group;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');


exports.regions = function (req, res, next) {
    var query={};
    if(req.session.user.email!=='admin@admin.com')
    {
        query ={'belong_group':req.session.user.location.belong_group};
    }
    Region.getRegionByQuery(query,{},function(err,regions){
        res.render('back/region/regions',{regions:regions});
    })
}

exports.show_create = function (req, res, next) {
    Group.getAllGroups(function(err,groups){
        res.render('back/region/create',{groups:groups});
    })


}
exports.del = function (req, res, next) {
    Region.removeById(req.query.id ,function(err,regions){
        return  res.redirect("/back/regions");
    })
}

exports.create = function (req, res, next) {
    var name = req.body.name;
    var region_code = req.body.region_code;
    var belong_group = req.body.belong_group;
    if(region_code.length<=0||name.length<=0)
    {
        return  res.render('back/region/create', {
            msg: "信息不全，请重试"
        });
    }
    Region.newAndSave(name, region_code,belong_group,function (err) {
        if (err) {
            return  res.render('back/region/create', {
                msg: "出现异常，请重试"
            });
        }
        return  res.redirect("/back/regions");
    })
}
