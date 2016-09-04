var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SchoolExSchema = new Schema({
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
    photo_guess_title: {type: String },
    photo_guess_content: {type: String },
    ershou_title: {type: String },
    ershou_content: {type: String },
    topic_title: {type: String },
   topic_content: {type: String },
  region_code: { type: String },
    erweima: { type: String },
    token: { type: String },
    cookie: { type: String },
    admin: { type: String },
  wxacount: { type: String },
    mail: { type: String },
    friend_title: {type: String },
    friend_content: {type: String },
    info_title: {type: String },
    info_content: {type: String },
    zipai_title: {type: String },
    zipai_content: {type: String },
  belong_group:{type: Number, default: 0},
  edit_at: { type: Date, default: Date.now },
  create_at: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});
mongoose.model('SchoolEx', SchoolExSchema);
