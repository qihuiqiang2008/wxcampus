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
var TradeBoard = require('../proxy').TradeBoard;
var Message = require('../proxy').Message;

exports.show_create = function (req, res, next) {
    res.render('front/discover/create_trade_board');
}

exports.create = function (req, res, next) {

    var content = req.body.content;
    var contact_type = req.body.contact_type;
    var contact = req.body.contact;
    var show_condition = req.body.show_condition;
    var title = req.body.title;
    var type = req.body.type;
    var price = req.body.price;
    var trade_address = req.body.trade_address;
    var contact_person = req.body.contact_person;
    if(content.length<=0||contact.length<=0||title.length<=0||price.length<=0||trade_address.length<=0||contact_person.length<=0)
    {
        return  res.render('front/discover/create_trade_board', {
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
    TradeBoard.newAndSave(content, contact_type, contact, show_condition, from_user,title,type,price,trade_address,contact_person,function (err) {
        if (err) {
            return  res.render('front/discover/create_trade_board', {
                errormsg: "出现错误，请重新填写"
            });
        }
        User.getUserById(req.session.user._id, function (err,user) {
            if(user) {
                user.trade_board_count = user.trade_board_count + 1;
                user.save();
                return  res.redirect("/trade_board?type=" + type);
            }
        });

    })
}

exports.index = function (req, res, next) {
    var type = req.query.type;
    var query = { $or:[{ 'show_condition' :'0','type':type} ,{ 'show_condition' :'1','from_user.region_code':req.session.user.location.region_code,'type':type},{ 'show_condition' :'2','from_user.school_id':req.session.user.location.school_id,'type':type}]};
    if(req.session.user.is_admin)
    {
        query={'type':type};
    }
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('trade_boards', 'pages',
        function (trade_boards, pages) {
            res.render('front/discover/trade_board', {
                trade_boards: trade_boards,
                pages: pages,
                current_page: page,
                type:type
            });
        });
    proxy.fail(next);
    TradeBoard.getTradeBoardByQuery(query, options, function (err, tradeboards) {
        tradeboards.forEach(function (tradeboard, i) {
            if (tradeboard) {
                tradeboard.friendly_create_at = Util.format_date(tradeboard.create_at, true);
            }
            return tradeboard;
        });
        proxy.emit('trade_boards', tradeboards);
    });
    TradeBoard.getCountByQuery(query, proxy.done(function (count) {
        var pages = Math.ceil(count / limit);
        proxy.emit('pages', pages);
    }));
}

exports.delete = function (req, res, next) {
    var trade_board_id = req.query.trade_board_id;
    TradeBoard.getTradeBoardById(trade_board_id, function (err, tradeboard) {
        if (req.session.user.is_admin == true && req.session.user._id.toString() !== tradeboard.from_user._id.toString()) {
            var from_user={_id:req.session.user._id,
                name: req.session.user.name,
                sex:req.session.user.sex
            }
            Message.newAndSave(from_user, "您发表的以下信息小编认为不适合出现，故已删除，敬请谅解---小编", tradeboard.from_user, tradeboard.content,function (err, message) {
                if (err) {
                    return res.send({ success: false, message: '发送失败，请稍后重试' });
                }
                tradeboard.remove();
                return res.send({ success: true })
            });
        } else if (req.session.user._id.toString() == tradeboard.from_user._id.toString()) {
            User.getUserById(req.session.user._id, function (err,user) {
                if(user) {
                    user.trade_board_count = user.trade_board_count - 1;
                    user.save();
                    tradeboard.remove();
                    return res.send({ success: true });
                }
            });
        }
    })
};
