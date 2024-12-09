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
				// keys: ["searchableContent"],
				keys: [
					"detail",
					"credit",
					"debit",
					"date_time", 
				],
				threshold: 0.0, // chinh xac tuyet doi
				distance: 10,
				ignoreLocation: true,
				useExtendedSearch: false,
			});
			resolve();
		});
	}

	createSearchableContent(row) {
		const date = row.date_time ? row.date_time.split("_")[0] : "";
		const searchParts = [
			row.detail || "",
			row.credit ? row.credit.toString() : "",
			row.debit ? row.debit.toString() : "",
			date,
		];
		const searchable = searchParts.join(" ").toLowerCase();
		return searchable;
	}

	sortByDate(results) {
		return results.sort((a, b) => {
			const dateA = a.date_time ? a.date_time.split("_")[0] : "";
			const dateB = b.date_time ? b.date_time.split("_")[0] : "";

			return new Date(dateA) - new Date(dateB);
		});
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
			console.log(
				`Found ${searchResults.length} results for query "${content}"`
			);
			results = searchResults.map((result) => result.item);
		}

		results = this.sortByDate(results);

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
