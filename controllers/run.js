/*var User = require('../proxy').User;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');
var User = require('../proxy').User;
var Post = require('../proxy').Post;
var PostLike = require('../proxy').PostLike;
var PostFav = require('../proxy').PostFav;
var PostReply = require('../proxy').PostReply;
var Message = require('../proxy').Message;
var ConfessInform = require('../proxy').ConfessInform;
var School = require('../proxy').School;
var College = require('../proxy').College;
var FriendBoard = require('../proxy').FriendBoard;
var TradeBoard = require('../proxy').TradeBoard;
var Region = require('../proxy').Region;
exports.reg = function (req, res, next) {
    res.render('front/user/reg');
};*/
var formidable = require('formidable');

exports.user = function (req, res, next) {
    res.render('back/run/users');
};


exports.create_activity_show = function (req, res, next) {
    res.render('back/run/create_activity_show');
};

exports.activityList = function (req, res, next) {
    res.render('back/run/activityList');
};

exports.huiyuan = function (req, res, next) {
    res.render('back/run/huiyuan');
};




///话题表单的显示
exports.user_create = function (req, res, next) {

    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = 'public/'; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024*1024;   //文件大小 k
    form.parse(req,function(err, fields, files){

        var name=fields.name;
        var nickname=fields.fields
        var sex=fields.sex;
        var height=fields.height;
        var age=fields.age;
        var location=fields.location;
        var phone=fields.phone;
        var size=fields.size;
        var address=fields.address;
        var avatar=files.avatar;
        if(name&&nickname&&sex&&height&&age&&location&&phone&&size&&address&&avatar){
            console.log("success")
            return res.json({"status":"success"});
        }else{
            console.log("fail")
            return res.json({"status":"fail"});
        }


        console.log(files)

        return res.json({"status":"success"});

        if (err) {
            console.log(err)
            res.locals.error = err;

            return res.json({"status":"no"});
        }
        console.log(fields)

        console.log(files)

        var extName = 'mp4';  //后缀名
        switch (files.photo_url.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }


        if(extName.length == 0){
            res.locals.error = '只支持png和jpg格式图片';
            res.render('index', { title: TITLE });
            return;
        }

        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        console.log(newPath);
        fs.renameSync(files.photo_url.path, newPath);  //重命名
    });

    res.json({status:"ok"})

    /*var form = new multiparty.Form({uploadDir: 'public/files/'});
     //上传完成后处理
     form.parse(req, function(err, fields, files) {
     var filesTmp = JSON.stringify(files,null,2);

     console.log(fields)
     console.log(files)
     if(err){
     console.log('parse error: ' + err);
     } else {
     console.log('parse files: ' + filesTmp);
     var inputFile = files.inputFile[0];
     var uploadedPath = inputFile.path;
     var dstPath = 'public/files/' + inputFile.originalFilename;
     //重命名为真实文件名
     fs.rename(uploadedPath, dstPath, function(err) {
     if(err){
     console.log('rename error: ' + err);
     } else {
     console.log('rename ok');
     }
     });
     }

     });*/

};



/*
exports.getReplied = function (req, res, next) {
    var query = { $or: [
        { 'post_user_id': req.session.user._id, 'main_id': null} ,
        {'to_user._id': req.session.user._id}
    ]};
    //var query = { post_user_id :req.session.user._id,main_id:null};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'to_user_read', 'asc' ],
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('replies', 'pages',
        function (replies, pages) {
            res.render('front/user/replied', {
                replies: replies,
                pages: pages,
                current_page: page,
                from: "i-replied"
            });
        });
    proxy.fail(next);
    PostReply.getRepliesByQuery(query, options, proxy.done(function (replies) {
        proxy.after('reply', replies.length, function (replies) {
            proxy.emit('replies', replies);
        });
        replies.forEach(function (reply, index) {
            if (reply.to_user_read == false) {
                reply.to_user_read = true;
                reply.save();
            }
            reply.friendly_create_at = Util.format_date(reply.create_at, true);
            proxy.emit('reply', reply);
        });
    }));
    PostReply.getCountByQuery(query, proxy.done(function (all_replies_count) {
        var pages = Math.ceil(all_replies_count / limit);
        proxy.emit('pages', pages);
    }));
}
//得到我赞的
exports.getPostLike = function (req, res, next) {
    user_id = req.query.user_id || req.session.user._id;
    var query = {from_user: user_id};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('post_likes', 'pages',
        function (post_likes, pages) {
            res.render('front/user/like', {
                post_likes: post_likes,
                pages: pages,
                current_page: page,
                from: "i-like"
            });
        });
    proxy.fail(next);
    PostLike.getPostLikesByQuery(query, options, proxy.done(function (results) {
        proxy.after('post_like', results.length, function (post_likes) {
            proxy.emit('post_likes', post_likes);
            // 在所有文件的异步执行结束后将被执行
            // 所有文件的内容都存在list数组中
        });
        results.forEach(function (post_like, index) {
            if (post_like.post) {
                post_like.post.friendly_create_at = Util.format_date(post_like.post.create_at, true);
                post_like.post.friendly_update_at = Util.format_date(post_like.post.update_at, true);
            }
            proxy.emit('post_like', post_like.post);
        });
    }));
    PostLike.getCountByQuery(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));
}

exports.userlock = function (req, res, next) {
    var user_id = req.query.user_id;
    var name = req.query.name;
    if (user_id && (user_id.toString() == req.session.user._id.toString())) {
        return res.send("self");
    }
    User.getUserById(user_id, function (err, user) {
        if (err||(!user)) {
            return res.send("err");
        }
        res.render('front/user/lock', {
            user_id: user_id,
            user_name: name,
            user_sex: user.sex
        });
    })
}

exports.send_message = function (req, res, next) {
    var from_user_nicked = req.body.nicked;
    var to_user_id = req.body.tou_id;
    var content = req.body.content;
    var ref_type = req.body.ref_type;
    var ref_id = req.body.ref_id;
    var ref_content = "";
    var from_user = {_id: req.session.user._id,
        name: from_user_nicked == "1" ? "匿名用户" : req.session.user.name,
        sex: req.session.user.sex

    }
    User.getUserById(to_user_id, function (err, user) {
        if (err||(!user)) {
            return res.send({ success: false, message: '没有此用户' });
        }
        var to_user = {
            _id: user._id,
            name: user.name,
            sex: user.sex
        }
        if (ref_type == "friend_board") {
            FriendBoard.getFriendBoardById(ref_id, function (err, friendboard) {
                Message.newAndSave(from_user, content, to_user, friendboard.content, function (err, message) {
                    if (err) {
                        return res.send({ success: false, message: '发送失败，请稍后重试' });
                    }
                    return res.send({ success: true })
                });
            })
        } else if (ref_type == "trade_board") {
            TradeBoard.getTradeBoardById(ref_id, function (err, tradeboard) {
                Message.newAndSave(from_user, content, to_user, tradeboard.content, function (err, message) {
                    if (err) {
                        return res.send({ success: false, message: '发送失败，请稍后重试' });
                    }
                    return res.send({ success: true })
                });
            })
        } else {
		 if(!((content.indexOf("专业")!= -1)||(content.indexOf("约炮")!= -1)||(content.indexOf("爱爱")!= -1)))
            {Message.newAndSave(from_user, content, to_user, "", function (err, message) {
                if (err) {
                    return res.send({ success: false, message: '发送失败，请稍后重试' });
                }
                return res.send({ success: true })
            });
				}else{
				 return res.send({ success: false, message: '发送失败，请稍后重试' });
				}

        }

    })

}

exports.confess_inform = function (req, res, next) {
    var from = req.query.from || "i-confess-informing";
    if (from == "i-confess-informing") {
        Post.confessToInform(req.session.user.location.college_id, [], function (err, confesses) {
            if (err) {
                return next(err);
            }
            ConfessInform.getConfessInform(req.session.user._id, ['confess'], function (err, informed) {
                var confess_informs = new Array();
                for (var i = 0; i < confesses.length; i++) {
                    confess_informs.push(confesses[i]);
                    for (var j = 0; j < informed.length; j++) {
                        // console.log("informed"+informed[j].confess);
                        if (confesses[i]._id.toString() == informed[j].confess.toString()) {
                            confess_informs.pop(confesses[i]);
                        }
                    }
                }
                var proxy = EventProxy.create('confess_informs',
                    function (confesses_informs) {
                        res.render('front/user/confess_inform', {
                            confess_informs: confess_informs,
                            from: "i-confess-informing"
                        });
                    });
                proxy.after('confess_inform_saved', confess_informs.length, function (confess_informs) {
                    proxy.emit('confess_informs', confess_informs);
                });
                confess_informs.forEach(function (confess_inform, index) {
                    ConfessInform.newAndSave(confess_inform._id, req.session.user._id, "read", function (err) {
                        console.log(err);
                    });
                    confess_inform.friendly_create_at = Util.format_date(confess_inform.create_at, true);
                    proxy.emit('confess_inform_saved', confess_inform);
                })
            })
        });
    } else {
        ConfessInform.getConfessInformEx(req.session.user._id, ['confess'], function (err, confess_informs) {
            var confesses = new Array();
            confess_informs.forEach(function (confess_inform, index) {
				if(confess_inform.confess){
                  confess_inform.confess.friendly_create_at = Util.format_date(confess_inform.confess.create_at, true);
                  confesses.push(confess_inform.confess);
				}
            });
            res.render('front/user/confess_inform', {
                confess_informs: confesses,
                from: "i-confess-informed"
            });
        })
    }
}

exports.messages = function (req, res, next) {
    var user_id = req.query.user_id || req.session.user._id;
    var query = {'to_user._id': user_id};
    var from = req.query.from || "i-send";
    if (from == "i-send") {
        query = {'from_user._id': user_id};
    }
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('messages', 'pages',
        function (messages, pages) {
            res.render('front/user/message', {
                messages: messages,
                pages: pages,
                current_page: page,
                from: from
            });
        });
    proxy.fail(next);
    Message.getMessagesByQuery(query, options, function (err, messages) {
        messages.forEach(function (message, i) {
            if (message) {
                if (!message.to_user_read) {
                    message.to_user_read = true;
                    message.save();
                }
                message.friendly_create_at = Util.format_date(message.create_at, true);
            }
            return message;
        });
        proxy.emit('messages', messages);
    });
    Message.getMessagesCount(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));
}

//得到我赞的
exports.getPostLiked = function (req, res, next) {
    user_id = req.query.user_id || req.session.user._id;
    var query = {to_user: user_id};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'to_user_read', 'asc' ],
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('post_likes', 'pages',
        function (post_likes, pages) {
            res.render('front/user/liked', {
                post_likes: post_likes,
                pages: pages,
                current_page: page,
                from: "i-like"
            });
        });
    proxy.fail(next);
    PostLike.getPostLikesByQuery(query, options, proxy.done(function (results) {
        proxy.after('post_like', results.length, function (post_likes) {
            proxy.emit('post_likes', post_likes);
        });
        results.forEach(function (post_like, index) {
            if (post_like.to_user_read == false) {
                post_like.to_user_read = true;
                post_like.save();
            }
            post_like.friendly_create_at = Util.format_date(post_like.create_at, true);
            proxy.emit('post_like', post_like);
        });
    }));
    PostLike.getCountByQuery(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));
};

//个人中心用户发过的表白和秘密
exports.getPostFav = function (req, res, next) {
    user_id = req.query.user_id || req.session.user._id;
    var query = {from_user: user_id};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('post_favs', 'pages',
        function (post_favs, pages) {
            res.render('front/user/fav', {
                post_favs: post_favs,
                pages: pages,
                current_page: page,
                from: "i-fav"
            });
        });
    proxy.fail(next);
    PostFav.getPostFavsByQuery(query, options, proxy.done(function (results) {
        proxy.after('post_fav', results.length, function (post_favs) {
            proxy.emit('post_favs', post_favs);
        });
        results.forEach(function (post_fav, index) {
            if (post_fav.post) {
                post_fav.post.friendly_create_at = Util.format_date(post_fav.post.create_at, true);
            }
            proxy.emit('post_fav', post_fav.post);
        });
    }));
    PostFav.getCountByQuery(query, proxy.done(function (all_posts_count) {
        var pages = Math.ceil(all_posts_count / limit);
        proxy.emit('pages', pages);
    }));
}

//更新用户信息的界面
exports.show_update = function (req, res, next) {
    var return_code = req.query.return_code;
    var events = ['regions', 'schools', 'colleges' , 'user'];
    var ep = EventProxy.create(events, function (regions, schools, colleges, user) {
        res.render('front/user/update', {
            regions: regions,
            schools: schools,
            colleges: colleges,
            user: user,
            return_msg: getReturnMsg(return_code)
        });
    });
    ep.fail(next);
    Region.getRegionByQuery({}, {}, ep.done('regions'));
    User.getUserById(req.session.user._id, function (err, user) {
        ep.emit("user", user);
        School.getSchoolsByRegion({region_code: user.location.region_code}, { sort: [
            [ 'create_at', 'desc' ]
        ]}, ep.done('schools'));
        College.getCollegesBySchool(user.location.school_id, ep.done("colleges"));
    });

};

//更新用户信息
exports.input_update = function (req, res, next) {
    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var email = sanitize(req.body.email).trim();
    email = email.toLowerCase();
    email = sanitize(email).xss();
    var school_id = sanitize(req.body.school_id).trim();
    school_id = sanitize(school_id).xss();
    var college_id = sanitize(req.body.college_id).trim();
    college_id = sanitize(college_id).xss();
    var region_code = sanitize(req.body.region_code).trim();
    region_code = sanitize(region_code).xss();
    var grade = sanitize(req.body.grade).trim();
    grade = sanitize(grade).xss();
    var sex = req.body.sex;
    var return_code = 201;
    if (name === '' || email === '' || college_id == "select") {
        return_code = 201;
        var url = "/user/show_update?return_code=" + return_code + "";
        res.redirect(url);
        return;
    }
    if (!name) {
        return_code = 202;
        var url = "/user/show_update?return_code=" + return_code + "";
        res.redirect(url);
        return;
    }
    try {
        check(email, '不正确的电子邮箱。').isEmail();
    } catch (e) {
        return_code = 205;
        var url = "/user/show_update?return_code=" + return_code + "";
        res.redirect(url);
        return;
    }
    User.getUserById(req.session.user._id, function (err, user) {
        School.getSchoolById(school_id, function (err, school) {
            College.getCollegeById(college_id, function (err, college) {
                user.name = name;
                user.email = email;
                user.location = {
                    region_code: school.region_code,
                    school_id: school_id,
                    school_name: school.cn_name,
                    school_en_name: school.en_name,
                    school_short_name: school.cn_short_name,
                    college_id: college_id,
                    college_name: college.name,
                    grade: grade,
                    belong_group: school.belong_group
                };
                user.sex = sex;
                user.save();
                req.session.user = user;
                errorcode = 200;
                var url = "/user/show_update?return_code=200";
                res.redirect(url);
            });
        });
    });
};

///返回成功信息的函数
function getReturnMsg(return_code) {
    if (!return_code) return "";
    var return_msg = new Object();
    if (return_code == 200) {
        return_msg.type = "success";
        return_msg.content = '操作成功';
        return return_msg;
    }
    if (return_code == 201) {
        return_msg.type = "err";
        return_msg.content = '信息不完整';
        return return_msg;

    }
    if (return_code == 202) {
        return_msg.type = "err";
        return_msg.content = '用户名格式不正确';
        return return_msg;
    }
    if (return_code == 203) {
        return_msg.type = "err";
        return_msg.content = '用户名只能使用0-9，a-z，A-Z。';
        return return_msg;
    }
    if (return_code == 204) {
        return_msg.type = "err";
        return_msg.content = '两次密码输入不一致';
        return return_msg;
    }
    if (return_code == 205) {
        return_msg.type = "err";
        return_msg.content = '不正确的电子邮箱';
        return return_msg;
    }
    if (return_code == 206) {
        return_msg.type = "err";
        return_msg.content = '用户名或邮箱已被使用';
        return return_msg;
    }
    if (return_code == 207) {
        return_msg.type = "err";
        return_msg.content = '用户不存在';
        return return_msg;
    }
    if (return_code == 208) {
        return_msg.type = "err";
        return_msg.content = '密码错误';
        return return_msg;
    }
    if (return_code == 209) {
        return_msg.type = "err";
        return_msg.content = '操作失败，请重试';
        return return_msg;
    }
    return "";
}

//个人中心自己发过的交友信息
exports.friend_boards = function (req, res, next) {
    var query = {'from_user._id': req.session.user._id};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('friend_boards', 'pages',
        function (friend_boards, pages) {
            res.render('front/user/friend_board', {
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
    proxy.emit('pages', Math.ceil(req.session.user.friend_board_count / limit));
};

//个人中心自己发过的交易信息
exports.trade_boards = function (req, res, next) {
    var query = {'from_user._id': req.session.user._id};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('trade_boards', 'pages',
        function (trade_boards, pages) {
            res.render('front/user/trade_board', {
                trade_boards: trade_boards,
                pages: pages,
                current_page: page
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
    proxy.emit('pages', Math.ceil(req.session.user.friend_board_count / limit));
}

//设置用户角色--------后台用到的
exports.set_role = function (req, res, next) {
    var current_page = req.query.current_page || "";
    var cmd = req.query.cmd || "";
    User.getUserById(req.query.user_id, function (err, user) {
        if (user) {
            user.is_admin = (cmd == 'set_admin');
            user.save();
            return  res.redirect("/back/users?page=" + current_page);
        }
        return res.redirect("/back/users?page=" + current_page);
    })
}





//获取所有的用户--------后台用到的
exports.users = function (req, res, next) {
    var keyword = req.query.keyword || "";
    var query = {};
    if (req.session.user.email != 'admin@admin.com') {
        //说明是查询的
        if (keyword != '') {
            query = {$or: [
                { 'email': keyword} ,
                {'name': keyword}
            ]};
        }
        else {
            query = {'location.belong_group': req.session.user.location.belong_group};
        }
    }
    else {
        //说明是查询的
        if (keyword != '') {
            query = {$or: [
                { 'email': keyword} ,
                {'name': keyword}
            ]};
        }
    }
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 20;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var proxy = EventProxy.create('users', 'pages',
        function (users, pages) {
            res.render('back/user/users', {
                users: users,
                pages: pages,
                current_page: page
            });
        });
    proxy.fail(next);
    User.getUsersByQuery(query, options, proxy.done("users"));
    User.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
};*/
