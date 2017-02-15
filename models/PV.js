/**
 * Created by yiweiguo on 2017/2/8.
 */
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var PVSchema=new Schema({
    school:{type:String},
    date_at:{type:Date, default: Date.now},
    url:{type:String},
    count:{type:Number},
    title:{type:String}
});

mongoose.model('PV',PVSchema);
