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
var PostEx = require('../proxy').PostEx;
var PostReply = require('../proxy').PostReply;
var PostLike = require('../proxy').PostLike;
var PostFav = require('../proxy').PostFav;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var School = require('../proxy').School;
var College = require('../proxy').College;
var Message = require('../proxy').Message;
var FilterWord = require('../proxy').FilterWord;
var SchoolEx = require('../proxy').SchoolEx;
var Configuration = require('../proxy').Configuration;
var cache = require('../common/cache');
var config = require('../config');
var random = require('mongoose-random');
var request = require("request");
var crypto = require('crypto');
var formidable = require('formidable');

/**var random = require('mongoose-random');
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
///一般表单的显示
exports.get_postExing_page = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    var type = req.params.type;
    var temp = "front/postEx/create";
    if (type == "shudong") {
        temp = "front/shudong/create";
    }
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render(temp, {school: school, type: type});
    })
};


///一般表单的显示
exports.choose = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    var type = req.params.type;
    var temp = "front/postEx/choose";
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render(temp, {school: school, type: type});
    })
};

exports.show_create_news = function (req, res, next) {
    var from_school_en_name = req.params.en_school;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render('front/news/create', {school: school, type: "news"});
    })
};

///一般表单的显示
exports.get_postExing_news_page = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    var type = req.params.type;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render('front/postEx/create', {school: school, type: type});
    })
};

///话题表单的显示
exports.show_topic = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        Configuration.getConfigurationByCode("topic", function (err, configuration) {
            res.render('front/topic/create', {school: school, type: "topic", configuration: configuration});
        })
    })
};


///话题表单的显示
exports.show_hudong = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render('front/hudong/create', {school: school, type: "hudong"});

    })
};






///话题表单的显示
exports.create_topconfess = function (req, res, next) {
    var from_school_en_name = req.body.from_school_en_name;
    var from_school_cn_name = req.body.from_school_cn_name;
    var from_school_cn_short_name = req.body.from_school_cn_short_name;
    var wx_account = req.body.wx_account;
    var content = req.body.content;
    var topconfess = req.body.topconfess;
    var tradeId = req.body.tradeId;
    var photo_url = req.body.photo_url;

    if (photo_url) {
        var base64Data = photo_url.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dirctory = "./public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
        if (!fs.existsSync(dirctory)) {
            fs.mkdirSync(dirctory);
        }
        var oldpath = dirctory + "/" + guid() + ".jpg"
        fs.writeFile(oldpath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
                return  res.send(err);
            }
            PostEx.newAndSave(false, false, "topconfess", from_school_cn_name, from_school_en_name, "image", tradeId, topconfess, content, wx_account, "content3", "content4", "content5", "content6", function (err,post) {

                if (err) {
                    return res.render('create/topconfess/result', {
                        msg: "出现异常，请重试"
                    });
                }
                var photo_id = guid();
                photo_id = post._id;
                fs.rename(oldpath, dirctory + "/" + photo_id + ".jpg", function (err) {
                    if(err){
                       res.send("发生错误，请重试");
                    }else{
                        post.image = "/" + dirctory + "/" + photo_id + ".jpg";
                        post.save();
                        res.render('front/topconfess/result', {school: from_school_en_name,status:"提交成功"})
                    }
                });
                //res.render('front/topconfess/result', {school: from_school_en_name});
            });
            /*Photo_Guess.newAndSave(photo_url,"", "", "", cn_name, en_name, introduction, wx_account,0, region_code, "",false,source,"","","complain","","","","",function (err, photo_guess) {
                if (err) {
                    console.log(err);
                }
                var photo_guess_id = guid();
                photo_guess_id = photo_guess._id
                fs.rename(oldpath, dirctory + "/" + photo_guess_id + ".jpg", function (err) {
                    photo_guess.photo_url = "/" + dirctory + "/" + photo_guess_id + ".jpg";
                    photo_guess.save();
                    return   res.render("front/complain/result");
                });
            })*/
        })
    }else{
        res.render('front/topconfess/result', {school: from_school_en_name,status:"提交失败！"})
    }
    /*PostEx.newAndSave(false, false, "topconfess", from_school_cn_name, from_school_en_name, "image", tradeId, topconfess, content, wx_account, "content3", "content4", "content5", "content6", function (err) {
        if (err) {
            return res.render('create/topconfess/result', {
                msg: "出现异常，请重试"
            });
        }
        res.render('front/topconfess/result', {school: from_school_en_name});
    });*/

};


///我想上头条显示
exports.show_topconfess = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render('front/topconfess/create', {school: school, type: "topconfess"});

    })
};


///话题表单的显示
exports.show_article_recommand = function (req, res, next) {
    var from_school_en_name = req.params.from_school_en_name;
    School.getSchoolByEname(from_school_en_name, function (err, school) {
        res.render('front/article_recommand/create', {school: school, type: "article_recommand"});

    })
};

///话题表单的显示
exports.show_topic_suggest = function (req, res, next) {
    res.render('front/topic_suggest/create', {type: "topic_suggest"});
};


exports.tt = function (req, res, next) {
    var dd1 = replaceAll1("", "", "[开心]啊哈哈哈[难过]")
    console.log(dd1);
};

replaceAlltitle = function (find, replace, str) {
    var title = replaceAll("[开心]", "", str)
    var title = replaceAll("[开心]", "", str)
}


var replaceAll = function (find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}


var replaceAll1 = function (find, replace, str) {
    //var find = find.replace(/[..]/g, '\\$&');
    return str.replace(/\[.{1,9}\]/g, replace);
}

///话题表单的显示
exports.show_topic_suggest = function (req, res, next) {
    res.render('front/hudong/create', {type: "hudong"});
};
///话题表单的显示
exports.create_topic_suggest = function (req, res, next) {
    PostEx.newAndSave(false, false, "topic_suggest", "", "", "image", "title", req.body.content, "", "", "content3", "content4", "content5", "content6", function (err) {
        if (err) {
            return res.render('create/topic_suggest/result', {
                msg: "出现异常，请重试"
            });
        }
        res.render('front/topic_suggest/result', {type: "topic_suggest"});
    });
};


///话题表单的显示
exports.create_article_recommand = function (req, res, next) {
    var from_school_en_name = req.body.from_school_en_name;
    var from_school_cn_name = req.body.from_school_cn_name;
    var from_school_cn_short_name = req.body.from_school_cn_short_name;
    PostEx.newAndSave(false, false, "article_recommand", from_school_cn_name, from_school_en_name, "image", "title", "文章地址: <a href='" + req.body.content + "' target='_blank'> " + req.body.content + "  </a>  推荐原因:" + req.body.content1 + "|||微信号：" + req.body.wx_account, "", "", "content3", "content4", "content5", "content6", function (err) {
        if (err) {
            return res.render('create/article_recommand/result', {
                msg: "出现异常，请重试"
            });
        }
        res.render('front/article_recommand/result', {type: "article_recommand"});
    });

};

///话题表单的显示
exports.create_hudong = function (req, res, next) {
    var from_school_en_name = req.body.from_school_en_name;
    var from_school_cn_name = req.body.from_school_cn_name;
    var from_school_cn_short_name = req.body.from_school_cn_short_name;
    PostEx.newAndSave(false, false, "hudong", from_school_cn_name, from_school_en_name, "image", "title", req.body.content + "|||微信号：" + req.body.wx_account, "", "", "content3", "content4", "content5", "content6", function (err) {
        if (err) {
            return res.render('create/hudong/result', {
                msg: "出现异常，请重试"
            });
        }
        res.render('front/hudong/result', {type: "hudong"});
    });

};


exports.index = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    var templete = 'back/postEx/index';
    var req_type = req.query.req_type;
    var se = req.query.se || "school";
    var en_name = req.query.en_name;
    var query = {};
    var type = req.query.type;
    var showtype = req.query.showtype;
    var day = req.query.d;
    var sort = [
        ['from_school_en_name', 'desc']
    ];
    Configuration.getConfigurationByCode(type, function (err, day) {
        day = day.value;

        if (!day) {
            day = 1;
        }
        if (type == "topic") {
            day = 1;
        }
        Configuration.getConfigurationByCode(DateFormat(day), function (err, start_cfg) {
            Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
                console.log(start_cfg + "...")
                console.log(end_cfg + ".....")
                if (req_type == "unpass") {
                    query = {
                        "$or": [
                            {sensitive: true},
                            {word_less: true}
                        ], type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                }
                if (req_type == "unpassEx") {
                    query = {
                        "$or": [
                            {sensitive: true},
                            {word_less: true}
                        ], type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }
                    };
                }
                if (req_type == "unpass_update") {
                    query = {
                        "$or": [
                            {sensitive: true},
                            {word_less: true}
                        ], type: req.query.type, display: true, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    templete = "back/postEx/content_update"
                }
                if (req_type == "all_no_common") {
                    console.log("-----")
                    query = {
                        common: false, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    console.log(new Date(start_cfg.value))
                    console.log(new Date(end_cfg.value))
                }
                if (req_type == "all_no_commonEx") {
                    query = {
                        common: false, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }
                    };
                }
                if (req_type == "common") {
                    query = {
                        common: true, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                }
                if (req_type == "commonEx") {
                    query = {
                        common: true, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }
                    };
                }
                if (req_type == "all_no_common_update") {
                    query = {
                        common: false, display: true, update: true, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    templete = "back/postEx/content_update"
                }
                if (req_type == "common_update") {
                    query = {
                        common: true, update: true, display: true, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    templete = "back/postEx/content_update"
                }

                if (req.query.update) {
                    query = {
                        update: req.query.update,
                        common: req.query.common,
                        diplay: true,
                        type: req.query.type,
                        create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    templete = "back/postEx/content_update"
                }
                if (en_name) {
                    query = {
                        common: false, type: req.query.type, from_school_en_name: en_name, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                    if (req_type == "all_no_commonEx") {
                        query = {
                            common: false, type: req.query.type,from_school_en_name: en_name, create_at: {
                                "$gt": new Date(start_cfg.value)
                            }
                        };
                    }
                }
                if(req_type=="deleted"){
                    query = {
                        type: req.query.type,display:false, create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    };
                }

                if (type == "topconfess") {
                    templete = "back/postEx/topconfess"
                    query = {
                        common: false, type: req.query.type, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }
                    };
                    if(req.query.send=="false"){
                        query = {
                            common: false,content6:{"$ne":"sended"}, type: req.query.type, create_at: {
                                "$gt": new Date(start_cfg.value)
                            }
                        };
                    }
                    sort = [
                        ['create_at', 'desc']
                    ];

                }
                if (showtype == "mobile") {
                    templete = "back/postEx/hudongschool"
                }


                page = page > 0 ? page : 1;
                var limit = 100;

                if (type == "topic") {
                    sort = [
                        ['create_at', 'desc']
                    ];
                }
                if (se) {
                    if (se == "time") {
                        sort = [
                            ['create_at', 'desc']
                        ];
                    }
                }

                var options = {skip: (page - 1) * limit, limit: limit, sort: sort};
                var proxy = EventProxy.create('postExs', 'pages', 'all_postExs_count',
                    function (postExs, pages, all_postExs_count) {
                        res.render(templete, {
                            postExs: postExs,
                            pages: pages,
                            current_page: page,
                            req_type: req_type,
                            type: type,
                            se: se,
                            day: day,
                            all_postExs_count: all_postExs_count
                        });
                    });
                proxy.fail(next);
                PostEx.getPostExsByQuery(query, options, function (err, postExs) {
                    postExs.forEach(function (postEx, i) {
                        if (postEx) {
                            postEx.friendly_create_at = Util.format_date(postEx.create_at, true);
                            postEx.pretty_create_at = Util.format_date(postEx.create_at, false);
                        }

                        return postEx;
                    });
                    proxy.emit('postExs', postExs);
                })
                PostEx.getCountByQuery(query, proxy.done(function (all_postExs_count) {
                    var pages = Math.ceil(all_postExs_count / limit);
                    proxy.emit('all_postExs_count', all_postExs_count);
                    proxy.emit('pages', pages);
                }));

            })
        });
    });
};

exports.confess_count = function (req, res, next) {
    PostEx.getCountByQuery({type: "confess"}, function (err, all_postExs_count) {
        console.log(err)
        console.log(all_postExs_count)

    });
}


exports.back_handler = function (req, res, next) {
    var type = req.query.type;
    var post_id = req.query.id;
    PostEx.getPostExById(post_id, function (err, postex) {
        if (err || (!postex)) {
            res.json({success: false});
            return;
        }
        ;
        if (type == "del") {
            postex.display = false;
           //  postex.content1="备注:"+postex.content1 Util.format_date(new Date(), false);
            postex.save();
            return res.json({success: true});
        }
        if (type == "deleteback") {
            postex.display = true;
            postex.save();
            return res.json({success: true});
        }
        if (type == "pass") {
            postex.sensitive = false;
            postex.word_less = false;
            postex.save();
            return res.json({success: true});
        }

        if (type == "common") {
            PostEx.newAndSaveEx(postex, function (err) {
                if (err) {
                    return res.json({success: false});
                }
                return res.json({success: true});
            })
        }
        if (type == "update") {
            postex.update = true;
            postex.save();
            return res.json({success: true});
        }
        if (type == "move") {

            if (postex.type == "confess") {
                postex.type = "shudong";
            }
            else if (postex.type == "shudong") {
                postex.type = "confess";
            } else {
            }
            console.log(postex.type);
            postex.save();
            return res.json({success: true});
        }
        if (type == "title") {
            SchoolEx.getSchoolByEname(postex.from_school_en_name, function (err, schoolEx) {
                if (schoolEx) {
                    if (postex.type == "shudong") {
                        schoolEx.secret_title = replaceAll1("", "", postex.content0);
                    }
                    if (postex.type == "confess") {
                        schoolEx.confess_title = replaceAll1("", "", postex.content0);
                    }
                    schoolEx.save();
                }
            })
            return res.json({success: true});
        }
        if (type == "topconfesssend") {
            postex.content6="sended";
            postex.save();
            return res.json({success: true});
        }
        if (type == "topconfessrecover") {
            postex.content6="";
            postex.save();
            return res.json({success: true});
        }


        if (type == "topconfess") {
            Configuration.getConfigurationByCode("confess", function (err, day) {
                Configuration.getConfigurationByCode(DateFormat(day.value), function (err, start_cfg) {
                    console.log(postex)
                   var t = new Date(start_cfg.value);
                    t.setSeconds(t.getSeconds() +10);
                    postex.type = "confess";
                    postex.create_at =t;
                    postex.common=false;
                    PostEx.newAndSaveTopConfess(postex, function (err,dd) {

                        SchoolEx.getSchoolByEname(postex.from_school_en_name, function (err, schoolEx) {
                            if (schoolEx) {
                                schoolEx.confess_title=postex.content0;
                                schoolEx.save();
                                if (err) {
                                    return res.json({success: false});

                                }
                                return res.json({success: true});
                            }
                        })
                    });
                })
            })
        }
    });
}


exports.start_edit = function (req, res, next) {
    var limit = 1;
    var sort = [
        ['create_at', 'desc']
    ];
    var options = {limit: 1, sort: sort};
    PostEx.newAndSave(false, false, "confess", "宁大", "nux", "image", "title", "++++++++++", "content1", "content2", "content3", "content4", "content5", "content6", function (err) {
        if (err) {
            return res.json({success: false});
        }
        PostEx.getPostExsByQuery({}, options, function (err, postexs) {
            if (postexs.length > 0) {
                Configuration.getConfigurationByCode("start_time", function (err, start_cfg) {
                    Configuration.getConfigurationByCode("end_time", function (err, end_cfg) {

                        Configuration.getConfigurationByCode(TodayFormat(), function (err, configuration) {
                            if (configuration) {
                                configuration.value = postexs[0].create_at.toISOString();
                                configuration.save();
                                return res.json({success: true});
                            } else {
                                Configuration.newAndSave("basic", TodayFormat(), postexs[0].create_at.toISOString(), "编辑的时间", function () {
                                    return res.json({success: true});
                                })
                            }
                        })

//                        start_cfg.value=end_cfg.value;
//                        end_cfg.value=postexs[0].create_at.toISOString();
//                        end_cfg.save();
//                        start_cfg.save();

                    })
                });
            }
        })
    });
}

function TodayFormat() {
    var today = new Date(); // 获取今天时间
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}
function YesTodayFormat() {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - 1); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}

function DateFormat(day) {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - day); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}


exports.get_result_post = function (req, res, next) {
    var type = req.query.type;

    SchoolEx.getSchoolExsByQueryAndField({},'_id cn_name en_name secret_title',{},function (err, schoolexs) {
        res.render('back/postEx/post_result', {type: type, schoolexs: schoolexs});
    });
}


function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    var result = (Min + Math.round(Rand * Range));
    if (result < 0) {
        result = -result;
    }
    return result;
}

exports.result_post = function (req, res, next) {
    var type = req.body.type;
    var school_en_name = req.body.en_name;
    var templete = "<section style='margin: 0.8em 0; padding: 0.6em; border: 1px solid #c0c8d1; border-radius: 0.3em; box-shadow: #aaa 0 0 0.6em; background-color: #fafaef;' class='ng-scope'><section style='padding: 0px; margin: 0px; border: none; color: rgb(51, 51, 51); font-size: 1em; line-height: 1.4em; word-break: break-all; word-wrap: break-word; background-image: none; font-family: inherit; ' placeholder='{ 点击编辑 }' class='tn-page-ed-type-text ng-scope ng-valid tn-page-editable ng-dirty'><strong><span style='color: rgb(112, 48, 160); '>###</span></strong><span style='color: rgb(112, 48, 160); '><br></span></section></section>"
    var templete1 = "<section class='tn-Powered-by-XIUMI' style=''><section class='tn-Powered-by-XIUMI' style='margin: 0px 0px 0px 1em; padding: 0px; max-width: 100%; box-sizing: border-box; line-height: 1.4; word-wrap: break-word !important;'><span class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 3px 8px; max-width: 100%; box-sizing: border-box; display: inline-block; border-radius: 4px; color: rgb(255, 255, 255); font-size: 1em; font-family: inherit; font-weight: inherit; text-align: inherit; text-decoration: inherit; border-color: rgb(166, 91, 203); word-wrap: break-word !important; background-color: rgb(191, 175, 219);'><section class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important;'>###title</section></span> <span class='tn-Powered-by-XIUMI' style='margin: 0px 0px 0px 4px; padding: 3px 8px; max-width: 100%; box-sizing: border-box; display: inline-block; border-radius: 1.2em; color: rgb(255, 255, 255); font-size: 1em; line-height: 1.2; font-family: inherit; font-weight: inherit; text-align: inherit; text-decoration: inherit; border-color: rgb(166, 91, 203); word-wrap: break-word !important; background-color: rgb(191, 175, 219);'><section class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important;'>###name</section></span></section><section class='tn-Powered-by-XIUMI' style='margin: -11px 0px 0px; padding: 22px 16px 16px; max-width: 100%; box-sizing: border-box; border: 1px solid rgb(192, 200, 209); color: rgb(112, 48, 160); font-size: 1em; font-family: inherit; font-weight: bold; text-align: inherit; text-decoration: inherit; word-wrap: break-word !important; background-color: rgb(255, 253, 253);'><p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; min-height: 1em; white-space: pre-wrap; word-wrap: break-word !important;'>###content</p><p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; min-height: 1em; white-space: pre-wrap; word-wrap: break-word !important;'><img data-src='http://mmbiz.qpic.cn/mmbiz/ib3w9Ylhv3SC6rop1AQTZDRHmdorGIica1LDHSTZrTyK5libP0Dj0qf6XperyRKVV3EUCAzYszKkJET1SarDWoujQ/0?wx_fmt=jpeg' class='' data-type='jpeg' data-ratio='0.6864406779661016' data-w='472' width='auto' style='margin: 0px; padding: 0px; box-sizing: border-box !important; word-wrap: break-word !important; width: auto !important; visibility: visible !important; height: auto !important;' _width='auto' src='###href'></p></section></section>";
    var templete2 = "<section class='tn-Powered-by-XIUMI' style=''><section class='tn-Powered-by-XIUMI' style='margin: 0px 0px 0px 1em; padding: 0px; max-width: 100%; box-sizing: border-box; line-height: 1.4; word-wrap: break-word !important;'><span class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 3px 8px; max-width: 100%; box-sizing: border-box; display: inline-block; border-radius: 4px; color: rgb(255, 255, 255); font-size: 1em; font-family: inherit; font-weight: inherit; text-align: inherit; text-decoration: inherit; border-color: rgb(166, 91, 203); word-wrap: break-word !important; background-color:rgb(191, 175, 219);'><section class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important;'>###title</section></span> <span class='tn-Powered-by-XIUMI' style='margin: 0px 0px 0px 4px; padding: 3px 8px; max-width: 100%; box-sizing: border-box; display: inline-block; border-radius: 1.2em; color: rgb(255, 255, 255); font-size: 1em; line-height: 1.2; font-family: inherit; font-weight: inherit; text-align: inherit; text-decoration: inherit; border-color: rgb(166, 91, 203); word-wrap: break-word !important; background-color:rgb(191, 175, 219);'><section class='tn-Powered-by-XIUMI' style='margin: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; word-wrap: break-word !important;'>###name</section></span></section><section class='tn-Powered-by-XIUMI' style='margin: -11px 0px 0px; padding: 22px 16px 16px; max-width: 100%; box-sizing: border-box; border: 1px solid rgb(192, 200, 209); color: rgb(112, 48, 160); font-size: 1em; font-family: inherit; font-weight: bold; text-align: inherit; text-decoration: inherit; word-wrap: break-word !important; background-color: rgb(255, 253, 253);'><p style='margin-top: 0px; margin-bottom: 0px; padding: 0px; max-width: 100%; box-sizing: border-box; min-height: 1em; white-space: pre-wrap; word-wrap: break-word !important;'>###content</p></section><section style='margin: 0px; padding: 0px; max-width: 100%; width: 0px; height: 0px; clear: both; box-sizing: border-box !important; word-wrap: break-word !important;'></section></section>";
    var result = "";
    var sort = [
        ['create_at', 'asc']
    ];
    var index = 1;
    var cn_title;
    var options = {sort: sort};
    if (type == "confess") {
        cn_title = "❤表白";
    } else if (type == "shudong") {
        cn_title = "★树洞";
    } else if (type == "info") {
        cn_title = "★生活信息";
    } else if (type == "friend") {
        cn_title = "★交友";
    }
    Configuration.getConfigurationByCode(type, function (err, day) {
        console.log("....." + day);
        Configuration.getConfigurationByCode(DateFormat(day.value), function (err, start_cfg) {
            Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
                PostEx.getPostExsByQuery({
                    'from_school_en_name': school_en_name, 'display': true, type: type, create_at: {
                        "$gt": new Date(start_cfg.value),
                        "$lt": new Date(end_cfg.value)
                    }
                }, options, function (err, postexs) {
                    postexs.forEach(function (postex, i) {
                        if (postex) {
                            if (type == "confess") {
                                result += templete.replace(/###/g, "" + cn_title + index + ":" + postex.content0);
                            } else {
                                result += templete.replace(/###/g, cn_title + index + ":" + postex.content0);
//                            if(postex.wx_photo_url){
//                                console.log("ddddd"+postex.wx_photo_url);
//                                result += templete1.replace(/###title/g, "" + cn_title + index).replace(/###content/g,postex.content0).replace(/###name/g,"【"+postex.content3+"】说:").replace(/###href/g,postex.wx_photo_url);
//                            }else{
//                                result += templete2.replace(/###title/g, "" + cn_title + index).replace(/###content/g,postex.content0).replace(/###name/g,"【"+postex.content3+"】说:");
//                            }
//                            result +="<p></p>"
                            }
                            index++;

                        }
                    });
                    if (postexs.length < 22 && type != "info" && type != "friend") {
                        PostEx.getPostExsByQuery({
                            from_school_en_name: {$ne: school_en_name},
                            'display': true,
                            common: true,
                            type: type,
                            create_at: {
                                "$gt": new Date(start_cfg.value),
                                "$lt": new Date(end_cfg.value)
                            }
                        }, options, function (err, postexs) {
                            if (postexs.length < 23) {
                                return res.json({success: false, msg: '公共的表白或树洞太少'});
                            }
                            console.log(postexs.length);
                            var i = 0;
                            while (index < 22) {
                                var random = parseInt((postexs.length - 1) * Math.random());
                                console.log(random);
                                result += templete.replace(/###/g, "★" + cn_title + index + ":" + postexs[random].content0);
                                postexs.splice(random, 1);
                                index++;
                                i++;
                            }
                            SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                                if (type == "confess") {
                                    school.confess_content = result;
                                }
                                if (type == "shudong") {
                                    school.secret_content = result;
                                }
                                school.save();
                                return res.json({success: true});
                            })
                        });
                    } else {
                        SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                            if (type == "confess") {
                                school.confess_content = result;
                            }
                            if (type == "shudong") {
                                school.secret_content = result;
                            }
                            if (type == "friend") {
                                school.friend_content = result;
                            }
                            if (type == "info") {
                                school.info_content = result;
                            }
                            school.save();
                            return res.json({success: true});
                        })
                    }
                })
            });
        });
    });
}

exports.exporttoes = function (req, res, next) {
    var s = req.query.s;
    console.log(s)
    PostEx.exporttoes(s, function () {
        res.send("ok");
    })
}


exports.search = function (req, res, next) {
    var s = req.query.s;
    var name = req.query.name;
    var key = req.query.key;
    var region = req.query.r;
    console.log(md5(name))
    console.log(region)

    if (md5(name) != key) {
        res.send("错误的来源");
    }
    PostEx.search(s, name, function (err, hits) {
        res.render('front/search/index', {hits: hits, name: name, region: region});
    })
}

function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

exports.get_result_topic = function (req, res, next) {
    var type = "topic";
    SchoolEx.getSchoolsByQuery({}, function (err, schoolexs) {
        res.render('back/topic/result', {type: type, schoolexs: schoolexs});
    });
}

exports.result_topic = function (req, res, next) {
    var extopiccount = 20;
    var type = "topic";
    var school_en_name = req.body.en_name;
    var templete = "<section style='margin: 0.8em 0; padding: 0.6em; border: 1px solid #c0c8d1; border-radius: 0.3em; box-shadow: #aaa 0 0 0.6em; background-color: #fafaef;' class='ng-scope'><section style='padding: 0px; margin: 0px; border: none; color: rgb(51, 51, 51); font-size: 1em; line-height: 1.4em; word-break: break-all; word-wrap: break-word; background-image: none; font-family: inherit; ' placeholder='{ 点击编辑 }' class='tn-page-ed-type-text ng-scope ng-valid tn-page-editable ng-dirty'><span style='color: rgb(112, 48, 160); '>###</span></section></section>"
    var result = "";
    var sort = [
        ['create_at', 'desc']
    ];

    var index = 1;
    var cn_title;
    var options = {sort: sort};
    Configuration.getConfigurationByCode(YesTodayFormat(), function (err, start_cfg) {
        Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
            PostEx.getPostExsByQuery({
                'from_school_en_name': school_en_name, 'display': true, type: type, create_at: {
                    "$gt": new Date(start_cfg.value),
                    "$lt": new Date(end_cfg.value)
                }
            }, options, function (err, postexs) {
                result += "<p><span style='color: rgb(247, 150, 70);'><strong>本校精彩回答</strong></span></p>";
                var temp = "";
                postexs.forEach(function (postex, i) {
                    if (postex && (temp !== postex.content0)) {
                        temp = postex.content0;
                        result += templete.replace(/###/g, "★’" + (postex.content1 || "佚名") + "‘同学说：" + postex.content0);
                        index++;
                    }
                });
                if (postexs.length < 20) {
                    PostEx.getPostExsByQuery({
                        from_school_en_name: {$ne: school_en_name},
                        'display': true,
                        common: true,
                        type: type,
                        create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    }, options, function (err, postexs) {
                        if (postexs.length < 21) {
                            return res.json({success: false, msg: '话题太少'});
                        }
                        var i = 0;
                        while (index < 20) {
                            var random = parseInt((postexs.length - 1) * Math.random());
                            result += templete.replace(/###/g, "★‘" + (postexs[random].content1 || "佚名") + "’同学说：" + postexs[random].content0);
                            postexs.splice(random, 1);
                            index++;
                            i++;
                        }
                        result += "<p><span style='color: rgb(247, 150, 70);'><strong>其他高校精彩回答</strong></span></p>";
                        var number = 0;
                        while (number < extopiccount) {
                            var random = parseInt((postexs.length - 1) * Math.random());

                            result += templete.replace(/###/g, "★来自【" + postexs[random].content2 + "】的‘" + (postexs[random].content1 || "佚名") + "’同学说：" + postexs[random].content0);
                            postexs.splice(random, 1);
                            index++;
                            number++;
                        }
                        SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                            console.log(school.en_name);
                            school.topic_content = result;
                            school.save();
                            return res.json({success: true});
                        })
                    });
                } else {
                    PostEx.getPostExsByQuery({
                        from_school_en_name: {$ne: school_en_name},
                        'display': true,
                        common: true,
                        type: type,
                        create_at: {
                            "$gt": new Date(start_cfg.value),
                            "$lt": new Date(end_cfg.value)
                        }
                    }, options, function (err, postexs) {
                        result += "<p><span style='color: rgb(247, 150, 70);'><strong>其他高校精彩回答</strong></span></p>";
                        var number = 0;
                        while (number < extopiccount) {
                            var random = parseInt((postexs.length - 1) * Math.random());
                            console.log(random);
                            result += templete.replace(/###/g, "★来自【" + postexs[random].content2 + "】的’" + (postexs[random].content1 || "佚名") + "‘同学说：" + postexs[random].content0);
                            postexs.splice(random, 1);
                            index++;
                            number++

                        }
                        SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                            school.topic_content = result;
                            school.save();
                            return res.json({success: true});
                        })
                    });
                }
            })
        });
    });
}


exports.update_content = function (req, res, next) {
    var postEx_id = req.body.postEx_id;
    var update_content = req.body.update_content;
    PostEx.getPostExById(postEx_id, function (err, post) {
        if (err) {
            return res.json({success: false});
        }
        post.content0 = update_content;
        post.update = false;
        post.sensitive = false;
        post.word_less = false;
        post.save();
        return res.json({success: true});
    });
}


exports.handler_postEx = function (req, res, next) {
    var from_school_en_name = req.body.from_school_en_name;
    var from_school_cn_name = req.body.from_school_cn_name;
    var from_school_cn_short_name = req.body.from_school_cn_short_name;
    var type = req.body.type;


    var word_less = false;
    var content = req.body.content;
    var content3 = req.body.content3;
    var photo_url = req.body.photo_url;
    if (content && content.length < 10) {
        word_less = true;
    }
    console.log("content" + content);
    FilterWord.getFilterWordCache(function (err, filterwordString) {
        //var regex = new RegExp(blacklist.join('|'), 'i');
        var regex = new RegExp(filterwordString, 'i');
        sensitive = regex.test(content);
        var senstive_value = "";
        PostEx.exist(content, from_school_en_name, function (err, count) {
            console.log("count++" + count);
            if (count == 0) {
                if (sensitive) {
                    senstive_value = regex.exec(content);
                    console.log("+++---------+" + senstive_value);
                    if (senstive_value && senstive_value.length > 0) {
                        FilterWord.findFilterWordByword(senstive_value[0], function (err, filterword) {
                            createfunction(photo_url, word_less, sensitive, type, from_school_cn_name, from_school_en_name, content, from_school_cn_short_name, senstive_value, res, content3)

                        })
                    }
                } else {
                    console.log("没有敏感字");
                    createfunction(photo_url, word_less, sensitive, type, from_school_cn_name, from_school_en_name, content, from_school_cn_short_name, senstive_value, res, content3)
                }
            } else {
                res.render('front/postEx/result', {from_school_cn_short_name: from_school_cn_short_name, type: type});
            }
        });
    })
};


function createfunction(photo_url, word_less, sensitive, type, from_school_cn_name, from_school_en_name, content, from_school_cn_short_name, senstive_value, res, content3) {
    if (photo_url) {
        console.log("出来了");
        var base64Data = photo_url.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dirctory = "public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
        if (!fs.existsSync(dirctory)) {
            fs.mkdirSync(dirctory);
        }
        var oldpath = dirctory + "/" + guid() + ".jpg"
        fs.writeFile(oldpath, dataBuffer, function (err) {
            if (err) {
                console.log(err);
                return res.send(err);
            }
            PostEx.newAndSave(word_less, sensitive, type, from_school_cn_name, from_school_en_name, "image", "title", content, senstive_value, from_school_cn_short_name, content3, "content4", "content5", "content6", function (err, postex) {
                if (err) {
                    return res.render('create/nxu/confession', {
                        msg: "出现异常，请重试"
                    });
                }
                fs.rename(oldpath, dirctory + "/" + postex._id + ".jpg", function (err) {
                    postex.image = "/" + dirctory + "/" + postex._id + ".jpg";
                    postex.save();
                    res.render('front/postEx/result', {
                        from_school_cn_short_name: from_school_cn_short_name,
                        type: type
                    });
                });
            });
        });
    } else {
        PostEx.newAndSave(word_less, sensitive, type, from_school_cn_name, from_school_en_name, "", "title", content, senstive_value, from_school_cn_short_name, "content3", "content4", "content5", "content6", function (err, postex) {
            if (err) {
                return res.render('create/nxu/confession', {
                    msg: "出现异常，请重试"
                });
            }
            res.render('front/postEx/result', {from_school_cn_short_name: from_school_cn_short_name, type: type});
        });
    }
}









///话题表单的显示
exports.xcx_post = function (req, res, next) {
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = 'public/file/video'; //设置上传目录
    form.keepExtensions = false; //保留后缀
    form.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    var dirctory = "public/front/photo_guess/" + (new Date()).getFullYear() + ((new Date()).getMonth() + 1) + (new Date()).getDate() + "";
    form.parse(req, function(err, fields, files) {

        if (err) {

           return res.json({status:"error"});
        }

        onsole.log(fields,"-------------",files);
        var extName = '';  //后缀名
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
            return res.json({status:"error"});
        }

        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;

        console.log(newPath);
        fs.renameSync(files.fulAvatar.path, newPath);  //重命名
    });

    return res.json({status:"ok"});


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

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}