var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config').config;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  wgateid:{type: String},
  name: { type: String},
  sex:{type:String},
  pass: { type: String },
  email: { type: String},
  is_block: {type: Boolean, default: false},
  is_admin: {type: Boolean, default: false},
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  confess_count:{type:Number, default:0},
  fav_count:{type:Number, default:0},
  like_count:{type:Number, default:0},
  post_count:{type:Number, default:0},
  secret_count:{type:Number,default:0},
  message_count:{type:Number,default:0},
  friend_board_count:{type:Number,default:0},
  trade_board_count:{type:Number,default:0},
  location:{
      region_code:{type:String},
      school_id:{type: ObjectId },
      school_short_name:{type:String },
      school_en_name:{type:String },
      school_name:{type:String },
      college_id:{type: ObjectId },
      college_name:{type:String },
      grade:{type:String},
      belong_group:{type: Number, default: 0}
  }
});

UserSchema.virtual('avatar_url').get(function () {
  var url = this.profile_image_url || this.avatar || config.site_static_host + '/public/images/user_icon&48.png';
  return url.replace('http://www.gravatar.com/', 'http://cnodegravatar.u.qiniudn.com/');
});

UserSchema.index({name: 1});
UserSchema.index({email: 1}, {unique: true});
mongoose.model('User', UserSchema);
