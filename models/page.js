const mongoose = require("mongoose");
const pageschema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sorting: {
    type: Number,
  },
});
module.exports = mongoose.model("pages", pageschema);
