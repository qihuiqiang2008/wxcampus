/**
 * Created by yiweiguo on 2017/2/8.
 */
var EventProxy=require('eventproxy');
var pv=require('../proxy/PV');
var sd=require('silly-datetime') //TODO 去掉silly-datetime 依赖

exports.saveOrUpdate=function (req,res,next) {
    console.log('进入PVManage.saveOrUpdate()......')
    var from_school_en_name = req.params.from_school_en_name;
    var date_at=sd.format(new Date(), 'YYYY-MM-DD');
    console.log('school:'+from_school_en_name+',date_at:'+date_at);
    var url=req.originalUrl;
    console.log('req.originalUrl:'+url);
    var type=url.split('/')[3];
    console.log('req.type:'+type);
    pv.getByCondition({school:from_school_en_name,date_at:new Date(date_at),
        title:type},
        function (err,data) {
            if(err){
                console.log(err);
            }
            if(data!=null&&data.length>0){
                //console.log("data.count:"+data[0].count);
                data[0].count++;
                //console.log("data[0].__id:"+data[0]._id);

                pv.updateCount(data[0]._id,data[0].count,function (err,pv) {
                    if(err){
                        console.log(err);
                    }
                    else {
                         console.log("更新后的数据："+pv);
                    }
                })
            }
            else {
                //console.log("查询结果为空，保存新的记录");
                pv.newAndSave(from_school_en_name,date_at,url,1,type,function (err) {
                    if(err){
                        console.log(err);
                    }
                    //console.log('pv save success!!')
                })
            }
    })
    next();
}
