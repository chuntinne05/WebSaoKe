const NodeCache = require("node-cache");
class SearchEngine {
	constructor() {
		this.dateIndex = {}; // dung hash map
		this.creditArray = []; // mang credit da sap xep
		// => dung binary search tree
		this.debitArray = []; // mang debit da sap xep
		this.detailIndex = {}; // dung inverted index
		this.rawData = [];
		// this.cache = new Map();
		this.cache = new NodeCache({
			stdTTL: 600, // 10 phút cache
			checkperiod: 120, // Kiểm tra expired items mỗi 2 phút
			maxKeys: 1000, // Giới hạn số lượng cache keys
		});
	}

	// quickSort(array, low = 0, high = array.length - 1, key) {
	// 	if (low < high) {
	// 		const pivotIndex = this.partition(array, low, high, key);
	// 		this.quickSort(array, low, pivotIndex - 1, key);
	// 		this.quickSort(array, pivotIndex + 1, high, key);
	// 	}
	// }

	// partition(array, low, high, key) {
	// 	const pivot = array[high][key] || 0;
	// 	let i = low - 1;
	// 	for (let j = low; j < high; j++) {
	// 		if ((array[j][key] || 0) <= pivot) {
	// 			i++;
	// 			[array[i], array[j]] = [array[j], array[i]];
	// 		}
	// 	}
	// 	[array[i + 1], array[high]] = [array[high], array[i + 1]];
	// 	return i + 1;
	// }

	// Bat dau load du lieu .....
	// loadData(data) {
	// 	this.rawData = data;

	// 	// dat index cho tung du lieu
	// 	data.forEach((row) => {
	// 		const date = row.date_time?.split("_")[0]; // tach ngay voi thoi gian qua dau "_" (10/09/2024_5242.70362)
	// 		if (date) {
	// 			// Neu co chua thong tin ngay
	// 			if (!this.dateIndex[date]) {
	// 				this.dateIndex[date] = []; // tao 1 mang rong neu chua co ngay nao
	// 			}
	// 			this.dateIndex[date].push(row);
	// 		}

	// 		/*
	// 		vi du : const data = [
	// 			{date_time : "10/09/2024_12345", detail : "noi dung 1"},
	// 			{date_time : "11/09/2024_12345", detail : "noi dung 2"},
	// 			{date_time : "10/09/2024_12345", detail : "noi dung 3"}
	// 		];
	// 		=> date_index chua :
	// 		{
	// 			"10/09/2024" : [
	// 				{date_time : "10/09/2024_12345", detail : "noi dung 1"},
	// 				{date_time : "10/09/2024_12345", detail : "noi dung 3"}
	// 			],
	// 			"11/09/2024" : [
	// 				{date_time : "11/09/2024_12345", detail : "noi dung 2"}
	// 			]
	// 		}
	// 		*/

	// 		// neu co nhap so tien
	// 		if (row.credit) {
	// 			this.creditArray.push(row); //push credit vao mang creditArray
	// 		}
	// 		if (row.debit) {
	// 			this.debitArray.push(row); //push debit vao mang debitArray
	// 		}

	// 		// neu co nhap noi dung
	// 		// row.detail : chuoi chua noi dung
	// 		// split(/\W+/) : phan tach tai cac ki tu khong phai chu cai, so hoac dau gach duoi ("_")
	// 		const words = row.detail?.toLowerCase().split(/\W+/) || []; // phan tach chuoi row.detail -> cac tu don le ( neu row undefined thi tra ve mang rong)

	// 		// detailIndex : inverted index (luu cac row theo tung tu khoa)
	// 		words.forEach((word) => {
	// 			if (!this.detailIndex[word]) {
	// 				// kiem tra xem word ton tai trong detailIndex chua
	// 				this.detailIndex[word] = [];
	// 			}
	// 			this.detailIndex[word].push(row);
	// 		});

	// 		/*
	// 		vi du : const data = [
	// 					{ detail: "Lap trinh nang cao #12345" },
	// 					{ detail: "Lap trinh web #54321" }
	// 				];

	// 			detailIndex :
	// 				{
	// 					"lap": [
	// 						{ detail: "Lap trinh nang cao #12345" },
	// 						{ detail: "Lap trinh web #54321" }
	// 					],
	// 					"trinh": [
	// 						{ detail: "Lap trinh nang cao #12345" },
	// 						{ detail: "Lap trinh web #54321" }
	// 					],
	// 					"nang": [{ detail: "Lap trinh nang cao #12345" }],
	// 					"cao": [{ detail: "Lap trinh nang cao #12345" }],
	// 					"web": [{ detail: "Lap trinh web #54321" }],
	// 					"12345": [{ detail: "Lap trinh nang cao #12345" }],
	// 					"54321": [{ detail: "Lap trinh web #54321" }]
	// 				}
	// 		 */
	// 	});
	// 	if (this.creditArray.length < 1000)
	// 	{
	// 		this.quickSort(this.creditArray, 0, this.creditArray.length - 1, "credit");
	// 	}
	// 	else
	// 	{
	// 		this.creditArray.sort((a, b) => (a.credit || 0) - (b.credit || 0));
	// 	}

	// 	if (this.debitArray.length < 1000)
	// 	{
	// 		this.quickSort(this.debitArray, 0, this.debitArray.length - 1, "debit");
	// 	}
	// 	else
	// 	{
	// 		this.debitArray.sort((a, b) => (a.debit || 0) - (b.debit || 0));
	// 	}
	// }
	// ket thuc load du lieu

	// ***************************************************************

	// batch processing

	loadData(data) {
		this.rawData = data;

		data.forEach((row) => {
			const date = row.date_time?.split("_")[0];
			if (date) {
				if (!this.dateIndex[date]) {
					this.dateIndex[date] = [];
				}
				this.dateIndex[date].push(row);
			}
		});

		const creditBatch = [];
		const debitBatch = [];
		data.forEach((row) => {
			if (row.credit) {
				creditBatch.push(row);
			}
			if (row.debit) {
				debitBatch.push(row);
			}
		});

		this.creditArray = this.sortWithBatch(creditBatch, "credit");
		this.debitArray = this.sortWithBatch(debitBatch, "debit");

		const detailBatch = {};
		data.forEach((row) => {
			const words = row.detail?.toLowerCase().split(/\W+/) || [];
			words.forEach((word) => {
				if (!detailBatch[word]) {
					detailBatch[word] = [];
				}
				detailBatch[word].push(row);
			});
		});
		this.detailIndex = detailBatch;
	}

	quickSort(array, key) {
		if (array.length <= 1) {
			return array;
		}
		// chon pivot la middle index
		const pivotIndex = Math.floor(array.length / 2);
		const pivot = array[pivotIndex][key] || 0;

		// chia mang thanh 2 phan
		const left = []; // < pivot
		const right = []; // > pivot
		const equal = []; // = pivot

		array.forEach((item) => {
			const value = item[key] || 0;
			if (value < pivot) {
				left.push(item);
			} else if (value > pivot) {
				right.push(item);
			} else {
				equal.push(item);
			}
		});

		return [...quickSort(left, key), ...equal, ...quickSort(right, key)];
	}

	// batch sorting
	sortWithBatch(array, key) {
		const batchSize = 1000;
		if (array.length <= batchSize) {
			return this.quickSort(array, key);
		} else {
			return array.sort((a, b) => (a[key] || 0) - (b[key] || 0));
		}
	}
	// ***************************************************************

	// ham binary search
	binarySearch(array, amount) {
		let left = 0;
		let right = array.length - 1;
		while (left <= right) {
			const mid = Math.floor((left + right) / 2);
			const value = array[mid].credit || 0;
			if (value === amount) {
				return mid;
			} else if (value < amount) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}
		return -1;
	}

	// ham tim kiem theo date
	searchByDate(date) {
		return this.dateIndex[date] || [];
	}

	// ham tim kiem theo so tien
	searchByAmount(amount) {
		const results = new Set(); // luu tru cac ptu duy nhat

		// Tim credit = binary search tree
		const creditIndex = this.binarySearch(this.creditArray, amount);
		if (creditIndex !== -1) {
			let left = creditIndex;
			let right = creditIndex;

			while (left >= 0 && this.creditArray[left].credit == amount) {
				results.add(this.creditArray[left]);
				left--;
			}

			while (
				right < this.creditArray.length &&
				this.creditArray[right].credit == amount
			) {
				results.add(this.creditArray[right]);
				right++;
			}
		}

		// Tim debit = binary search tree
		const debitIndex = this.binarySearch(this.debitArray, amount);
		if (debitIndex !== -1) {
			let left = debitIndex;
			let right = debitIndex;

			while (left >= 0 && this.debitArray[left].debit == amount) {
				results.add(this.debitArray[left]);
				left--;
			}

			while (
				right < this.debitArray.length &&
				this.debitArray[right].debit == amount
			) {
				results.add(this.debitArray[right]);
				right++;
			}
		}

		return Array.from(results);
	}

	// ham tim kiem theo noi dung
	searchByDetail(content) {
		if (!content) {
			return [];
		}

		// handle truong hop viet hoa
		const searchString = content.toLowerCase();
		let results = new Set();
		for (const keyword in this.detailIndex) {
			const keywordResults = this.detailIndex[keyword] || [];

			keywordResults.forEach((row) => {
				if (row.detail && row.detail.toLowerCase().includes(searchString)) {
					results.add(row);
				}
			});
		}
		return Array.from(results);
	}

	// ham bat dau tim kiem
	search({ date, amount, content, page, pageSize }) {
		// cache de luu lai ket qua
		const cacheKey = `${date || ""}-${amount || ""}-${content || ""}-${
			page || ""
		}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		let results = this.rawData; //loc qua cac gia tri date, amount va content

		if (date) {
			const dateResults = this.searchByDate(date);
			results = results.filter((row) => dateResults.includes(row));
		}
		console.log("Results sau khi qua date : ", results.length);

		if (amount) {
			const amountResults = this.searchByAmount(amount);
			results = results.filter((row) => amountResults.includes(row));
		}
		console.log("Results sau khi qua amount : ", results.length);

		if (content) {
			const detailResults = this.searchByDetail(content);
			results = results.filter((row) => detailResults.includes(row));
		}
		console.log("Results sau khi qua content : ", results.length);

		const totalResults = results.length; // so luong ket qua tim thay
		results = results.slice((page - 1) * pageSize, page * pageSize); // tinh toan cac row dung cho page (1,2,3,4) , moi trang co pageSize ket qua
		const result = { results, totalResults, page }; // dung cache de luu lai lich su tim kiem
		this.cache.set(cacheKey, result);
		return result;
	}
}

module.exports = SearchEngine;
