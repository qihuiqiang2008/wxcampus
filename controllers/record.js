var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var Region = require('../proxy').Region;
var PostEx=require('../proxy').PostEx;
async = require('async');
var PV=require('../proxy/PV')

exports.getPostsRecord = function (req, res, next) {
    
    //获取查询的开始时间和结束时间
    var startDate,endDate;
    var create_at;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    if(req.query.endDate != undefined){
        endDate = req.query.endDate;
    }
    console.log("begin:"+new Date(startDate));
    console.log("end:"+new Date(endDate));
    if(startDate!=undefined&&endDate!=undefined){
        create_at={
            "$gt": new Date(startDate),
            "$lt": new Date(endDate)
        }
        console.log("create_at is not null")
    }
    var view = 'back/record/posts';
    var query={}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['create_at', 'asc']
        ]
    };
    page = page > 0 ? page : 1;
    var proxy=EventProxy.create('schools','pages','amounts',
        function (schools,pages) {
            res.render(view,{
                schools:schools,
                pages: pages,
                amounts:JSON.stringify(amounts),
                current_page: page,
            })
    })
    proxy.fail(next);
    //School.getSchoolsByQuery(query,options,proxy.done('schools'));
    var amounts=new Array();
    School.getSchoolsByQuery(query,options,function (err,schools){
        proxy.emit('schools', schools);
        console.log('schools.length'+schools.length);
        async.eachSeries(schools,
            function (school,callback){
                PostEx.countByschool(school,create_at,function (amount) {
                    console.log("amount:"+amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err){
                console.log("表白树洞统计结束......"+amounts[3].total);
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
};

exports.getPvs=function (req, res, next) {
    var startDate,endDate;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    if(req.query.endDate != undefined){
        endDate = req.query.endDate;
    }
    console.log("begin:"+new Date(startDate));
    console.log("end:"+new Date(endDate).setDate(new Date(endDate).getDate()+1));
    var create_at;
    if(startDate!=undefined&&endDate!=undefined){
        create_at={
            "$gt": new Date(startDate),
            "$lt": new Date(endDate).setDate(new Date(endDate).getDate()+1)
        }
        console.log("create_at is not null")
    }

    var view = 'back/record/pvs';

    var query={}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['schools', 'asc']
        ]
    };
    page = page > 0 ? page : 1;

    var proxy=EventProxy.create('schools','pages','amounts',
        function (schools,pages) {
            res.render(view,{
                schools:schools,
                pages: pages,
                amounts:JSON.stringify(amounts),
                current_page: page,
            })
        })
    proxy.fail(next);
    var amounts=[];
    School.getSchoolsByQuery(query,options,function (err,schools){
        proxy.emit('schools', schools);
        console.log('schools.length'+schools.length);
        async.eachSeries(schools,
            function (school,callback){
                PV.countByCondition(school,create_at,function (amount) {
                    console.log("amount:"+amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err){
                console.log("表白树洞PV统计结束......"+amounts[3].total);
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));


}