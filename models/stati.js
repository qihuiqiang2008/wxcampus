var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var StatiSchema = new Schema({
  _id:{type: ObjectId },
  cn_name:{ type: String },
  en_name:{ type: String },
  date:{type: String },
  wanancount:{type: Number, default: 0},
  wananrate:{type: Number, default: 0},
  biaobaicount:{type: Number, default: 0},
  biaobairate:{type: Number, default: 0},
  shudongcount:{type: Number, default: 0},
  shudongrate:{type: Number, default: 0},
  yuanfengcount:{type: Number, default: 0},
  yuanfenrate:{type: Number, default: 0},
  ershoucount:{type: Number, default: 0},
  ershourate:{type: Number, default: 0},
  allcount:{type: Number, default: 0},
  create_at: { type: Date, default: Date.now }
});
mongoose.model('Stati', StatiSchema);
