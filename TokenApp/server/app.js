const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./routes/routes");
const bodyParser = require("body-parser");

app.use(cors({ origin: ["http://localhost:3000"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes);
app.use(bodyParser.json());



app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is working!" });
});

app.get("/user", function (req, res) {
  console.log("/user request called");
  res.send("Welcome to GeeksforGeeks");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
