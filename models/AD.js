var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ADSchema = new Schema({
  name:{ type:String},
  slot:[{school:{type: String}, date:{type:Date}, position:{type:String}}],
  custom:{type:String},
  discount:{type:Number},
  price:{type:Number},
  sponsor: {type:String},
  is_clear:{type:Boolean},
  remark:{type:String},
  create_at: { type: Date, default: Date.now }
});
mongoose.model('AD', ADSchema);
