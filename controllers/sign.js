var check = require('validator').check,
    sanitize = require('validator').sanitize;
var crypto = require('crypto');
var config = require('../config').config;
var User = require('../proxy').User;
var Message = require('../proxy').Message;
var mail = require('../services/mail');
var School = require('../proxy').School;
var College = require('../proxy').College;
var EventProxy = require('eventproxy');
var PostLike = require('../proxy').PostLike;
var PostReply = require('../proxy').PostReply;
var ConfessInform = require('../proxy').ConfessInform;
var Post = require('../proxy').Post;
var Region = require('../proxy').Region;
//sign up
exports.showSignup = function (req, res, next) {
    var errorcode = 201;
    var errorcode = req.query.errorcode;
    var name = req.query.name;
    var email = req.query.email;
    var errormsg = getErrorMsg(errorcode);
    var events = ['regions'];
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    var ep = EventProxy.create(events, function (regions) {
        res.render('front/sign/signup', {
            errormsg: errormsg,
            name: name,
            email: email,
            regions: regions
        });
    });
    ep.fail(next);
    Region.getRegionByQuery({}, {}, function (err, regions) {
        ep.emit('regions', regions);
    })
};


function getErrorMsg(errorcode) {
    if (errorcode == 201) {
        return "信息不完整";
    }
    if (errorcode == 202) {
        return "用户名格式不正确";
    }
    if (errorcode == 203) {
        return "用户名只能使用0-9，a-z，A-Z。";
    }
    if (errorcode == 204) {
        return "两次密码输入不一致";
    }
    if (errorcode == 205) {
        return "不正确的电子邮箱";
    }
    if (errorcode == 206) {
        return "邮箱已被使用";
    }
    if (errorcode == 207) {
        return "用户不存在";
    }
    if (errorcode == 208) {
        return "密码错误";
    }
    if (errorcode == 209) {
        return "操作失败，请重试";
    }
    return "";
}

exports.signup = function (req, res, next) {
    //console.log("name="+req.body.name+"--"+"pwd="+req.body.pwd+"--"+"email="+req.body.email+"--"+"confirmpwd="+req.body.confirmpwd+"--"+"school_id="+req.body.school_id+"--"+"college_id="+req.body.college_id+"--"+"region_code="+req.body.region_code+"--"+"grade="+req.body.grade+"--"+"sex="+req.body.sex);

    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var pwd = sanitize(req.body.pwd).trim();
    pwd = sanitize(pwd).xss();
    var email = sanitize(req.body.email).trim();
    email = email.toLowerCase();
    email = sanitize(email).xss();
    var confirmpwd = sanitize(req.body.confirmpwd).trim();
    confirmpwd = sanitize(confirmpwd).xss();
    var school_id = sanitize(req.body.school_id).trim();
    school_id = sanitize(school_id).xss();
    var college_id = sanitize(req.body.college_id).trim();
    college_id = sanitize(college_id).xss();
    var region_code = sanitize(req.body.region_code).trim();
    region_code = sanitize(region_code).xss();
    var grade = sanitize(req.body.grade).trim();
    grade = sanitize(grade).xss();
    var sex = req.body.sex;
    var errorcode = 201;

    //console.log("name="+name+"--"+"pwd="+pwd+"--"+"email="+email+"--"+"confirmpwd="+confirmpwd+"--"+"school_id="+school_id+"--"+"college_id="+college_id+"--"+"region_code="+region_code+"--"+"grade="+grade+"--"+"sex="+sex);
    if (name === '' || pwd === '' || confirmpwd === '' || email === '' || college_id == 'select') {
        errorcode = 201;
        var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "";
        res.redirect(url);
        return;
    }
    if (!name.match(/^[\u4E00-\u9FA5a-zA-Z0-9_]{1,20}$/)) {
        errorcode = 202;
        var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
        res.redirect(url);
        return;
    }
    if (pwd !== confirmpwd) {
        errorcode = 204;
        var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
        res.redirect(url);
        return;
    }
    try {
        check(email, '不正确的电子邮箱。').isEmail();
    } catch (e) {
        errorcode = 205;
        var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
        res.redirect(url);
        return;
    }
    User.getUsersByQuery({'email': email}, {}, function (err, users) {
        if (err) {
            return next(err);
        }
        if (users.length > 0) {
            errorcode = 206;
            var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
            res.redirect(url);
            return;
        }
        pwd = md5(pwd);
        Region.getRegionByCode(region_code, function (err, region) {
            School.getSchoolById(school_id, function (err, school) {
                if (err) {
                    errorcode = 209;
                    var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
                    res.redirect(url);
                    return;
                }
                College.getCollegeById(college_id, function (err, college) {
                    if (err) {
                        errorcode = 209;
                        var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
                        res.redirect(url);
                        return;
                    }
                    var location = {
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
                    User.newAndSave(name, sex, pwd, email, location, function (err, user) {
                        if (err) {
                            if (err) {
                                errorcode = 209;
                                var url = "/signup?errorcode=" + errorcode + "&name=" + name + "&email=" + email + "&school_id=" + school_id + "&college_id=" + college_id + "";
                                res.redirect(url);
                                return;
                            }
                        }
                        ;
                        region.student_count++;
                        region.save();
                        school.student_count++;
                        school.save();
                        college.student_count++;
                        college.save();
                        req.session.destroy();
                        res.clearCookie(config.auth_cookie_name, { path: '/' });
                        gen_session(user, res);
                        res.redirect('/');
                    });
                })
            });
        });
    });
};

exports.initadmin = function (req, res) {
    var location = {
        region_code: '',
        school_id: null,
        school_name: '',
        school_short_name: '',
        college_id: null,
        college_name: '',
        grade: '',
        belong_group: ''
    };
    User.newAndSave("admin", 'boy', md5("QHQ19891216"), 'admin@admin.com', location, function (err, user) {
        req.session.destroy();
        res.clearCookie(config.auth_cookie_name, { path: '/' });
        gen_session(user, res);
        res.redirect('/back/signin');
    });
};


/**
 * Show user login page.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 */
exports.showLogin = function (req, res) {
    var errorcode = req.query.errorcode;
    var errormsg = getErrorMsg(errorcode);
    req.session._loginReferer = req.headers.referer;
    res.render('front/sign/signin', {
        errormsg: errormsg
    });
};

/**
 * define some page when login just jump to the home page
 * @type {Array}
 */
var notJump = [
    '/active_account', //active page
    '/reset_pass',     //reset password page, avoid to reset twice
    '/signup',         //regist page
    '/search_pass'    //serch pass page
];

/**
 * Handle user login.
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.login = function (req, res, next) {
    var email = sanitize(req.body.email).trim().toLowerCase();
    var pass = sanitize(req.body.pwd).trim();

    if (!email || !pass) {
        var errorcode = 201;
        var url = "/signin?errorcode=" + errorcode + "";
        res.redirect(url);
        return;
    }
    try {
        check(email, '不正确的电子邮箱。').isEmail();
    } catch (e) {
        var errorcode = 205;
        var url = "/signin?errorcode=" + errorcode + "";
        res.redirect(url);
        return;
    }
    User.getUserByEmail(email, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            var errorcode = 207;
            var url = "/signin?errorcode=" + errorcode + "";
            res.redirect(url);
            return;
        }
        pass = md5(pass);
        if (pass !== user.pass) {
            var errorcode = 208;
            var url = "/signin?errorcode=" + errorcode + "";
            res.redirect(url);
            return;
        }
        // store session cookie
        gen_session(user, res);
        //check at some page just jump to home page
        var refer = req.session._loginReferer || 'home';
        for (var i = 0, len = notJump.length; i !== len; ++i) {
            if (refer.indexOf(notJump[i]) >= 0) {
                refer = 'home';
                break;
            }
        }
        res.redirect("/");
    });
};

exports.show_admin_login = function (req, res, next) {
    var msg = req.query.msg;
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    res.render('back/user/signin', {
        msg: msg
    });
};

exports.admin_login = function (req, res, next) {
    var email = sanitize(req.body.email).trim().toLowerCase();
    var pass = sanitize(req.body.pass).trim();
    var url = "/back/signin?msg=fail";
    if (!email || !pass) {
        res.redirect(url);
        return;
    }
    User.getUserByEmail(email, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.redirect(url);
            return;
        }
        pass = md5(pass);
        if (pass !== user.pass) {
            res.redirect(url);
            return;
        }
        gen_session(user, res);
        if (user.is_admin || user.email == 'admin@admin.com') {
            return   res.redirect("/back/statistic");
        }
        res.redirect(url);
    });
};


// sign out
exports.signout = function (req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    res.clearCookie("en_name", { path: '/' });
    res.clearCookie("wgateid", { path: '/' });
    res.clearCookie("school_id", { path: '/' });
    res.clearCookie("school_short_name", { path: '/' });
    res.redirect("/signin");
};

exports.active_account = function (req, res, next) {
    var key = req.query.key;
    var name = req.query.name;

    User.getUserByName(name, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user || md5(user.email + config.session_secret) !== key) {
            return res.render('notify/notify', {error: '信息有误，帐号无法被激活。'});
        }
        if (user.active) {
            return res.render('notify/notify', {error: '帐号已经是激活状态。'});
        }
        user.active = true;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.render('notify/notify', {success: '帐号已被激活，请登录'});
        });
    });
};

exports.showSearchPass = function (req, res) {
    res.render('sign/search_pass');
};

exports.updateSearchPass = function (req, res, next) {
    var email = req.body.email;
    email = email.toLowerCase();

    try {
        check(email, '不正确的电子邮箱。').isEmail();
    } catch (e) {
        res.render('sign/search_pass', {error: e.message, email: email});
        return;
    }

    // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
    var retrieveKey = randomString(15);
    var retrieveTime = new Date().getTime();
    User.getUserByMail(email, function (err, user) {
        if (!user) {
            res.render('sign/search_pass', {error: '没有这个电子邮箱。', email: email});
            return;
        }
        user.retrieve_key = retrieveKey;
        user.retrieve_time = retrieveTime;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            // 发送重置密码邮件
            mail.sendResetPassMail(email, retrieveKey, user.name);
            res.render('notify/notify', {success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'});
        });
    });
};

/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 * @param  {http.req}   req
 * @param  {http.res}   res
 * @param  {Function} next
 */
exports.reset_pass = function (req, res, next) {
    var key = req.query.key;
    var name = req.query.name;
    User.getUserByQuery(name, key, function (err, user) {
        if (!user) {
            return res.render('notify/notify', {error: '信息有误，密码无法重置。'});
        }
        var now = new Date().getTime();
        var oneDay = 1000 * 60 * 60 * 24;
        if (!user.retrieve_time || now - user.retrieve_time > oneDay) {
            return res.render('notify/notify', {error: '该链接已过期，请重新申请。'});
        }
        return res.render('sign/reset', {name: name, key: key});
    });
};

exports.update_pass = function (req, res, next) {
    var psw = req.body.psw || '';
    var repsw = req.body.repsw || '';
    var key = req.body.key || '';
    var name = req.body.name || '';
    if (psw !== repsw) {
        return res.render('sign/reset', {name: name, key: key, error: '两次密码输入不一致。'});
    }
    User.getUserByQuery(name, key, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('notify/notify', {error: '错误的激活链接'});
        }
        user.pass = md5(psw);
        user.retrieve_key = null;
        user.retrieve_time = null;
        user.active = true; // 用户激活
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            return res.render('notify/notify', {success: '你的密码已重置。'});
        });
    });
};

function getAvatarURL(user) {
    if (user.avatar_url) {
        return user.avatar_url;
    }
    var avatar_url = user.profile_image_url || user.avatar;
    if (!avatar_url) {
        avatar_url = config.site_static_host + '/public/images/user_icon&48.png';
    }
    return avatar_url;
}


// auth_user middleware
exports.auth_user = function (req, res, next) {
    var wgateid = req.query.wgateid;
    var en_name = req.query.en_name;
    var timespan=0;
    ///如果是来自资源文件就不用去走这个路径啦
    if(req.path.indexOf("/public")!=-1){
        return next();
    }
    ///每一次请求都更新一下他上次请求的时间
    if(req.session.user){
        timespan=Math.abs(req.session.user.last_request-(new Date().getMinutes()));
        req.session.user.last_request = new Date().getMinutes();

    }
   //或者是这个用户有回话，同时他距上次请求有3分钟或者他直接来自个人中心的，这样就更新他的未读消息
    if (req.session.user) {
        //如果这个用户有session，但是没有wgateid，这样就需要进行对wgateid进行设置啦
        console.log("设置了")
        console.log(req.path);
         if((!req.session.user.wgateid)&&wgateid){
             User.getUserById(req.session.user._id, function (err, user) {
                 if (err) {
                     console.log(err);
                     return next(err);
                 }
                 if (user) {
                     if ((!user.wgateid) && wgateid) {
                         user.wgateid = wgateid;
                         user.save();
                         req.session.user = user;
                     }
                     if (!user.location.school_en_name) {
                         School.getSchoolCacheById(user.location.school_id, function (err, school) {
                             if (school) {
                                 user.location.school_en_name = school.en_name;
                                 user.save();
                                 req.session.user = user;
                                 req.session.user.last_request = new Date().getMinutes();
                                 update_status(req, res, next);
                             }
                         });
                     }
                     update_status(req, res, next);
                 } else {
                     update_status(req, res, next);
                 }
             });
         }else {
             update_status(req, res, next);
         }
    } else if (!req.session.user) {
        console.log(req.path);
        if (wgateid) {
            User.getUserByWgateid(req.query.wgateid, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (user) {
                   // user.last_request = new Date().getMinutes();
                    req.session.user = user;
                    update_status(req, res, next);
                } else {
                    if (wgateid) {
                        res.cookie("wgateid", wgateid, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 300}); //cookie 有效期300天
                    }
                    if (en_name) {
                        School.getSchoolCacheByEname(en_name, function (err, school) {
                            if (err || !(school)) {
                                return next();
                            } else {
                                res.cookie("en_name", en_name, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 300}); //cookie 有效期300天
                                res.cookie("school_id", school._id, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 300}); //cookie 有效期300天
                                res.cookie("school_short_name", school.cn_short_name, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 300}); //cookie 有效期300天
                                req.cookies.wgateid=wgateid;
                                req.cookies.school_id= school._id;
                                req.cookies.en_name= en_name;
                                req.cookies.school_short_name= school.cn_short_name;
                                return next();
                            }
                        })
                    } else {
                        return next();
                    }
                }
            });
        } else {
            var cookie = req.cookies[config.auth_cookie_name];
            if (!cookie) {
                return next();
            }
            var auth_token = decrypt(cookie, config.session_secret);
            var auth = auth_token.split('\t');
            var user_id = auth[0];
            User.getUserById(user_id, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (user) {
                    if ((!user.wgateid) && wgateid) {

                        user.wgateid = wgateid;
                        user.save();
                    }
                    req.session.user = user;
                    if (!user.location.school_en_name) {
                        School.getSchoolCacheById(user.location.school_id, function (err, school) {
                            if (school) {
                                user.location.school_en_name = school.en_name;
                                user.save();
                            }
                        });
                    }
                    update_status(req, res, next);
                } else {
                    return next();
                }
            });
        }
    } else {
        res.locals.current_user = req.session.user;
        return next();
    }
};

// private
function gen_session(user, res) {
    if (user) {
        var auth_token = encrypt(user._id + '\t' + user.wgateid + '\t' + user.name + '\t' + user.pass + '\t' + user.email, config.session_secret);
        res.cookie(config.auth_cookie_name, auth_token, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 300}); //cookie 有效期300天
    }
}

exports.gen_session = gen_session;

//直接读取数据库中的表
//1.我的秘密
//2.我的表白
//2.我的收藏
//2.我赞的祝福的

//需要统计的有
//1.评论我的我没有读的
//2.赞我的没有读取的
//2.私信我的
//2.需要我来传情的
// private
function update_status(req, res, next) {
    var proxy = EventProxy.create('post_liked_not_read_count', 'post_replied_not_read_count', 'private_message_not_read_count',
        function (post_liked_not_read_count, post_replied_not_read_count, private_message_not_read_count) {
            if (req.session.user.email == "admin@admin.com") {
                req.session.user.is_admin = true;
            }
            req.session.user.last_request = new Date().getMinutes();
            req.session.user.post_liked_not_read_count = post_liked_not_read_count;
            req.session.user.post_replied_not_read_count = post_replied_not_read_count;
            req.session.user.private_message_not_read_count = private_message_not_read_count;
            req.session.user.all_message_not_read_count = private_message_not_read_count + post_replied_not_read_count + post_liked_not_read_count;
            res.locals.current_user = req.session.user;
            return next();
        });
    proxy.fail(next);
    PostLike.getNotReadCount(req.session.user._id, proxy.done("post_liked_not_read_count"));
    PostReply.getNotReadCount(req.session.user._id, proxy.done("post_replied_not_read_count"));
    Message.getNotReadCount(req.session.user._id, proxy.done("private_message_not_read_count"));
}


exports.update_status = update_status;


exports.user_setting_show = function (req, res, next) {
    var en_name = req.cookies["en_name"];
    var wgateid = req.cookies["wgateid"];
    if(!wgateid){
      return  res.redirect("/signin");
    }
    if (!en_name) {
        School.getAllSchools(function (err, schools) {
            res.render('front/partial/user_setting', {schools: schools, en_name: "", wgateid: wgateid});
        });
    } else {
        res.render('front/partial/user_setting', {en_name: en_name, wgateid: wgateid});
    }
};

exports.user_setting_save = function (req, res, next) {
    var user_name = req.body.user_name;
    var user_sex = req.body.user_sex;
    console.log("sex--"+user_sex);
    var school_en_name = req.body.school_en_name;
    var wgateid = req.body.wgateid;
    if (!(user_name && user_sex && wgateid)) {
        return  res.json({ success: false });
    } else {
        School.getSchoolByEname(school_en_name, function (err, school) {
			if(school){
            Region.getRegionByCode(school.region_code, function (err, region) {
                if (err) {
                    return  res.json({ success: false });
                }
                var location = {
                    region_code: school.region_code,
                    school_id: school._id,
                    school_name: school.cn_name,
                    school_short_name: school.cn_short_name,
                    school_en_name: school.en_name,
                    college_id: null,
                    college_name: '',
                    grade: '',
                    belong_group: school.belong_group
                };
                User.newAndSave(wgateid, user_name, user_sex, md5("QHQ19891216"), wgateid + '@admin.com', location, function (err, user) {
                    region.student_count++;
                    region.save();
                    school.student_count++;
                    school.save();
                    req.session.destroy();
                    res.clearCookie(config.auth_cookie_name, { path: '/' });
                    gen_session(user, res);
                    return  res.json({ success: true });
                });
            });
			}else{
				 return  res.json({ success: false });
			}
        })
    }
};

function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

function decrypt(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}

function randomString(size) {
    size = size || 6;
    var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var max_num = code_string.length + 1;
    var new_pass = '';
    while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        size--;
    }
    return new_pass;
}



