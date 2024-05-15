const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Events = mongoose.model('Events', dynamicSchema);
module.exports = Events;