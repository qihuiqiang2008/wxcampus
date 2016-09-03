var sanitize = require('validator').sanitize;
var School = require('../proxy').School;
var College = require('../proxy').College;
var Region = require('../proxy').Region;
var Post = require('../proxy').Post;
var PostReply = require('../proxy').PostReply;
var User = require('../proxy').User;
var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.show = function (req, res, next) {
    var schools={};
    var proxy = EventProxy.create('yestoday_secret_count', 'yestoday_confess_count', 'yestoday_reply_count','yestoday_user_count','schools','yestoday_secrets_count_byschool','yestoday_confesses_count_byschool','yestoday_replies_count_byschool','yestoday_users_count_byschool',
        function (yestoday_secret_count, yestoday_confess_count,yestoday_reply_count,yestoday_user_count,schools,yestoday_secrets_count_byschool,yestoday_confesses_count_byschool,yestoday_replies_count_byschool,yestoday_users_count_byschool) {

            res.render('back/statistic/index', {
                yestoday_secret_count: yestoday_secret_count,
                yestoday_confess_count: yestoday_confess_count,
                yestoday_reply_count: yestoday_reply_count,
                yestoday_user_count: yestoday_user_count,
                schools:schools,
                yestoday_secrets_count_byschool:yestoday_secrets_count_byschool,
                yestoday_confesses_count_byschool:yestoday_confesses_count_byschool,
                yestoday_replies_count_byschool:yestoday_replies_count_byschool,
                yestoday_users_count_byschool:yestoday_users_count_byschool
            });
        });
    proxy.fail(next);
    Post.getYestodayPostCountByGroup("secret",req.session.user.location.belong_group,proxy.done("yestoday_secret_count"));
    Post.getYestodayPostCountByGroup("confess",req.session.user.location.belong_group,proxy.done("yestoday_confess_count"));
    PostReply.getYestodayReplyCountByGroup(req.session.user.location.belong_group,proxy.done("yestoday_reply_count"));
    User.getYestodayUserCountByGroup(req.session.user.location.belong_group,proxy.done("yestoday_user_count"));
    School.getSchoolsByQuery({'belong_group':req.session.user.location.belong_group},{},function(err,schools){
        proxy.emit('schools',schools);
        proxy.after('yestoday_secret_count_byschool',schools.length, function (yestoday_secrets_count_byschool) {
            console.log(yestoday_secrets_count_byschool);
            proxy.emit('yestoday_secrets_count_byschool',yestoday_secrets_count_byschool);

        });
        proxy.after('yestoday_confess_count_byschool',schools.length, function (yestoday_confesses_count_byschool) {
            proxy.emit('yestoday_confesses_count_byschool',yestoday_confesses_count_byschool);

        });
        proxy.after('yestoday_reply_count_byschool',schools.length, function (yestoday_replies_count_byschool) {
            proxy.emit('yestoday_replies_count_byschool',yestoday_replies_count_byschool);
        });
        proxy.after('yestoday_user_count_byschool',schools.length, function (yestoday_user_count_byschool) {
            proxy.emit('yestoday_users_count_byschool',yestoday_user_count_byschool);

        });
        schools.forEach(function(school,index){
            Post.getYestodayPostCountBySchool("secret",school._id,function(err,count){
                proxy.emit("yestoday_secret_count_byschool",count);
            });
            Post.getYestodayPostCountBySchool("confess",school._id,function(err,count){
                proxy.emit("yestoday_confess_count_byschool",count);
            });
            PostReply.getYestodayReplyCountBySchool(school._id,function(err,count){
                proxy.emit("yestoday_reply_count_byschool",count);
            });
            User.getYestodayUserCountBySchool(school._id,function(err,count){
                proxy.emit("yestoday_user_count_byschool",count);
            });
        });

    });


};
exports.del = function (req, res, next) {
    var school_id=req.query.school_id;
    var college_id=req.query.college_id;
    College.removeById(college_id ,function(err,regions){
        return  res.redirect("/back/colleges?school_id="+school_id);
    })
}

exports.colleges = function (req, res, next) {
    var school_id=req.query.school_id;
    College.getCollegesBySchool(school_id ,function(err,colleges){
      return  res.render('back/college/colleges',{colleges:colleges});
    })
}

exports.create = function (req, res, next) {
    var college_name = sanitize(req.body.college_name).trim();
    var school_id =req.body.school_id;
    var msg =
        (college_name === '')? '相关信息不能为空':'';
    if (msg){
        res.render('back/college/create', {msg: msg});
    }else{
           College.newAndSave(college_name,school_id,function(err, school) {
            if(err){
                return next(err);
            }
            return   res.redirect("/back/colleges?school_id="+school_id);
        });
    }
};

