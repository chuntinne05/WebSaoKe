const NodeCache = require("node-cache");
const Fuse = require("fuse.js");

class SearchEngine {
	constructor() {
		this.rawData = [];
		this.searchIndex = null;
		this.cache = new NodeCache({
			stdTTL: 1200,
			checkperiod: 600,
			maxKeys: 10000,
			useClones: false,
		});
	}

	async loadData(data) {
		this.rawData = data;
		await this.buildSearchIndex(data);
	}

	async buildSearchIndex(data) {
		return new Promise((resolve) => {
			const processedData = data.map((row) => ({
				...row,
				searchableContent: this.createSearchableContent(row),
			}));

			this.searchIndex = new Fuse(processedData, {
				keys: ["searchableContent"],
				threshold: 0.0, // chinh xac tuyet doi
				distance: 10,
				ignoreLocation: true,
				useExtendedSearch: false,
			});
			resolve();
		});
	}

	createSearchableContent(row) {
		const searchParts = [
			row.detail || "",
			row.credit ? row.credit.toString() : "",
			row.debit ? row.debit.toString() : "",
			row.date_time ? row.date_time.split("_")[0] : "",
		];
		return searchParts.join(" ").toLowerCase();
	}

	search({ content, page = 1, pageSize = 10 }) {
		console.time("searchTime");

		const cacheKey = `${content || ""}-${page}`;
		if (this.cache.has(cacheKey)) {
			console.timeEnd("searchTime");
			return this.cache.get(cacheKey);
		}

		let results = this.rawData;

		if (content) {
			const searchResults = this.searchIndex.search(content);
			results = searchResults.map((result) => result.item);
		}

		const totalResults = results.length;
		const paginatedResults = results.slice(
			(page - 1) * pageSize,
			page * pageSize
		);

		const result = {
			results: paginatedResults,
			totalResults,
			page,
		};

		this.cache.set(cacheKey, result);

		console.timeEnd("searchTime");
		return result;
	}
}

module.exports = SearchEngine;
