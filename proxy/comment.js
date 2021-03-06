var EventProxy = require('eventproxy');
var Comment = require('../models').Comment;

exports.getCountByQuery = function (query, callback) {
    Comment.count(query, callback);
};

exports.getCommentByContentId = function(content_id, callback){
    Comment.find({'content_id':content_id} ,callback);
}

exports.getCommentByQuery = function (query, opt, callback) {
    Comment.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.getNewComments = function (callback, page, size){
    Comment.find({'audit_status':false, 'del_flag': '0', '$or': [{"status": '0'}, {"status":"3"}]})
    .sort('post_time', 'descending')
    .skip((page - 1)*size)
    .limit(size)
    .exec(callback);
}

exports.getAllComments = function (callback, page, size){
    Comment.find({'del_flag': '0',  '$or': [{"status": '0'}, {"status":"3"}]})
    .sort('post_time', 'descending')
    .skip((page - 1)*size)
    .limit(size)
    .exec(callback);
}

exports.getDelByUserComments = function(callback, page, size){
    Comment.find({'del_flag': '0', 'status': '1'})
    .sort('post_time', 'descending')
    .skip((page - 1)*size)
    .limit(size)
    .exec(callback);
}

exports.UpdateOrNew = function(comment_in, callback){
    Comment.find({"content_id": comment_in.content_id}, function(err, docs){
        if(err){
            console.log(err);
        } else {
            if(docs != ""){
                updateComment(comment_in, callback);
            } else {
                newAndSave(comment_in, callback);
            }
        }
    });
}

function updateComment(comment_in, callback){
    delete comment_in.post_time; //不更新提交时间
    Comment.update({"content_id":comment_in.content_id}, {$set: comment_in}, 
        function(err){
            if(err){
                console.log(err);
            } else {
                callback();
            }
    }); 
}

function newAndSave(comment_in, callback) {
    var comment = new Comment();

    comment.comment_id = comment_in.comment_id;
    comment.content = comment_in.content;
    comment.content_id = comment_in.content_id;
    comment.del_flag = comment_in.del_flag;
    comment.fake_id = comment_in.fake_id;
    comment.icon = comment_in.icon;
    comment.id = comment_in.id;
    comment.is_elected = comment_in.is_elected;
    comment.is_top = comment_in.is_top;
    comment.my_id = comment_in.my_id;
    comment.nick_name = comment_in.nick_name;
    comment.post_time = comment_in.post_time + "000";
    comment.reply = comment_in.reply;
    comment.status = comment_in.status;
    comment.uin = comment_in.uin;
    comment.school_enname = comment_in.school_enname;
    comment.audit_status = false;

    comment.save(callback);
};

exports.removeAll = function (callback) {
    comment.remove({}, callback);
};

exports.removeByAId = function (id, callback) {
    comment.remove({_id: id}, callback);
};

exports.getById = function (id, callback) {
    comment.findOne({_id:id}, callback);

};

exports.newAndSave = newAndSave;
exports.updateComment = updateComment;

