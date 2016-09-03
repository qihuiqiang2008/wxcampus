var Question = require('../proxy').Question;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');


exports.index = function (req, res, next) {
    var query={};
    Question.getQuestionByQuery(query,{},function(err,questions){
        res.render('back/question/index',{questions:questions});
    })
}

exports.show_create = function (req, res, next) {
    res.render('back/question/create');
}

exports.del = function (req, res, next) {
    Question.removeById(req.query.id ,function(err,regions){
        return  res.redirect("/back/question/index");
    })
}

exports.back_handler = function (req, res, next) {
    var type=req.query.type;
    Question.getQuestionById(req.query.id ,function(err,question){
        if(type=="unable"){
            question.status=false;
        }else if(type=="able"){
            question.status=true;
        } if(type=="quanzhiadd") {
            question.weight++;
        }else{
            question.weight--;
        }
        question.save();
        return res.send({success:true});
    })
}


exports.create = function (req, res, next) {
    var content = req.body.question_content;

    Question.newAndSave(content,function (err) {
        if (err) {
            return  res.render('back/question/create', {
                msg: "出现异常，请重试"
            });
        }
        return  res.redirect("/back/question/index");
    })
}
