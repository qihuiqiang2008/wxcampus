var sanitize = require('validator').sanitize;
var School = require('../proxy').School;
var College = require('../proxy').College;
var Region = require('../proxy').Region;
var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.show_create = function (req, res, next) {
    var query={};
    var school_id=req.query.school_id;
    if(req.session.user.email!=='admin@admin.com')
    {
        query ={'belong_group':req.session.user.location.belong_group};
    }
    School.getSchoolsByQuery(query,{},function(err,schools){
        res.render('back/college/create',{schools:schools,select_school:school_id});
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
    School.getSchoolById(school_id,function(err,school){
        College.getCollegesBySchool(school_id ,function(err,colleges){
            return  res.render('back/college/colleges',{colleges:colleges,school:school});
        })
    });

}


exports.colleges_json = function (req, res, next) {
    var school_id=req.query.school_id;
    College.getCollegesBySchool(school_id ,function(err,colleges){
        return  res.json(colleges);
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

