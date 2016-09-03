var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
  content: { type: String },
  type:{type:String},
  from_user:{
      _id:{type: ObjectId },
      sex:{ type: String},
      name:{type: String},
      nicked:{type: Boolean, default: true},
      college_id:{type: ObjectId },
      college_name:{type:String },
      school_id:{type: ObjectId },
      school_name:{type:String },
      school_en_name:{type: String },
      school_short_name:{type:String },
      region_code:{type:String},
      belong_group:{type: Number, default: 0}
  },
  confess_to:{
      name:{type: String},
      grade:{type:String},
      college_id:{type: ObjectId },
      college_name:{type:String },
      school_id:{type: ObjectId },
      school_name:{type:String }
  },
  top:{ type: Boolean, default:false },
  chosen :{ type: Boolean, default:false },
  all_show :{ type: Boolean, default:false },
  like_count: { type: Number, default: 0 },
  down_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  fav_count: { type: Number, default: 0 },
  order_index: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  last_update_type:{type:String},
  last_reply: {type: ObjectId },
  image:{type:String},
  image_from:{type:String},
  display:{type:Boolean,default:true},
  last_reply_at:{type: Date, default: Date.now },
  plus_count: {type:Number, default: 0 },
  plusmsg1:{type:String},
  plusmsg1_create_at:{type: Date, default: Date.now},
  plusmsg2:{type:String},
  plusmsg2_create_at:{type: Date, default: Date.now},
  plusmsg3:{type:String},
  plusmsg3_create_at:{type: Date, default: Date.now},
  replylist:[PostReplySchema]
});

PostSchema.index({create_at: -1});
PostSchema.index({top: -1, last_reply_at: -1});
PostSchema.index({last_reply_at: -1});
PostSchema.index({user_id: 1, create_at: -1});

mongoose.model('Post', PostSchema);


var PostReplySchema = new Schema({
    content:{type: String },
    post:{type: ObjectId, ref: 'Post'},
    post_user_id:{type:ObjectId},
    main_id:{type: ObjectId},
    from_user:{
        _id:{type:ObjectId},
        sex:{ type: String},
        name:{type: String},
        belong_group:{type: Number, default: 0}
    },
    reply:{type:ObjectId ,ref:'PostReply'},
    to_user:{
        _id:{type:ObjectId},
        sex:{ type: String},
        name:{type: String}
    },
    to_user_read:{type: Boolean,default:false},
    create_at: { type: Date, default: Date.now },
    children_list:[PostReplySchema]
});

PostReplySchema.index({post_id: 1});
PostReplySchema.index({from_user_id: 1, create_at: -1});
mongoose.model('PostReply', PostReplySchema);


var PostLikeSchema = new Schema({
    post:{type: ObjectId, ref: 'Post'},
    post_type:{type:String},
    from_user:{type: ObjectId, ref: 'User'},
    from_user_name:{type: String},
    to_user:{type: ObjectId, ref: 'User'},
    to_user_read:{type: Boolean,default:false},
    create_at: { type: Date, default: Date.now }
});
mongoose.model('PostLike', PostLikeSchema);

var PostFavSchema = new Schema({
    post:{type: ObjectId, ref: 'Post'},
    post_type:{type:String},
    from_user:{type: ObjectId, ref: 'User'},
    from_user_name:{type: String},
    to_user:{type: ObjectId, ref: 'User'},
    to_user_read:{type: Boolean,default:false},
    create_at:{ type: Date, default: Date.now}
});

mongoose.model('PostFav', PostFavSchema);




var ConfessInformSchema = new Schema({
    confess:{type: ObjectId, ref: 'Post'},
    user_id:{type: ObjectId},
    status:{type:String},
    create_at:{ type: Date, default: Date.now}
});
mongoose.model('ConfessInform', ConfessInformSchema);

//SecretLikeSchema.index({secret_id: 1});
//SecretLikeSchema.index({user_id: 1, create_at: -1});

