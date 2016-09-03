var EventProxy = require('eventproxy');
var Answer = require('../models').Answer;

exports.getCountByQuery = function (query, callback) {
    Answer.count(query, callback);
};

exports.getAnswerByQuery = function (query, opt, callback) {
    Answer.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (question_id,content,callback) {
    console.log("sdfsdf"+question_id);
    var answer = new Answer();
    answer.question_id= question_id;
    answer.content = content;
    answer.save(callback);
};
exports.removeById = function (id, callback) {
    Answer.remove({_id: id}, callback);
};
