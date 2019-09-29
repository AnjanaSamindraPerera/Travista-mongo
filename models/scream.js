const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const screamSchema = new Schema(
  {
    userHandle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },
    body: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Scream = mongoose.model("Scream", screamSchema);

module.exports = Scream;
