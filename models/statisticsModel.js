const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  realtime: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Statistics = mongoose.model('Statistics', dynamicSchema);
module.exports = Statistics;