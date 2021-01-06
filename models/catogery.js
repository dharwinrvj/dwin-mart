const mongoose = require("mongoose");
const catogeryschema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  sorting: {
    type: Number,
  },
});
module.exports = mongoose.model("catogeries", catogeryschema);
