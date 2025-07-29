// ===== Login Logic =====
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
  
        // Sample hardcoded login
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('loggedInUser', username);
          window.location.href = 'index.html';
        } else {
          alert('Invalid credentials!');
        }
      });
    }
  
    // Check login on protected pages
    const protectedPage = document.getElementById('app'); // Add an id="app" to your index.html <body> or wrapper
    if (protectedPage) {
      const user = localStorage.getItem('loggedInUser');
      if (!user) {
        window.location.href = 'login.html';
      } else {
        console.log('Logged in as:', user);
      }
  
      // Add logout button if needed
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('loggedInUser');
          window.location.href = 'login.html';
        });
      }
    }
  });
// ========== APP DATA ==========
// Data keys for localStorage
const STORAGE_KEYS = {
  customers: "travel_crm_customers",
  calls: "travel_crm_calls",
  jobs: "travel_crm_jobs",
  countries: "travel_crm_countries",
};

// Cached DOM
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("#sidebar nav button");

// Sidebar navigation
navButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.target;
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === target);
    });
    if (target === "dashboard") updateDashboard();
    else if (target === "customers") {
      refreshCustomersTable();
      populateDropdowns();
    } else if (target === "calls") {
      refreshCallsTable();
      populateCallCustomerDropdown();
    }
  })
);

// Utilities
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadData(key) {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Initialize default jobs and countries if empty
function initDefaults() {
  let jobs = loadData(STORAGE_KEYS.jobs);
  let countries = loadData(STORAGE_KEYS.countries);

  if (jobs.length === 0) {
    jobs = ["Nurse", "Labor", "Driver", "Housemaid"];
    saveData(STORAGE_KEYS.jobs, jobs);
  }
  if (countries.length === 0) {
    countries = ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman"];
    saveData(STORAGE_KEYS.countries, countries);
  }
}
initDefaults();

// ---- CUSTOMER FORM ----
const customerForm = document.getElementById("customer-form");
const custNameInput = document.getElementById("cust-name");
const custPhoneInput = document.getElementById("cust-phone");
const custLocationInput = document.getElementById("cust-location");
const custCountrySelect = document.getElementById("cust-country");
const custJobSelect = document.getElementById("cust-job");

const addCountryBtn = document.getElementById("add-country-btn");
const delCountryBtn = document.getElementById("del-country-btn");
const addJobBtn = document.getElementById("add-job-btn");
const delJobBtn = document.getElementById("del-job-btn");

let editCustomerId = null; // For editing

// Populate dropdowns for customer form
function populateDropdowns() {
  const countries = loadData(STORAGE_KEYS.countries);
  const jobs = loadData(STORAGE_KEYS.jobs);

  custCountrySelect.innerHTML = "";
  countries.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    custCountrySelect.appendChild(opt);
  });

  custJobSelect.innerHTML = "";
  jobs.forEach((j) => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.textContent = j;
    custJobSelect.appendChild(opt);
  });
}
populateDropdowns();

// Add/Delete Country
addCountryBtn.addEventListener("click", () => {
  const newCountry = prompt("Enter new country name:");
  if (newCountry) {
    let countries = loadData(STORAGE_KEYS.countries);
    if (!countries.includes(newCountry.trim())) {
      countries.push(newCountry.trim());
      saveData(STORAGE_KEYS.countries, countries);
      populateDropdowns();
      alert(`Country "${newCountry.trim()}" added.`);
    } else alert("Country already exists.");
  }
});
delCountryBtn.addEventListener("click", () => {
  const country = custCountrySelect.value;
  if (!country) return alert("Select a country to delete.");
  if (confirm(`Delete "${country}"?`)) {
    let countries = loadData(STORAGE_KEYS.countries);
    countries = countries.filter((c) => c !== country);
    saveData(STORAGE_KEYS.countries, countries);
    populateDropdowns();
  }
});

// Add/Delete Job
addJobBtn.addEventListener("click", () => {
  const newJob = prompt("Enter new job name:");
  if (newJob) {
    let jobs = loadData(STORAGE_KEYS.jobs);
    if (!jobs.includes(newJob.trim())) {
      jobs.push(newJob.trim());
      saveData(STORAGE_KEYS.jobs, jobs);
      populateDropdowns();
      alert(`Job "${newJob.trim()}" added.`);
    } else alert("Job already exists.");
  }
});
delJobBtn.addEventListener("click", () => {
  const job = custJobSelect.value;
  if (!job) return alert("Select a job to delete.");
  if (confirm(`Delete "${job}"?`)) {
    let jobs = loadData(STORAGE_KEYS.jobs);
    jobs = jobs.filter((j) => j !== job);
    saveData(STORAGE_KEYS.jobs, jobs);
    populateDropdowns();
  }
});

// Add/Edit Customer
customerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = custNameInput.value.trim();
  const phone = custPhoneInput.value.trim();
  const location = custLocationInput.value.trim();
  const country = custCountrySelect.value;
  const job = custJobSelect.value;

  if (!name || !phone || !location || !country || !job) {
    alert("Please fill in all fields.");
    return;
  }

  let customers = loadData(STORAGE_KEYS.customers);

  if (editCustomerId !== null) {
    const idx = customers.findIndex((c) => c.id === editCustomerId);
    if (idx !== -1) {
      customers[idx] = {
        ...customers[idx],
        name,
        phone,
        location,
        country,
        job,
      };
    }
    editCustomerId = null;
    customerForm.querySelector("button[type=submit]").textContent = "Add Customer";
  } else {
    const id = Date.now();
    customers.push({
      id,
      name,
      phone,
      location,
      country,
      job,
      visited: false,
      confirmed: false,
    });
  }

  saveData(STORAGE_KEYS.customers, customers);
  customerForm.reset();
  populateDropdowns();
  refreshCustomersTable();
  updateDashboard();
});

// Refresh customer table
function refreshCustomersTable() {
  const tbody = document.querySelector("#customers-table tbody");
  const customers = loadData(STORAGE_KEYS.customers);
  tbody.innerHTML = "";

  customers.forEach((cust) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cust.name}</td>
      <td>${cust.phone}</td>
      <td>${cust.location}</td>
      <td>${cust.country}</td>
      <td>${cust.job}</td>
      <td><button class="small btn-secondary visit-btn" data-id="${cust.id}">${cust.visited ? "✔️ Visited" : "Mark Visit"}</button></td>
      <td><button class="small btn-secondary confirm-btn" data-id="${cust.id}">${cust.confirmed ? "✔️ Confirmed" : "Mark Confirm"}</button></td>
      <td>
        <button class="small" data-action="edit" data-id="${cust.id}">✏️</button>
        <button class="small delete" data-action="delete" data-id="${cust.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button.visit-btn").forEach((btn) =>
    btn.addEventListener("click", () => toggleVisitStatus(btn.dataset.id))
  );
  tbody.querySelectorAll("button.confirm-btn").forEach((btn) =>
    btn.addEventListener("click", () => toggleConfirmStatus(btn.dataset.id))
  );
  tbody.querySelectorAll("button[data-action=edit]").forEach((btn) =>
    btn.addEventListener("click", () => startEditCustomer(btn.dataset.id))
  );
  tbody.querySelectorAll("button[data-action=delete]").forEach((btn) =>
    btn.addEventListener("click", () => deleteCustomer(btn.dataset.id))
  );
}

function toggleVisitStatus(id) {
  let customers = loadData(STORAGE_KEYS.customers);
  const idx = customers.findIndex((c) => c.id == id);
  if (idx !== -1) {
    customers[idx].visited = !customers[idx].visited;
    saveData(STORAGE_KEYS.customers, customers);
    refreshCustomersTable();
    updateDashboard();
  }
}

function toggleConfirmStatus(id) {
  let customers = loadData(STORAGE_KEYS.customers);
  const idx = customers.findIndex((c) => c.id == id);
  if (idx !== -1) {
    customers[idx].confirmed = !customers[idx].confirmed;
    saveData(STORAGE_KEYS.customers, customers);
    refreshCustomersTable();
    updateDashboard();
  }
}

function startEditCustomer(id) {
  let customers = loadData(STORAGE_KEYS.customers);
  const cust = customers.find((c) => c.id == id);
  if (!cust) return;

  custNameInput.value = cust.name;
  custPhoneInput.value = cust.phone;
  custLocationInput.value = cust.location;
  custCountrySelect.value = cust.country;
  custJobSelect.value = cust.job;

  editCustomerId = cust.id;
  customerForm.querySelector("button[type=submit]").textContent = "Update Customer";
  document.querySelector("#sidebar nav button[data-target=customers]").click();
}

function deleteCustomer(id) {
  if (!confirm("Delete this customer? This will also delete their calls.")) return;
  let customers = loadData(STORAGE_KEYS.customers);
  customers = customers.filter((c) => c.id != id);
  saveData(STORAGE_KEYS.customers, customers);

  let calls = loadData(STORAGE_KEYS.calls);
  calls = calls.filter((call) => call.customerId != id);
  saveData(STORAGE_KEYS.calls, calls);

  refreshCustomersTable();
  refreshCallsTable();
  updateDashboard();
}

// ---- CALL FORM ----
const callForm = document.getElementById("call-form");
const callCustomerSelect = document.getElementById("call-customer");
const callDateInput = document.getElementById("call-date");
const followUpDateInput = document.getElementById("followup-date");
const callDescInput = document.getElementById("call-desc");

let editCallId = null;

function populateCallCustomerDropdown() {
  const customers = loadData(STORAGE_KEYS.customers);
  callCustomerSelect.innerHTML = "";
  customers.forEach((cust) => {
    const opt = document.createElement("option");
    opt.value = cust.id;
    opt.textContent = `${cust.name} (${cust.phone})`;
    callCustomerSelect.appendChild(opt);
  });
}
populateCallCustomerDropdown();

callForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const customerId = callCustomerSelect.value;
  const callDate = callDateInput.value;
  const followUpDate = followUpDateInput.value;
  const desc = callDescInput.value.trim();

  if (!customerId || !callDate) {
    alert("Please select customer and call date.");
    return;
  }

  let calls = loadData(STORAGE_KEYS.calls);

  if (editCallId !== null) {
    const idx = calls.findIndex((c) => c.id === editCallId);
    if (idx !== -1) {
      calls[idx] = { ...calls[idx], customerId, callDate, followUpDate, desc };
    }
    editCallId = null;
    callForm.querySelector("button[type=submit]").textContent = "Add Call Log";
  } else {
    calls.push({ id: Date.now(), customerId, callDate, followUpDate, desc });
  }

  saveData(STORAGE_KEYS.calls, calls);
  callForm.reset();
  populateCallCustomerDropdown();
  refreshCallsTable();
  updateDashboard();
});

function refreshCallsTable() {
  const tbody = document.querySelector("#calls-table tbody");
  tbody.innerHTML = "";

  const calls = loadData(STORAGE_KEYS.calls);
  const customers = loadData(STORAGE_KEYS.customers);

  calls.forEach((call) => {
    const cust = customers.find((c) => c.id == call.customerId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cust ? cust.name : "Unknown"}</td>
      <td>${cust ? cust.job : "-"}</td>
      <td>${cust ? cust.country : "-"}</td>
      <td>${call.callDate}</td>
      <td>${call.followUpDate || "-"}</td>
      <td>${call.desc || ""}</td>
      <td>
        <button class="small" data-action="edit" data-id="${call.id}">✏️</button>
        <button class="small delete" data-action="delete" data-id="${call.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button[data-action=edit]").forEach((btn) =>
    btn.addEventListener("click", () => startEditCall(btn.dataset.id))
  );
  tbody.querySelectorAll("button[data-action=delete]").forEach((btn) =>
    btn.addEventListener("click", () => deleteCall(btn.dataset.id))
  );
}

function startEditCall(id) {
  const calls = loadData(STORAGE_KEYS.calls);
  const call = calls.find((c) => c.id == id);
  if (!call) return;

  callCustomerSelect.value = call.customerId;
  callDateInput.value = call.callDate;
  followUpDateInput.value = call.followUpDate || "";
  callDescInput.value = call.desc || "";

  editCallId = call.id;
  callForm.querySelector("button[type=submit]").textContent = "Update Call Log";
  document.querySelector("#sidebar nav button[data-target=calls]").click();
}

function deleteCall(id) {
  if (!confirm("Delete this call log?")) return;

  let calls = loadData(STORAGE_KEYS.calls);
  calls = calls.filter((c) => c.id != id);
  saveData(STORAGE_KEYS.calls, calls);

  refreshCallsTable();
  updateDashboard();
}

// ---- DASHBOARD UPDATE ----
function updateDashboard() {
  const customers = loadData(STORAGE_KEYS.customers);
  const calls = loadData(STORAGE_KEYS.calls);

  document.getElementById("stat-customers").textContent = customers.length;
  document.getElementById("stat-calls").textContent = calls.length;
  document.getElementById("stat-visited").textContent =
    customers.filter((c) => c.visited).length;
  document.getElementById("stat-confirmed").textContent =
    customers.filter((c) => c.confirmed).length;
}

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const navButtons = sidebar.querySelectorAll('nav button');

  // Toggle sidebar on hamburger click
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('show');
  });

  // Close sidebar on nav click (mobile only)
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
      }
    });
  });
});

// Initial load
refreshCustomersTable();
refreshCallsTable();
updateDashboard();