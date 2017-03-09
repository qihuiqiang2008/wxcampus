var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var nodeExcel = require('excel-export');
var wxList = require(__dirname + '/../config/config');
var async = require('async');
var SchoolEx = require('../proxy').SchoolEx;
var price = require('./price');
var EventProxy = require('eventproxy');
var Configuration = require('../proxy').Configuration;

exports.count_number1 = function(req, res, next) {
    var conf = {};
    conf.cols = [
        { caption: 'string', type: 'string' },
        { caption: 'date', type: 'date' },
        { caption: 'bool', type: 'bool' },
        { caption: 'number', type: 'number' }
    ];
    conf.rows = new Array();
    conf.rows.push(['pi', (new Date(2013, 4, 1)).getJulian(), true, 3.14]);
    conf.rows.push(['pi', (new Date(2013, 4, 1)).getJulian(), true, 3.14]);
    /* [
        ['pi', (new Date(2013, 4, 1)).getJulian(), true, 3.14],
        ["e", (new Date(2012, 4, 1)).getJulian(), false, 2.7182]
    ];*/
    conf.rows.push([getString(1000)])
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
}

function getRegion(region) {
    if (region == "010") {
        return "北京";
    }
    if (region == "022") {
        return "天津";
    }
    if (region == "027") {
        return "武汉";
    }
    if (region == "0951") {
        return "银川";
    }
    if (region == "029") {
        return "西安";
    }
    if (region == "021") {
        return "上海";
    }
    if (region == "025") {
        return "南京";
    }
    return "其他"
}


function getPrice(number, region) {

    return Math.floor(number * 0.05);
}

exports.count_number = function(req, res, next) {
    var item;
    var totalNumber = 0;
    var result;
    var conf = {};
    conf.rows = new Array();
    conf.cols = [
        //{ caption: '地区', type: 'string' },
        { caption: '学校', type: 'string' },
        { caption: '账号名称', type: 'string' },
        { caption: '账号ID', type: 'string' },
        { caption: '人数', type: 'number' },
        { caption: '报价', type: 'number' }
    ];

    console.log();

    var region_code = req.query.region_code || "";
    // console.log(region_code);
    var query = {};
    if (!region_code) {
        /*if(req.session.user.email!=='admin@admin.com')
        {
            query ={'belong_group':req.session.user.location.belong_group};
        }*/
        //query={};
    } else {
        /*if(req.session.user.email!=='admin@admin.com')
        {
        query ={'belong_group':req.session.user.location.belong_group,region_code: region_code};
        }else {
            query = {region_code: region_code}
        }*/
    }

    console.log("开始生成总价单...");

    var sort = [
        ['region_code', 'desc']
    ];
    var options = { sort: sort };

    var proxy = EventProxy.create('schools', "price_per_fans", "min_price", "price_step",
        function(schools, price_per_fans, min_price, price_step) {
            var all = 0;
            console.log("开始构造文件...");

            price_per_fans = parseFloat(price_per_fans.value);
            min_price = parseInt(min_price.value);
            price_step = parseInt(price_step.value);

            schools.forEach(function(item, i) {
                if (item.fans) {
                    // console.log(getRegion(item.region_code))
                    //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                    // totalNumber=totalNumber+item.fans
                    if (item.en_name == "bnu") {
                        item.fans = item.fans + 5000;
                    }

                    if(item.en_name == "bj" || item.en_name == "sh" || item.en_name == "xa")
                        return;

                    conf.rows.push([
                        //getRegion(item.region_code), 
                        item.cn_name, 
                        item.wx_account_name, 
                        item.wx_account_id, 
                        item.fans, 
                        price.priceRule(item.fans, price_per_fans, price_step, min_price)]);
                    totalNumber = totalNumber + item.fans;
                } else {}
                
            })
            console.log("..................")


            result = nodeExcel.execute(conf);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader("Content-Disposition", "attachment; filename=" + FormatDate(new Date()) + "welife-" + totalNumber + ".xlsx");
            res.end(result, 'binary');
        });

    SchoolEx.getSchoolExsByQueryAndField(query, 
        {"region_code" : 1, 
        "cn_name": 1, 
        "wx_account_id" : 1,
        "wx_account_name" : 1,
        "fans" : 1, 
        "en_name": 1}, 
        options, proxy.done("schools"));

    Configuration.getConfigurationByCode("price_per_fans", proxy.done("price_per_fans"));
    Configuration.getConfigurationByCode("min_price", proxy.done("min_price"));

    Configuration.getConfigurationByCode("price_step", proxy.done("price_step"));
}

function FormatDate(strTime) {
    var date = new Date(strTime);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

function getString(number) {
    return "账号整体情况：1.总人数" + number + "万，覆盖天津 北京 上海 西安 南京 银川 武汉的大部分高校  2.每天收到的表白数量在4000条左右，树洞数量在1000条左右3.账号活跃度在同类账号中算是比较高的4.上面的人数都是实事求是，如果觉的有问题可以后台截图：1.报价都是头条一次推送价格，报价方式是按照粉丝关注数量，每1000人50块 2.如果是发次条广告，价格是头条的60%（推荐这种方式，如果连续每天头条广告，会影响整体阅读）3.在表白中插入广告，价格是头条价格40%，广告内容纯文字且字数在140字以内（也可在表白下放插入少量图文信息） 4.关键字和菜单的合作方式，这种可以具体详谈其他：1.阅读是多少就是多少，我们绝对不会去刷阅读2.广告的内容不能有诱导分享或者诱导关注嫌疑"
}
