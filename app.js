const http = require("http");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.end("test xem");
});

app.listen(1908, () => {
	console.log("Server is listening on port 1908");
});
