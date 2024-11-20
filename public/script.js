let current_page=1;
let totalResult=0;
let pageSize=10;
let searchStartTime;
const prev=document.getElementById("prev__page");
const next=document.getElementById("next__page");
const search=document.getElementById("search_button");
const resultDiv=document.getElementById("resultDiv");
//
search.addEventListener('click',()=>{
    current_page=1;
    performSearch();
});
//Ham gui yeu cau tu front sang back de lay data
function performSearch(){
    searchStartTime = new Date();
    const date=document.getElementById("date_input").value;
    const amount=document.getElementById("amount_input").value;
    const content=document.getElementById("content_input").value;
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

                // const searchEndTime = new Date();
                // const timeTaken = searchEndTime - searchStartTime;
                // const timeDisplay = document.getElementById("search_time");
                // timeDisplay.textContent = `Tổng thời gian tìm kiếm: ${timeTaken / 1000} giây`;
            }
        })
        .catch((error)=>{
            console.error("Lỗi khi tìm kiếm", error);
            alert("Đã xảy ra lỗi khi tìm kiếm!!!");
        });
}
//Ham hien thi ket qua 
function displayResults(results, totalResults, page) {
    const resultsBody = document.getElementById("resultsBody");
    resultsBody.innerHTML = `<tr class="menu__row" id="menu__title">
            <th id="day">Ngày</th>
            <th id="name">Người đóng góp</th>
            <th id="money">Số tiền</th>
            <th id="description">Nội dung</th>
        </tr>`; 

    // Lấy giá trị input để highlight
    const dateInput = document.getElementById("date_input").value.trim();
    const amountInput = document.getElementById("amount_input").value.trim();
    const contentInput = document.getElementById("content_input").value.trim();

    // Nếu không có kết quả, hiển thị thông báo trong bảng
    if (results.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4; // Gộp tất cả các cột
        cell.textContent = "Không tìm thấy kết quả nào.";
        cell.style.textAlign = "center";
        row.appendChild(cell);
        resultsBody.appendChild(row);
        return;
    }

    // Thêm dữ liệu mới vào bảng
    results.forEach((transaction) => {
        const row = document.createElement("tr");

        // Highlight cột Date
        const dateCell = highlightText(transaction.date_time, dateInput);
        
        // Highlight cột Credit và Debit
        const creditCell = highlightText(transaction.credit?.toString(), amountInput);
        const debitCell = highlightText(transaction.debit?.toString(), amountInput);

        // Highlight cột Content
        const detailCell = highlightText(transaction.detail, contentInput);

        row.innerHTML = `
            <td>${dateCell}</td>
            <td>${creditCell}</td>
            <td>${debitCell}</td>
            <td>${detailCell}</td>
        `;
        resultsBody.appendChild(row);
    });

    // Cập nhật thông tin số trang
    const pageInfo = document.getElementById("page__number");
    pageInfo.textContent=`${page}`;
}

// Hàm highlight các phần văn bản
function highlightText(text, searchText) {
    if (!text || !searchText) return text || "-";  // Trả về giá trị nếu không có gì cần tìm kiếm

    const regex = new RegExp(`(${searchText})`, "gi");  // Tạo biểu thức chính quy cho từ khóa
    return text.replace(regex, `<span class="highlight">$1</span>`);  // Thêm thẻ <span> với lớp highlight
}

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