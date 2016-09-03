var sanitize = require('validator').sanitize;

var at = require('../services/at');
var User = require('../proxy').User;
var Post = require('../proxy').Post;
var PostReply = require('../proxy').PostReply;
var PostLike = require('../proxy').PostLike;
var PostFav = require('../proxy').PostFav;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var School = require('../proxy').School;
var College = require('../proxy').College;
var Reply = require('../proxy').Reply;


exports.create = function (req, res, next) {
    var post_id = req.body.post_id;
    var content = req.body.content;
	var name=req.body.admin_name||req.session.user.name;
	var sex=req.body.admin_sex||req.session.user.sex;
    var from_user = {
        _id: req.session.user._id,
        name:name,
        sex: sex,
        belong_group:req.session.user.location.belong_group
    };
    var to_user;
    var to_user_id = (req.body.tou_id == "null" || req.body.tou_id == "undefined" || req.body.tou_id == "") ? null : req.body.tou_id;
    if (to_user_id) {
        to_user = {
            _id: req.body.tou_id,
            name: req.body.tou_name,
            sex: req.body.tou_sex
        };
    }
    var main_id = (req.body.main_id == "null" || req.body.main_id == "undefined" || req.body.main_id == "") ? null : req.body.main_id;
    var reply_id = (req.body.reply_id == "null" || req.body.reply_id == "undefined" || req.body.reply_id == "") ? null : req.body.reply_id;
    var from = req.body.from;
    Post.getPostById(post_id, function (err, post) {
        if (err||(!post)) {
            res.json({success: false });
            return;
        }
        //增加评论
        PostReply.newAndSave(post_id, content, post.from_user._id, main_id, reply_id, from_user, to_user, function (err, reply) {
            if (err) {
                res.send({ success: false });
                return;
            }
            //如果秘密的本身的也少于6条，插入一条数据
            if (post.reply_count < 6) {
                Post.addReply(post_id, reply, function (err, docs) {
                    if (err) {
                        res.send('err');
                        return;
                    }
                });
            }
            post.reply_count = post.reply_count + 1;
            post.order_index=post.order_index+1;
            post.last_reply_at = new Date();
            post.update_at = new Date();
            post.last_update_type="reply";
            post.save();
            if (from == "detail_comment") {
                reply.friendly_create_at = Util.format_date(reply.create_at, true);
                res.render('front/partial/post_detail_comment_abstract', {
                    reply: reply
                });
            } else if (from == "detail_reply") {
                reply.friendly_create_at = Util.format_date(reply.create_at, true);
                res.render('front/partial/post_detail_reply_abstract', {
                    children_reply: reply
                });
            } else {
                res.render('front/partial/post_list_comment_abstract', {

                    reply: reply
                });
            }
        })
    })
};



exports.delete = function (req, res, next) {
    //删除本身
    //删除post主表当中的一条
    //删除对应的reply_count
    var reply_id = req.query.reply_id;
    PostReply.getReply(reply_id, function (err, reply) {
        if (err) {
            return res.send({ success: false, message: err.message });
        }
        if (!reply) {
            return res.send({ success: false, message: '此回复不存在或已被删除。' });
        }
        if (!(req.session.user._id == reply.from_user._id || req.session.user.is_admin)) {
            return res.send({success: false, message: '无权限'});
        }
        var proxy = new EventProxy();
        proxy.assign('reply_removed_done', 'post_nest_reply_removed_done', 'post_nest_reply_count_done', function () {
            return   res.send({success: true});
        });
        proxy.fail(function (err) {
            return   res.send({success: false});
        });
        //删除这条消息
        reply.remove(proxy.done("reply_removed_done"));
        Post.removeReply(reply.post, reply_id, function (err, doc) {
            if (err) {
                return;
            }
            proxy.emit("post_nest_reply_removed_done");
        });
        Post.getPostById(reply.post, proxy.done(function (post) {
            post.reply_count = post.reply_count - 1;
            post.save();
            proxy.emit("post_nest_reply_count_done")
        }));

    });
}


exports.index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var sort=[[ 'create_at', 'desc' ] ];
    var query={};
    if(!req.session.user.email!=="admin@admin.com"){
       query = {'from_user.belong_group':req.session.user.location.belong_group};
    }
    var options = { skip: (page - 1) * limit, limit: limit,sort:sort};
    var proxy = EventProxy.create('replies', 'pages',
        function (replies, pages) {
            res.render('back/reply/index',{
                replies: replies,
                pages: pages,
                current_page: page
            });
        });
    proxy.fail(next);
    PostReply.getRepliesByQueryEx(query, options, function (err, replies) {
        replies.forEach(function (reply, i) {
            if (reply) {
                reply.friendly_create_at = Util.format_date(reply.create_at, true);
            }
            return reply;
        });
        proxy.emit('replies', replies);
    })

    PostReply.getCountByQuery(query, proxy.done(function (all_replies_count) {
        var pages = Math.ceil(all_replies_count / limit);
        proxy.emit('pages', pages);
    }));
};