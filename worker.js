const { parentPort } = require("worker_threads");
const Papa = require("papaparse");
const fs = require("fs");
const SearchEngine = require("./searchEngine");

let data = [];
const searchEngine = new SearchEngine();

parentPort.on("message", async (message) => {
	const { type, payLoad } = message; //gan message lam destructive gom type va payLoad

	if (type === "loadData") {
		console.log("Loading data...Please wait 4 system to run!");
		if (payLoad && payLoad.csvFilePath) {
			await loadData(payLoad.csvFilePath);
			console.log("Data loaded successfully");
		} else {
			console.error("csvFilePath is missing in payLoad");
		}
	} else if (type === "search") {
		const results = await searchEngine.search(payLoad);
		parentPort.postMessage({
			type: "searchResults",
			payload: results,
		});
	}
});

async function loadData(csvFilePath) {
	try {
		const csvText = await fs.promises.readFile(csvFilePath, "utf-8");

		Papa.parse(csvText, {
			header: true, // dong dau tien cua file csv se duoc doc la tieu de (dung de tao khoa)
			dynamicTyping: true,// auto chuyen kieu du lieu
			complete: function (results) {
				searchEngine.loadData(results.data);
				parentPort.postMessage({ type: "dataLoaded" });
			},
		});
	} catch (error) {
		console.error("Failed to load data: ", error);
	}
}
