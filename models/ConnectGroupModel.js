const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imgURL: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2014/05/22/22/05/photo-351528_1280.jpg",
  },
  connectGroups: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }
});

module.exports = mongoose.model("ConnectGroup", connectGroupSchema);
