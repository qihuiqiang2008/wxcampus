var Configuration = require('../proxy').Configuration;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');


exports.index = function (req, res, next) {
    var query={};
    if(req.query.type){
        query={type:req.query.type}
    }
    Configuration.getConfigurationByQuery(query,{},function(err,configurations){
        res.render('back/configuration/index',{configurations:configurations,type:req.query.type});
    })
}

exports.indexEx = function (req, res, next) {
    var query={};
    if(req.query.type){
        query={type:req.query.type}
    }
    Configuration.getConfigurationByQuery(query,{},function(err,configurations){
        res.render('front/photo_guess/create',{configurations:configurations,type:req.query.type});
    })
}


exports.show_create = function (req, res, next) {
   // Configuration.getAllConfigurations(function(err,configurations){
    res.render('back/configuration/create');
    //})
}

exports.show_update = function (req, res, next) {
    Configuration.getConfigurationByCode(req.query.key,function(err,configuration){
        res.render('back/configuration/update',{configuration:configuration});
    })
    // Configuration.getAllConfigurations(function(err,configurations){

    //})
}


exports.del = function (req, res, next) {
    Configuration.removeById(req.query.key ,function(err,configurations){
        return  res.redirect("/back/configurations");
    })
}


exports.update = function (req, res, next) {
    var type=req.body.type;
    var key = req.body.key;
    var value = req.body.value;
    var description = req.body.description;
    Configuration.getConfigurationByCode(key,function (err,configuration) {
        if (err) {
            return  res.render('back/configuration/update', {
                msg: "出现异常，请重试"
            });
        }
        configuration.type=type;
        configuration.value=value;
        configuration.description=description;
        configuration.save();
        return  res.redirect("/back/configurations");
    })
}


exports.create = function (req, res, next) {
    var type=req.body.type;

    var key = req.body.key;
    var value = req.body.value;
    var description = req.body.description;
    Configuration.newAndSave(type,key,value,description,function (err) {
        if (err) {
            return  res.render('back/configuration/create', {
                msg: "出现异常，请重试"
            });
        }
        return  res.redirect("/back/configurations");
    })
}
