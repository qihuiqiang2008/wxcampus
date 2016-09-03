var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigurationSchema = new Schema({
  type: { type: String,default:"basic" },
  key: { type: String },
  value: { type: String },
  description: { type: String },
  disable: {type: Boolean, default:true},
  create_at: { type: Date, default: Date.now }
});
mongoose.model('Configuration',ConfigurationSchema);
