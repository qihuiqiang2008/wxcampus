var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var CollegeSchema = new Schema({
  name:{ type: String },
  student_count: { type: Number, default: 0},
  school_id: { type: ObjectId },
  create_at:{ type: Date, default: Date.now }

});
mongoose.model('College', CollegeSchema);
