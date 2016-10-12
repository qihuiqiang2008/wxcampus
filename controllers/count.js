var request = require("superagent");
var login = require( __dirname + '/../wx_helpers/login');
var nodeExcel = require('excel-export');
var wxList = require(__dirname + '/../config/config');
var async = require('async');
var SchoolEx = require('../proxy').SchoolEx;
exports.count_number1 = function(req, res, next){
    var conf ={};
    conf.cols = [
        {caption:'string', type:'string'},
        {caption:'date', type:'date'},
        {caption:'bool', type:'bool'},
        {caption:'number', type:'number'}
    ];
    conf.rows =new Array();
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

function getRegion(region){
    if(region=="010"){
        return "北京";
    }
    if(region=="022"){
        return "天津";
    }
    if(region=="027"){
        return "武汉";
    }
    if(region=="0951"){
        return "银川";
    }
    if(region=="029"){
        return "西安";
    }
    if(region=="021"){
        return "上海";
    }
    if(region=="025"){
        return "南京";
    }
  return "其他"
}


function getPrice(number,region){
    if(region=="010"){
        return  Math.floor(number*0.05);
    }
    return  Math.floor(number*0.05 );
}

exports.count_number = function(req, res, next){
    var item;
    var totalNumber = 0;
    var result;
    var conf ={};
    conf.rows =new Array();
    conf.cols = [
        {caption:'地区', type:'string'},
        {caption:'学校', type:'string'},
        {caption:'账号名称', type:'string'},
        {caption:'账号ID', type:'string'},
        {caption:'人数', type:'number'},
        {caption:'报价', type:'number'}
    ];

    var region_code = req.query.region_code || "";
   // console.log(region_code);
    var query={};
    if(!region_code){
        if(req.session.user.email!=='admin@admin.com')
        {
            query ={'belong_group':req.session.user.location.belong_group};
        }
        //query={};
    }else
    {
        if(req.session.user.email!=='admin@admin.com')
        {
        query ={'belong_group':req.session.user.location.belong_group,region_code: region_code};
        }else {
            query = {region_code: region_code}
        }
    }



    var sort = [
        [ 'region_code', 'desc' ]
    ];
    var options = { sort: sort};

    SchoolEx.getSchoolExsByQuery(query, options, function(err,schools){
        console.log("..................")
        var all=0;

        schools.forEach(function (item, i) {
            if(item.fans){
               // console.log(getRegion(item.region_code))
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
               // totalNumber=totalNumber+item.fans
                if(item.en_name=="bnu"){
                    item.fans=item.fans+5000;
                }
                conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
                totalNumber=totalNumber+item.fans;
            }else{
            }
        })
        console.log("..................")
/*

        schools.forEach(function (item, i) {
            if(item.fans){
                console.log(item.cn_name)
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                // totalNumber=totalNumber+item.fans
                // conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })
        console.log("..................")

        schools.forEach(function (item, i) {
            if(item.fans){
                console.log(item.wx_account_name)
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                // totalNumber=totalNumber+item.fans
                // conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })



        console.log("..................")
        schools.forEach(function (item, i) {
            if(item.fans){
                console.log(item.wx_account_id)
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                // totalNumber=totalNumber+item.fans
                // conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })




        console.log("..................")

        schools.forEach(function (item, i) {
            if(item.fans){
                console.log(item.fans)
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                // totalNumber=totalNumber+item.fans
                // conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })



        console.log("..................")
        schools.forEach(function (item, i) {
            if(item.fans){
                totalNumber=totalNumber+item.fans
                console.log(getPrice(item.fans,item.region_code))
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                // totalNumber=totalNumber+item.fans
                // conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })*/


     /*   schools.forEach(function (item, i) {
            if(item.fans){
                console.log(getRegion(item.region_code))
                //+":"+item.fans+":"+getPrice(item.fans,item.region_code)
                totalNumber=totalNumber+item.fans
                conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,item.fans,getPrice(item.fans,item.region_code)]);
            }else{
            }
        })*/

        result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename="+FormatDate(new Date())+"welife-"+totalNumber+".xlsx");
        res.end(result, 'binary');


                 /*login(item, function(err, results) {
                     /!* if (results) {
                      req.session.is_login = results;
                      }*!/
                     if (err) {
                         res.json(err);
                     }

                     request.get('https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token='+results.token) //获取人数
                         .set('Cookie', results.cookie)
                         .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
                         .end(function(res) {
                             var html, indexHead, indexTail, number, numberString;

                             indexHead = res.text.indexOf('li class="index_tap_item total_fans extra"'); //定位到html含有人数的位置
                             indexTail = res.text.indexOf('</li>', indexHead);
                             html = res.text.slice(indexHead - 1, indexTail + '</li>'.length);  //截取部分html
                             indexHead = html.indexOf('<em class="number">') + '<em class="number">'.length; //从里面继续截取含有人数的字符串
                             numberString = html.slice(indexHead);
                             number = parseInt(numberString);
                             console.log( item.region_code /!*item.cn_name+":"+item.wx_account_name+":"+item.wx_account_id+":" + ":" + number*!/);
                             totalNumber += number;
                             /!*conf.cols = [
                                 {caption:'地区', type:'string'},
                                 {caption:'学校', type:'string'},
                                 {caption:'账号名称', type:'string'},
                                 {caption:'账号ID', type:'string'},
                                 {caption:'人数', type:'number'},
                                 {caption:'报价', type:'number'}
                             ];*!/
                             if(item.region_code!="111"){
                                 conf.rows.push([getRegion(item.region_code), item.cn_name, item.wx_account_name, item.wx_account_id,number,getPrice(number,item.region_code)]);

                             }
                            /!* conf.rows[]*!/
                             callback();
     //                        var cookie = '';
     //                        if (res.header['set-cookie']) {
     //                            _ref = res.header['set-cookie'];
     //                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
     //                                rs = _ref[_i];
     //                                cookie += rs.replace(/HttpOnly/g, '');
     //                            }
     //                        }
     //                        request.get('https://mp.weixin.qq.com/misc/pluginloginpage?action=stat_article_detail&pluginid=luopan&t=statistics/index&token=' + results.token + '&lang=zh_CN')//请求图文分析地址
     //                            .set('Cookie', cookie)
     //                            .set({"Accept-Encoding" : "gzip,sdch"})
     //                            .end(function(res){
     //                                indexHead = res.text.indexOf('cgiData'); //定位到html含有下次请求参数的位置
     //                                indexTail = res.text.indexOf('seajs.use("statistics/index");', indexHead);
     //                                var jsonString = res.text.slice(indexHead , indexTail);  //截取json
     //                                var cgiData;
     //                                eval(jsonString); //将json转换为对象
     //
     //                                //请求图文分析页中的框架的地址
     //                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //克服 UNABLE_TO_VERIFY_LEAF_SIGNATURE 错误，对端服务器证书不正确。另一种解决之道是从中间服务器下载正确的证书？
     //                                request.get('https://mta.qq.com/mta/wechat/ctr_article_detail?appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&devtype=' + cgiData.devtype + '&jsurl=' + cgiData.jsurl + '&version=2')
     //                                    .set('Cookie', cookie)
     //                                    .set({"Accept-Encoding" : "gzip,sdch"})
     //                                    .end(function(res){
     //                                        cookie = ''; //此次请求的主要目的是获取cookie以及获取initParam，其中包含日期
     //                                        if (res.header['set-cookie']) {
     //                                            _ref = res.header['set-cookie'];
     //                                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
     //                                                rs = _ref[_i];
     //                                                cookie += rs.replace(/HttpOnly/g, '');
     //                                            }
     //                                        }
     //
     //                                        indexHead = res.text.indexOf('var initParams =');
     //                                        indexTail = res.text.indexOf('MTA.Page.init_params = initParams;'); // 截取HTML页面中js脚本中关于initParams的定义
     //                                        var jsonString = res.text.slice(indexHead, indexTail);
     //                                        eval(jsonString);  //initParams定义+赋值
     //                                        //请求文章详情的json串的地址
     //                                        request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=1&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd='+ (+new Date())+'&ajax=1')
     //                                            .set('Cookie', cookie)
     //                                            .set({"Accept-Encoding" : "gzip,sdch"})
     //                                            .end(function(res){
     //                                                var articalData = JSON.parse(res.text);
     //                                                console.log(articalData.data);
     //
     ////                                                request.get('https://mta.qq.com/mta/wechat/ctr_article_detail/get_list?sort=RefDate%20desc&keyword=&page=2&appid=' + cgiData.appid + '&pluginid=luopan&token=' + cgiData.pluginToken + '&from=&devtype=' + cgiData.devtype + '&time_type=day&start_date=' + initParams.start_date + '&end_date=' + initParams.end_date + '&need_compare=0&app_id=&rnd='+ (+new Date())+'&ajax=1')
     ////                                                    .set('Cookie', cookie)
     ////                                                    .set({"Accept-Encoding" : "gzip,sdch"})
     ////                                                    .end(function(res){
     ////                                                        articalData = JSON.parse(res.text);
     ////                                                        console.log(articalData.data);
     ////                                                    });
     //
     //                                                callback();
     //                                            });
     //
     //                                    });
     //                            });
                         });
                 })*/
//            console.log("-----");

	});




    }
function FormatDate (strTime) {
    var date = new Date(strTime);
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
}

function getString(number){
   return "账号整体情况：1.总人数"+number+"万，覆盖天津 北京 上海 西安 南京 银川 武汉的大部分高校  2.每天收到的表白数量在4000条左右，树洞数量在1000条左右3.账号活跃度在同类账号中算是比较高的4.上面的人数都是实事求是，如果觉的有问题可以截图收费情况：1.上面表格中的价格都是头条的价格，北京地区的是每1000人50块（原来是40块，最近因为广告比较多，所以涨了10块），其他地区都是每1000人40块2.如果是发次条广告，价格是头条的60%（推荐这种方式，如果每天头条是广告的话，基本很少人点我们的公众号）3.就是在表白中加入广告块，这种方式价格也是头条的60%，广告块内容不能太多4.关键字和菜单的合作方式，这种可以具体详谈其他：1.阅读是多少就是多少，我们绝对不会去刷阅读2.广告的内容不能有诱导分享或者诱导关注之类的，"
}