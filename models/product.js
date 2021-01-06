const mongoose = require("mongoose");
const productschema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  catogery: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  sorting: {
    type: Number,
  },
});
module.exports = mongoose.model("products", productschema);
