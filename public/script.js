let current_page = 1;
let totalResult = 0;
let pageSize = 40;
let current_result = [];
const prev = document.getElementById("prev_page");
const next = document.getElementById("next_page");
const first = document.getElementById("first_page");
const last = document.getElementById("last_page");
const search = document.getElementById("search_button");
const resultDiv = document.getElementById("resultDiv");
const historyNav = document.querySelector(".header__nav");

// xoa lich su khi reset trang
window.onload = function () {
	sessionStorage.removeItem("searchHistory");
};
function saveSearchToHistory() {
	const date = document.getElementById("date_input").value;
	const amount = document.getElementById("amount_input").value;
	const content = document.getElementById("content_input").value;

	if (!date && !amount && !content) return; // neu khong co truong nao thi kh luu

	let searchHistory = sessionStorage.getItem("searchHistory");
	searchHistory = searchHistory ? JSON.parse(searchHistory) : [];

	const newSearch = {
		date,
		amount,
		content,
		timestamp: new Date().toISOString(),
	};

	// check xem co tim kiem cai do truoc chua
	const isDuplicate = searchHistory.some(
		(item) =>
			item.date === newSearch.date &&
			item.amount === newSearch.amount &&
			item.content === newSearch.content
	);

	if (isDuplicate) {
		// neu co trung, xoa cai cu, them cai moi
		searchHistory = searchHistory.filter(
			(item) =>
				!(
					item.date === newSearch.date &&
					item.amount === newSearch.amount &&
					item.content === newSearch.content
				)
		);
	}
	searchHistory.unshift(newSearch);

	// if (searchHistory.length > 20) {
	// 	searchHistory = searchHistory.slice(0, 20);
	// }
	sessionStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function showHistoryModal() {
	// tao model container
	const modalContainer = document.createElement("div");
	modalContainer.className = "history-modal-container";

	// tao noi dung model
	const modalContent = document.createElement("div");
	modalContent.className = "history-modal-content";

	// tao header model
	const modalHeader = document.createElement("div");
	modalHeader.className = "history-modal-header";
	modalHeader.innerHTML = `
        <h2>Lịch sử tìm kiếm</h2>
        <button class="close-modal">×</button>
    `;

	// tao body model
	const modalBody = document.createElement("div");
	modalBody.className = "history-modal-body";

	// call history
	const searchHistory = JSON.parse(
		sessionStorage.getItem("searchHistory") || "[]"
	);

	// neu chua co du lieu
	if (searchHistory.length === 0) {
		modalBody.innerHTML = '<p class="no-history">Chưa có lịch sử tìm kiếm</p>';
	} else {
		// neu co du lieu
		const historyList = searchHistory
			.map(
				(item) => `
            <div class="history-item" data-search='${JSON.stringify(item)}'>
                <div class="history-item-details">
                    ${item.date ? `<span>Ngày: ${item.date}</span>` : ""}
                    ${item.amount ? `<span>Số tiền: ${item.amount}</span>` : ""}
                    ${
											item.content
												? `<span>Nội dung: ${item.content}</span>`
												: ""
										}
                </div>
                <div class="history-item-time">
                    ${new Date(item.timestamp).toLocaleString()}
                </div>
            </div>
        `
			)
			.join("");
		modalBody.innerHTML = historyList;
	}

	// ghep cac model lai
	modalContent.appendChild(modalHeader);
	modalContent.appendChild(modalBody);
	modalContainer.appendChild(modalContent);
	document.body.appendChild(modalContainer);

	// khi dong history
	const closeBtn = modalContainer.querySelector(".close-modal");
	closeBtn.onclick = () => {
		document.body.removeChild(modalContainer);
	};

	// click ra ngoai cung tat
	modalContainer.onclick = (e) => {
		if (e.target === modalContainer) {
			document.body.removeChild(modalContainer);
		}
	};

	// event khi an vao lich su
	const historyItems = modalBody.querySelectorAll(".history-item");
	historyItems.forEach((item) => {
		item.onclick = () => {
			const searchData = JSON.parse(item.dataset.search);
			document.getElementById("date_input").value = searchData.date || "";
			document.getElementById("amount_input").value = searchData.amount || "";
			document.getElementById("content_input").value = searchData.content || "";
			document.body.removeChild(modalContainer);
			performSearch();
		};
	});
}

//Event khi bam nut
search.addEventListener("click", () => {
	current_page = 1;

	performSearch();
});
//Ham gui yeu cau tu front sang back de lay data
function performSearch() {
	searchStartTime = new Date();
	// const loadingElement = document.getElementById("loading");
	// setTimeout(() => {
	//     loadingElement.style.display = "flex";
	// }, 50);

	const date = document.getElementById("date_input").value;
	const amount = document.getElementById("amount_input").value;
	const content = document.getElementById("content_input").value;

	saveSearchToHistory();

	fetch(
		`/search?date=${date}&amount=${amount}&content=${content}&page=${current_page}`
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.error) {
				alert("Lỗi: " + data.error);
			} else {
				totalResult = data.totalResults;
				current_result = data.results;
				displayResults(data.results, data.totalResults, current_page);
				updatePage();
				updatePagination();
			}
		})
		.catch((error) => {
			console.error("Lỗi khi tìm kiếm", error);
			alert("Đã xảy ra lỗi khi tìm kiếm!!!");
		});
	//         .finally(()=>{
	//             loadingElement.style.display="none";
	//         });
}
historyNav.addEventListener("click", showHistoryModal);

// chinh sua dinh dang ngay
function formatDate(dateTimeString) {
	if (!dateTimeString) return "-";
	const datePart = dateTimeString.split("_")[0];
	const [day, month, year] = datePart.split("/");
	return `${day}/${month}/${year}`;
}
//Ham hien thi ket qua
function displayResults(results, totalResults, page) {
	const resultsBody = document.getElementById("resultsBody");
	resultsBody.innerHTML = "";

	// Lấy giá trị input để highlight
	// const dateInput = document.getElementById("date_input").value.trim();
	// const amountInput = document.getElementById("amount_input").value.trim();
	// const contentInput = document.getElementById("content_input").value.trim();

	// Nếu không có kết quả, hiển thị thông báo trong bảng
	if (results.length === 0) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		cell.colSpan = 4;
		cell.textContent = "Không tìm thấy kết quả nào.";
		cell.style.textAlign = "center";
		row.appendChild(cell);
		resultsBody.appendChild(row);
		return;
	}

	// Thêm dữ liệu mới vào bảng
	results.forEach((transaction) => {
		const row = document.createElement("tr");
		row.classList.add("menu_row");

		const formattedDate = formatDate(transaction.date_time);
		const dateCell = formattedDate || "-";
		const creditCell = transaction.credit?.toString() || "-";
		const debitCell = transaction.debit?.toString() || "-";
		const detailCell = transaction.detail || "-";

		row.innerHTML = `
            <td>${dateCell}</td>
            <td>${creditCell}</td>
            <td>${debitCell}</td>
            <td>${detailCell}</td>
        `;
		resultsBody.appendChild(row);
	});
}

// Hàm highlight các phần văn bản
function highlightText(text, searchText) {
	if (!text || !searchText) return text || "-"; // Trả về giá trị nếu không có gì cần tìm kiếm

	const regex = new RegExp(`(${searchText})`, "gi"); // Tạo biểu thức chính quy cho từ khóa
	return text.replace(regex, `<span class="highlight">$1</span>`); // Thêm thẻ <span> với lớp highlight
}
const inputs = document.querySelectorAll(
	"#date_input, #amount_input, #content_input"
);

// Thêm sự kiện focus cho từng input
inputs.forEach((input) => {
	input.addEventListener("focus", () => {
		input.value = ""; // Xóa nội dung cũ
	});
});
//Ham lam cho nut bam xuat hien
function updatePage() {
	prev.disabled = current_page === 1;
	next.disabled = current_page >= Math.ceil(totalResult / pageSize);
}
prev.addEventListener("click", () => {
	if (current_page > 1) {
		current_page--;
		performSearch();
	}
});
next.addEventListener("click", () => {
	if (current_page < Math.ceil(totalResult / pageSize)) {
		current_page++;
		performSearch();
	}
});

function updatePagination() {
	const paginationContainer = document.getElementById("pagination");
	paginationContainer.innerHTML = "";

	const totalPages = Math.ceil(totalResult / pageSize);
	const range = 2; // Hiển thị 2 nút trước và sau trang hiện tại

	for (let i = 1; i <= totalPages; i++) {
		if (
			i === 1 ||
			i === totalPages ||
			(i >= current_page - range && i <= current_page + range)
		) {
			const pageButton = document.createElement("button");
			pageButton.textContent = i;
			pageButton.classList.add("page_button");

			if (i === current_page) {
				pageButton.classList.add("current_page");
			}

			pageButton.addEventListener("click", () => {
				if (current_page !== i) {
					current_page = i;
					performSearch();
				}
			});

			paginationContainer.appendChild(pageButton);
		} else if (
			(i === current_page - range - 1 || i === current_page + range + 1) &&
			totalPages > 5
		) {
			// Hiển thị dấu "..."
			const ellipsis = document.createElement("span");
			ellipsis.textContent = ". . .";
			paginationContainer.appendChild(ellipsis);
		}
	}
}
first.addEventListener("click", () => {
	current_page = 1;
	performSearch();
});
last.addEventListener("click", () => {
	current_page = Math.ceil(totalResult / pageSize);
	performSearch();
});

const dateInput = document.getElementById("date_input");
const dateOptions = document.getElementById("date-options");

// Hiển thị danh sách khi click vào ô nhập
dateInput.addEventListener("focus", () => {
	dateOptions.style.display = "block";
});

// Ẩn danh sách khi click ngoài
document.addEventListener("click", (e) => {
	if (!e.target.closest(".date-picker-container")) {
		dateOptions.style.display = "none";
	}
});

// Xử lý sự kiện click chọn ngày
dateOptions.addEventListener("click", (e) => {
	const selectedDate = e.target.getAttribute("data-date");
	if (selectedDate) {
		dateInput.value = selectedDate;
		dateOptions.style.display = "none"; // Ẩn danh sách sau khi chọn
	}
});
// Cho phép xóa và nhập thủ công
dateInput.addEventListener("input", () => {
	// Nếu người dùng nhập mới, không làm gì thêm
	dateOptions.style.display = "none";
});
let daySortAscending = true; // Sort order for the day column
let moneySortAscending = true; // Sort order for the money column

const daySortButton = document.getElementById("daySortButton");
const moneySortButton = document.getElementById("moneySortButton");

// Event listener for sorting by day
daySortButton.addEventListener("click", () => {
	sortTable("day", daySortAscending);
	updateSortButtonState(daySortButton, daySortAscending);
	daySortAscending = !daySortAscending; // Toggle sort order
});

// Event listener for sorting by money
moneySortButton.addEventListener("click", () => {
	sortTable("money", moneySortAscending);
	updateSortButtonState(moneySortButton, moneySortAscending);
	moneySortAscending = !moneySortAscending; // Toggle sort order
});

function sortTable(column, ascending) {
	// const tableBody = document.getElementById("resultsBody");
	// const rows = Array.from(tableBody.rows);

	// // Determine sort key based on the column
	// const columnIndex = column === "day" ? 0 : 1;

	// rows.sort((a, b) => {
	//     const cellA = a.cells[columnIndex].textContent.trim();
	//     const cellB = b.cells[columnIndex].textContent.trim();
	//     if (column === "money") {
	//         return ascending
	//             ? parseFloat(cellA) - parseFloat(cellB)
	//             : parseFloat(cellB) - parseFloat(cellA);
	//     } else if (column === "day") {
	//         const dateA = new Date(cellA.split("/").reverse().join("-"));
	//         const dateB = new Date(cellB.split("/").reverse().join("-"));
	//         return ascending ? dateA - dateB : dateB - dateA;
	//     }

	//     return 0;
	// });
	// rows.forEach(row => tableBody.appendChild(row));

	current_result.sort((a, b) => {
		let valueA, valueB;

		if (column === "day") {
			// Parse date from date_time string
			const parseDate = (dateStr) => {
				if (!dateStr) return new Date(-8640000000000000); // earliest possible date
				const datePart = dateStr.split("_")[0];
				const [day, month, year] = datePart.split("/");
				return new Date(`${year}-${month}-${day}`);
			};
			valueA = parseDate(a.date_time);
			valueB = parseDate(b.date_time);

			return ascending ? valueA - valueB : valueB - valueA;
		} else if (column === "money") {
			// Use credit or debit for sorting, preferring credit
			valueA = parseFloat(a.credit || a.debit || 0);
			valueB = parseFloat(b.credit || b.debit || 0);

			return ascending ? valueA - valueB : valueB - valueA;
		}

		return 0;
	});

	// Re-display the sorted results
	displayResults(current_result, totalResult, current_page);
}
function updateSortButtonState(button, ascending) {
	document.querySelectorAll(".sortButton").forEach((btn) => {
		btn.classList.remove("sort-asc", "sort-desc");
		btn.querySelector("i").className = "fa-solid fa-sort";
	});
	const icon = button.querySelector("i");
	if (ascending) {
		button.classList.add("sort-asc");
		icon.className = "fa-solid fa-sort-up";
	} else {
		button.classList.add("sort-desc");
		icon.className = "fa-solid fa-sort-down";
	}
}

function exportAllResultsToPDF() {
	fetch(
		`/search?date=${document.getElementById("date_input").value}&amount=${
			document.getElementById("amount_input").value
		}&content=${
			document.getElementById("content_input").value
		}&page=1&pageSize=${totalResult}`
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.results && data.results.length > 0) {
				const { jsPDF } = window.jspdf;
				const doc = new jsPDF("p", "pt", "a4");

				doc.setFontSize(16);
				doc.text("Transaction Detail", 40, 40);

				const tableData = data.results.map((transaction) => [
					formatDate(transaction.date_time) || "-",
					transaction.credit?.toString() || "-",
					transaction.debit?.toString() || "-",
					transaction.detail || "-",
				]);

				// Add table
				doc.autoTable({
					startY: 60,
					head: [["Date", "Credit", "Debit", "Detail"]],
					body: tableData,
					theme: "striped",
					styles: {
						fontSize: 10,
						cellPadding: 5,
					},
					columnStyles: {
						0: { cellWidth: 80 },
						1: { cellWidth: 80 },
						2: { cellWidth: 80 },
						3: { cellWidth: 200 },
					},
				});

				// Save the PDF
				doc.save(`ChuyenKhoan_${new Date().toISOString().split("T")[0]}.pdf`);
			} else {
				alert("Không có dữ liệu để xuất PDF");
			}
		})
		.catch((error) => {
			console.error("Lỗi khi xuất PDF:", error);
			alert("Đã xảy ra lỗi khi xuất PDF");
		});
}

document
	.getElementById("pdf-export-button")
	.addEventListener("click", exportAllResultsToPDF);

const searchButtonContainer = document.querySelector(".body__search");
searchButtonContainer.appendChild(pdfExportButton);
