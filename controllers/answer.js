var Answer = require('../proxy').Answer;
var Question = require('../proxy').Question;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var sanitize = require('validator').sanitize;

exports.index = function (req, res, next) {
    var query = {question_id: req.query.question_id};

    Question.getQuestionById(req.query.question_id, function (err, question) {
        Answer.getAnswerByQuery(query, {}, function (err, answers) {
            console.log(answers.length);
            res.render('back/answer/index', {answers: answers, question: question});
        })
    })

}

exports.show_create = function (req, res, next) {
    var question_id = req.query.question_id;
    res.render('back/answer/create', {question_id: question_id});
}

exports.del = function (req, res, next) {
    var answer_id=req.query.id;
    var question_id= req.query.question_id;
    Answer.removeById(answer_id, function (err, answer) {
        Question.removeAnswer(question_id,answer_id,function(err){
            return  res.redirect("/back/answer/index?question_id=" +question_id);
        })
    })
}

exports.create = function (req, res, next) {
    var content = req.body.answer_content;
    var question_id = sanitize(req.body.question_id).trim();
    console.log("fdsfsd" + question_id);
    Answer.newAndSave(question_id, content, function (err,answer) {
        if (err) {
            return  res.render('back/answer/create', {
                msg: "出现异常，请重试"
            });
        }
        Question.addAnswer(question_id,answer,function(err){
            return  res.redirect("/back/answer/index?question_id=" + question_id);
        })

    })
}
