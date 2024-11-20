
// <<<<<<< HEAD
const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");
const app = express();
const PORT = 1908;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// =======

/**
 Cách test : 
 bật terminal điều hướng tới file : 
 - cd LTNC
 - nodemon app.js
 - copy  : "http://localhost:1908/search?date=...&amount=...&content=...." (có thể đổi chỗ hoặc bỏ đi các trường tìm kiếm)
 */

 
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
			 csvFilePath:
				 "/KHMT/ComputerScience/WebProgramming/Assignment/WebSaoKe/data/chuyen_khoan.csv",
		 },
	 });
 }

 app.get("/search", (req, res) => {
	 const { date, amount, content, page = 1, pageSize = 40 } = req.query;
 
	 worker.postMessage({
		 type: "search",
		 payLoad: {
			 date,
			 amount: parseInt(amount, 10) || null, //chuyen thanh so nguyen tu he co so 10
			 content,
			 page: parseInt(page, 10), // neu kh co gia tri thi mac dinh page = 1
			 pageSize: parseInt(pageSize, 10), // neu kh co gia tri thi mac dinh pageSize = 20
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
