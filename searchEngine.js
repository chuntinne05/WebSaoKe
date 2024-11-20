const NodeCache = require("node-cache");
const Fuse = require("fuse.js");
// const numCPUs = require("os").cpus().length;

class SearchEngine {
	constructor() {
		this.dateIndex = {};
		this.rawData = [];
		this.searchIndex = null;
		this.cache = new NodeCache({
			stdTTL: 1200,
			checkperiod: 600,
			maxKeys: 10000,
			useClones: false,
		});
	}

	// loadData(data) {
	// 	this.rawData = data;
	// 	this.buildDateIndex(data);
	// 	this.buildSearchIndex(data);
	// }
	async loadData(data) {
		this.rawData = data;
		await this.buildIndices(data);
	}

	async buildIndices(data) {
		// su dung index song song
		const promises = [this.buildDateIndex(data), this.buildSearchIndex(data)];

		// wait de hoan thanh
		return Promise.all(promises);
	}

	async buildDateIndex(data) {
		return new Promise((resolve) => {
			data.forEach((row) => {
				const date = row.date_time?.split("_")[0];
				if (date) {
					if (!this.dateIndex[date]) {
						this.dateIndex[date] = [];
					}
					this.dateIndex[date].push(row);
				}
			});
			resolve();
		});
	}

	async buildSearchIndex(data) {
		return new Promise((resolve) => {
			this.searchIndex = new Fuse(data, {
				keys: [
					{ name: "detail", weight: 2 },
					{ name: "credit", weight: 1 },
					{ name: "debit", weight: 1 },
				],
				threshold: 0.1,
				distance: 50,
				ignoreLocation: true,
				useExtendedSearch: true,
			});
			resolve();
		});
	}

	// buildDateIndex(data) {
	// 	data.forEach((row) => {
	// 		const date = row.date_time?.split("_")[0];
	// 		if (date) {
	// 			if (!this.dateIndex[date]) {
	// 				this.dateIndex[date] = [];
	// 			}
	// 			this.dateIndex[date].push(row);
	// 		}
	// 	});
	// }

	// buildSearchIndex(data) {
	// 	this.searchIndex = new Fuse(data, {
	// 		keys: [
	// 			{ name: "detail", weight: 2 },
	// 			{ name: "credit", weight: 1 },
	// 			{ name: "debit", weight: 1 },
	// 		],
	// 		threshold: 0.1,
	// 		distance: 50,
	// 		ignoreLocation: true,
	// 		useExtendedSearch: true,
	// 	});
	// }

	searchByDate(date) {
		return this.dateIndex[date] || [];
	}

	searchByAmount(amount) {
		if (!amount) return [];
		return this.rawData.filter(
			(row) =>
				(row.credit && row.credit === amount) ||
				(row.debit && row.debit === amount)
		);
	}

	searchByDetail(content) {
		if (!this.searchIndex || !content) return [];
		const results = this.searchIndex.search(content);
		return results.map((result) => result.item);
	}

	conditionalSort(results, { date, amount }) {
		if (date && amount) return results;

		let sortedResults = [...results];

		if (date && !amount) {
			return sortedResults.sort((a, b) => {
				const amountA = (a.credit || 0) + (a.debit || 0);
				const amountB = (b.credit || 0) + (b.debit || 0);
				return amountA - amountB;
			});
		}

		if (amount && !date) {
			return sortedResults.sort((a, b) => {
				const dateA = a.date_time?.split("_")[0] || "";
				const dateB = b.date_time?.split("_")[0] || "";
				return dateA.localeCompare(dateB);
			});
		}

		return results;
	}

	search({ date, amount, content, page = 1, pageSize = 10 }) {
		// console.log("numCPU: ", numCPUs);

		console.time("searchTime");

		const cacheKey = `${date || ""}-${amount || ""}-${content || ""}-${page}`;
		if (this.cache.has(cacheKey)) {
			console.timeEnd("searchTime");
			return this.cache.get(cacheKey);
		}

		let results = this.rawData;

		if (date) {
			const dateResults = this.searchByDate(date);
			results = dateResults;
		}

		if (amount) {
			const amountResults = this.searchByAmount(amount);
			results = results.filter((row) => amountResults.includes(row));
		}

		if (content) {
			const detailResults = this.searchByDetail(content);
			results = results.filter((row) => detailResults.includes(row));
		}

		results = this.conditionalSort(results, { date, amount });

		const totalResults = results.length;
		const paginatedResults = results.slice(
			(page - 1) * pageSize,
			page * pageSize
		);

		const result = {
			results: paginatedResults,
			totalResults,
			page,
			sortedBy: date && !amount ? "amount" : amount && !date ? "date" : "none",
		};

		this.cache.set(cacheKey, result);

		console.timeEnd("searchTime");
		return result;
	}
}

module.exports = SearchEngine;
