const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const app = express();
app.use(express.json());
app.use(morgan("dev"));


// logger created for logs.txt
const logger = (req, res, next) => {
  const start = Date.now();
  const send = res.send;
  
  res.send = function (body) {
    const end = Date.now();
    const duration = end - start;
    const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration} ms - ${Buffer.byteLength(body, 'utf8')} \n`;
    fs.appendFileSync("logs.txt", log);
    send.call(this, body);
  };

  next();
};
app.use(logger);

// welcome
app.get("/", (req, res) => {
  res.send("welcome to the server");
});

// GET users
app.get("/api/users", (req, res) => {
  const result = fs.readFileSync("./db.json", { encoding: "utf-8" });
  const parsed = JSON.parse(result);
  res.status(200).json(parsed.user);
});

// POST users
app.post("/api/users", (req, res) => {
  fs.readFile("./db.json", "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    const database = JSON.parse(data);
    database.user.push(req.body);
    fs.writeFile("./db.json", JSON.stringify(database), "utf8", (error) => {
      if (error) {
        throw error;
      }
      res.status(201).json({msg:"user added successfully"});
    });
  });
});

app.listen(8000, () => {
  console.log("listening port 8000");
});
