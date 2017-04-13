/**
 * Created by yiweiguo on 2017/2/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleInfoShema = new Schema({
    url:{type:String},
    date_time:{type:Date},
    positon:{type:Number,default:0},
    type:{type:String},
    school:{type:String},
    school_cn_name:{type:String},
    fans:{type:Number,default:0},
    title:{type:String},
    digest:{type:String},
    read_num:{type:Number,default:0},
    like_num:{type:Number,default:0}
})
mongoose.model('ArticleInfo', ArticleInfoShema);