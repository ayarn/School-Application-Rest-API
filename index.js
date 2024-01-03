const express = require("express");

const app = express();
const PORT = 8000;

// Connect to Database
const DatabaseConnection = require("./database/connect");
DatabaseConnection();

// Middleware
app.use(express.json());

// All Routes
const routes = require("./api/routes");
app.use("/", routes);

// Listen on PORT
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
