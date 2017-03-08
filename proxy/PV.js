var EventProxy=require("eventproxy");
var PV=require("../models").PV;

exports.newAndSave=function (school,date_at,url,count,titile,callback) {
    var  pv=new PV();
    pv.school=school;
    pv.date_at=date_at;
    pv.url=url;
    pv.count=count;
    pv.title=titile;
    pv.save(callback);
}

exports.getByCondition=function (query,callback) {
    PV.find(query,callback);
}

exports.updateCount=function (id,count,callback) {
    PV.update({'_id':id},{'count':count},{},callback)
}

exports.countByCondition=function (school,date_at,callback) {
    var query={};
    if(date_at!=undefined||date_at!=null){
        //if(!typeof (create_at)   ==   "undefined"){
        query.date_at=date_at;
        console.log("create_at is not null 2")
    }

    var amount={};
    amount.en_name=school.en_name;
    async.series([
        function (cb) {
            query.school=school.en_name;
            query.title="confess";
            PV.find(query, function (err,pvs){
                var sum=0;
                pvs.forEach(function (pv,index) {
                    if(pv.count!=undefined){
                        sum=sum+pv.count;
                    }
                })
                amount.confess=sum;
                console.log(school.en_name+"的表白PV数量:"+amount.confess)
                cb();
            })
        },
        function (cb) {
            query.school=school.en_name;
            query.title="shudong";
            PV.find(query, function (err,pvs){
                var sum=0;
                pvs.forEach(function (pv,index) {
                    if(pv.count!=undefined){
                        sum=sum+pv.count;
                    }
                })
                amount.shudong=sum;
                console.log(school.en_name+"的树洞PV数量:"+amount.confess)
                cb();
            })
        },
        function (cb) {
            query.school=school.en_name;
            delete query.title;
            PV.find(query, function (err,pvs){
                var sum=0;
                pvs.forEach(function (pv,index) {
                    if(pv.count!=undefined){
                        sum=sum+pv.count;
                    }
                })
                amount.total=sum;
                console.log(school.en_name+"的所有PV数量:"+amount.confess)
                cb();
            })
        },
        function (cb) {
            //cb();
            callback(amount);
        }

    ])
}