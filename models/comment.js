var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
	_id: { type: ObjectId },
    comment_id: {type: String},
    content: { type: String },
    content_id : { type: String },
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

mongoose.model('Comment', CommentSchema);