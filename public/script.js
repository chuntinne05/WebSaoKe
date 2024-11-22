let current_page=1;
let totalResult=0;
let pageSize=40;
const prev=document.getElementById("prev_page");
const next=document.getElementById("next_page");
const first=document.getElementById("first_page");
const last=document.getElementById("last_page");
const search=document.getElementById("search_button");
const resultDiv=document.getElementById("resultDiv");
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
search.addEventListener('click',()=>{
    current_page=1;
    
    performSearch();
});
//Ham gui yeu cau tu front sang back de lay data
function performSearch(){
    searchStartTime = new Date();
    // const loadingElement = document.getElementById("loading");
    // setTimeout(() => {
    //     loadingElement.style.display = "flex";
    // }, 50);

    const date=document.getElementById("date_input").value;
    const amount=document.getElementById("amount_input").value;
    const content=document.getElementById("content_input").value;

    saveSearchToHistory();

    fetch(
        `/search?date=${date}&amount=${amount}&content=${content}&page=${current_page}`
    )
        .then((response)=>response.json())
        .then((data)=>{
            if(data.error){
                alert("Lỗi: " +data.error);
            }else{
                totalResult=data.totalResults;
                displayResults(data.results,data.totalResults,current_page);
                updatePage();
                updatePagination();
            }
        })
        .catch((error)=>{
            console.error("Lỗi khi tìm kiếm", error);
            alert("Đã xảy ra lỗi khi tìm kiếm!!!");
        });
//         .finally(()=>{
//             loadingElement.style.display="none";
//         });
 };
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
    if (!text || !searchText) return text || "-";  // Trả về giá trị nếu không có gì cần tìm kiếm

    const regex = new RegExp(`(${searchText})`, "gi");  // Tạo biểu thức chính quy cho từ khóa
    return text.replace(regex, `<span class="highlight">$1</span>`);  // Thêm thẻ <span> với lớp highlight
}
const inputs = document.querySelectorAll('#date_input, #amount_input, #content_input');

// Thêm sự kiện focus cho từng input
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.value = ""; // Xóa nội dung cũ
    });
});
//Ham lam cho nut bam xuat hien
function updatePage(){
    prev.disabled=current_page===1;
    next.disabled=current_page>=Math.ceil(totalResult/pageSize);
}
prev.addEventListener("click",()=>{
    if(current_page>1){
        current_page--;
        performSearch();
    }
})
next.addEventListener("click",()=>{
    if(current_page<Math.ceil(totalResult/pageSize)){
        current_page++;
        performSearch();
    }
})

function updatePagination(){
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalResult / pageSize);
    const range = 2; // Hiển thị 2 nút trước và sau trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= current_page - range && i <= current_page + range)) {
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
            ellipsis.textContent = "...";
            paginationContainer.appendChild(ellipsis);
        }
    }
}
first.addEventListener("click",()=>{
    current_page=1;
    performSearch();
})
last.addEventListener("click",()=>{
    current_page=Math.ceil(totalResult/pageSize);
    performSearch();
})