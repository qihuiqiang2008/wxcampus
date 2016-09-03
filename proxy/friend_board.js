var EventProxy = require('eventproxy');
var FriendBoard = require('../models').FriendBoard;

exports.getCountByQuery = function (query, callback) {
    FriendBoard.count(query, callback);
};

exports.removeAll = function (callback) {
    FriendBoard.remove({}, callback);
};


exports.getFriendBoardByQuery = function (query, opt, callback) {
    FriendBoard.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (content,contact_type,contact,show_condition,from_user,callback) {
    var friendboard = new FriendBoard();
    friendboard.from_user =from_user;
    friendboard.show_condition= show_condition
    friendboard.content =  content;
    friendboard.contact_type = contact_type;
    friendboard.contact =contact;
    friendboard.save(callback)
};


exports.removeByFriendBoardId = function (friendboard_id, callback) {
    FriendBoard.remove({_id: friendboard_id}, callback);
};


exports.getFriendBoardById = function (id, callback) {
    FriendBoard.findOne({_id:id}, callback);

};
