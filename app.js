const http = require("http");
const express = require("express");
const app = express();
const port=8080;
const bodyParser = require("body-parser");

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.end("test xem");
});

app.listen(port, () => {
	console.log(`Sever is running at http://localhost:${port}`);
});
