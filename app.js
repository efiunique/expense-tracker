// دسته‌های هزینه
const categories = ["خوراک", "رفت‌وآمد", "تفریح", "سایر"];

// گرفتن عنصرهای صفحه
const expenseForm = document.getElementById("expense-form");
const titleInput = document.getElementById("title-input");
const amountInput = document.getElementById("amount-input");
const categoryInput = document.getElementById("category-input");
const errorMessage = document.getElementById("error-message");
const totalAmount = document.getElementById("total-amount");
const categorySummary = document.getElementById("category-summary");
const filterSelect = document.getElementById("filter-select");
const expenseList = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const themeButton = document.getElementById("theme-button");

// لیست هزینه‌ها؛ اول خالی است و loadExpenses آن را از localStorage پر می‌کند
let expenses = [];


// ---------- ذخیره و خواندن ----------

function loadExpenses() {
  const saved = localStorage.getItem("expenses");

  //اگر چیزی ذخیره نشده بود لیست خالی رو برمیگردونه
  if (saved === null) {
    return
  }


  
  // agar matn vared shode kharab bashe JSON.parse error mide va (try/catch) jologiri mikone az error
  // agar tuye try be error bokhorim catch run mishe
  try {
    const data = JSON.parse(saved);
    // check kardan array budan
    if (Array.isArray(data)) {
      expenses = data; 
    }
    else {
      expenses = [];
    }

  } 
  catch (error) {
    expenses = []
  }


}

function saveExpenses() {
  // localStorage فقط متن نگه می‌دارد، پس آرایه را اول به متن تبدیل می‌کنیم
  localStorage.setItem("expenses", JSON.stringify(expenses));
}


// ---------- توابع کمکی ----------

// عدد را با جداکننده‌ی هزارگان و رقم فارسی نشان می‌دهد: ۱٬۲۵۰٬۰۰۰ تومان
function formatMoney(number) {
  return number.toLocaleString("fa-IR") + " تومان";
}

// مبلغی را که کاربر نوشته به متن عددی تمیز تبدیل می‌کند
// مثال: " ۱۲٬۰۰۰ " ← "12000"
function cleanAmount(text) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  text = text.trim();

  // هر رقم فارسی را با رقم انگلیسی هم‌شماره‌اش عوض کن
  for (let i = 0; i < persianDigits.length; i++) {
    text = text.split(persianDigits[i]).join(i);
  }

  // ویرگول انگلیسی و فارسی را حذف کن
  text = text.split(",").join("");
  text = text.split("٬").join("");

  return text;
}


// ---------- افزودن و حذف ----------

function addExpense(event) {
  // جلوی رفرش شدن صفحه را بگیر
  event.preventDefault();

  const title = titleInput.value.trim();
  const amountText = cleanAmount(amountInput.value);
  const amount = Number(amountText);

  // اعتبارسنجی
  if (title === "") {
    errorMessage.textContent = "لطفاً عنوان هزینه را وارد کنید.";
    return;
  }

  // اگر مبلغ حرف یا اعشار باشد isInteger نادرست است؛ اگر خالی باشد عددش ۰ می‌شود
  if (!Number.isInteger(amount) || amount <= 0) {
    errorMessage.textContent = "لطفاً مبلغ معتبر (عدد صحیح بیشتر از صفر) وارد کنید.";
    return;
  }

  const newExpense = {
    id: Date.now(),
    title: title,
    amount: amount,
    category: categoryInput.value
  };

  expenses.push(newExpense);
  saveExpenses();

  // فرم را برای هزینه‌ی بعدی آماده کن
  errorMessage.textContent = "";
  titleInput.value = "";
  amountInput.value = "";
  titleInput.focus();

  showAll();
}

function deleteExpense(id) {
  // یک لیست جدید می‌سازیم که همه‌ی هزینه‌ها را دارد جز هزینه‌ای که حذف می‌شود
  const newList = [];

  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].id !== id) {
      newList.push(expenses[i]);
    }
  }

  expenses = newList;
  saveExpenses();
  showAll();
}


// ---------- نمایش لیست ----------

// یک ردیف (li) برای یک هزینه می‌سازد
function makeExpenseItem(expense) {
  const item = document.createElement("li");
  item.className = "expense-item";

  const text = document.createElement("span");
  text.className = "expense-text";
  text.textContent = expense.title + " | " + expense.category + " | " + formatMoney(expense.amount);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "حذف";
  deleteButton.addEventListener("click", function () {
    deleteExpense(expense.id);
  });

  item.appendChild(text);
  item.appendChild(deleteButton);

  return item;
}

function showExpenseList() {
  const selectedCategory = filterSelect.value;
  let count = 0;

  // لیست قدیمی را پاک کن تا ردیف‌ها دوبار نیایند
  expenseList.innerHTML = "";

  // از آخر به اول می‌رویم تا جدیدترین هزینه بالا باشد
  for (let i = expenses.length - 1; i >= 0; i--) {
    const expense = expenses[i];

    // فقط هزینه‌هایی که با فیلتر می‌خوانند نمایش داده می‌شوند
    if (selectedCategory === "همه" || expense.category === selectedCategory) {
      expenseList.appendChild(makeExpenseItem(expense));
      count = count + 1;
    }
  }

  // اگر چیزی برای نمایش نبود، پیام خالی بودن را نشان بده
  if (count === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }
}


// ---------- نمایش جمع‌ها و نمودار ----------

// جمع مبلغ هزینه‌های یک دسته
function sumByCategory(category) {
  let sum = 0;

  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].category === category) {
      sum = sum + expenses[i].amount;
    }
  }

  return sum;
}

function showSummary() {
  // جمع کل
  let total = 0;
  for (let i = 0; i < expenses.length; i++) {
    total = total + expenses[i].amount;
  }
  totalAmount.textContent = formatMoney(total);

  // جمع هر دسته و نمودار درصد
  categorySummary.innerHTML = "";

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryTotal = sumByCategory(category);

    // اگر جمع کل صفر باشد تقسیم نمی‌کنیم تا خطا نگیریم
    let percent = 0;
    if (total > 0) {
      percent = Math.round((categoryTotal / total) * 100);
    }

    const item = document.createElement("li");

    const text = document.createElement("p");
    text.className = "summary-text";
    text.textContent = category + ": " + formatMoney(categoryTotal) + " (" + percent.toLocaleString("fa-IR") + "٪)";

    // نوار خاکستری و داخلش نوار رنگی که عرضش برابر درصد است
    const bar = document.createElement("div");
    bar.className = "bar";

    const barFill = document.createElement("div");
    barFill.className = "bar-fill";
    barFill.style.width = percent + "%";

    bar.appendChild(barFill);
    item.appendChild(text);
    item.appendChild(bar);
    categorySummary.appendChild(item);
  }
}

// هم لیست و هم جمع‌ها را دوباره می‌کشد
function showAll() {
  showExpenseList();
  showSummary();
}


// ---------- حالت تاریک ----------

function toggleTheme() {
  // کلاس dark را اگر نبود اضافه کن، اگر بود بردار
  document.body.classList.toggle("dark");

  // انتخاب کاربر را ذخیره کن تا بعد از رفرش بماند
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}


// ---------- رویدادها و شروع برنامه ----------

expenseForm.addEventListener("submit", addExpense);
filterSelect.addEventListener("change", showExpenseList);
themeButton.addEventListener("click", toggleTheme);

loadExpenses();
loadTheme();
showAll();
