var User = require('../proxy').User;

var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');
var User = require('../proxy').User;
var Advise = require('../proxy').Advise;

exports.show_create = function (req, res, next) {
    res.render('front/discover/create_advise');
}

exports.create = function (req, res, next) {
    var content = req.body.content;
    var return_msg = new Object();
    if(content==''||content.trim().length<=0){
        return_msg.type = "err";
        return_msg.content = '信息不全';
        return  res.render('front/discover/create_advise', {
            return_msg: return_msg
        });
    }
    var from_user = {
        _id: req.session.user._id,
        name: req.session.user.name,
        sex: req.session.user.sex,
        school_id: req.session.user.location.school_id,
        school_name: req.session.user.location.school_name,
        region_code: req.session.user.location.region_code,
        belong_group: req.session.user.location.belong_group
    }
    Advise.newAndSave(from_user,content,function (err) {
        if (err) {
            return_msg.type = "err";
            return_msg.content = '提交失败，请重试';
            return  res.render('front/discover/create_advise', {
                return_msg: return_msg
            });
        }
        return_msg.type = "success";
        return_msg.content = '操作成功';
        return  res.render('front/discover/create_advise', {
            return_msg: return_msg
        });
    })
}


exports.index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var query={};
    if(req.session.user.email!='admin@admin.com'){
        var query={'from_user.belong_group':req.session.user.location.belong_group};
    }
    var sort=[[ 'create_at', 'desc' ] ];
    var options = { skip: (page - 1) * limit, limit: limit,sort:sort};
    var proxy = EventProxy.create('advises', 'pages',
        function (advises, pages) {
            res.render('back/advise/index',{
                advises: advises,
                pages: pages,
                current_page: page
            });
        });
    proxy.fail(next);
    Advise.getAdviseByQuery(query, options, function (err, advises) {
        advises.forEach(function (advise, i) {
            if (advise) {
                advise.friendly_create_at = Util.format_date(advise.create_at, true);
            }
            return advise;
        });
        proxy.emit('advises', advises);
    })

    Advise.getCountByQuery(query, proxy.done(function (all_advises_count) {
        var pages = Math.ceil(all_advises_count / limit);
        proxy.emit('pages', pages);
    }));
};
