var Group = require('../proxy').Group;
var School = require('../proxy').School;
var Post = require('../proxy').Post;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');



exports.groups = function (req, res, next) {
    Group.getAllGroups(function(err,groups){
        res.render('back/group/groups',{groups:groups});
    })
}

exports.show_create = function (req, res, next) {
    var query={};
    if(req.session.user.email!=='admin@admin.com')
    {
        query ={'belong_group':req.session.user.location.belong_group};
    }
    School.getSchoolsByQuery(query,{},function(err,schools){
        res.render('back/edit/index',{schools:schools});
    });
}

exports.create = function (req, res, next) {
    var  type = req.body.type;
    var  school_id= req.body.school_id;
    var  random= req.body.random;
    School.getSchoolById(school_id,function(err,school){
         school.last_edit_at=new Date();
         school.save(function(){
              var  sort=[[ 'create_at', 'desc' ]];
             var options = { sort:sort};
              Post.getPostsByQuery({'type': type,'from_user.school_id':school_id,create_at:{$lt:school.last_edit_at}}, options, function (err, posts_school) {
                   query={};
                     if(req.session.user.email!=='admin@admin.com')
                     {
                         query ={'belong_group':req.session.user.location.belong_group};
                     }
                     School.getSchoolsByQuery(query,{},function(err,schools){
                         res.render('back/edit/index',{schools:schools,posts_school:posts_school});
                     });

              })
          });
    })
}
