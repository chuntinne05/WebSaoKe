const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");
const app = express();
const PORT = 1908;
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let worker;

function loadWorker() {
	worker = new Worker(path.resolve(__dirname, "worker.js"));
	worker.on("message", (message) => {
		if (message.type === "dataLoaded") {
			console.log("Data has been loaded successfully.");
		} else if (message.type === "searchResults") {
			console.log("Search results received:", message.payload);
		}
	});

	worker.on("error", (error) => {
		console.error("Worker error:", error);
	});

	worker.on("exit", (code) => {
		if (code !== 0) {
			console.error("Worker exited with code:", code);
		}
	});

	worker.postMessage({
		type: "loadData",
		payLoad: {
			csvFilePath: "data/chuyen_khoan.csv",
		},
	});
}

app.get("/search", (req, res) => {
	const { content, page = 1, pageSize = 40 } = req.query;

	worker.postMessage({
		type: "search",
		payLoad: {
			content,
			page: parseInt(page, 10),
			pageSize: parseInt(pageSize, 10),
		},
	});

	worker.once("message", (message) => {
		if (message.type === "searchResults") {
			console.log("Search result:", message.payload);
			res.json(message.payload);
		}
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	loadWorker();
});
