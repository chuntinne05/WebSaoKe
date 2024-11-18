let current_page=1;
let totalResult=0;
let pageSize=10;
const BACKEND_URL = "http://localhost:1908";
const prev=document.getElementById("prev_button");
const next=document.getElementById("next_button");
const search=document.getElementById("search_button");
const resultDiv=document.getElementById("search_result");
//
search.addEventListener('submit',(event)=>{
    event.preventDefault();
    current_page=1;
    performSearch();
});
//Ham gui yeu cau tu front sang back de lay data
function performSearch(){
    const date=document.getElementById("date_input").value;
    const money=document.getElementById("money_input").value;
    const text=document.getElementById("text_input").value;
    const page=document.getElementById("page_input").value ||1;
    const page_size=document.getElementById("page_size").value||10;
    fetch(
        `${BACKEND_URL}/search?date=${encodeURIComponent(date)}&money=${encodeURIComponent(money)}&text=${encodeURIComponent(text)}&page=${page}&page_size=${page_size}`
    )
        .then((response)=>response.json())
        .then((data)=>{
            if(data.error){
                alert("Lỗi: " +data.error);
            }else{
                totalResult=data.totalResults;
                displayResults(data.result,totalResult,current_page);
                updatePage();
            }
        })
        .catch((error)=>{
            console.error("Lỗi khi tìm kiếm", error);
            alert("Đã xảy ra lỗi khi tìm kiếm!!!");
        });
}
//Ham hien thi ket qua 
function displayResults(result,totalResults,page){
    if(result.length==0){
        resultDiv.innerHTML="<p>Không tìm thấy kết quả!!!</p>";
        return;
    }
    console.log("DMM");
    const header=document.createElement("h3");
    header.textContent=`Tổng kết quả: ${totalResults} | Trang: ${page}`;
    resultDiv.appendChild(header);
    const table=document.createElement('table');
    table.classList.add('result_table');
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Ngày giờ</th>
            <th>Credit</th>
            <th>Debit</th>
            <th>Nội dung</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    result.forEach((result) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.date_time || "-"}</td>
            <td>${result.credit || "-"}</td>
            <td>${result.debit || "-"}</td>
            <td>${result.detail || "-"}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    resultsContainer.appendChild(table);
}
//Ham lam cho nut bam xuat hien
function updatePage(){
    next.disabled=current_page===1;
    prev.disabled=current_page>=Math.ceil(totalResult/pageSize);
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