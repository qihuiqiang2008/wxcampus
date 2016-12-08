require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var AD = require('../proxy').AD;
var async = require('async');
var fs = require('fs');
var EventProxy = require('eventproxy');
var brushRate = 0.05;
var nodeExcel = require('excel-export');

exports.getArticleAD = function(req, res, next) {
    var conf ={};
        conf.stylesXmlFile = "styles.xml";
        conf.name = "mysheet";
        conf.cols = [{
            caption:'string',
            type:'string',
            beforeCellWrite:function(row, cellData){
                 return cellData.toUpperCase();
            },
            width:28.7109375
        },{
            caption:'date',
            type:'date',
            beforeCellWrite:function(){
                var originDate = new Date(Date.UTC(1899,11,30));
                return function(row, cellData, eOpt){
                    if (eOpt.rowNum%2){
                        eOpt.styleIndex = 1;
                    }  
                    else{
                        eOpt.styleIndex = 2;
                    }
                    if (cellData === null){
                      eOpt.cellType = 'string';
                      return 'N/A';
                    } else
                      return (cellData - originDate) / (24 * 60 * 60 * 1000);
                } 
            }()
        },{
            caption:'bool',
            type:'bool'
        },{
            caption:'number',
             type:'number'              
        }];
        conf.rows = [
            ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
            ["e", new Date(2012, 4, 1), false, 2.7182],
            ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
            ["null date", null, true, 1.414]  
        ];
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(result, 'binary');
}

function escape2Html(str) {
    var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
        return arrEntities[t];
    });
}

function getArticleURL(school_enname, position, callback) {
    var ads;

    var loadResult;
    var latest_msg_id;
    var list;
    var schoolEx;

    async.series([

        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function(err, school) {
                schoolEx = school;
                cb();
            })
        },

        function(cb) { //1.1：登陆。
            login(schoolEx, function(err, results) {
                loadResult = results;
                cb();
            });
        },

        function(cb) {
            request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({ "Accept-Encoding": "gzip,sdch" }) //为了防止出现Zlib错误
                .end(function(res) {
                    var start = res.text.indexOf("window.wx =")
                    var end = res.text.indexOf("path:")

                    var indexHead = res.text.indexOf('wx.cgiData =');
                    indexHead = res.text.indexOf('list :', indexHead);
                    var indexTail = res.text.indexOf('.msg_item', indexHead);
                    var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
                    html = html.slice(1, -1);
                    list = JSON.parse(html);
                    //console.log(list.msg_item[0].multi_item);
                    cb();
                });

        }
    ], function() {
        var url = list.msg_item[0].multi_item[position].content_url;

        callback(escape2Html(url));
    });
}

function FormatDate(strTime) {
    var date = new Date(strTime);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

exports.getTodayAdBrush = function(req, res, next) {

    var begin;
    var day = req.query.day;
    var conf = {};

    conf.rows =new Array();

    conf.cols = [
        {caption:'链接', type:'string'},
        {caption:'数量', type:'number'},
        {caption:'学校', type:'string'},
        {caption:'简称', type:'string'},
        {caption:'位置', type:'string'},
    ];

    begin = new Date(new Date().setUTCHours(0, 0, 0, 0));

    var end = begin;

    var adArray = new Array();
    var schoolDic = new Array();
    var schoolFanDic = new Array();

    var proxy = EventProxy.create("ads", "schools", function(ads, school) {


        school.forEach(function(s) {
            schoolDic[s.en_name] = s.cn_name;
            schoolFanDic[s.en_name] = s.fans;
        });

        ads.forEach(function(ad, index) {
            ad.slot.forEach(function(slot) {
                if (slot.date.setUTCHours(0, 0, 0, 0) == begin.getTime()) {
                    adArray.push(slot);
                }
            });
        });

        async.eachSeries(adArray, function(ad, cb) {
            console.log("-------one ad-------");
            console.log(schoolDic[ad.school]);
            console.log(schoolFanDic[ad.school]);
            console.log(ad.position);

            getArticleURL(ad.school, ad.position, function(url){
                console.log(url);
                var amount, fans;

                ad.school=="bnu" ? fans = schoolFanDic[ad.school]+5000 : fans = schoolFanDic[ad.school];

                amount = Math.round(fans * brushRate / 100) * 100;

                amount = amount < 200 ? 200 : amount;

                conf.rows.push([url, amount, schoolDic[ad.school], ad.school, ad.position]);

                cb();
             });

        }, function(err) {
            console.log("-----Exporting---------");

            console.log(conf.rows);
            result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + FormatDate(new Date()) + ".xlsx");
            res.end(result, 'binary');
            console.log("-----Finish---------");
        });
    });

    AD.getAdByTime(begin, end, {}, function(err, ads) {

        proxy.emit('ads', ads);
    });

    School.getSchoolsByQuery({}, {}, proxy.done("schools"));

}
