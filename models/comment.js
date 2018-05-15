var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var timestamps = require('mongoose-timestamp');

var CommentSchema = new Schema({
	_id: { type: ObjectId },
    school_enname: {type: String},
    article: {type: String},
    audit_status : {type: Boolean, default:false},
    comment_id: {type: String},
    content: { type: String },
    content_id : { type: String, unique: true},
    del_flag: { type: Number },
    
    fake_id : { type: String },

    icon : {type: String},

    id : { type: Number },
    is_elected : { type: Number },
    is_top : { type: Boolean },
    my_id : { type: Number },
    nick_name : { type: String },
    post_time: {type: Date},

    reply : [{content : { type : String}, 
        create_time: { type:Date}, 
    	reply_id : { type : Number},
    	to_uin: {type : Number},
    	uin : {type : Number}}],
    status : { type: String },
    uin : { type: Number }
});

CommentSchema.index({post_time: -1});
//CommentSchema.plugin(timestamps);


mongoose.model('Comment', CommentSchema);