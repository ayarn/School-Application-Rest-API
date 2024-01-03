const mongoose = require("mongoose");
const uri = "mongodb+srv://ayarn:ayarn@schooldb.rqacs96.mongodb.net/SchoolDB?retryWrites=true&w=majority";

const DatabaseConnection = async () => {
  try {
    await mongoose.connect(uri);
    console.log("DB Connected ✅");
  } catch (err) {
    console.log(err);
  }
};

module.exports = DatabaseConnection;
