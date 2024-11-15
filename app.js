const http = require("http");
const express = require("express");
const app = express();
const fs= require("fs");
const port =8080;
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.end("test xem");
});

app.listen(port, () => {
	console.log(`Sever is running at htttp://localhost:${port}`);
});
