class SearchEngine {
	constructor() {
		this.dateIndex = {}; // dung hash map
		this.creditArray = []; // mang credit da sap xep
		// => dung binary search tree
		this.debitArray = []; // mang debit da sap xep
		this.detailIndex = {}; // dung inverted index
		this.rawData = [];
	}
	// Bat dau load du lieu .....
	loadData(data) {
		this.rawData = data;

		// dat index cho tung du lieu
		data.forEach((row) => {
			const date = row.date_time?.split("_")[0]; // tach ngay voi thoi gian qua dau "_" (10/09/2024_5242.70362)
			if (date) {
				// Neu co chua thong tin ngay
				if (!this.dateIndex[date]) {
					this.dateIndex[date] = []; // tao 1 mang rong neu chua co ngay nao
				}
				this.dateIndex[date].push(row);
			}

			/*
			vi du : const data = [
				{date_time : "10/09/2024_12345", detail : "noi dung 1"},
				{date_time : "11/09/2024_12345", detail : "noi dung 2"},
				{date_time : "10/09/2024_12345", detail : "noi dung 3"}
			];
			=> date_index chua : 
			{
				"10/09/2024" : [
					{date_time : "10/09/2024_12345", detail : "noi dung 1"},
					{date_time : "10/09/2024_12345", detail : "noi dung 3"}
				],
				"11/09/2024" : [
					{date_time : "11/09/2024_12345", detail : "noi dung 2"}
				]
			}
			*/

			// neu co nhap so tien
			if (row.credit) {
				this.creditArray.push(row); //push credit vao mang creditArray
			}
			if (row.debit) {
				this.debitArray.push(row); //push debit vao mang debitArray
			}

			// neu co nhap noi dung
			// row.detail : chuoi chua noi dung
			// split(/\W+/) : phan tach tai cac ki tu khong phai chu cai, so hoac dau gach duoi ("_")
			const words = row.detail?.toLowerCase().split(/\W+/) || []; // phan tach chuoi row.detail -> cac tu don le ( neu row undefined thi tra ve mang rong)

			// detailIndex : inverted index (luu cac row theo tung tu khoa)
			words.forEach((word) => {
				if (!this.detailIndex[word]) {
					// kiem tra xem word ton tai trong detailIndex chua
					this.detailIndex[word] = [];
				}
				this.detailIndex[word].push(row);
			});

			/*
			vi du : const data = [
  						{ detail: "Lap trinh nang cao #12345" },
  						{ detail: "Lap trinh web #54321" }
					];

				detailIndex : 
					{
						"lap": [
							{ detail: "Lap trinh nang cao #12345" },
							{ detail: "Lap trinh web #54321" }
						],
						"trinh": [
							{ detail: "Lap trinh nang cao #12345" },
							{ detail: "Lap trinh web #54321" }
						],
						"nang": [{ detail: "Lap trinh nang cao #12345" }],
						"cao": [{ detail: "Lap trinh nang cao #12345" }],
						"web": [{ detail: "Lap trinh web #54321" }],
						"12345": [{ detail: "Lap trinh nang cao #12345" }],
						"54321": [{ detail: "Lap trinh web #54321" }]
					}
			 */
		});

		this.creditArray.sort((a, b) => (a.credit || 0) - (b.credit || 0)); //sap xep creditArray theo thu tu tang dan
		this.debitArray.sort((a, b) => (a.debit || 0) - (b.debit || 0)); // su dung Tim Sort
	}
	// ket thuc load du lieu

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

		const totalResults = results.length;
		results = results.slice((page - 1) * pageSize, page * pageSize); // tinh toan cac row dung cho page (1,2,3,4) , moi trang co pageSize ket qua

		return { results, totalResults, page };
	}
}

module.exports = SearchEngine;
