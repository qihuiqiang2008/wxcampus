var User = require('../proxy').User;

var utility = require('utility');

var message = require('../services/message');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');
var User = require('../proxy').User;
var FriendBoard = require('../proxy').FriendBoard;
var Message = require('../proxy').Message;

exports.show_create = function (req, res, next) {
    res.render('front/discover/create_friend_board');
}

exports.create = function (req, res, next) {
    var content = req.body.content;
    var contact_type = req.body.contact_type;
    var contact = req.body.contact;
    var show_condition = req.body.show_condition;
    if(content.length<=0||contact.length<=0)
    {
        return  res.render('front/discover/create_friend_board', {
            errormsg: "信息不全，请重试"
        });
    }
    var from_user = {
        _id: req.session.user._id,
        name: req.session.user.name,
        sex: req.session.user.sex,
        school_id: req.session.user.location.school_id,
        school_name: req.session.user.location.school_name,
        region_code: req.session.user.location.region_code
    }
    FriendBoard.newAndSave(content, contact_type, contact, show_condition, from_user, function (err) {
        if (err) {
            return  res.render('front/discover/create_friend_board', {
                errormsg: "出现错误，请重新填写"
            });
        }
        User.getUserById(req.session.user._id, function (err,user) {
            if(err){
                return  res.render('front/discover/create_friend_board', {
                    errormsg: "出现错误，请重新填写"
                });
            }
            user.friend_board_count=user.friend_board_count+1;
            user.save();
            return  res.redirect("/friend_board");
        });
    })
}

exports.index = function (req, res, next) {

    var query = { $or:[{ 'show_condition' :'0'} ,{ 'show_condition' :'1','from_user.region_code':req.session.user.location.region_code},{ 'show_condition' :'2','from_user.school_id':req.session.user.location.school_id}]};
    if(req.session.user.is_admin)
    {
        query={};
    }
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('friend_boards', 'pages',
        function (friend_boards, pages) {
            res.render('front/discover/friend_board', {
                friend_boards: friend_boards,
                pages: pages,
                current_page: page
            });
        });
    proxy.fail(next);
    FriendBoard.getFriendBoardByQuery(query, options, function (err, friendboards) {
        friendboards.forEach(function (friendboard, i) {
            if (friendboard) {
                friendboard.friendly_create_at = Util.format_date(friendboard.create_at, true);
            }
            return friendboard;
        });
        proxy.emit('friend_boards', friendboards);
    });
    FriendBoard.getCountByQuery(query, proxy.done(function (all_replies_count) {
        var pages = Math.ceil(all_replies_count / limit);
        proxy.emit('pages', pages);
    }));
}

exports.delete = function (req, res, next) {
    var friend_board_id = req.query.friend_board_id;
    FriendBoard.getFriendBoardById(friend_board_id, function (err, friendboard) {
        if (req.session.user.is_admin == true && req.session.user._id.toString() !== friendboard.from_user._id.toString()) {
            var from_user={_id:req.session.user._id,
                name: req.session.user.name,
                sex:req.session.user.sex
            }
            Message.newAndSave(from_user, "您发表的以下信息小编认为不适合出现，故已删除，敬请谅解---小编", friendboard.from_user, friendboard.content, function (err, message) {
                if (err) {
                    return res.send({ success: false, message: '发送失败，请稍后重试' });
                }
                friendboard.remove();
                return res.send({ success: true })
            });
        } else if (req.session.user._id.toString() == friendboard.from_user._id.toString()){
            User.getUserById(req.session.user._id, function (err,user) {
                if(user) {
                    user.friend_board_count = user.friend_board_count - 1;
                    user.save();
                    friendboard.remove();
                    return res.send({ success: true });
                }
            });
        }
    })
};

