/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;
var fs = require("fs");
var at = require('../services/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Post = require('../proxy').Post;
var PostReply = require('../proxy').PostReply;
var PostLike = require('../proxy').PostLike;
var PostFav = require('../proxy').PostFav;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var School = require('../proxy').School;
var College = require('../proxy').College;
var Message = require('../proxy').Message;
var cache = require('../common/cache');
var config = require('../config');
/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
function showdate(n) {
    var uom = new Date(new Date() - 0 + n * 86400000);
    return uom;
}

exports.index = function (req, res, next) {
    var filter = req.query.filter || "all";
    var school=req.query.school||((req.session.user || req.cookies["school_id"])?"my":"all");
    var query = {type: req.query.t, 'display': true};

    var sort = [
        [ 'update_at', 'desc' ]
    ];
    var school_id = "";
    var school_short_name="";
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = config.list_topic_count;
    var render_url = 'front/post/index';
    school_id=req.cookies["school_id"];
    school_short_name=req.cookies.school_short_name;
    if (req.session.user) {
        school_id = req.session.user.location.school_id;
        school_short_name= req.session.user.location.school_short_name;
        console.log(req.session.user.location.school_en_name);
    }
    if ((req.session.user || req.cookies["school_id"]||req.cookies.school_id)&&school=="my") {
        //看本校的全部
        if (school=="my"&&filter == "all") {
			query={"$or":[{'from_user.school_id':school_id, 'display': true},{"all_show":true, 'display': true}]}
            //query = {'from_user.school_id':school_id, 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //看本校热门';
        } else if (school=="my"&&filter == "hot") {
			query={"$or":[{'from_user.school_id':school_id,'create_at':{$gt: new Date(showdate(-3))}, 'display': true},{'all_show':true,'create_at':{$gt: new Date(showdate(-3))}, 'display': true}]}
           //query = {'from_user.school_id':school_id,'create_at':{$gt: new Date(showdate(-3))}, 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
           
        }else if (school=="my"&&filter == "new") {
			query={"$or":[{'from_user.school_id':school_id, 'display': true},{'all_show':true, 'display': true}]}
          
            //query = {'from_user.school_id':school_id, 'display': true};
            sort = [
                [ 'create_at', 'desc' ]
            ];
            //本校晒图
        } else if (school=="my"&&filter == "image") {
			query={"$or":[{'image': {'$exists': true},'from_user.school_id':school_id,'display': true},{'image': {'$exists': true},'all_show':true, 'display': true}]}
          
           // query = {'image': {'$exists': true},'from_user.school_id':school_id,'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];///本校表白
        }else  if (school=="my"&&filter == "biaobai") {
			query={"$or":[{'from_user.school_id':school_id,'type':'biaobai','display': true},{'type':'biaobai','all_show':true, 'display': true}]}
          
           // query = {'from_user.school_id':school_id,'type':'biaobai','display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //求勾搭';
        }else  if (school=="my"&&filter == "friend") {
				query={"$or":[{'from_user.school_id':school_id,'type':'friend','display': true},{'type':'friend','all_show':true, 'display': true}]}
 
            //query = {'from_user.school_id':school_id,'type':'friend', 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //出谋划策';
        } else  if (school=="my"&&filter == "mood") {
		  query={"$or":[{'from_user.school_id':school_id,'type':'mood','display': true},{'type':'mood','all_show':true, 'display': true}]}
 
            //query = {'from_user.school_id':school_id,'type':'mood', 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //出谋划策';
        }else  if (school=="my"&&filter == "news") {
			  query={"$or":[{'from_user.school_id':school_id,'type':'news','display': true},{'type':'news','all_show':true, 'display': true}]}
 
            //query = {'from_user.school_id':school_id,'type':'news', 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //出谋划策';
        }else if (school=="my"&&filter == "ask") {
		 query={"$or":[{'from_user.school_id':school_id,'type':'ask','display': true},{'type':'ask','all_show':true, 'display': true}]}
 
            //query = {'from_user.school_id':school_id,'type':'ask', 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
        }
    }else {
        //高校热门
        if (school == "all" && filter == "hot") {
            query = {'create_at': {$gt: new Date(showdate(-3))}, 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //晒图
        } else if (school == "all" && filter == "image") {
            query = {'create_at': {$gt: new Date(showdate(-3))}, 'image': {'$exists': true}, 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];///高校最新
        } else if (school == "all" && filter == "all") {
            query = { 'display': true};
            sort = [
                [ 'update_at', 'desc' ]
            ];
            //求勾搭';
        } else if (school == "all" && filter == "friend") {
            query = {'type': 'friend', 'display': true};
            sort = [
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
            //出谋划策';
        } else if (school == "all" && filter == "ask") {
            query = {'create_at': {$gt: new Date(showdate(-3))}, 'type': 'ask', 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
        }else if (school == "all" && filter == "news") {
            query = {'create_at': {$gt: new Date(showdate(-3))}, 'type': 'news', 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
        }else if (school == "all" && filter == "mood") {
            query = {'create_at': {$gt: new Date(showdate(-3))}, 'type': 'mood', 'display': true};
            sort = [
                ['order_index', 'desc' ],
                ['top', 'desc' ],
                [ 'update_at', 'desc' ]
            ];
        }else if (school=="all"&&filter == "new") {
            query = { 'display': true};
            sort = [
                [ 'create_at', 'desc' ]
            ];
            //本校晒图
        }
        else if (filter == "new") {
            query = {'type': req.query.t};
            sort = [
                [ 'update_at', 'desc' ]
            ];
            if (req.session.user && req.session.user.is_admin) {
                if (req.session.user.email != 'admin@admin.com') {
                    query = {'type': req.query.t, 'from_user.belong_group': req.session.user.location.belong_group};
                }
            }
        } else {
            query = {'type': req.query.t};
            sort = [
                [ 'update_at', 'desc' ]
            ];
            if (req.session.user && req.session.user.is_admin) {
                if (req.session.user.email != 'admin@admin.com') {
                    query = {'type': req.query.t, 'from_user.belong_group': req.session.user.location.belong_group};
                }
            }
        }
    }

    console.log(query);

    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
    var proxy = EventProxy.create('posts', 'pages', 'board',
        function (posts, pages, board) {
            res.render(render_url, {
                posts: posts,
                pages: pages,
                current_page: page,
                type: req.query.t,
                from: "index",
                filter: filter,
                school_short_name:school_short_name,
                school_type:school,
                board: board
            });
        });
    proxy.fail(next);
    Post.getPostsByQuery(query, options, function (err, posts) {
        posts.forEach(function (post, i) {
            if (post) {
                post.friendly_create_at = Util.format_date(post.create_at, true);
                post.friendly_update_at = Util.format_date(post.update_at, true);
            }
            return post;
        });
        proxy.emit('posts', posts);
    })

    Post.getCountByQuery(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));

    School.getSchoolCacheById(req.session.user ? req.session.user.location.school_id : "", function (err, school) {
        if (school && school !== '') {
            proxy.emit('board', school.board);
        } else {
            proxy.emit('board', "");
        }
    })
};

exports.back = function (req, res, next) {
    var query = {type: req.query.t, 'display': true};
    //这里的0表示查看全部，而不是某一个学校
    var school_id = req.query.school_id || "0";
    var sort = [
        [ 'update_at', 'desc' ]
    ];
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    if (school_id && school_id !== "0") {
        query = {'type': req.query.t, 'from_user.school_id': school_id};
    }
    var options = { skip: (page - 1) * limit, limit: limit, sort: sort};
    var proxy = EventProxy.create('posts', 'pages', 'schools',
        function (posts, pages, schools) {
            res.render('back/post/' + (req.query.t == 'secret' ? 'secrets' : 'confesses'), {
                posts: posts,
                pages: pages,
                current_page: page,
                schools: schools,
                school_id: school_id,
                type: req.query.t
            });
        });
    proxy.fail(next);
    Post.getPostsByQuery(query, options, function (err, posts) {
        posts.forEach(function (post, i) {
            if (post) {
                post.friendly_create_at = Util.format_date(post.create_at, true);
                post.friendly_update_at = Util.format_date(post.update_at, true);
            }
            return post;
        });
        proxy.emit('posts', posts);
    })

    Post.getCountByQuery(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));

    School.getSchoolsByQuery({}, { sort: [
        [ 'create_at', 'desc' ]
    ] }, proxy.done("schools"));

};


/**
 * post page
 * 新增一条秘密涉及的地方有
 1.该用户新增一条秘密
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 * @param  {Function} next
 */
exports.detail = function (req, res, next) {
    var post_id = req.params.post_id;
    var query = {post: post_id};
    var ajax = req.query.ajax;
    var share = req.query.share;
    var faved = false;
    var liked = false;
    var options = { sort: [
        [ 'create_at', 'asc' ]
    ]};
    //var options = { limit: 5, sorst: [ [ 'last_reply_at', 'desc' ] ]};

    Post.getPostById(post_id, function (err, post) {
        if (err || (!post)) {
            return  res.redirect("/post");
        } else {
            post.visit_count = post.visit_count + 1;
            post.save();
            var events = ['post', 'replies', 'faved', 'liked'];
            var ep = EventProxy.create(events, function (post, replies) {
                post.friendly_create_at = Util.format_date(post.create_at, true);
                res.render('front/post/detail', {
                    post: post,
                    replies: replies,
                    ajax: ajax,
                    share: share,
                    faved: faved,
                    liked: liked,
                    from: "detail"
                });
            });
            ep.fail(function () {
                res.json({ success: false })
            });
            PostReply.getPostReplysByQuery(query, options, ep.done('replies'));
            ep.emit('post', post);

            if (req.session.user) {
                PostFav.exsitFavRecord(req.session.user._id, post_id, function (err, doc) {
                    if (doc) {
                        faved = true;
                    }
                    ep.emit('faved', faved);
                });
                PostLike.exsitLikeRecord(req.session.user._id, post_id, function (err, doc) {
                    if (doc) {
                        liked = true;
                    }
                    ep.emit('liked', liked);
                });
            } else {
                ep.emit('faved', false);
                ep.emit('liked', false);
            }

        }
    });
};

exports.postlike = function (req, res, next) {
    var post_id = req.query.post_id;
    var from_user_id = req.session.user._id;
    var from_user_name = req.session.user.name;
    PostLike.exsitLikeRecord(from_user_id, post_id, function (err, doc) {
        if (err) {
            return    res.json({success: false})
        }
        else if (!doc) {
            Post.getPostById(post_id, function (err, post) {
                if (err || (!post) || post.length <= 0) {
                    return  res.json({ success: false });
                }
                PostLike.newAndSave(post_id, from_user_id, from_user_name, post.from_user._id, post.type, function (err, doc) {
                    if (err) {
                        return  res.json({ success: false });
                    }
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.like_count = user.like_count + 1;
                        post.like_count = post.like_count + 1;
                        post.order_index = post.order_index + 1;
                        post.update_at = new Date();
                        post.last_update_type = "like";
                        user.save();
                        post.save();
                        return  res.json({ success: true});
                    });
                })
            })
        } else {
            res.json({ success: true, exsit: true});
            return;
        }
    });
};

exports.postfav = function (req, res, next) {
    var post_id = req.query.post_id;
    var from_user_id = req.session.user._id;
    var from_user_name = req.session.user.name;
    PostFav.exsitFavRecord(from_user_id, post_id, function (err, doc) {
        if (err) {
            return  res.json({success: false});
        }
        else if (!doc) {
            Post.getPostById(post_id, function (err, post) {
                if (err || post.length <= 0) {
                    res.json({ success: false });
                }
                PostFav.newAndSave(post_id, from_user_id, from_user_name, post.user_id, post.type, function (err, doc) {
                    if (err) {
                        return res.json({ success: false });
                    }
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.fav_count = user.fav_count + 1;
                        post.fav_count = post.fav_count + 1;
                        post.last_update_type = "fav";
                        user.save();
                        post.save();
                        req.session.user.fav_count = user.fav_count;
                        res.locals.current_user = req.session.user;
                        return  res.json({ success: true});
                    });
                })
            })
        } else {
            res.json({ success: true, exsit: true});
            return;
        }
    });
};

exports.create = function (req, res, next) {
    var content = req.body.content;
    var nicked = req.body.nicked;
    var college_id = req.body.college_id || req.session.user.college_id;
    var college_name = req.body.college_name || req.session.user.college_name;
    var school_id = req.body.school_id || req.session.user.school_id;
    var school_name = req.body.school_name || req.session.user.school_name;
    var confess_to = req.body.confess_to || "";
    var imgData = req.body.image;
    var from_user = {
        _id: req.session.user._id,
        sex: req.session.user.sex,
        name: (req.body.nicked == 1) ? "某同学" : req.session.user.name,
        grade: req.session.user.location.grade,
        college_id: req.session.user.location.college_id,
        college_name: req.session.user.location.college_name,
        school_id: req.session.user.location.school_id,
        school_name: req.session.user.location.school_name,
        school_en_name: req.session.user.location.school_en_name,
        school_short_name: req.session.user.location.school_short_name,
        region_code: req.session.user.location.region_code,
        belong_group: req.session.user.location.belong_group
    };
    var confess_to = "";
    if (req.query.t == "confess") {
        confess_to = {
            name: req.body.confess_to,
            college_id: req.body.college_id,
            college_name: req.body.college_name,
            school_id: req.body.school_id,
            school_name: req.body.school_name
        };
    }
    var edit_error =
            content === '' ?
        '标题不能是空的。' :
        (content.length >= 10 && content.length <= 100 ? '' : '标题字数太多或太少。');
    if (false) {
    } else {
        Post.newAndSave(req.query.t, content, from_user, confess_to, function (err, post) {
            if (err) {
                res.send('err');
                return;
            }
            post.friendly_create_at = Util.format_date(post.create_at, true);
            User.getUserById(req.session.user._id, function (err, user) {
                if (req.query.t == "secret") {
                    user.secret_count = user.secret_count + 1;
                } else {
                    user.confess_count = user.confess_count + 1;
                }
                user.post_count = user.post_count + 1;
                user.save();
                req.session.user.secret_count = user.secret_count;
                req.session.user.confess_count = user.confess_count;
                res.locals.current_user = req.session.user;
                //接收前台POST过来的base64
                //过滤data:URL
                if (imgData) {
                    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                    var dataBuffer = new Buffer(base64Data, 'base64');
                    var dirctory = "public/front/userImages/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
                    if (!fs.existsSync(dirctory)) {
                        fs.mkdirSync(dirctory);
                    }
                    fs.writeFile(dirctory + "/" + post._id + ".png", dataBuffer, function (err) {
                        if (err) {
                            res.send(err);
                        } else {
                            post.image = dirctory + "/" + post._id + ".png";
                            post.image_from = "local";
                            post.save();
                            return  res.render('front/partial/post_abstract', {
                                post: post,
                                from: "index",
                                type: req.query.t
                            });
                        }
                    })

                } else {
                    return  res.render('front/partial/post_abstract', {
                        post: post,
                        from: "index",
                        type: req.query.t
                    });
                }
            });
        });
    }
};

exports.delete = function (req, res, next) {
    //删除发表, 作者对应的发表-1
    //删除喜欢，喜欢作者like_count减1
    //删除收藏，收藏作者的fav_count减1
    var post_id = req.query.post_id;
    if (post_id.length !== 24) {
        return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    Post.getPostById(post_id, function (err, post) {
        if (err) {
            return res.send({ success: false, message: err.message });
        }
        if (!post) {
            return res.send({ success: false, message: '此话题不存在或已被删除。' });
        }
        if (!(req.session.user._id == post.from_user._id || req.session.user.is_admin)) {
            return res.send({success: false, message: '无权限'});
        }
        var proxy = new EventProxy();
        proxy.assign('post_removed_done', 'post_reply_removed_done', 'users_like_count_update', 'post_likes_remove',
            'users_fav_count_update', 'post_favs_remove', 'poster_post_count_update', function () {
                return  res.send({success: true});
            });
        proxy.fail(function (err) {
            return   res.send({success: false});
        });
        //删除这条消息
        post.remove(proxy.done("post_removed_done"));
        //删除所有回复
        PostReply.removeByPostId(post_id, proxy.done("post_reply_removed_done"));
        PostFav.getPostFavsByPostId(post_id, function (err, post_favs) {
            //删除收藏纪录
            proxy.after('post_fav_remove', post_favs.length, function () {
                proxy.emit('post_favs_remove');
            });
            //用户收藏-1
            proxy.after('user_fav_count_update', post_favs.length, function () {
                proxy.emit('users_fav_count_update');
            });
            post_favs.forEach(function (post_fav) {
                User.getUserById(post_fav.from_user, function (err, user) {
                    user.fav_count = user.fav_count - 1;
                    user.save();
                    proxy.emit("user_fav_count_update")
                });
                post_fav.remove(proxy.done("post_fav_remove"));
            })
        });
        PostLike.getPostLikesByPostId(post_id, function (err, post_likes) {
            //删除赞或者祝福的纪录
            proxy.after('post_like_remove', post_likes.length, function () {
                proxy.emit('post_likes_remove');
            });
            //更新咱或者祝福者的upcount
            proxy.after('user_like_count_update', post_likes.length, function () {
                proxy.emit('users_like_count_update');
            });
            post_likes.forEach(function (post_like) {
                User.getUserById(post_like.from_user, function (err, user) {
                    if(user) {
                        user.like_count = user.like_count - 1;
                        user.save();
                    }
                    proxy.emit("user_like_count_update")
                });
                post_like.remove(proxy.done("post_like_remove"));
            })
        });
        User.getUserById(post.from_user._id, function (err, user) {
            if (post.type == "secret") {
                user.secret_count = user.secret_count - 1;
            } else {
                user.confess_count = user.confess_count - 1;
            }
            user.post_count = user.post_count - 1;
            user.save();
            proxy.emit('poster_post_count_update');
        });
        if (req.session.user.is_admin && (req.session.user._id !== post.user_id)) {
            var from_user = {_id: req.session.user._id,
                name: req.session.user.name,
                sex: req.session.user.sex
            };
            var to_user = {_id: post.from_user._id,
                name: post.from_user.name,
                sex: post.from_user.sex
            };
            Message.newAndSave(from_user, "您发表的以下信息小编认为不适合出现，故已删除，敬请谅解---小编", to_user, post.content, function (err, message) {
                /*  if (err) {
                 return res.send({ success: false, message: '发送失败，请稍后重试' });
                 }
                 return res.send({ success: true })*/
            });
        }
    });
};

exports.update_status = function (req, res, next) {
    var post_id = req.query.post_id;
    var action_val = req.query.action_val == "true" ? 1 : 0;
    var action_name = req.query.action_name;
    if (action_name == "other") {
        action_val = req.query.action_val;
    }
    Post.getPostById(post_id, function (err, post) {
        if (err||(!post)) {
            res.json({ success: false });
            return;
        }
        ;
        if (action_name == "top") {
            post.top = action_val;
        } else if (action_name == "chosen") {
            post.chosen = action_val;
        } else if (action_name == "other") {
			if(action_val=="all_show"){
			 post.all_show=true;
			}else{
            post.type = action_val;
			}
        } else if (action_name == "display") {
            post.display = action_val;
        } else if (action_name == "like") {
            if (!action_val) {
                PostLike.removeByPostId(post_id, function (err) {
                    if (err) return res.json({ success: false });
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.like_count = user.like_count - 1;
                        post.like_count = post.like_count - 1;
                        post.update_at = new Date();
                        user.save();
                    });
                })
            } else {
                PostLike.newAndSave(post_id, req.session.user._id, req.session.user.name, post.from_user._id, post.type, function (err) {
                    if (err) return res.json({ success: false });
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.like_count = user.like_count + 1;
                        post.like_count = post.like_count + 1;
                        user.save();
                    });
                })
            }
        } else if (action_name == "fav") {
            if (!action_val) {
                PostFav.removeByPostId(post_id, function (err) {
                    if (err) return res.json({ success: false });
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.fav_count = user.fav_count - 1;
                        post.fav_count = post.fav_count - 1;
                        user.save();
                        req.session.user.fav_count = user.fav_count;
                    });
                })
            } else {
                PostFav.newAndSave(post_id, req.session.user._id, req.session.user.name, post.from_user._id, post.type, function (err) {
                    if (err) return res.json({ success: false });
                    User.getUserById(req.session.user._id, function (err, user) {
                        if (err) return res.json({ success: false });
                        user.fav_count = user.fav_count + 1;
                        post.fav_count = post.fav_count + 1;
                        user.save();
                        req.session.user.fav_count = user.fav_count;
                    });
                })
            }
        }
        post.save();
        res.locals.current_user = req.session.user;
        return res.json({ success: true });
    });
}

exports.plus = function (req, res, next) {
    var post_id = req.body.post_id;
    var content = req.body.content;
    Post.getPostById(post_id, function (err, post) {
        if (err) {
            res.json({ success: false, msg: "追加失败，请刷新后重试"});
            return;
        }
        if (post.plus_count == 3) {
            res.json({ success: false, msg: "最多只能追加三次，谢谢参与"});
            return;
        }
        if (post.plus_count == 0) {
            post.plusmsg1 = content;
            post.plusmsg1_create_at = new Date();
            post.plus_count += 1;
        } else if (post.plus_count == 1) {
            post.plusmsg2 = content;
            post.plusmsg2_create_at = new Date();
            post.plus_count += 1;
        } else if (post.plus_count == 2) {
            post.plusmsg3 = content;
            post.plusmsg3_create_at = new Date();
            post.plus_count += 1;
        }
        post.update_at = new Date();
        post.last_update_type = "plus";
        post.save();
        res.json({ success: true });
        return;
    });
}

exports.get_posting_confess_page = function (req, res, next) {
    var school_id = req.query.school_id;
    res.render('front/partial/posting_confess', {current_school_id: school_id});
};

exports.get_posting_pageEx = function (req, res, next) {
    var school_id = req.query.school_id;
	var type="news";
    res.render('front/partial/posting_page', {current_school_id: school_id,type:type});
};

exports.get_posting_page = function (req, res, next) {
    var school_id = req.query.school_id;
	var type= req.params.type
	
    res.render('front/post/create', {current_school_id: school_id,type:type});
};

exports.get_college_select_page = function (req, res, next) {
    var school_id = req.query.school_id;
    College.getCollegesBySchool(school_id, function (err, colleges) {
        if (err) {
            return;
        }
        res.render('front/partial/college_select', {colleges: colleges});
    });
};

exports.img = function (req, res, next) {
    //接收前台POST过来的base64
    var imgData = req.body.formFile;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile("out.png", dataBuffer, function (err) {
        if (err) {
            res.send(err);
        } else {
            res.send("保存成功！");
        }
    });
};

