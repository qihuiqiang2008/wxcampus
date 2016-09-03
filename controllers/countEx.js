var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var wxList = require(__dirname + '/../config/config');
var async = require('async');
var SchoolEx = require('../proxy').SchoolEx;
var Stati = require('../proxy').Stati;
var FilterWord = require('../proxy').FilterWord;


exports.stat_article_detail = function (req, res, next) {
    var item;
    var totalNumber = 0;

    var region_code = req.query.region_code || "";
    var en_name = req.query.en_name ;
    // console.log(region_code);
//    var query = {};
//    if (!region_code) {
//        if (req.session.user.email !== 'admin@admin.com') {
//            query = {'belong_group': req.session.user.location.belong_group};
//        }
//        //query={};
//    } else {
//        if (req.session.user.email !== 'admin@admin.com') {
//            query = {'belong_group': req.session.user.location.belong_group, region_code: region_code, en_name: "muc"};
//        } else {
//            query = {region_code: region_code}
//        }
//    }

    query = {en_name:en_name};
    var sort = [
        [ 'region_code', 'desc' ]
    ];
    var options = {sort: sort };
    var Data=new Object();
    var array=new Array();
    var results;
    SchoolEx.getSchoolExsByQuery(query, options, function (err, schools) {
            async.eachSeries(schools, function (item, callback) {
                async.series([
                    function(cb) {                          //2.1登陆目的账号
                        login(item, function(err, resultsWx) {
                            results = resultsWx;

                            cb();
                        });
                    },
                    function (cb) {
                            var cookie = '';
                            request.get('https://mp.weixin.qq.com/misc/pluginloginpage?action=stat_article_detail&pluginid=luopan&t=statistics/index&token=' + results.token + '&lang=zh_CN')//请求图文分析地址
                                .set('Cookie', results.cookie)
                                .set({"Accept-Encoding": "gzip,sdch"})
                                .end(function (res) {
                                    indexHead = res.text.indexOf('cgiData'); //定位到html含有下次请求参数的位置
                                    indexTail = res.text.indexOf('seajs.use', indexHead);
                                    var jsonString = res.text.slice(indexHead, indexTail);  //截取json
                                    var cgiData;
                                    eval(jsonString); //将json转换为对象

                                    //请求图文分析页中的框架的地址
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //克服 UNABLE_TO_VERIFY_LEAF_SIGNATURE 错误，对端服务器证书不正确。另一种解决之道是从中间服务器下载正确的证书？
                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail?appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&devtype=' + cgiData.devtype + '&jsurl=' + cgiData.jsurl + '&version=2')
                                        .set('Cookie', cookie)
                                        .set({"Accept-Encoding": "gzip,sdch"})
                                        .end(function (res) {
                                            cookie = ''; //此次请求的主要目的是获取cookie以及获取initParam，其中包含日期
                                            if (res.header['set-cookie']) {
                                                _ref = res.header['set-cookie'];
                                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                                    rs = _ref[_i];
                                                    cookie += rs.replace(/HttpOnly/g, '');
                                                }
                                            }
                                            indexHead = res.text.indexOf('var initParams =');
                                            indexTail = res.text.indexOf('MTA.Page.init_params = initParams;'); // 截取HTML页面中js脚本中关于initParams的定义
                                            var jsonString = res.text.slice(indexHead, indexTail);
                                            eval(jsonString);  //initParams定义+赋值
                                            //请求文章详情的json串的地址
                                            request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=1&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                .set('Cookie', cookie)
                                                .set({"Accept-Encoding": "gzip,sdch"})
                                                .end(function (res) {
                                                    var articalData = JSON.parse(res.text);
                                                    //console.log(articalData.data);

                                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=1&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                        .set('Cookie', cookie)
                                                        .set({"Accept-Encoding": "gzip,sdch"})
                                                        .end(function (res) {
                                                            articalData = JSON.parse(res.text);
                                                            console.log(item.cn_name);
                                                            // console.log(articalData.data);
                                                            for (var o in articalData.data) {
                                                                //alert(o);
                                                                //alert(data[o]);
                                                                var Data=new Object();
                                                                Data.title=articalData.data[o].title;
                                                                Data.time=articalData.data[o].time;
                                                                Data.index=articalData.data[o].index;
                                                                array.push(Data);
                                                              //  console.log("title:" + articalData.data[o].title + " time:" + articalData.data[o].time + " index:" + articalData.data[o].index);
                                                            }

                                                            request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=2&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                                .set('Cookie', cookie)
                                                                .set({"Accept-Encoding": "gzip,sdch"})
                                                                .end(function (res) {
                                                                    var articalData = JSON.parse(res.text);
                                                                    //console.log(articalData.data);
                                                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=2&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                                        .set('Cookie', cookie)
                                                                        .set({"Accept-Encoding": "gzip,sdch"})
                                                                        .end(function (res) {
                                                                            articalData = JSON.parse(res.text);
                                                                            // console.log(articalData.data);
                                                                            for (var o in articalData.data) {
                                                                                //alert(o);
                                                                                //alert(data[o]);
                                                                                var Data=new Object();
                                                                                Data.title=articalData.data[o].title;
                                                                                Data.time=articalData.data[o].time;
                                                                                Data.index=articalData.data[o].index;
                                                                                array.push(Data);
                                                                              //  console.log("title:" + articalData.data[o].title + " time:" + articalData.data[o].time + " index:" + articalData.data[o].index);
                                                                            }
                                                                            request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=3&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                                                .set('Cookie', cookie)
                                                                                .set({"Accept-Encoding": "gzip,sdch"})
                                                                                .end(function (res) {
                                                                                    var articalData = JSON.parse(res.text);
                                                                                    //console.log(articalData.data);
                                                                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=3&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                                                        .set('Cookie', cookie)
                                                                                        .set({"Accept-Encoding": "gzip,sdch"})
                                                                                        .end(function (res) {
                                                                                            articalData = JSON.parse(res.text);
                                                                                            // console.log(articalData.data);
                                                                                            for (var o in articalData.data) {
                                                                                                //alert(o);
                                                                                                //alert(data[o]);
                                                                                                var Data=new Object();
                                                                                                Data.title=articalData.data[o].title;
                                                                                                Data.time=articalData.data[o].time;
                                                                                                Data.index=articalData.data[o].index;
                                                                                                array.push(Data);
                                                                                                //  console.log("title:" + articalData.data[o].title + " time:" + articalData.data[o].time + " index:" + articalData.data[o].index);
                                                                                            }
                                                                                            request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + results.token)
                                                                                                .set('Cookie', results.cookie)
                                                                                                .set("Accept-Encoding" , "gzip,sdch")
                                                                                                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                                                                                .end(function(res){
                                                                                                    console.log('==========logout=================');
                                                                                                    cb();
                                                                                                })

                                                                                        });
                                                                                });

                                                                        });
                                                                });

                                                        });
                                                });

                                        });
                                });
                    }], function (err, results) {
                    if (err) {
                        res.send("fail");
                        console.log('=========preview fail=================');
                    }
                    async.eachSeries(array, function (itemEx, callbackEx) {
                        itemEx.index[1]=itemEx.index[1].replace(",","");
                        itemEx.index[0]=itemEx.index[0].replace(",","");
                        Stati.getStat(item.en_name,itemEx.time,function(err,stat){
                            if(stat){
                                if(itemEx.title.indexOf("表白")!=-1){
                                    stat.allcount=itemEx.index[0];
                                    stat.biaobaicount=itemEx.index[1];
                                    stat.biaobairate=(itemEx.index[1]/itemEx.index[0]).toFixed(2)*100;
                                    stat.biaobairate=NumberFormat(stat.biaobairate);
                                    stat.save(callbackEx);
                                }else if(itemEx.title.indexOf("树洞")!=-1){
                                    stat.allcount=itemEx.index[0];
                                    stat.shudongcount=itemEx.index[1];
                                    stat.shudongrate=(itemEx.index[1]/itemEx.index[0]).toFixed(2)*100;
                                    stat.shudongrate=NumberFormat(stat.shudongrate);
                                    stat.save(callbackEx);

                                }else if(itemEx.title.indexOf("缘分")!=-1){
                                    stat.allcount=itemEx.index[0];
                                    stat.yuanfengcount=itemEx.index[1];
                                    stat.yuanfenrate=(itemEx.index[1]/itemEx.index[0]).toFixed(2)*100;
                                    stat.yuanfenrate=NumberFormat(stat.yuanfenrate);

                                    stat.save(callbackEx);
                                }else if(itemEx.title.indexOf("晚安")!=-1) {
                                    stat.allcount=itemEx.index[0];
                                    stat.wanancount = itemEx.index[1];
                                    stat.wananrate = (itemEx.index[1]/itemEx.index[0]).toFixed(2)*100;
                                    stat.wananrate=NumberFormat(stat.wananrate);
                                    stat.save(callbackEx);
                                }else if(itemEx.title.indexOf("二手")!=-1) {
                                    stat.allcount=itemEx.index[0];
                                    stat.ershoucount = itemEx.index[1];
                                    stat.ershourate =(itemEx.index[1]/itemEx.index[0]).toFixed(2)*100;
                                    stat.ershourate=NumberFormat(stat.ershourate);;
                                    stat.save(callbackEx);
                                }else{
                                    callbackEx();
                                }
                            }else{
                                var type="wanan";
                                //cn_name, en_name,date,count,rate,type,allcount,
                                if(itemEx.title.indexOf("表白")!=-1){
                                    type="biaobai";
                                }else if(itemEx.title.indexOf("树洞")!=-1){
                                    type="shudong";
                                }else if(itemEx.title.indexOf("缘分")!=-1){
                                    type="yuanfen";
                                }else if(itemEx.title.indexOf("晚安")!=-1) {
                                    type="wanan";
                                }else if(itemEx.title.indexOf("二手")!=-1) {
                                    type="ershou";
                                }
                                Stati.newAndSaveEx(item.cn_name,item.en_name,itemEx.time,itemEx.index[1],(itemEx.index[1] / itemEx.index[0]).toFixed(2)*100,type,itemEx.index[0],function(err){
                                    if(err){
                                        console.log(err);
                                        callbackEx();
                                    }else{
                                        callbackEx();
                                    }
                                });
                            }
                        })
                    },function (err) {             //全部请求过程完成后执行
                        callback();
                    });
                });
            }, function (err) {             //全部请求过程完成后执行
                console.log("请求完成");
               res.send({success:true});
//                var wananNumber=0;
//                var biaobaiNumber=0;
//                var shudongNumber=0;
//                var ershouNumber=0;
//                var yuanfenNumber=0;
//                var totalNumber=0;
//                Stati.getStatByQuery({date:DateFormat(1)},{},function(err,stats){
//                    async.eachSeries(stats, function(item, callback) {
//                        wananNumber+=item.wanancount;
//                        biaobaiNumber+=item.biaobaicount;
//                         shudongNumber+=item.shudongcount
//                         ershouNumber+=item.ershoucount;
//                         yuanfenNumber+=item.yuanfengcount;
//                         totalNumber+=(item.wanancount+item.biaobaicount+item.shudongcount+item.ershoucount+item.yuanfengcount);
//                        callback();
//                    }, function(err){
//                        res.render('back/statistic/indexstati', {statis: stats, wananNumber: wananNumber, biaobaiNumber: biaobaiNumber, shudongNumber: shudongNumber, ershouNumber: ershouNumber, yuanfenNumber: yuanfenNumber, totalNumber: totalNumber,today:DateFormat(1),yestoday:DateFormat(2),thedayofyestoday:DateFormat(3)});
//                    });
//                });
            });
        })

};

exports.stat_article_detailEx = function (req, res, next) {
   var date=req.query.date;
    if(!date){
        date=DateFormat(1);
    }
    var wananNumber=0;
    var biaobaiNumber=0;
    var shudongNumber=0;
    var ershouNumber=0;
    var yuanfenNumber=0;
    var totalNumber=0;

    SchoolEx.getSchoolExsByQuery({}, {}, function (err, schools) {
        async.eachSeries(schools, function(item, callback) {
            Stati.getStat(item.en_name,date,function(err,stat){
                 if(!stat){
                    Stati.newAndSave(item.cn_name,item.en_name,date,0,0,0,0,0,0,0,0,0,0,0,function(err){
                        if(err){
                            console.log(err);
                            callback();
                        }else{
                            callback();
                        }
                    });
                }else{
                     callback();
                 }
            })
        }, function(err){
            Stati.getStatByQuery({date:date},{},function(err,stats){
                async.eachSeries(stats, function(item, callback) {
                    wananNumber+=item.wanancount;
                    biaobaiNumber+=item.biaobaicount;
                    shudongNumber+=item.shudongcount
                    ershouNumber+=item.ershoucount;
                    yuanfenNumber+=item.yuanfengcount;
                    totalNumber+=(item.wanancount+item.biaobaicount+item.shudongcount+item.ershoucount+item.yuanfengcount);
                    callback();
                }, function(err){
                    res.render('back/statistic/indexstati', {statis: stats, wananNumber: wananNumber, biaobaiNumber: biaobaiNumber, shudongNumber: shudongNumber, ershouNumber: ershouNumber, yuanfenNumber: yuanfenNumber, totalNumber: totalNumber,today:DateFormat(1),yestoday:DateFormat(2),thedayofyestoday:DateFormat(3)});
                });
            });
         });
    });


}

function NumberFormat(number) {
    number=number+"";
    if(number.length>2){
      return  number.substr(0,2);
    }else{
        return number;
    }
}

function DateFormat(number) {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - number); // 系统会自动转换
    var month=today.getMonth()+1;
    var date=today.getDate();
    if(month<10){
        month="0"+month;
    }
    if(date<10){
        date="0"+date;
    }
    return today.getFullYear() + "-" +month + "-" + date;
}

exports.count_number = function (req, res, next) {
    var item;
    var totalNumber = 0;
    var region_code = req.query.region_code || "";
    // console.log(region_code);
    var query = {};
    if (!region_code) {
        if (req.session.user.email !== 'admin@admin.com') {
            query = {'belong_group': req.session.user.location.belong_group};
        }
        //query={};
    } else {
        if (req.session.user.email !== 'admin@admin.com') {
            query = {'belong_group': req.session.user.location.belong_group, region_code: region_code, en_name: "muc"};
        } else {
            query = {region_code: region_code}
        }
    }

    query = {en_name: "ruc"}

    var sort = [
        [ 'region_code', 'desc' ]
    ];
    var options = {sort: sort };


    SchoolEx.getSchoolExsByQuery(query, options, function (err, schools) {
        async.eachSeries(schools, function (item, callback) {
                login(item, function (err, results) {
                    /* if (results) {
                     req.session.is_login = results;
                     }*/
                    if (err) {
                        res.json(err);
                    }

                    request.get('https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token=' + results.token) //获取人数
                        .set('Cookie', results.cookie)
                        .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                        .end(function (res) {
                            var html, indexHead, indexTail, number, numberString;

                            indexHead = res.text.indexOf('li class="index_tap_item total_fans extra"'); //定位到html含有人数的位置
                            indexTail = res.text.indexOf('</li>', indexHead);
                            html = res.text.slice(indexHead - 1, indexTail + '</li>'.length);  //截取部分html
                            indexHead = html.indexOf('<em class="number">') + '<em class="number">'.length; //从里面继续截取含有人数的字符串
                            numberString = html.slice(indexHead);
                            number = parseInt(numberString);
                            console.log(number);
                            totalNumber += number;
                            callback();
                            var cookie = '';
                            if (res.header['set-cookie']) {
                                _ref = res.header['set-cookie'];
                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                    rs = _ref[_i];
                                    cookie += rs.replace(/HttpOnly/g, '');
                                }
                            }
                            request.get('https://mp.weixin.qq.com/misc/pluginloginpage?action=stat_article_detail&pluginid=luopan&t=statistics/index&token=' + results.token + '&lang=zh_CN')//请求图文分析地址
                                .set('Cookie', results.cookie)
                                .set({"Accept-Encoding": "gzip,sdch"})
                                .end(function (res) {
                                    indexHead = res.text.indexOf('cgiData'); //定位到html含有下次请求参数的位置
                                    indexTail = res.text.indexOf('seajs.use', indexHead);
                                    var jsonString = res.text.slice(indexHead, indexTail);  //截取json
                                    var cgiData;
                                    eval(jsonString); //将json转换为对象

                                    //请求图文分析页中的框架的地址
                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //克服 UNABLE_TO_VERIFY_LEAF_SIGNATURE 错误，对端服务器证书不正确。另一种解决之道是从中间服务器下载正确的证书？
                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail?appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&devtype=' + cgiData.devtype + '&jsurl=' + cgiData.jsurl + '&version=2')
                                        .set('Cookie', cookie)
                                        .set({"Accept-Encoding": "gzip,sdch"})
                                        .end(function (res) {
                                            cookie = ''; //此次请求的主要目的是获取cookie以及获取initParam，其中包含日期
                                            if (res.header['set-cookie']) {
                                                _ref = res.header['set-cookie'];
                                                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                                    rs = _ref[_i];
                                                    cookie += rs.replace(/HttpOnly/g, '');
                                                }
                                            }

                                            indexHead = res.text.indexOf('var initParams =');
                                            indexTail = res.text.indexOf('MTA.Page.init_params = initParams;'); // 截取HTML页面中js脚本中关于initParams的定义
                                            var jsonString = res.text.slice(indexHead, indexTail);
                                            eval(jsonString);  //initParams定义+赋值
                                            //请求文章详情的json串的地址
                                            request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=1&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                .set('Cookie', cookie)
                                                .set({"Accept-Encoding": "gzip,sdch"})
                                                .end(function (res) {
                                                    var articalData = JSON.parse(res.text);
                                                    //console.log(articalData.data);

                                                    request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=1&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd=' + (+new Date()) + '&ajax=1')
                                                        .set('Cookie', cookie)
                                                        .set({"Accept-Encoding": "gzip,sdch"})
                                                        .end(function (res) {
                                                            articalData = JSON.parse(res.text);
                                                            // console.log(articalData.data);

                                                            for (var o in articalData.data) {
                                                                //alert(o);
                                                                //alert(data[o]);
                                                                console.log("title:" + articalData.data[o].title + " time:" + articalData.data[o].time + " index:" + articalData.data[o].index);
                                                            }

                                                        });

                                                    callback();
                                                });

                                        });
                                });
                        });
                })
                console.log("-----");
            },

            function (err) {             //全部请求过程完成后执行
                console.log("get done,total number is:" + totalNumber);
                res.render('counter', {"body": "total number is " + 123});
            });
    });


}

