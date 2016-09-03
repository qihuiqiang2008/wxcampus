var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var random = require('mongoose-random');
var PostExSchema = new Schema({
  type:{type:String},
  title:{ type: String },
  name:{ type: String },
  content0:{ type: String },
  content1:{ type: String },
  content2:{ type: String },
  content3:{ type: String },
  content4:{ type: String },
  content5:{ type: String },
  content6:{ type: String },
  image:{type:String},
    wx_photo_url:{type:String},

  image_from:{type:String},
  from_school_cn_name:{type:String},
  from_school_en_name:{type:String},
  sensitive:{type:Boolean,default:false},
  word_less:{type:Boolean,default:false},
  common:{type:Boolean,default:false},
  update:{type:Boolean,default:false},
  display:{type:Boolean,default:true},
  create_at:{type: Date, default: Date.now },
});

PostExSchema.index({create_at: -1});
PostExSchema.plugin(random);
mongoose.model('PostEx', PostExSchema);


//SecretLikeSchema.index({secret_id: 1});
//SecretLikeSchema.index({user_id: 1, create_at: -1});

