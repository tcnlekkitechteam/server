const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imgURL: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2014/05/22/22/05/photo-351528_1280.jpg",
  },
});

module.exports = mongoose.model("Department", departmentSchema);
