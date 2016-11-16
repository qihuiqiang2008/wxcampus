var sanitize = require('validator').sanitize;
var School = require('../proxy').School;
var Post = require('../proxy').Post;
var SchoolEx = require('../proxy').SchoolEx;
var Region = require('../proxy').Region;
var config = require('../config').config;
var EventProxy = require('eventproxy');
var Resource = require('../proxy').Resource;
var async = require("async");


exports.show_create = function (req, res, next) {

    Region.getRegionByQuery({},{},function(err,regions){
        res.render('back/school/create',{regions:regions});
    })
};

exports.account_show = function (req, res, next) {
    School.getSchoolById(req.query.id,function(err,school){
        res.render('back/school/account',{school:school});
    });
};

exports.account_update = function (req, res, next) {
    var school_id = req.body.school_id;
    var account=req.body.account;
    if(account)
    {
        account=account.trim();
    }
    School.getSchoolById(school_id,function (err, school) {
        if (err) {
            res.render('back/school/account', {msg:'出现未知错误'});
        }
        school.wx_account_url=account;
        school.save();
        res.redirect("/back/schools");
    });

}

exports.del = function (req, res, next) {
    School.removeByEnname(req.query.en_name ,function(err,regions){
        SchoolEx.removeByEnname(req.query.en_name ,function(err,regions){
            return  res.redirect("/back/schools");
        })
    })
}

exports.board_update = function (req, res, next) {
    var type = req.body.type||"text";
    var content =req.body.content;
    if(content)
    {
        content=content.trim();
    }
    var school_id = req.body.school_id;
    var display =req.body.display;
    var  board={type:type,content:content,display:(display=='true'?true:false)};
    School.updateBoardById(school_id,board,function (err){
        if (err) {
            console.log(err);
            return  res.render('back/school/board', {msg:'出现未知错误'});
        }
        return   res.redirect("/back/schools");
    });
}

exports.board_show = function (req, res, next) {
    School.getSchoolById(req.query.id,function(err,school){
        res.render('back/school/board',{school:school});
    });
}


exports.serverDo = function (req, res, next) {
    if(req.query.stop){
        process.exit();
    }else
    {
        return res.json({status:1});
    }
}

/*
exports.mschools = function (req, res, next) {

    var region_code = req.query.region_code;
    var tag = req.query.tag;
    var admin= req.params.admin;
   // console.log(region_code);
    var query={};
    var ip="http://115.29.47.93";
    var port="1111";
    if(admin=="qi"){
        port="5555";
        admin="齐"
    }
    if(admin=="wang"){
        port="2222";
        admin="汪"
    }
    if(admin=="he"){
        port="3333";
        admin="贺"
    }
    if(admin=="ma"){
        port="4444";
        admin="马"
    }
    if(admin=="yi"){
        port="4444";
        admin="弋"
    }
    if(admin){
       query = {admin: admin};
        if(admin=="汪"||admin=="齐"||admin=="弋"){
            port="80";
        }else{
            port="80";
        }
    }
    if(region_code){
        query = {region_code: region_code};
    }
    if(tag){
        if(tag=="1"){
            query = {active: true};
        }else {
            query = {active: false};
        }
    }

    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 100;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'wxacount', 'desc' ]
    ] };
    var view='back/school/mschool';

    var proxy = EventProxy.create('schools', 'pages','regions',
        function (schools, pages,regions) {
            schools.forEach(function (post, i) {
              console.log( "schoolnameMap."+post.cn_name+"="+"\""+post.en_name+"\"")
            });

            schools.forEach(function (post, i) {
                console.log( "regionnameMap."+post.cn_name+"="+"\""+post.region_code+"\"")
            });
            res.render(view,{
                port:port,
                schools: schools,
                pages: pages,
                current_page: page,
                ip:ip,
                regions:regions
            });
        });


    proxy.fail(next);
    School.getSchoolsByQuery(query, options, proxy.done("schools"));
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));

    Region.getRegionByQuery({},{}, proxy.done("regions"))
};
*/




exports.mschools = function (req, res, next) {

    var region_code = req.query.region_code;
    var tag = req.query.tag;
    var admin= req.params.admin;
    // console.log(region_code);
    var query={};
    var ip="http://115.29.47.93";
    var port="1111";
    if(admin=="qi"){
        port="5555";
        admin="齐"
    }
    if(admin=="wang"){
        port="2222";
        admin="汪"
    }
    if(admin=="he"){
        port="3333";
        admin="贺"
    }
    if(admin=="ma"){
        port="4444";
        admin="马"
    }
    if(admin=="yi"){
        port="4444";
        admin="弋"
    }
    if(admin){
        query = {admin: admin};
        if(admin=="汪"||admin=="齐"||admin=="弋"){
            port="80";
        }else{
            port="80";
        }
    }
    if(region_code){
        query = {region_code: region_code};
    }
    if(tag){
        if(tag=="1"){
            query = {active: true};
        }else {
            query = {active: false};
        }
    }

    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 100;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'wxacount', 'desc' ]
    ] };
    var view='back/school/mschool';


    var last="";


    var all="";

/*
    schoolnameMap.北化微生活="buct_welife|zgyfjch2013|北林微生活"
*/

    var proxy = EventProxy.create('schools', 'pages','regions',
        function (schools, pages,regions) {
           // schools.forEach(function (school, i) {

             /*   if(last!=""){
                    console.log("schoolnameMap."+last.wx_account_name+"='"+last.wx_account_id+"|"+last.wx_account_password+"|"+school.wx_account_name+"'")
                }else{
                    console.log("schoolnameMap."+school.wx_account_name+"='"+school.wx_account_id+"|"+school.wx_account_password+"|"+school.wx_account_name+",")
                }
                last=school*/



                //last=school.wx_account_name
                    //schoolnameMap.北化微生活

              //  console.log( "schoolnameMap."+school.cn_name+"="+"\""+school.en_name+"\"")
          //  });
          //  console.log("schoolnameMap."+last.wx_account_name+"='"+last.wx_account_id+"|"+last.wx_account_password+"|"+last.wx_account_name+"'")
           /* schools.forEach(function (post, i) {
                console.log( "regionnameMap."+post.cn_name+"="+"\""+post.region_code+"\"")
            });*/
            res.render(view,{
                port:port,
                schools: schools,
                pages: pages,
                current_page: page,
                ip:ip,
                regions:regions
            });
        });


    proxy.fail(next);
    SchoolEx.getSchoolsByQuery(query, options, proxy.done("schools"));
    SchoolEx.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));

    Region.getRegionByQuery({},{}, proxy.done("regions"))
};




exports.schools = function (req, res, next) {
    var region_code = req.query.region_code;
    var tag = req.query.tag;
    var admin=req.query.admin;
    var t=req.query.m;
    // console.log(region_code);
    var query={};
//    if(!region_code){
//        if(req.session.user.email!=='admin@admin.com')
//        {
//            query ={'belong_group':req.session.user.location.belong_group};
//        }
//        //query={};
//    }else
//    {
//        if(req.session.user.email!=='admin@admin.com')
//        {
//        query ={'belong_group':req.session.user.location.belong_group,region_code: region_code};
//        }else {
//            query = {region_code: region_code}
//        }
//    }
    if(admin){
        query = {admin: admin};
    }
    if(region_code){
        query = {region_code: region_code};
    }
    if(tag){
        if(tag=="1"){
            query = {active: true};
        }else{
            query = {active: false};
        }


    }

    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 200;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'create_at', 'desc' ]
    ] };
    var view='back/school/schools';
    if(t){
        view='back/school/mschool';
    }
    var proxy = EventProxy.create('schools', 'pages','TodayResourceCount','regions',
        function (schools, pages,TodayResourceCount,regions) {
            schools.forEach(function (post, i) {
                console.log( "schoolnameMap."+post.cn_name+"="+"\""+post.en_name+"\"")
            });

            schools.forEach(function (post, i) {
                console.log( "regionnameMap."+post.cn_name+"="+"\""+post.region_code+"\"")
            });
            res.render(view,{
                schools: schools,
                pages: pages,
                current_page: page,
                TodayResourceCount:TodayResourceCount,
                belong_group:req.session.user.location.belong_group,
                regions:regions
            });
        });


    proxy.fail(next);
    School.getSchoolsByQuery(query, options, proxy.done("schools"));
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
    if(req.session.user.email!=='admin@admin.com')
    {
        query ={};
    }
    Region.getRegionByQuery({},{}, proxy.done("regions"))
    Resource.getTodayResourceCount(req.session.user.location.belong_group,{"$gte": new Date((new Date()).getFullYear(),(new Date()).getMonth(), (new Date()).getDate())}, proxy.done("TodayResourceCount"));
};

exports.schools_json = function (req, res, next) {
    var region_code = req.query.region_code || "";
    var query = {region_code: region_code};
    if(!region_code){
        query={};
    }

    var options = { sort: [
        [ 'create_at', 'desc' ]
    ] };

    School.getSchoolsByQuery(query, options, function(err,schools){
        return res.json(schools);
    });
};

exports.schoolExs_json = function (req, res, next) {
    var region_code = req.query.region_code || "";
    var query = {region_code: region_code};
    if(!region_code){
        query={};
    }

    var options = { sort: [
        [ 'create_at', 'desc' ]
    ] };

    SchoolEx.getSchoolExsByQuery(query, options, function(err,schools){
        return res.json(schools);
    });
};

/*_id:{type: ObjectId },
cn_name:{ type: String },
cn_short_name:{type: String },
wx_account_name: {type: String },
wx_account_password: {type: String },
appmsgid: {type: String },
secret_title: {type: String },
secret_content: {type: String },
confess_title: {type: String },
confess_content: {type: String },
region_code: { type: String },
belong_group:{type: Number, default: 0},*/

exports.create = function (req, res, next) {
    var cn_name = sanitize(req.body.cn_name).trim();
    var en_name = sanitize(req.body.en_name).trim();
    var region_code = sanitize(req.body.region_code).trim();
    var cn_short_name = sanitize(req.body.cn_short_name).trim();
    var wx_account_url = sanitize(req.body.wx_account_url).trim();
    var wx_account_name = sanitize(req.body.wx_account_name).trim();
    var wx_account_id = sanitize(req.body.wx_account_id).trim();
    var wx_account_password = sanitize(req.body.wx_account_password).trim();
    var appmsgid=req.body.appmsgid;
    var msg = (cn_name === '' ||en_name==''||region_code==''||cn_short_name==''||wx_account_url==''||wx_account_name=='')? '相关信息不能为空':'';
    if (msg) {
        res.render('back/school/create', {msg: msg});
    } else {
        Region.getRegionByCode(region_code,function(err,region){
            School.newAndSave(cn_name,en_name,cn_short_name,region_code,wx_account_url,wx_account_name,wx_account_id,region.belong_group,function (err, school) {
                if (err) {
                    return next(err);
                }
                SchoolEx.newAndSave(school._id, cn_name,en_name,cn_short_name, wx_account_name,wx_account_id,wx_account_password,appmsgid,region_code,region.belong_group,function(err){
                    if (err) {
                        return next(err);
                    }
                    res.redirect("/back/schools");
                })
            });
        })
    }
};

exports.source_edit_show = function (req, res, next) {
    var en_name = req.query.en_name;
    var statusCode=req.query.statusCode;
    SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
        if(schoolEx){
            res.render('back/school/source_edit', {schoolEx: schoolEx,statusCode:statusCode});
        }else{
            statusCode=201;
            res.render('back/school/source_edit', {statusCode:statusCode});
        }
    })
};

exports.erweima_show = function (req, res, next) {
    var en_name = req.query.en_name;
    SchoolEx.getSchoolByEname(en_name,function(err,school){
      console.log(school.erweima)
        res.render('back/school/erweima',{school:school});
    });
};


exports.erweima_update = function (req, res, next) {
    var en_name = req.body.en_name;
    var erweima = req.body.erweima;
    console.log(en_name);
    console.log(erweima);
    SchoolEx.getSchoolByEname(en_name,function(err,school){
        if (err) {
            res.render('back/school/erweima', {msg:'出现未知错误'});
        }
        school.erweima=erweima;
        school.save();
        res.redirect("/back/schools");
    });

};




exports.cookie_show = function (req, res, next) {
    var en_name = req.query.en_name;
    SchoolEx.getSchoolByEname(en_name,function(err,school){
        console.log(school)
        res.render('back/school/cookie',{school:school});
    });
};

exports.back_price = function (req, res, next) {

    var region_code = req.query.region_code;
    var tag = req.query.tag;
    var admin= req.params.admin;
    var query={};

    if(tag){
        if(tag=="1"){
            query = {active: true};
        }else {
            query = {active: false};
        }
    }


    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 200;
    var options = { skip: (page - 1) * limit, limit: limit, sort: [
        [ 'region_code', 'desc' ]
    ] };
    var view='back/school/mschool';

    var proxy = EventProxy.create('schools', 'pages','regions',
        function (schools, pages,regions) {
            res.render('back/school/priceschool',{
                schools: schools,
                pages: pages,
                current_page: page,
                regions:regions
            });
        });

    proxy.fail(next);
    School.getSchoolsByQuery(query, options, proxy.done("schools"));
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));

    Region.getRegionByQuery({},{}, proxy.done("regions"))



   // res.render('back/school/priceschool');
 /*   var en_name = req.query.en_name;
    SchoolEx.getSchoolByEname(en_name,function(err,school){
        console.log(school)
        res.render('back/school/cookie',{school:school});
    });*/
};

exports.cookie_update_chrome = function (req, res, next) {
    var en_name = req.body.en_name;
    var cookie = req.body.cookie;
    var token = req.body.token;
    var admin = req.body.admin;
    var mail = req.body.mail;
    var wxacount = req.body.wxacount;
    var chrome=req.body.chrome;
    var count=req.body.count;

    console.log(en_name)
    console.log(cookie)
    console.log()

    SchoolEx.getSchoolBywxId(en_name,function(err,school){
        School.getSchoolBywxId(en_name,function(err,sch){
            if (err) {
                res.render('back/school/cookie', {msg:'出现未知错误'});
            }
            school.cookie=cookie;
            school.token=token;
            school.fans=count;
            sch.cookie=cookie;
            sch.token=token;
            sch.fans=count;
            if(mail){
                school.mail=mail;

            }
            if(admin){
                school.admin=admin;
                sch.admin=admin;
            }
            if(wxacount){
                school.wxacount=wxacount;
                sch.wxacount=wxacount;

            }
            school.save();
            sch.save();
            if(chrome){
                res.send("true");
            }
            else{
                res.redirect("/back/schools");
            }
        });
    });


};

exports.cookie_update = function (req, res, next) {
    var en_name = req.body.en_name;
    var cookie = req.body.cookie;
    var token = req.body.token;
    var admin = req.body.admin;
    var mail = req.body.mail;
    var wxacount = req.body.wxacount;
    var chrome=req.body.chrome;

    console.log("........."+cookie)

           SchoolEx.getSchoolByEname(en_name,function(err,school){
               School.getSchoolByEname(en_name,function(err,sch){
                   if (err) {
                       res.render('back/school/cookie', {msg:'出现未知错误'});
                   }
                   school.cookie=cookie;
                   school.token=token;
                   sch.cookie=cookie;
                   sch.token=token;
                   if(mail){
                       school.mail=mail;

                   }
                   if(admin){
                       school.admin=admin;
                       sch.admin=admin;
                   }
                   if(wxacount){
                       school.wxacount=wxacount;
                       sch.wxacount=wxacount;

                   }
                   school.save();
                   sch.save();
                   if(chrome){
                       res.send("true");
                   }
                   else{
                       res.redirect("/back/schools");
                   }
               });
           });




};





exports.title_edit_show = function (req, res, next){
    var school_id = req.query.school_id;
    var statusCode=req.query.statusCode;
    var type=req.query.t;
    var post_id=req.query.post_id;
    console.log(post_id);
    SchoolEx.getSchoolById(school_id,function(err,schoolEx){
        if(schoolEx){
            if(post_id){
               Post.getPostById(post_id,function(err,post) {
                if (type == "secret") {
                    schoolEx.secret_title = post.content;
                }else {
                    schoolEx.confess_title = post.content;
                }
                   res.render('back/school/title_edit', {schoolEx:schoolEx,statusCode:statusCode});
               });
            }else {
                res.render('back/school/title_edit', {schoolEx: schoolEx, statusCode: statusCode});
            }
         }
       else{
            statusCode=201;
            res.render('back/school/title_edit', {statusCode:statusCode});
        }
    })
};


exports.all_title_edit = function (req, res, next) {
    var type=req.query.type;
    SchoolEx.getSchoolExsByQueryAndField({},'_id confess_title photo_guess_title cn_name en_name secret_title',{},function (err,schools){
        console.log(schools)
        console.log(err);
        return  res.render('back/school/all_title_edit', {schools:schools,type:type});
    });
}



exports.all_title_updating = function (req, res, next) {
    var title_content =req.body.title_content;
    var title_content1 =req.body.title_content1;
    var title_content2 =req.body.title_content2;
    var title_content3 =req.body.title_content3;
    var title_content4 =req.body.title_content4;
    var title_content5 =req.body.title_content5;
    var title_content6 =req.body.title_content6;
    var title_content7 =req.body.title_content7;
    var title_content8 =req.body.title_content8;
    var arrayObj = new Array();
    arrayObj.push(title_content);
    arrayObj.push(title_content1)
    arrayObj.push(title_content2)
    arrayObj.push(title_content3)
    arrayObj.push(title_content4)
    arrayObj.push(title_content5)
    arrayObj.push(title_content6)
    arrayObj.push(title_content7)
    arrayObj.push(title_content8)

    console.log("..................")

    var type=req.body.type;
    var sort = [
        [ 'region_code', 'desc' ]
    ];
    var options = { sort: sort};
    if(type=="confess"){
        SchoolEx.getSchoolExsByQueryAndField({},'_id confess_title', options, function(err,schools){
            var i=0;
            async.eachSeries(schools, function (item, callreplace) {
                item.confess_title=arrayObj[i%5]
                item.save()
                i++;
                callreplace()

            }, function (err) {
                if (err) {
                    console.log('err while upload  pic!!!');
                }
                return  res.render('back/school/title_update', {msg:'设置成功',type:type});
            })
        });


      /*  SchoolEx.updateAllConfessTitle(title_content,function (err){
            if (err) {
                console.log(err);
                return  res.render('back/school/title_update', {msg:'出现未知错误',type:type});
            }
            return  res.render('back/school/title_update', {msg:'设置成功',type:type});
        });*/
    }else if(type=="shudong"){
        SchoolEx.getSchoolExsByQueryAndField({},'_id secret_title', options, function(err,schools){
            var i=0;
            async.eachSeries(schools, function (item, callreplace) {
                item.secret_title=arrayObj[i%8]
                item.save()
                i++;
                callreplace()

            }, function (err) {
                if (err) {
                    console.log('err while upload  pic!!!');
                }
                return  res.render('back/school/title_update', {msg:'设置成功',type:type});
            })
        });
       /* SchoolEx.updateAllSecretTitle(title_content,function (err){
            if (err) {
                console.log(err);
                return  res.render('back/school/title_update', {msg:'出现未知错误',type:type});
            }
            return  res.render('back/school/title_update', {msg:'设置成功',type:type});
        });*/

    }
    else{
        console.log(type);
        SchoolEx.updateAllPhoto_guessTitle(title_content,function (err){
            if (err) {
                console.log(err);
                return  res.render('back/school/title_update', {msg:'出现未知错误',type:type});
            }
            return  res.render('back/school/title_update', {msg:'设置成功',type:type});
        });

    }
}
exports.all_title_update = function (req, res, next) {
    var type=req.query.type;
    return  res.render('back/school/title_update',{type:type});

}



exports.update_all_title_by_school = function (req, res, next) {
    var en_name = req.body.school_en_name;
    var title = req.body.title;
    var type = req.body.type;
    console.log(en_name);
    console.log(title);
    console.log(type);
    SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
        if(schoolEx){
            if(type=="shudong") {
                schoolEx.secret_title = title;
            }
            if(type=="confess") {
                schoolEx.confess_title = title;
            }
            if(type=="ershou") {
                schoolEx.ershou_title= title;
            }
            if(type=="photo_guess") {
                schoolEx.photo_guess_title= title;
            }
            schoolEx.save();
            return   res.json({ success: true});
            // res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "保存成功"});
        }else{
            //  res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "不存在此学校"});
            return   res.json({ success: false});
        }
    })
};

exports.title_edit_save = function (req, res, next) {
    var en_name = req.body.en_name;
    var secret_title = req.body.secret_title;
    var confess_title = req.body.confess_title;
    SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
        if(schoolEx){
            if(secret_title&&(secret_title!=="undefined")) {
                schoolEx.secret_title = secret_title;
            }

            if(confess_title&&(confess_title!=="undefined")) {
                schoolEx.confess_title = confess_title;
            }
            schoolEx.save();
            res.redirect("/back/school/title_edit_show?school_id="+schoolEx._id+"&en_name="+schoolEx.en_name+"&statusCode=200");
            // res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "保存成功"});
        }else{
            //  res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "不存在此学校"});
            res.redirect("/back/school/title_edit_show?statusCode=201");
        }
    })
};


exports.source_show = function (req, res, next) {
    var id = req.query.id;
    SchoolEx.getSchoolById(id,function(err,schoolEx){
        if(schoolEx){
            res.render('back/school/source_show', {schoolEx: schoolEx});
        }else{
            res.render('back/school/source_show', {msg: "不存在此学校"});
        }
    })
};

exports.addTag = function (req, res, next) {
    var en_name = req.query.school;
    School.getSchoolByEname(en_name,function(err,schoolEx){
        if(schoolEx){

            schoolEx.active=true;
            schoolEx.save();
            res.send("true");
            // res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "保存成功"});
        }else{
            //  res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "不存在此学校"});
            res.send("false");
        }
    })
};


exports.tagreset = function (req, res, next) {


    SchoolEx.updateAlltag(false,function (err){
        if (err) {
            console.log(err);

        }else{
            res.redirect("/back/schools");
        }

    });


};


exports.update_source = function (req, res, next) {
    var templete="<fieldset style='border: 0px; margin: 0.5em 0px; padding: 0.3em;' class='tn-Powered-by-XIUMI'><section style='border: 1px solid rgb(192, 200, 209); box-shadow: rgb(170, 170, 170) 0px 0px 0.6em; font-size: 1em; line-height: 1.4; color: rgb(51, 51, 51);' class='tn-Powered-by-XIUMI'><section style='padding: 0.6em; background-color: rgb(250, 250, 239);' class='tn-Powered-by-XIUMI'><section class='tn-Powered-by-XIUMI' style='font-size: 1em; font-family: inherit; font-weight: inherit; text-align: inherit; text-decoration: inherit;'>###<br></section></section></section></fieldset>"
    var en_name= req.query.en_name;
    var update_last_edit= req.query.update_last_edit;
    var confess_result="";
    var secret_result="";
    School.getSchoolByEname(en_name,function(err,school){
        SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
            if(school&&schoolEx) {
                var sort = [
                    [ 'create_at', 'desc' ]
                ];
                var options = { sort: sort};
                console.log(school.last_edit_at);
                Post.getPostsByQuery({'from_user.school_id': school._id, create_at: {$gt: school.last_edit_at},'display':true}, options, function (err, posts) {
                    var secret_index=1;
                    var confess_index=1;
					  console.log(posts.length);
                    posts.forEach(function (post, i) {
                        if (post) {
                            if (post.type == "confess") {
                                confess_result += templete.replace(/###/g, "★表白:对"+post.confess_to.college_name+"的【"+post.confess_to.name+"】说"+post.content);
                           confess_index++;
							} else {
                                secret_result += templete.replace(/###/g,"★树洞:"+post.content);
								secret_index++;
                            }
                        }
                    });
                    schoolEx.secret_content =secret_result;
                    schoolEx.confess_content =confess_result;
                    schoolEx.save(function () {
                        if (update_last_edit=="true") {
                            school.last_edit_at=new Date();
                            school.save();
                            return  res.json({ success: true});
                        }else{
                            res.json({ success: true});
                        }
                    });
                })
            }else{
                return   res.json({ success: false});

            }
        });
    });
};


exports.source_edit_save = function (req, res, next) {
    var en_name = req.body.en_name;
    var secret_title = req.body.secret_title;
    var secret_content = req.body.secret_content;
    var confess_title = req.body.confess_title;
    var confess_content = req.body.confess_content;
    SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
        if(schoolEx){
            if(secret_title) {
                schoolEx.secret_title = secret_title;
            }
            if(secret_content){
            schoolEx.secret_content=secret_content;
            }
            if(confess_title) {
                schoolEx.confess_title = confess_title;
            }
            if(confess_content){
                schoolEx.confess_content=confess_content;
            }
            schoolEx.save();
            res.redirect("/back/school/source_edit_show?id="+schoolEx._id+"&en_name="+schoolEx.en_name+"&statusCode=200");
           // res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "保存成功"});
        }else{
          //  res.render('back/school/source_edit', {schoolEx:schoolEx,msg: "不存在此学校"});
            res.redirect("/back/school/source_edit_show?statusCode=201");
        }
    })
};
