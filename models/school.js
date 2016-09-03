var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchoolSchema = new Schema({
  cn_name:{ type: String },
  en_name:{ type: String },
  cn_short_name:{type: String },
  name:{type: String },
  region_code: { type: String },
  student_count:{type: Number, default: 0},
  college_count:{type: Number, default: 0},
  last_edit_at: { type: Date, default: Date.now },
  belong_group:{type: Number, default: 0},
  wx_account_url: {type: String },
  wx_account_name: {type: String },
  wx_account_id: {type: String },
        board:{
        type:{type:String },
        display:{type:Boolean,default:false},
        content:{type:String}
    },
  active: { type: Boolean, default: true },
    admin: { type: String },
  create_at: { type: Date, default: Date.now }
});
mongoose.model('School', SchoolSchema);
