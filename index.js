let totalIncome = 0;
let totalExpenses = 0;
let transactions = []; 
let categories = ["Food", "Travel", "Rent", "Others"];

function updateSummary() {
  const remainingBalance = totalIncome - totalExpenses;
  document.getElementById("total-income-display").textContent = `₹${totalIncome.toFixed(2)}`;
  document.getElementById("total-expenses-display").textContent = `₹${totalExpenses.toFixed(2)}`;
  document.getElementById("remaining-balance-display").textContent = `₹${remainingBalance.toFixed(2)}`;
}

function addExpense() {
  const expenseTitle = document.getElementById("solo-expense-title").value;
  const expenseAmount = parseFloat(document.getElementById("solo-expense-amount").value);
  const expenseCategory = document.getElementById("solo-expense-category").value;

  if (!expenseTitle || !expenseAmount || !expenseCategory) {
    alert("Please fill out all fields.");
    return;
  }

  const dateTime = new Date().toLocaleString();

  totalExpenses += expenseAmount;
  transactions.push({
    title: expenseTitle,
    amount: expenseAmount,
    category: expenseCategory,
    dateTime: dateTime, 
  });

  document.getElementById("solo-expense-title").value = "";
  document.getElementById("solo-expense-amount").value = "";
  document.getElementById("solo-expense-category").value = "";

  updateSummary();
  displayTransactionHistory();
  updateExpenseChart();
}

function displayTransactionHistory() {
  const filterCategory = document.getElementById("history-filter").value;
  const historyList = document.getElementById("transaction-history-list");
  historyList.innerHTML = ""; 

  if (transactions.length === 0) {
    const noTransactionsMessage = document.createElement("li");
    noTransactionsMessage.textContent = "No transactions available.";
    historyList.appendChild(noTransactionsMessage);
    return;
  }

  transactions.forEach(transaction => {
    if (filterCategory === "" || transaction.category === filterCategory) {
      const listItem = document.createElement("li");
      listItem.textContent = `${transaction.title} - ₹${transaction.amount.toFixed(2)} (${transaction.category}) - ${transaction.dateTime}`;
      historyList.appendChild(listItem);
    }
  });
}

function updateExpenseChart() {
  const categoriesTotal = {
    Food: 0,
    Travel: 0,
    Rent: 0,
    Others: 0,
  };

  transactions.forEach(transaction => {
    categoriesTotal[transaction.category] += transaction.amount;
  });

  if (totalExpenses === 0) {
    return;
  }

  const ctx = document.getElementById("expensePieChartCanvas").getContext("2d");

  if (window.expenseChart) {
    window.expenseChart.destroy();
  }

  window.expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{
        data: [
          categoriesTotal.Food,
          categoriesTotal.Travel,
          categoriesTotal.Rent,
          categoriesTotal.Others,
        ],
        backgroundColor: ["#FF6347", "#FFD700", "#32CD32", "#1E90FF"],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return tooltipItem.label + ": ₹" + tooltipItem.raw.toFixed(2);
            },
          },
        },
      },
    },
  });
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Expense Report", 20, 20);
  doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 20, 30);
  doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 20, 40);
  doc.text(`Remaining Balance: ₹${(totalIncome - totalExpenses).toFixed(2)}`, 20, 50);

  doc.text("Transaction History:", 20, 60);
  transactions.forEach((transaction, index) => {
    doc.text(`${transaction.title} - ₹${transaction.amount.toFixed(2)} (${transaction.category}) - ${transaction.dateTime}`, 20, 70 + (index * 10));
  });

  const canvas = document.getElementById("expensePieChartCanvas");
  const imgData = canvas.toDataURL("image/png");
  doc.addImage(imgData, "PNG", 20, 100, 180, 160);

  doc.save("expense-report.pdf");
}

function resetAll() {
  totalIncome = 0;
  totalExpenses = 0;
  transactions = [];
  document.getElementById("total-income-input").value = "";
  document.getElementById("solo-expense-title").value = "";
  document.getElementById("solo-expense-amount").value = "";
  document.getElementById("solo-expense-category").value = "";
  updateSummary();
  displayTransactionHistory();
  updateExpenseChart();
}

function setTotalIncome() {
  const income = parseFloat(document.getElementById("total-income-input").value);
  if (!isNaN(income) && income > 0) {
    totalIncome = income;
    document.getElementById("total-income-input").value = "";
    updateSummary();
  } else {
    alert("Please enter a valid income.");
  }
}

function displayDateTime() {
  const dateTimeElement = document.getElementById("current-date-time");
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  dateTimeElement.textContent = now.toLocaleString('en-US', options);
}

document.getElementById("set-income").addEventListener("click", setTotalIncome);
document.getElementById("add-solo-expense").addEventListener("click", addExpense);
document.getElementById("history-filter").addEventListener("change", displayTransactionHistory);
document.getElementById("download-pdf").addEventListener("click", downloadPDF);
document.getElementById("reset-all").addEventListener("click", resetAll);

updateSummary();
displayTransactionHistory();
updateExpenseChart();
displayDateTime();

setInterval(displayDateTime, 1000);