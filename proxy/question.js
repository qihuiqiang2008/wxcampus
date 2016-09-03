var EventProxy = require('eventproxy');
var Question = require('../models').Question;

exports.getCountByQuery = function (query, callback) {
    Question.count(query, callback);
};

exports.getQuestionByQuery = function (query, opt, callback) {
    Question.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.getQuestionById = function (id, callback) {
    Question.findOne({_id:id}, callback);
};

exports.addAnswer = function (id,answer,callback) {
    Question.update({_id:id},{$push:{"answers":answer}},callback)

};

exports.removeAnswer = function (id,answerid,callback) {
    Question.update({_id:id},{$pull:{answers:{_id:answerid}}},callback);

};

exports.newAndSave = function (content,callback) {
    var question = new Question();
    question.content = content;
    question.save(callback);
};
exports.removeById = function (id, callback) {
    Question.remove({_id: id}, callback);
};
