/**
 * Created by yiweiguo on 2017/2/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleInfoShema = new Schema({
    url:{type:String},
    date_time:{type:Date},
    positon:{type:Number},
    type:{type:String},
    school:{type:String},
    school_cn_name:{type:String},
    fans:{type:Number},
    title:{type:String},
    read_num:{type:Number},
    like_num:{type:Number}
})
mongoose.model('ArticleInfo', ArticleInfoShema);