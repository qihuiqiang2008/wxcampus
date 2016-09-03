var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SchoolEx1Schema = new Schema({
  _id:{type: ObjectId },
  cn_name:{ type: String },
  en_name:{ type: String },
  cn_short_name:{type: String },
  wx_account_name: {type: String },
  wx_account_id: {type: String },
  wx_account_password: {type: String },
  appmsgid: {type: String },
  secret_title: {type: String },
  secret_content: {type: String },
  confess_title: {type: String },
  confess_content: {type: String },
  region_code: { type: String },
  belong_group:{type: Number, default: 0},
  edit_at: { type: Date, default: Date.now },
  create_at: { type: Date, default: Date.now }
});
mongoose.model('SchoolEx1', SchoolEx1Schema);
