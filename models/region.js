var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegionSchema = new Schema({
  name: { type: String },
  region_code: { type: String },
  school_count:{type: Number, default: 0},
  college_count:{type: Number, default: 0},
  student_count:{type: Number, default: 0},
  belong_group:{type: Number, default: 0},
  create_at: { type: Date, default: Date.now }
});
mongoose.model('Region',RegionSchema);
