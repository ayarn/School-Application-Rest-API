const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      studentName: {
        type: String,
      },
    },
  ],
});

const Class = mongoose.model("Class", ClassSchema);

module.exports = Class;
