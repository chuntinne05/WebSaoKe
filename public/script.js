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
const historyNav = document.querySelector("#header__history");

const darkModeToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
	document.body.classList.add("dark-mode");

	document.getElementById("header__history").classList.add("dark-mode"); //DARK MODE HISTORY
	document.querySelector("div.body__information").classList.add("dark-mode"); //DARK MODE BODY INFORMATION

	const elements = document.querySelectorAll(".body__search button"); //DARK MODE BODY SEARCH BUTTON
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
		// BODY SEARCH INPUT ELEMENT
		//mac du ko hieu sao nhung ma tu nhien code chay dc 👌
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
		////BUTTON SEARCH AND PDF
		const elements = document.querySelectorAll(
			".body__search button.dark-mode"
		);
		for (let i = 0; i < elements.length; i++)
			elements[i].classList.remove("dark-mode");
		document.querySelectorAll(".body__search button").style.transition =
			"color 0.5s";
	}
});

window.addEventListener("load", () => {
	if (localStorage.getItem("darkMode") === "enabled") {
		document.body.classList.add("dark-mode");
		darkModeToggle.checked = true;
	}
});

function createHiddenImageModal(imagePath) {
	// Create modal container
	const modalContainer = document.createElement("div");
	modalContainer.id = "hidden-image-modal";
	modalContainer.style.position = "fixed";
	modalContainer.style.top = "0";
	modalContainer.style.left = "0";
	modalContainer.style.width = "100%";
	modalContainer.style.height = "100%";
	modalContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
	modalContainer.style.zIndex = "1000";
	modalContainer.style.display = "flex";
	modalContainer.style.justifyContent = "center";
	modalContainer.style.alignItems = "center";

	// Create image
	const hiddenImage = document.createElement("img");
	hiddenImage.src = imagePath;
	hiddenImage.style.maxWidth = "90%";
	hiddenImage.style.maxHeight = "90%";
	hiddenImage.style.objectFit = "contain";

	// Create close button
	const closeButton = document.createElement("button");
	closeButton.textContent = "Đóng";
	closeButton.style.position = "absolute";
	closeButton.style.top = "20px";
	closeButton.style.right = "20px";
	closeButton.style.padding = "10px 20px";
	closeButton.style.backgroundColor = "white";
	closeButton.style.color = "black";
	closeButton.style.border = "none";
	closeButton.style.borderRadius = "5px";
	closeButton.style.cursor = "pointer";

	// Add close functionality
	closeButton.addEventListener("click", () => {
		document.body.removeChild(modalContainer);
	});

	// Assemble modal
	modalContainer.appendChild(hiddenImage);
	modalContainer.appendChild(closeButton);

	return modalContainer;
}
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

//Chuc nang tim kiem khi bam nut
search.addEventListener("click", () => {
	current_page = 1;
	performSearch();
});
//Ham kiem tra co du lieu da duoc nhap
function areInputsValid() {
	const date = document.getElementById("date_input").value.trim();
	const amount = document.getElementById("amount_input").value.trim();
	const content = document.getElementById("content_input").value.trim();

	return date || amount || content;
}
//Chuc nang tim kiem khi nhan enter
document.addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
		if (areInputsValid()) {
			current_page = 1;
			performSearch();
		}
	}
});
//Ham gui yeu cau tu front sang back de lay data
function performSearch() {
	const searchStartTime = performance.now();
	const date = document.getElementById("date_input").value;
	const amount = document.getElementById("amount_input").value;
	const content = document.getElementById("content_input").value;

	if (content.toLowerCase() === "huy" && amount === "2311202") {
		const hiddenModal = createHiddenImageModal(
			"/images/z6036849628292_a8e19fbc0d25917ca6adf422d2c16c00.jpg"
		);
		document.body.appendChild(hiddenModal);
		return; // Stop further search
	}

	// Check for the second hidden trigger
	if (content.toLowerCase().includes("tieudoi6")) {
		const hiddenModal = createHiddenImageModal("/images/IMG_0499.JPG"); // Replace with your second image path
		document.body.appendChild(hiddenModal);
		return; // Stop further search
	}

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

				// createTransactionChart(data.results, {
				// 	date: document.getElementById("date_input").value,
				// 	amount: document.getElementById("amount_input").value,
				// });
			}
		})
		.catch((error) => {
			console.error("Lỗi khi tìm kiếm", error);
			alert("Đã xảy ra lỗi khi tìm kiếm!!!");
		});
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

function createTransactionChart(results, searchParams) {
	// Kiểm tra điều kiện hiển thị biểu đồ
	if (searchParams.date && searchParams.amount) return;

	// Tạo container cho biểu đồ nếu chưa tồn tại
	let chartContainer = document.getElementById("chart-container");
	if (!chartContainer) {
		chartContainer = document.createElement("div");
		chartContainer.id = "chart-container";
		chartContainer.style.width = "100%";
		chartContainer.style.height = "500px";
		document.querySelector(".body__search").appendChild(chartContainer);
	}

	// Tạo canvas
	chartContainer.innerHTML = '<canvas id="transactionChart"></canvas>';
	const ctx = document.getElementById("transactionChart").getContext("2d");

	// Xử lý dữ liệu cho biểu đồ
	let chartData = {};
	let totalAmount = 0;

	// Logic xử lý dữ liệu theo từng trường tìm kiếm
	if (searchParams.date && !searchParams.amount) {
		// Nhóm theo nội dung chuyển khoản
		results.forEach((transaction) => {
			const category = transaction.detail || "Không xác định";
			const amount = transaction.credit || transaction.debit || 0;

			chartData[category] = (chartData[category] || 0) + Math.abs(amount);
			totalAmount += Math.abs(amount);
		});
	} else if (searchParams.amount && !searchParams.date) {
		// Nhóm theo ngày
		results.forEach((transaction) => {
			const date = transaction.date_time?.split("_")[0] || "Không xác định";
			const amount = transaction.credit || transaction.debit || 0;

			chartData[date] = (chartData[date] || 0) + Math.abs(amount);
			totalAmount += Math.abs(amount);
		});
	}

	// Kiểm tra xem có dữ liệu để vẽ không
	if (Object.keys(chartData).length === 0) return;

	// Tạo mảng cho biểu đồ
	const labels = Object.keys(chartData);
	const data = Object.values(chartData);

	// Tạo nút đóng/mở biểu đồ
	const toggleButton = document.createElement("button");
	toggleButton.textContent = "Hiện/Ẩn Biểu Đồ";
	toggleButton.className = "btn btn-secondary mb-3";
	toggleButton.style.display = "block";
	toggleButton.style.margin = "10px auto";

	chartContainer.insertBefore(toggleButton, chartContainer.firstChild);

	// Tạo phần chú thích chi tiết
	const legendContainer = document.createElement("div");
	legendContainer.id = "chart-legend";
	legendContainer.style.display = "flex";
	legendContainer.style.flexWrap = "wrap";
	legendContainer.style.justifyContent = "center";
	legendContainer.style.gap = "10px";
	legendContainer.style.marginTop = "20px";

	// Tạo mảng màu gradient
	const createGradientColors = (num) => {
		const baseColors = [
			"rgba(54, 162, 235, 1)", // Blue
			"rgba(255, 99, 132, 1)", // Red
			"rgba(75, 192, 192, 1)", // Green
			"rgba(255, 206, 86, 1)", // Yellow
			"rgba(153, 102, 255, 1)", // Purple
		];
		return baseColors.slice(0, num);
	};

	const backgroundColors = createGradientColors(labels.length);

	// Khởi tạo biểu đồ đường
	const chart = new Chart(ctx, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: searchParams.date
						? "Phân Bố Theo Nội Dung Chuyển Khoản"
						: "Phân Bố Theo Ngày",
					data: data,
					borderColor: backgroundColors,
					backgroundColor: backgroundColors.map((color) =>
						color.replace("1)", "0.2)")
					),
					borderWidth: 2,
					fill: true,
					tension: 0.1,
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: searchParams.date
						? "Phân Bố Theo Nội Dung Chuyển Khoản"
						: "Phân Bố Theo Ngày",
					font: {
						size: 16,
					},
				},
				tooltip: {
					callbacks: {
						label: function (context) {
							const value = context.parsed.y;
							const percentage = ((value / totalAmount) * 100).toFixed(2);
							return `${context.label}: ${value.toLocaleString(
								"vi-VN"
							)} VNĐ (${percentage}%)`;
						},
					},
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: "Số tiền (VNĐ)",
					},
				},
			},
		},
	});

	// Tạo chú thích chi tiết
	labels.forEach((label, index) => {
		const legendItem = document.createElement("div");
		legendItem.style.display = "flex";
		legendItem.style.alignItems = "center";
		legendItem.style.margin = "5px";

		const colorBox = document.createElement("span");
		colorBox.style.width = "20px";
		colorBox.style.height = "20px";
		colorBox.style.backgroundColor = backgroundColors[index];
		colorBox.style.marginRight = "10px";

		const labelText = document.createElement("span");
		const amount = data[index];
		const percentage = ((amount / totalAmount) * 100).toFixed(2);

		labelText.textContent = `${label}: ${amount.toLocaleString(
			"vi-VN"
		)} VNĐ (${percentage}%)`;

		legendItem.appendChild(colorBox);
		legendItem.appendChild(labelText);
		legendContainer.appendChild(legendItem);
	});

	// Thêm tổng số tiền
	const totalAmountElement = document.createElement("div");
	totalAmountElement.style.textAlign = "center";
	totalAmountElement.style.fontWeight = "bold";
	totalAmountElement.style.marginTop = "10px";
	totalAmountElement.textContent = `Tổng số tiền: ${totalAmount.toLocaleString(
		"vi-VN"
	)} VNĐ`;

	chartContainer.appendChild(legendContainer);
	chartContainer.appendChild(totalAmountElement);

	// Xử lý nút đóng/mở
	toggleButton.addEventListener("click", () => {
		chart.canvas.style.display =
			chart.canvas.style.display === "none" ? "block" : "none";
		legendContainer.style.display =
			legendContainer.style.display === "none" ? "flex" : "none";
		totalAmountElement.style.display =
			totalAmountElement.style.display === "none" ? "block" : "none";
	});
}
