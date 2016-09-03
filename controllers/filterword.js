var FilterWord = require('../proxy').FilterWord;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');


exports.filterwords = function (req, res, next) {
    var query={};
    FilterWord.getFilterWordByQuery(query,{},function(err,filterwords){
        res.render('back/filterword/index',{filterwords:filterwords});
    })
}

exports.show_create = function (req, res, next) {
        res.render('back/filterword/create');
}

exports.del = function (req, res, next) {
    FilterWord.removeById(req.query.id ,function(err,regions){
        return  res.redirect("/back/filterwords");
    })
}

exports.create = function (req, res, next) {
    var word = req.body.word;
    var desc = req.body.desc;
    FilterWord.newAndSave(word,desc,function (err) {
        if (err) {
            return  res.render('back/filterword/create', {
                msg: "出现异常，请重试"
            });
        }
        return  res.redirect("/back/filterwords");
    })
}
