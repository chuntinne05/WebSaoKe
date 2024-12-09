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

//----------Chức năng tìm kiếm chính----------//

//Chức năng tìm kiếm khi bấm nút
search.addEventListener("click", () => {
	current_page = 1;
	performSearch();
});
//Hàm kiểm tra dữ liệu đã được nhập ở các ô input chưa
function areInputsValid() {
	const content = document.getElementById("content_input").value.trim();

	return content;
}
//Chức năng tìm kiếm khi nhấn enter
document.addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
		if (areInputsValid()) {
			current_page = 1;
			performSearch();
		}
	}
});
//Hàm gửi yêu cầu từ front sang back
function performSearch() {
	const content = document.getElementById("content_input").value;

	document.getElementById("loading").style.display = "flex";
	saveSearchToHistory();

	fetch(`/search?content=${content}&page=${current_page}`)
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("loading").style.display = "none";
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
			document.getElementById("loading").style.display = "none";
			console.error("Lỗi khi tìm kiếm", error);
			alert("Đã xảy ra lỗi khi tìm kiếm!!!");
		});
}

// Hàm chỉnh sửa định dạng ngày
function formatDate(dateTimeString) {
	if (!dateTimeString) return "-";
	const datePart = dateTimeString.split("_")[0];
	const [day, month, year] = datePart.split("/");
	return `${day}/${month}/${year}`;
}

//Hàm hiển thị kết quả
function displayResults(results, totalResults, page) {
	const resultsBody = document.getElementById("resultsBody");
	resultsBody.innerHTML = "";

	// Trường hợp không có kết quả
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

	// Thêm dữ liệu vào bảng
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

// Thêm sự kiện focus cho từng input
const inputs = document.querySelectorAll(
	"#content_input"
);

inputs.forEach((input) => {
	input.addEventListener("focus", () => {
		input.value = ""; // Xóa nội dung cũ
	});
});

//Hàm hiện nút chuyển trang
function updatePage() {
	prev.disabled = current_page === 1;
	next.disabled = current_page >= Math.ceil(totalResult / pageSize);
}

//Chức năng nút chuyển trang
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
//Hàm update số trang
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
//Chức năng cho nút chuyển trang đầu và cuối
first.addEventListener("click", () => {
	current_page = 1;
	performSearch();
});
last.addEventListener("click", () => {
	current_page = Math.ceil(totalResult / pageSize);
	performSearch();
});
//----------end----------//

//----------Lịch sử tìm kiếm----------//
const historyNav = document.querySelector("#header__history");
// Xóa lịch sử khi reset trang
window.onload = function () {
	sessionStorage.removeItem("searchHistory");
};
//Hàm lưu lịch sử tìm kiếm
function saveSearchToHistory() {
	// const date = document.getElementById("date_input").value;
	// const amount = document.getElementById("amount_input").value;
	const content = document.getElementById("content_input").value;

	if (!content) return;

	let searchHistory = sessionStorage.getItem("searchHistory");
	searchHistory = searchHistory ? JSON.parse(searchHistory) : [];

	const newSearch = {
		content,
		timestamp: new Date().toISOString(),
	};

	// Kiểm tra xem đã có tìm kiếm đó trước chưa
	const isDuplicate = searchHistory.some(
		(item) => item.content === newSearch.content
	);

	if (isDuplicate) {
		// Nếu có trùng, xóa cái cũ thêm cái mới
		searchHistory = searchHistory.filter(
			(item) => !(item.content === newSearch.content)
		);
	}
	searchHistory.unshift(newSearch);
	sessionStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}
//Hàm hiển thị lịch sử tìm kiếm
function showHistoryModal() {
	// Tạo container
	const modalContainer = document.createElement("div");
	modalContainer.className = "history-modal-container";

	// Tạo nội dung
	const modalContent = document.createElement("div");
	modalContent.className = "history-modal-content";

	// Tạo header
	const modalHeader = document.createElement("div");
	modalHeader.className = "history-modal-header";
	modalHeader.innerHTML = `
        <h2>Lịch sử tìm kiếm</h2>
        <button class="close-modal">×</button>
    `;

	// Tạo body
	const modalBody = document.createElement("div");
	modalBody.className = "history-modal-body";

	// Gọi lịch sử
	const searchHistory = JSON.parse(
		sessionStorage.getItem("searchHistory") || "[]"
	);

	// Nếu chưa có dữ liệu
	if (searchHistory.length === 0) {
		modalBody.innerHTML = '<p class="no-history">Chưa có lịch sử tìm kiếm</p>';
	} else {
		// Nếu có dữ liệu
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

	// Ghép các modal lại
	modalContent.appendChild(modalHeader);
	modalContent.appendChild(modalBody);
	modalContainer.appendChild(modalContent);
	document.body.appendChild(modalContainer);

	// Khi đóng lịch sử
	const closeBtn = modalContainer.querySelector(".close-modal");
	closeBtn.onclick = () => {
		document.body.removeChild(modalContainer);
	};

	// Click ra ngoài cũng tắt
	modalContainer.onclick = (e) => {
		if (e.target === modalContainer) {
			document.body.removeChild(modalContainer);
		}
	};

	// Chức năng khi nhấn vào lịch sử
	const historyItems = modalBody.querySelectorAll(".history-item");
	historyItems.forEach((item) => {
		item.onclick = () => {
			const searchData = JSON.parse(item.dataset.search);
			document.getElementById("content_input").value = searchData.content || "";
			document.body.removeChild(modalContainer);
			performSearch();
		};
	});
}
historyNav.addEventListener("click", showHistoryModal);
//----------end----------//

//----------Chỉnh DarkMode----------//

const darkModeToggle = document.getElementById("darkModeToggle");
if (localStorage.getItem("darkMode") === "enabled") {
	document.body.classList.add("dark-mode");

	document.getElementById("header__history").classList.add("dark-mode");
	document.querySelector("div.body__information").classList.add("dark-mode");

	const elements = document.querySelectorAll(".body__search button");
	for (let i = 0; i < elements.length; i++)
		elements[i].classList.add("dark-mode");

	darkModeToggle.checked = true;
}
darkModeToggle.addEventListener("change", () => {
	if (darkModeToggle.checked) {
		document.body.classList.add("dark-mode");
		localStorage.setItem("darkMode", "enabled");
		document.body.style.transition =
			"background-image 0.5s ease-in-out, color 0.5s";

		// HISTORY
		document.getElementById("header__history").classList.add("dark-mode");
		document.getElementById("header__history").style.transition = "color 0.5s";
		// BODY INFORMATION
		document.querySelector("div.body__information").classList.add("dark-mode");
		document.querySelector("div.body__information.dark-mode").style.transition =
			"color 0.5s";
		//BUTTON SEARCH AND PDF
		const elements = document.querySelectorAll(".body__search button");
		for (let i = 0; i < elements.length; i++)
			elements[i].classList.add("dark-mode");

	} else {
		document.body.classList.remove("dark-mode");
		localStorage.setItem("darkMode", "disabled");
		document.body.style.transition =
			"background-image 0.5s ease-in-out, color 0.5s";
		// HISTORY
		document.getElementById("header__history").classList.remove("dark-mode");
		document.getElementById("header__history").style.transition = "color 0.5s";
		// BODY INFORMATION
		document
			.querySelector("div.body__information.dark-mode")
			.classList.remove("dark-mode");
		document.querySelector("div.body__information").style.transition =
			"color 0.5s";
		//BUTTON SEARCH AND PDF
		const elements = document.querySelectorAll(
			".body__search button.dark-mode"
		);
		for (let i = 0; i < elements.length; i++)
			elements[i].classList.remove("dark-mode");

	}
});

window.addEventListener("load", () => {
	if (localStorage.getItem("darkMode") === "enabled") {
		document.body.classList.add("dark-mode");
		darkModeToggle.checked = true;
	}
});
//----------end----------//

//----------Sắp xếp kết quả trong bảng----------//
let daySortAscending = true; // Sort order for the day column
let moneySortAscending = true; // Sort order for the money column

const daySortButton = document.getElementById("daySortButton");
const moneySortButton = document.getElementById("moneySortButton");

// Chức năng sắp xếp
daySortButton.addEventListener("click", () => {
	sortTable("day", daySortAscending);
	updateSortButtonState(daySortButton, daySortAscending);
	daySortAscending = !daySortAscending; // Toggle sort order
});

moneySortButton.addEventListener("click", () => {
	sortTable("money", moneySortAscending);
	updateSortButtonState(moneySortButton, moneySortAscending);
	moneySortAscending = !moneySortAscending; // Toggle sort order
});

//Hàm sắp xếp
function sortTable(column, ascending) {
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
			valueA = parseFloat(a.credit || a.debit || 0);
			valueB = parseFloat(b.credit || b.debit || 0);

			return ascending ? valueA - valueB : valueB - valueA;
		}

		return 0;
	});

	//Hiển thị lại lần nữa kết quả sau khi sắp xếp
	displayResults(current_result, totalResult, current_page);
}

//Hàm hiển thị đúng nút bấm sắp xếp
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

//----------Chức năng xuất file PDF----------//
function exportAllResultsToPDF() {
	fetch(
		`/search?date=${
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

				//Thêm bảng
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

				//Lưu file
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
