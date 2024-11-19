let currentPage = 1;
let totalPages = 0;

async function searchTransactions() {
	const dateInput = document.getElementById("dateInput").value;
	const amountInput = document.getElementById("amountInput").value;
	const contentInput = document.getElementById("contentInput").value;

	try {
		const response = await fetch(
			`/search?date=${dateInput}&amount=${amountInput}&content=${contentInput}&page=${currentPage}`
		);
		const data = await response.json();

		displayResults(data.results);
		updatePagination(data.totalResults, data.page);
	} catch (error) {
		console.error("Search error:", error);
		alert("An error occurred while searching transactions.");
	}
}

function displayResults(results) {
	const resultsBody = document.getElementById("resultsBody");
	resultsBody.innerHTML = ""; // Clear previous results

	results.forEach((transaction) => {
		const row = document.createElement("tr");
		row.innerHTML = `
            <td>${transaction.date_time?.split("_")[0] || "N/A"}</td>
            <td>${transaction.credit || "N/A"}</td>
            <td>${transaction.debit || "N/A"}</td>
            <td>${transaction.detail || "N/A"}</td>
        `;
		resultsBody.appendChild(row);
	});
}

function updatePagination(totalResults, currentPageNum) {
	currentPage = currentPageNum;
	totalPages = Math.ceil(totalResults / 40); // Assuming 40 results per page from backend

	const pageInfo = document.getElementById("pageInfo");
	pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

	const prevButton = document.getElementById("prevButton");
	const nextButton = document.getElementById("nextButton");

	prevButton.disabled = currentPage === 1;
	nextButton.disabled = currentPage === totalPages;
}

function changePage(delta) {
	currentPage += delta;
	searchTransactions();
}

// Initial page load
document.addEventListener("DOMContentLoaded", () => {
	const prevButton = document.getElementById("prevButton");
	const nextButton = document.getElementById("nextButton");
	prevButton.disabled = true;
	nextButton.disabled = true;
});
