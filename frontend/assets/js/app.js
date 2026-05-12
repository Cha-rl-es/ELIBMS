(function () {
  const PAGES = {
    login: "login.php",
    dashboard: "dashboard.php",
    inventory: "inventory.php",
    borrow: "borrow.php",
    return: "return.php",
    records: "history.php",
    staffLibrary: "staff-library.php",
    staffDashboard: "staff-dashboard.php",
  };

  const KEYS = {
    auth: "elbis_auth",
    books: "elbis_books",
    transactions: "elbis_transactions",
    users: "elbis_users",
    students: "elbis_students",
    adminActivity: "elbis_admin_activity",
    libraryLog: "elbis_library_log",
    icsRecords: "elbis_ics_records",
    systemSettings: "elbis_system_settings",
  };

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function shortId(id, len) {
    const s = String(id || "");
    if (!s) return "-";
    return s.length <= (len || 10) ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
  }

  function borrowedOutForBook(bookId, transactions) {
    return transactions.filter((t) => t.bookId === bookId && t.status === "Borrowed").length;
  }

  function totalPhysicalCopies(book, transactions) {
    return Number(book.quantity || 0) + borrowedOutForBook(book.id, transactions) + Number(book.damagedQty || 0);
  }

  function overdueBorrowedTxn(t, todayStr) {
    return t.status === "Borrowed" && t.dueDate && String(t.dueDate) < String(todayStr);
  }

  function daysLate(dueISO) {
    if (!dueISO) return "0";
    const dueMs = Date.parse(`${dueISO}T12:00:00`);
    if (!Number.isFinite(dueMs)) return "—";
    const diff = Math.floor((Date.now() - dueMs) / 86400000);
    return String(Math.max(0, diff));
  }

  function logLibraryActivity(activity, actionType, userName) {
    const auth = getJSON(KEYS.auth, null);
    const logs = getJSON(KEYS.libraryLog, []);
    logs.unshift({
      id: uid(),
      activity,
      userName: userName || auth?.name || auth?.email || "System",
      actionType,
      timestamp: new Date().toISOString(),
    });
    setJSON(KEYS.libraryLog, logs.slice(0, 200));
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  const EVSU_EMAIL_SUFFIX = "@evsu.edu.ph";

  function isEvsuEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return e.endsWith(EVSU_EMAIL_SUFFIX) && e.length > EVSU_EMAIL_SUFFIX.length;
  }

  async function sha256Hex(plain) {
    if (!window.crypto?.subtle) return null;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function hashPasswordForStorage(plain) {
    const hex = await sha256Hex(plain);
    if (!hex) return plain;
    return `sha256:${hex}`;
  }

  async function verifyStoredPassword(stored, plain) {
    if (plain == null || plain === "") return false;
    const s = String(stored);
    if (s.startsWith("sha256:")) {
      const hex = await sha256Hex(plain);
      return Boolean(hex && s === `sha256:${hex}`);
    }
    return s === plain;
  }

  const seedUsers = [
    { id: uid(), name: "Library Admin", email: "admin@evsu.edu.ph", password: "admin123", role: "Admin" },
    { id: uid(), name: "Library Staff", email: "staff@evsu.edu.ph", password: "staff123", role: "Staff" },
  ];
  const seedStudents = [
    {
      id: uid(),
      studentId: "2024-00321",
      name: "Student User",
      email: "student@evsu.edu.ph",
      phone_number: "09171234567",
      password: "student123",
      role: "Student",
      course: "BS Information Technology",
      yearLevel: "3",
    },
  ];
  const seedBooks = [
    { id: uid(), title: "Clean Code", author: "Robert C. Martin", category: "Programming", year: "2008", quantity: 4 },
    { id: uid(), title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Programming", year: "1999", quantity: 2 },
    { id: uid(), title: "Atomic Habits", author: "James Clear", category: "Self-help", year: "2018", quantity: 5 },
  ];

  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }
  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function migrateLibraryModels() {
    let books = getJSON(KEYS.books, []).map((b) => ({
      ...b,
      title: b.title || "Untitled",
      author: b.author || "",
      category: b.category || "General",
      quantity: Number.isFinite(Number(b.quantity)) ? Number(b.quantity) : 0,
      isbn: b.isbn != null ? String(b.isbn) : "",
      publisher: b.publisher != null ? String(b.publisher) : "",
      year: b.year != null ? String(b.year) : "",
      shelf: b.shelf != null ? String(b.shelf) : "",
      description: b.description != null ? String(b.description) : "",
      cover: b.cover || "",
      accessionNo:
        b.accessionNo ||
        `ACC-${String(b.id || "")
          .replace(/\W/g, "")
          .slice(-6)
          .toUpperCase()}`,
      archived: !!b.archived,
      damagedQty: Number(b.damagedQty) || 0,
      dateAdded: b.dateAdded || todayISO(),
    }));

    const students = getJSON(KEYS.students, []).map((s) => ({
      ...s,
      studentId:
        s.studentId ||
        `ST-${String(s.id || "")
          .replace(/\W/g, "")
          .slice(-6)
          .toUpperCase()}`,
      phone_number: s.phone_number != null ? String(s.phone_number) : s.phone != null ? String(s.phone) : "",
      course: s.course || "—",
      yearLevel: s.yearLevel || "—",
    }));

    const txns = getJSON(KEYS.transactions, []).map((t) => ({
      ...t,
      borrowerEmail: t.borrowerEmail || "",
      borrowerStudentId: t.borrowerStudentId || "",
      studentCourse: t.studentCourse || "",
      studentYearLevel: t.studentYearLevel || "",
      borrowedByName: t.borrowedByName || "",
      returnedToName: t.returnedToName || "",
      penalty: t.penalty != null ? String(t.penalty) : "",
      returnCondition: t.returnCondition || "",
      remarks: t.remarks || "",
      returnId: t.returnId || "",
    }));

    const ics = getJSON(KEYS.icsRecords, []).map((r) => ({
      id: r.id || uid(),
      bookId: r.bookId || r.book_id || "",
      quantity: Number.isFinite(Number(r.quantity)) ? Number(r.quantity) : 0,
      dateReceived: r.dateReceived || r.date_received || r.createdAt || todayISO(),
      recordedBy: r.recordedBy || r.recorded_by || r.studentName || "System",
    }));

    setJSON(KEYS.books, books);
    setJSON(KEYS.students, students);
    setJSON(KEYS.transactions, txns);
    setJSON(KEYS.icsRecords, ics);
  }

  function ensureData() {
    if (!localStorage.getItem(KEYS.users)) {
      setJSON(KEYS.users, seedUsers);
    } else {
      const users = getJSON(KEYS.users, []);
      if (!Array.isArray(users) || users.length === 0) setJSON(KEYS.users, seedUsers);
    }

    if (!localStorage.getItem(KEYS.students)) {
      setJSON(KEYS.students, seedStudents);
    } else {
      const students = getJSON(KEYS.students, []);
      if (!Array.isArray(students) || students.length === 0) setJSON(KEYS.students, seedStudents);
    }

    if (!localStorage.getItem(KEYS.books)) setJSON(KEYS.books, seedBooks);
    if (!localStorage.getItem(KEYS.transactions)) setJSON(KEYS.transactions, []);
    if (!localStorage.getItem(KEYS.adminActivity)) setJSON(KEYS.adminActivity, []);
    if (!localStorage.getItem(KEYS.libraryLog)) setJSON(KEYS.libraryLog, []);
    if (!localStorage.getItem(KEYS.icsRecords)) {
      const seedBook = seedBooks[0];
      setJSON(KEYS.icsRecords, [
        {
          id: uid(),
          bookId: seedBook.id,
          quantity: 2,
          dateReceived: todayISO(),
          recordedBy: "Library Admin",
        },
      ]);
    }

    migrateLibraryModels();
  }

  function getAuth() {
    return getJSON(KEYS.auth, null);
  }
  function isAuthenticated() {
    const auth = getAuth();
    return !!(auth && auth.email && auth.type === "user");
  }
  function isStudentAuthenticated() {
    const auth = getAuth();
    return !!(auth && auth.email && auth.type === "student");
  }

  function requireAuth() {
    const page = document.body.dataset.page;
    if (page === "login" || page === "student-login") {
      const auth = getAuth();
      if (auth?.type === "superadmin") localStorage.removeItem(KEYS.auth);
      return;
    }
    if (isAuthenticated()) return;

    window.location.href = PAGES.login;
  }

  function statusBadge(quantity) {
    if (quantity <= 0) return '<span class="badge badge-danger">Out of Stock</span>';
    if (quantity <= 2) return '<span class="badge badge-warning">Low Stock</span>';
    return '<span class="badge badge-success">Available</span>';
  }

  function bookRowStatus(book, borrowedOut) {
    if (book.archived) return '<span class="badge badge-warning">Archived</span>';
    const lendable = Number(book.quantity || 0);
    if (lendable <= 0) return '<span class="badge badge-danger">Unavailable</span>';
    if (lendable <= 2) return '<span class="badge badge-warning">Low Stock</span>';
    return '<span class="badge badge-success">Active</span>';
  }

  function borrowTxnStatus(txn, todayStr) {
    if (txn.status === "Returned")
      return txn.returnCondition === "Damaged" ? '<span class="badge badge-warning">Returned (Damaged)</span>' : '<span class="badge badge-success">Returned</span>';
    if (txn.status === "Lost") return '<span class="badge badge-danger">Lost</span>';
    if (overdueBorrowedTxn(txn, todayStr)) return '<span class="badge badge-danger">Overdue</span>';
    return '<span class="badge badge-success">Borrowed</span>';
  }

  function effectiveLoanStatus(txn) {
    const today = todayISO();
    if (txn.status === "Returned") return txn.returnCondition === "Damaged" ? "Returned (Damaged)" : "Returned";
    if (txn.status === "Lost") return "Lost";
    if (overdueBorrowedTxn(txn, today)) return "Overdue";
    return "Borrowed";
  }

  function historyTransactionType(txn) {
    return txn.status === "Returned" || txn.status === "Lost" ? "Borrow / Return" : "Borrow";
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("show");
      modal.style.display = "flex";
    }
  }
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
    }
  }

  function initPasswordToggles() {
    const toggles = document.querySelectorAll(".password-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", function () {
        const targetId = btn.dataset.target;
        const input = targetId ? document.getElementById(targetId) : null;
        if (!input) return;

        const showingPassword = input.type === "text";
        input.type = showingPassword ? "password" : "text";
        btn.innerHTML = showingPassword
          ? '<i class="fa-solid fa-eye"></i>'
          : '<i class="fa-solid fa-eye-slash"></i>';
        btn.setAttribute("aria-label", showingPassword ? "Show password" : "Hide password");
      });
    });
  }

  function logAdminActivity(type, message) {
    const logs = getJSON(KEYS.adminActivity, []);
    logs.unshift({
      id: uid(),
      type,
      message,
      timestamp: new Date().toISOString(),
      user: getAuth()?.name || "System",
      role: getAuth()?.role || "System",
      module: "Admin Management",
      ip: "127.0.0.1",
    });
    setJSON(KEYS.adminActivity, logs.slice(0, 100));
  }

  function renderActivityLog() {
    const body = document.getElementById("activityLogBody");
    const totalNode = document.getElementById("logTotalActions");
    const addsNode = document.getElementById("logAdds");
    const deletesNode = document.getElementById("logDeletes");
    if (!body) return;

    const logs = getJSON(KEYS.adminActivity, []);
    const adds = logs.filter((log) => log.type === "add").length;
    const deletes = logs.filter((log) => log.type === "delete").length;

    if (totalNode) totalNode.textContent = logs.length;
    if (addsNode) addsNode.textContent = adds;
    if (deletesNode) deletesNode.textContent = deletes;

    if (!logs.length) {
      body.innerHTML = "<tr><td colspan='4' class='muted'>No activity recorded yet.</td></tr>";
      return;
    }

    body.innerHTML = logs
      .slice(0, 20)
      .map(
        (entry) =>
          `<tr><td>${new Date(entry.timestamp).toLocaleString()}</td><td>${entry.type === "add" ? "Admin Added" : "Admin Removed"}</td><td>${entry.message}</td><td>${entry.type === "add" ? "Success" : "Success"}</td></tr>`
      )
      .join("");
  }

  function attachModalClosers() {
    document.addEventListener("click", function (e) {
      const openBtn = e.target.closest("[data-open-modal]");
      if (openBtn) {
        e.preventDefault();
        openModal(openBtn.dataset.openModal);
      }

      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        e.preventDefault();
        closeModal(closeBtn.dataset.closeModal);
      }
    });
  }

  function navHandlers() {
    document.querySelectorAll("[data-action='logout']").forEach((btn) => {
      btn.addEventListener("click", function () {
        localStorage.removeItem(KEYS.auth);
        window.location.href = "logout.php";
      });
    });

    document.querySelectorAll("[data-action='student-logout']").forEach((btn) => {
      btn.addEventListener("click", function () {
        localStorage.removeItem(KEYS.auth);
        window.location.href = "logout.php";
      });
    });

    const currentPage = document.body.dataset.page;
    document.querySelectorAll(".nav-link[data-page-target]").forEach((link) => {
      if (link.dataset.pageTarget === currentPage) link.classList.add("active");
    });

    const auth = getAuth();
    const label = document.getElementById("currentUserLabel");
    if (label && auth) label.textContent = auth.name || auth.email;

    const initialsButtons = document.querySelectorAll(".user-circle-btn");
    initialsButtons.forEach((initialsBtn) => {
      if (!auth) return;
      const role = String(auth.role || "").toLowerCase();
      if (role === "admin") {
        initialsBtn.textContent = "A";
      } else if (role === "library staff") {
        initialsBtn.textContent = "LS";
      } else {
        initialsBtn.textContent = String(auth.name || auth.email).charAt(0).toUpperCase();
      }
    });

    document.querySelectorAll("[data-role-badge]").forEach((el) => {
      const roleLabel = auth?.role || "Librarian";
      el.textContent = roleLabel;
      const tone = roleLabel === "Student" ? "student" : "librarian";
      el.className = `role-badge ${tone}`;
    });

    document.querySelectorAll("[data-admin-name]").forEach((el) => {
      el.textContent = auth?.name || auth?.email || "Admin";
    });

    const profileDropdown = document.querySelector(".profile-dropdown");
    const userCircleBtn = document.getElementById("userCircleBtn");
    if (profileDropdown && userCircleBtn) {
      userCircleBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        profileDropdown.classList.toggle("active");
      });
      document.addEventListener("click", function (event) {
        if (!profileDropdown.contains(event.target)) profileDropdown.classList.remove("active");
      });
      profileDropdown.querySelectorAll(".dropdown-menu a, .dropdown-menu button").forEach((item) => {
        item.addEventListener("click", function () {
          profileDropdown.classList.remove("active");
        });
      });
    }

    const profileForm = document.getElementById("profileForm");
    if (profileForm && auth) {
      const nameEl = document.getElementById("profileName");
      const emailEl = document.getElementById("profileEmail");
      if (nameEl) nameEl.value = auth.name || "";
      if (emailEl) emailEl.value = auth.email || "";
      profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("profileName")?.value.trim() || "";
        const email = document.getElementById("profileEmail")?.value.trim() || "";
        const password = document.getElementById("profilePassword")?.value.trim() || "";
        const keyMap = {
          user: KEYS.users,
          student: KEYS.students,
        };
        const targetKey = keyMap[auth.type] || KEYS.users;
        const records = getJSON(targetKey, []);
        const idx = records.findIndex((u) => u.id === auth.id);
        if (idx === -1) return;
        records[idx].name = name || records[idx].name;
        records[idx].email = email || records[idx].email;
        if (password) {
          records[idx].password =
            auth.type === "student" ? (await hashPasswordForStorage(password)) || password : password;
        }
        setJSON(targetKey, records);
        setJSON(KEYS.auth, { ...auth, name: records[idx].name, email: records[idx].email });
        closeModal("profileModal");
        window.location.reload();
      });
    }
  }

  function initTopbarWidgets() {
    const dateTimeEl = document.getElementById("liveDateTime");
    if (!dateTimeEl) return;
    const tick = () => {
      const now = new Date();
      dateTimeEl.textContent = now.toLocaleString();
    };
    tick();
    setInterval(tick, 1000);
  }

  function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    // Staff sign-in is handled by PHP (login-action.php + session). Native form POST is used.
  }

  function initStudentAuthPage() {
    const loginForm = document.getElementById("studentLoginForm");
    const registerForm = document.getElementById("studentRegisterForm");
    if (!loginForm && !registerForm) return;

    if (isStudentAuthenticated()) {
      window.location.href = PAGES.studentDashboard;
      return;
    }

    document.querySelectorAll("[data-login-tab]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-login-tab");
        document.querySelectorAll("[data-login-tab]").forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        const signin = document.getElementById("studentLoginPanel");
        const reg = document.getElementById("studentRegisterPanel");
        if (signin) signin.hidden = key !== "signin";
        if (reg) reg.hidden = key !== "register";
      });
    });

    if (loginForm) {
      const msg = document.getElementById("studentLoginMessage");
      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("studentEmail").value.trim();
        const password = document.getElementById("studentPassword").value;

        if (!email || !password) {
          if (msg) {
            msg.textContent = "Please enter your EVSU email and password.";
            msg.className = "message error";
          }
          return;
        }

        if (!isEvsuEmail(email)) {
          if (msg) {
            msg.textContent = "Please use a valid EVSU email address.";
            msg.className = "message error";
          }
          return;
        }

        const students = getJSON(KEYS.students, []);
        const found = students.find((s) => String(s.email || "").toLowerCase() === email.toLowerCase());
        if (!found) {
          if (msg) {
            msg.textContent = "Account is not registered.";
            msg.className = "message error";
          }
          return;
        }

        const ok = await verifyStoredPassword(found.password, password);
        if (!ok) {
          if (msg) {
            msg.textContent = "Invalid email or password.";
            msg.className = "message error";
          }
          return;
        }

        setJSON(KEYS.auth, {
          type: "student",
          id: found.id,
          name: found.name,
          email: found.email,
          role: "Student",
        });

        if (msg) {
          msg.textContent = "";
          msg.className = "message";
        }
        window.location.href = PAGES.studentDashboard;
      });
    }

    if (registerForm) {
      const msg = document.getElementById("studentRegisterMessage");
      registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const password = document.getElementById("regPassword").value;
        const password2 = document.getElementById("regPasswordConfirm").value;

        if (!name || !email || !phone || !password) {
          if (msg) {
            msg.textContent = "Please fill in all required fields.";
            msg.className = "message error";
          }
          return;
        }

        if (!isEvsuEmail(email)) {
          if (msg) {
            msg.textContent = "Please use a valid EVSU email address.";
            msg.className = "message error";
          }
          return;
        }

        if (password.length < 6) {
          if (msg) {
            msg.textContent = "Password must be at least 6 characters.";
            msg.className = "message error";
          }
          return;
        }

        if (password !== password2) {
          if (msg) {
            msg.textContent = "Passwords do not match.";
            msg.className = "message error";
          }
          return;
        }

        const students = getJSON(KEYS.students, []);
        const users = getJSON(KEYS.users, []);
        const em = email.toLowerCase();
        if (students.some((s) => String(s.email || "").toLowerCase() === em)) {
          if (msg) {
            msg.textContent = "Email is already registered.";
            msg.className = "message error";
          }
          return;
        }
        if (users.some((u) => String(u.email || "").toLowerCase() === em)) {
          if (msg) {
            msg.textContent = "This email is already in use.";
            msg.className = "message error";
          }
          return;
        }

        const nid = uid();
        const hashed = await hashPasswordForStorage(password);
        students.push({
          id: nid,
          studentId: `ST-${String(nid)
            .replace(/\W/g, "")
            .slice(-6)
            .toUpperCase()}`,
          name,
          email,
          phone_number: phone,
          password: hashed,
          role: "Student",
          course: "",
          yearLevel: "",
        });
        setJSON(KEYS.students, students);

        if (msg) {
          msg.textContent = "Account created successfully. Sign in below.";
          msg.className = "message success";
        }
        registerForm.reset();
        const emailIn = document.getElementById("studentEmail");
        if (emailIn) emailIn.value = email;
        document.querySelector("[data-login-tab='signin']")?.click();
      });
    }
  }

  function initStudentLibrary() {
    const form = document.getElementById("studentBorrowForm");
    const select = document.getElementById("studentBorrowBook");
    const catalogBody = document.getElementById("studentLibraryTableBody");
    if (!isAuthenticated()) return;

    if (catalogBody) {
      const rows = getJSON(KEYS.books, [])
        .filter((b) => !b.archived)
        .map(
          (b) =>
            `<tr><td>${shortId(b.id)}</td><td>${b.title || "—"}</td><td>${b.author || "—"}</td><td>${b.category || "—"}</td><td>${b.year || "—"}</td><td>${Number(b.quantity || 0)}</td></tr>`
        );
      catalogBody.innerHTML = rows.length ? rows.join("") : "<tr><td colspan='6' class='muted'>No books found.</td></tr>";
    }
    if (!form || !select) return;

    const auth = getAuth();
    const msg = document.getElementById("studentBorrowMessage");

    const borrowDateEl = document.getElementById("studentBorrowDate");
    const dueDateEl = document.getElementById("studentDueDate");

    const historySearchEl = document.getElementById("studentHistorySearch");
    const historyStatusEl = document.getElementById("studentStatusFilter");
    const historyBodyEl = document.getElementById("studentHistoryTableBody");

    function renderBorrowableBooks() {
      const options = getBorrowableBooks();
      select.innerHTML = options.length
        ? options.map((b) => `<option value="${b.id}">${b.title} (${b.quantity} left)</option>`).join("")
        : "<option value=''>No available books</option>";
    }

    function isTxnForCurrentStudent(txn) {
      const email = String(auth.email || "").toLowerCase();
      if (txn.borrowerEmail) return String(txn.borrowerEmail || "").toLowerCase() === email;
      return txn.borrowerName === auth.name;
    }

    function renderStudentHistory() {
      if (!historyBodyEl) return;

      const q = historySearchEl ? historySearchEl.value.trim().toLowerCase() : "";
      const status = historyStatusEl ? historyStatusEl.value : "All";

      const txns = getJSON(KEYS.transactions, []);
      const studentTxns = txns.filter(isTxnForCurrentStudent);

      const filtered = studentTxns.filter((t) => {
        const matchQ = q ? String(t.bookTitle || "").toLowerCase().includes(q) : true;
        const matchStatus = status === "All" || t.status === status;
        return matchQ && matchStatus;
      });

      if (!filtered.length) {
        historyBodyEl.innerHTML = "<tr><td colspan='6' class='muted'>No records found.</td></tr>";
        return;
      }

      historyBodyEl.innerHTML = filtered
        .map(
          (t) => `<tr>
          <td>${t.bookTitle}</td>
          <td>${t.borrowDate}</td>
          <td>${t.returnDate || "-"}</td>
          <td>${t.status}</td>
          <td>${t.dueDate || "-"}</td>
          <td>
            ${
              t.status === "Borrowed"
                ? `<button class="btn-accent icon-btn" data-student-return-id="${t.id}" title="Return"><i class="fa-solid fa-rotate-left"></i></button>`
                : "-"
            }
          </td>
        </tr>`
        )
        .join("");
    }

    function renderAndWire() {
      renderBorrowableBooks();
      renderStudentHistory();
      if (historySearchEl) historySearchEl.addEventListener("input", renderStudentHistory);
      if (historyStatusEl) historyStatusEl.addEventListener("change", renderStudentHistory);
      if (historyBodyEl) {
        historyBodyEl.addEventListener("click", function (e) {
          const btn = e.target.closest("button[data-student-return-id]");
          if (!btn) return;
          const id = btn.getAttribute("data-student-return-id");
          if (!id) return;

          const books = getJSON(KEYS.books, []);
          const txns = getJSON(KEYS.transactions, []);
          const txn = txns.find((t) => t.id === id);
          if (!txn || txn.status !== "Borrowed") return;
          if (!isTxnForCurrentStudent(txn)) return; // safety

          txn.status = "Returned";
          txn.returnDate = new Date().toISOString().slice(0, 10);

          const book = books.find((b) => b.id === txn.bookId);
          if (book) book.quantity += 1;

          setJSON(KEYS.books, books);
          setJSON(KEYS.transactions, txns);

          renderBorrowableBooks();
          renderStudentHistory();
        });
      }
    }

    renderAndWire();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const bookId = select.value;
      const borrowDate = borrowDateEl ? borrowDateEl.value : "";
      const dueDate = dueDateEl ? dueDateEl.value : "";

      if (!bookId || !borrowDate || !dueDate) {
        if (msg) {
          msg.textContent = "Please complete all details.";
          msg.className = "message error";
        }
        return;
      }

      const books = getJSON(KEYS.books, []);
      const transactions = getJSON(KEYS.transactions, []);
      const idx = books.findIndex((b) => b.id === bookId);

      if (idx === -1 || Number(books[idx].quantity) <= 0) {
        if (msg) {
          msg.textContent = "Book is not available.";
          msg.className = "message error";
        }
        return;
      }

      books[idx].quantity -= 1;
      let stRec =
        getJSON(KEYS.students, []).find((s) => String(s.email || "").toLowerCase() === String(auth.email || "").toLowerCase()) ||
        {};
      transactions.push({
        id: uid(),
        borrowerName: auth.name,
        borrowerEmail: auth.email,
        borrowerStudentId: stRec.studentId || "",
        studentCourse: stRec.course || "",
        studentYearLevel: stRec.yearLevel || "",
        bookId,
        bookTitle: books[idx].title,
        borrowDate,
        dueDate,
        returnDate: "",
        status: "Borrowed",
        borrowedByName: "",
        returnedToName: "",
        penalty: "",
        returnCondition: "",
        remarks: "",
        returnId: "",
      });

      setJSON(KEYS.books, books);
      setJSON(KEYS.transactions, transactions);

      if (msg) {
        msg.textContent = "Borrow transaction saved.";
        msg.className = "message success";
      }

      form.reset();
      renderBorrowableBooks();
      renderStudentHistory();
    });
  }

  function initStudentDashboard() {
    const root = document.getElementById("studentDashboardRoot");
    if (!root) return;
    if (!isAuthenticated()) return;

    const auth = getAuth();
    const books = getJSON(KEYS.books, []);
    const txns = getJSON(KEYS.transactions, []);
    const today = new Date().toISOString().slice(0, 10);

    const studentTxns = txns.filter((txn) => {
      const email = String(auth.email || "").toLowerCase();
      if (txn.borrowerEmail) return String(txn.borrowerEmail || "").toLowerCase() === email;
      return txn.borrowerName === auth.name;
    });

    const availableBooks = books.filter((b) => Number(b.quantity) > 0 && !b.archived).length;
    const borrowedCount = studentTxns.filter((t) => t.status === "Borrowed").length;
    const overdueCount = studentTxns.filter((t) => t.status === "Borrowed" && t.dueDate && t.dueDate < today).length;

    const availableEl = document.getElementById("studentAvailableBooks");
    const borrowedEl = document.getElementById("studentBorrowedCount");
    const overdueEl = document.getElementById("studentOverdueCount");
    const borrowAlertsEl = document.getElementById("staffBorrowAlertsCount");
    const overdueAlertsEl = document.getElementById("staffOverdueAlertsCount");
    const recentList = document.getElementById("studentRecentActivity");

    if (availableEl) availableEl.textContent = availableBooks;
    if (borrowedEl) borrowedEl.textContent = borrowedCount;
    if (overdueEl) overdueEl.textContent = overdueCount;
    if (borrowAlertsEl) borrowAlertsEl.textContent = String(borrowedCount);
    if (overdueAlertsEl) overdueAlertsEl.textContent = String(overdueCount);

    const currentBorrowBody = document.getElementById("studentCurrentBorrowedBody");
    const historyBody = document.getElementById("studentBorrowHistoryBody");
    const overdueBody = document.getElementById("studentOverdueTableBody");
    const toSrsRow = (t) =>
      `<tr><td>${shortId(t.id)}</td><td>${t.borrowerStudentId || "—"}</td><td>${shortId(t.bookId)}</td><td>${t.borrowDate || "—"}</td><td>${t.returnDate || "—"}</td><td>${effectiveLoanStatus(t)}</td></tr>`;

    if (currentBorrowBody) {
      const current = studentTxns.filter((t) => t.status === "Borrowed");
      currentBorrowBody.innerHTML = current.length ? current.map(toSrsRow).join("") : "<tr><td colspan='6' class='muted'>No active borrowings.</td></tr>";
    }
    if (historyBody) {
      historyBody.innerHTML = studentTxns.length ? [...studentTxns].reverse().map(toSrsRow).join("") : "<tr><td colspan='6' class='muted'>No transaction history yet.</td></tr>";
    }
    if (overdueBody) {
      const overdue = studentTxns.filter((t) => overdueBorrowedTxn(t, today));
      overdueBody.innerHTML = overdue.length ? overdue.map(toSrsRow).join("") : "<tr><td colspan='6' class='muted'>No overdue records.</td></tr>";
    }

    if (recentList) {
      const recent = [...studentTxns].reverse().slice(0, 5);
      recentList.innerHTML = recent.length
        ? recent
            .map(
              (t) =>
                `<li><strong>${t.bookTitle}</strong> — ${t.status} (Borrowed: ${t.borrowDate})</li>`
            )
            .join("")
        : "<li class='muted'>No activity yet.</li>";
    }
  }

  function initDashboard() {
    const hook = document.getElementById("totalBooksCopies") || document.getElementById("totalBooks");
    if (!hook) return;
    const books = getJSON(KEYS.books, []).filter((b) => !b.archived);
    const allBooks = getJSON(KEYS.books, []);
    const transactions = getJSON(KEYS.transactions, []);
    const students = getJSON(KEYS.students, []);
    const today = todayISO();
    const totalCopies = allBooks.reduce((sum, b) => sum + totalPhysicalCopies(b, transactions), 0);
    const availableTitles = books.filter((b) => Number(b.quantity) > 0).length;
    const lentUnits = transactions.filter((t) => t.status === "Borrowed").length;
    const overdueCount = transactions.filter((t) => overdueBorrowedTxn(t, today)).length;
    const icsRecords = getJSON(KEYS.icsRecords, []);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const icsSeven = icsRecords.filter((r) => r.createdAt && String(r.createdAt) >= weekAgo).length;

    const setText = (id, val) => {
      const n = document.getElementById(id);
      if (n) n.textContent = String(val);
    };

    setText("totalBooksCopies", totalCopies);
    setText("totalBooks", totalCopies);
    const availableCopiesSum = books.reduce((s, b) => s + Number(b.quantity || 0), 0);
    setText("availableBooks", availableCopiesSum);
    setText("availableTitlesCount", availableTitles);
    setText("borrowedBooks", lentUnits);
    setText("overdueBooks", overdueCount);
    setText("dashTotalStudents", students.length);
    setText("dashTotalTransactions", transactions.length);
    setText("dashNewIcsRecords", icsSeven);
    setText("dashPendingReservations", "0");

    const recentBorrowsBody = document.getElementById("dashRecentBorrowBody");
    if (recentBorrowsBody) {
      const rows = [...transactions].filter((t) => t.status === "Borrowed").reverse().slice(0, 8);
      recentBorrowsBody.innerHTML = rows.length
        ? rows
            .map(
              (t) => `<tr><td>${shortId(t.id)}</td><td>${t.borrowerName}</td><td>${t.bookTitle}</td><td>${t.borrowDate}</td><td>${t.dueDate || "-"}</td><td>${borrowTxnStatus(t, today)}</td></tr>`
            )
            .join("")
        : "<tr><td colspan='6' class='muted'>No borrow records.</td></tr>";
    }

    const recentReturnsBody = document.getElementById("dashRecentReturnsBody");
    if (recentReturnsBody) {
      const rows = [...transactions].filter((t) => t.status === "Returned").reverse().slice(0, 8);
      recentReturnsBody.innerHTML = rows.length
        ? rows
            .map(
              (t) =>
                `<tr><td>${t.returnId ? shortId(t.returnId) : shortId(t.id)}</td><td>${t.borrowerName}</td><td>${t.bookTitle}</td><td>${t.returnDate || "-"}</td><td>${t.returnCondition === "Damaged" ? `<span class="badge badge-warning">Damaged</span>` : `<span class="badge badge-success">Good</span>`}</td></tr>`
            )
            .join("")
        : "<tr><td colspan='5' class='muted'>No returns yet.</td></tr>";
    }

    const overdueBody = document.getElementById("dashOverdueBody");
    if (overdueBody) {
      const rows = transactions.filter((t) => overdueBorrowedTxn(t, today));
      overdueBody.innerHTML = rows.length
        ? rows
            .map(
              (t) =>
                `<tr><td>${t.borrowerName}</td><td>${t.bookTitle}</td><td>${t.dueDate}</td><td>${daysLate(t.dueDate)}</td><td>${borrowTxnStatus(t, today)}</td></tr>`
            )
            .join("")
        : "<tr><td colspan='5' class='muted'>No overdue loans.</td></tr>";
    }

    const dashLogBody = document.getElementById("dashActivityLogBody");
    if (dashLogBody) {
      const logs = getJSON(KEYS.libraryLog, []);
      dashLogBody.innerHTML = logs.length
        ? logs
            .slice(0, 12)
            .map(
              (l) =>
                `<tr><td>${l.activity}</td><td>${l.userName}</td><td>${new Date(l.timestamp).toLocaleString()}</td><td>${l.actionType}</td></tr>`
            )
            .join("")
        : "<tr><td colspan='4' class='muted'>No activity logged yet.</td></tr>";
    }

    const byCat = {};
    allBooks
      .filter((b) => !b.archived)
      .forEach((b) => {
        byCat[b.category] = (byCat[b.category] || 0) + totalPhysicalCopies(b, transactions);
      });

    const barWrap = document.getElementById("categoryBars");
    if (barWrap) {
      const maxVal = Math.max(1, ...Object.values(byCat));
      barWrap.innerHTML = Object.keys(byCat).length
        ? Object.entries(byCat)
            .map(([k, v]) => `<div><div class="muted">${k}</div><div style="background:#f1e5ea;border-radius:8px;height:10px;"><div style="height:10px;border-radius:8px;background:#6f1d37;width:${(v / maxVal) * 100}%"></div></div></div>`)
            .join("")
        : "<p class='muted'>No category data.</p>";
    }

    const report = document.getElementById("reportList");
    if (report) {
      report.innerHTML = `
        <li>Registered students: <strong>${students.length}</strong></li>
        <li>Inventory titles: <strong>${allBooks.filter((b) => !b.archived).length}</strong></li>
        <li>Archived titles: <strong>${allBooks.filter((b) => b.archived).length}</strong></li>
      `;
    }
  }

  function renderInventory(filterText) {
    const books = getJSON(KEYS.books, []);
    const txns = getJSON(KEYS.transactions, []);
    const tbody = document.getElementById("bookTableBody");
    if (!tbody) return;
    const q = (filterText || "").toLowerCase();
    const filtered = books.filter((b) => [b.id, b.title, b.author, b.category, b.year, b.quantity].some((x) => String(x || "").toLowerCase().includes(q)));
    if (!filtered.length) {
      tbody.innerHTML = "<tr><td colspan='6' class='muted'>No books found.</td></tr>";
      return;
    }
    tbody.innerHTML = filtered
      .map((b) => {
        return `
        <tr data-book-id="${b.id}">
          <td>${shortId(b.id)}</td>
          <td>${b.title}</td>
          <td>${b.author || "-"}</td>
          <td>${b.category || "-"}</td>
          <td>${b.year || "-"}</td>
          <td>${Number(b.quantity || 0)}</td>
        </tr>`;
      })
      .join("");
  }

  function renderInventoryStats() {
    const books = getJSON(KEYS.books, []);
    const txns = getJSON(KEYS.transactions, []);

    const setText = (id, val) => {
      const n = document.getElementById(id);
      if (n) n.textContent = String(val);
    };

    const activeTitles = books.filter((b) => !b.archived);
    const categories = new Set(activeTitles.map((b) => String(b.category || "").trim())).size;
    const totalInventory = books.reduce((s, b) => s + totalPhysicalCopies(b, txns), 0);
    const availableCopies = activeTitles.reduce((s, b) => s + Number(b.quantity || 0), 0);
    const borrowedCopies = txns.filter((t) => t.status === "Borrowed").length;
    const damaged = books.reduce((s, b) => s + Number(b.damagedQty || 0), 0);
    const archived = books.filter((b) => b.archived).length;

    setText("invTotalInventory", totalInventory);
    setText("invTotalCategories", categories);
    setText("invAvailableStocks", availableCopies);
    setText("invBorrowedStocks", borrowedCopies);
    setText("invDamagedBooks", damaged);
    setText("invArchivedBooks", archived);

    const totalEl = document.getElementById("inventoryTotalBooks");
    const availableEl = document.getElementById("inventoryAvailableTitles");
    const lowStockEl = document.getElementById("inventoryLowStock");
    if (totalEl) totalEl.textContent = activeTitles.length;
    if (availableEl) availableEl.textContent = activeTitles.filter((b) => Number(b.quantity) > 0).length;
    if (lowStockEl) lowStockEl.textContent = activeTitles.filter((b) => Number(b.quantity) > 0 && Number(b.quantity) <= 2).length;
  }

  function fillBookForm(book) {
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setVal("bookId", book.id || "");
    setVal("bookTitle", book.title || "");
    setVal("bookAuthor", book.author || "");
    setVal("bookCategory", book.category || "");
    setVal("bookIsbn", book.isbn || "");
    setVal("bookPublisher", book.publisher || "");
    setVal("bookYear", book.year || "");
    setVal("bookQuantity", book.quantity ?? 0);
    setVal("bookShelf", book.shelf || "");
    setVal("bookDesc", book.description || "");
    setVal("bookAccession", book.accessionNo || "");
    const coverPrev = document.getElementById("bookCoverPreview");
    if (coverPrev) coverPrev.src = book.cover || "";
  }

  function showBookDetailsModal(book) {
    const txns = getJSON(KEYS.transactions, []);
    const out = borrowedOutForBook(book.id, txns);
    const total = totalPhysicalCopies(book, txns);
    const box = document.getElementById("bookDetailsInner");
    if (!box) return;
    box.innerHTML = `
      <div class="book-details-layout">
        <div>${book.cover ? `<img class="book-details-cover" src="${book.cover}" alt="">` : `<div class="book-cover-ph large"><i class="fa-solid fa-book"></i></div>`}</div>
        <div class="book-details-fields">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author || "-"}</p>
          <p><strong>Category:</strong> ${book.category || "-"}</p>
          <p><strong>ISBN:</strong> ${book.isbn || "-"}</p>
          <p><strong>Accession No.:</strong> ${book.accessionNo || "-"}</p>
          <p><strong>Publisher:</strong> ${book.publisher || "-"}</p>
          <p><strong>Year:</strong> ${book.year || "-"}</p>
          <p><strong>Shelf Location:</strong> ${book.shelf || "-"}</p>
          <p><strong>Total Stock:</strong> ${total} &nbsp;|&nbsp; <strong>Available:</strong> ${book.quantity ?? 0} &nbsp;|&nbsp; <strong>Borrowed:</strong> ${out} &nbsp;|&nbsp; <strong>Damaged:</strong> ${book.damagedQty || 0}</p>
          <p><strong>Status:</strong> ${book.archived ? "Archived" : "Active"}</p>
          <p><strong>Date Added:</strong> ${book.dateAdded || "-"}</p>
          <p><strong>Description:</strong></p><p class="muted">${book.description ? String(book.description) : "—"}</p>
        </div>
      </div>`;
    openModal("bookDetailsModal");
  }

  function initInventory() {
    const table = document.getElementById("bookTableBody");
    if (!table) return;
    const search = document.getElementById("bookSearch");
    let pendingCoverDataUrl = "";

    function currentFilter() {
      return search ? search.value : "";
    }

    renderInventory("");
    renderInventoryStats();
    if (search) search.addEventListener("input", () => renderInventory(search.value));

    const globalSearch = document.getElementById("globalSearch");
    if (globalSearch && search) {
      globalSearch.addEventListener("input", () => {
        search.value = globalSearch.value;
        renderInventory(globalSearch.value);
      });
    }

    const coverInput = document.getElementById("bookCoverFile");
    const coverPreview = document.getElementById("bookCoverPreview");
    if (coverInput && coverPreview) {
      coverInput.addEventListener("change", function () {
        const file = coverInput.files && coverInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          pendingCoverDataUrl = String(reader.result || "");
          coverPreview.src = pendingCoverDataUrl || "";
        };
        reader.readAsDataURL(file);
      });
    }

    document.getElementById("clearBookCoverBtn")?.addEventListener("click", function () {
      pendingCoverDataUrl = "";
      if (coverPreview) coverPreview.removeAttribute("src");
      if (coverInput) coverInput.value = "";
    });

    const addBtn = document.getElementById("openAddBookModal");
    if (addBtn)
      addBtn.addEventListener("click", () => {
        const mt = document.getElementById("bookModalTitle");
        if (mt) mt.textContent = "Add Book";
        pendingCoverDataUrl = "";
        document.getElementById("bookForm")?.reset();
        const bid = document.getElementById("bookId");
        if (bid) bid.value = "";
        if (coverPreview) coverPreview.removeAttribute("src");
        openModal("bookModal");
      });

    const form = document.getElementById("bookForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("bookId")?.value;
      const title = document.getElementById("bookTitle").value.trim();
      const author = document.getElementById("bookAuthor").value.trim();
      const category = document.getElementById("bookCategory").value.trim();
      const quantity = Number(document.getElementById("bookQuantity").value);
      const msg = document.getElementById("bookModalMessage");
      const getOpt = (fieldId, fallback = "") =>
        document.getElementById(fieldId) ? document.getElementById(fieldId).value.trim() : fallback;

      if (!title || !author || !category || Number.isNaN(quantity) || quantity < 0) {
        if (msg) {
          msg.textContent = "Fill required fields (title, author, category, quantity).";
          msg.className = "message error";
        }
        return;
      }

      let accessionNo = getOpt("bookAccession");
      let isbn = getOpt("bookIsbn");
      const publisher = getOpt("bookPublisher");
      const year = getOpt("bookYear");
      const shelf = getOpt("bookShelf");
      const description = getOpt("bookDesc");

      const books = getJSON(KEYS.books, []);
      let coverField = pendingCoverDataUrl;
      if (id) {
        const prevBook = books.find((b) => b.id === id);
        if (!coverField && prevBook?.cover) coverField = prevBook.cover;
      }
      pendingCoverDataUrl = "";

      if (!id) {
        const nid = uid();
        if (!accessionNo) accessionNo = `ACC-${String(nid).replace(/\W/g, "").slice(-6).toUpperCase()}`;
        const row = {
          id: nid,
          title,
          author,
          category,
          quantity,
          isbn,
          publisher,
          year,
          shelf,
          description,
          cover: coverField,
          accessionNo,
          archived: false,
          damagedQty: 0,
          dateAdded: todayISO(),
        };
        books.push(row);
        logLibraryActivity(`Added "${title}" to inventory (${accessionNo})`, "Create", "");
      } else {
        const idx = books.findIndex((b) => b.id === id);
        if (idx === -1) return;
        if (!accessionNo) accessionNo = books[idx].accessionNo || `ACC-${String(id).replace(/\W/g, "").slice(-6).toUpperCase()}`;
        books[idx] = {
          ...books[idx],
          title,
          author,
          category,
          quantity,
          isbn,
          publisher,
          year,
          shelf,
          description,
          cover: coverField || books[idx].cover || "",
          accessionNo,
        };
        logLibraryActivity(`Updated "${title}" (${accessionNo})`, "Update", "");
      }

      setJSON(KEYS.books, books);
      closeModal("bookModal");
      renderInventory(currentFilter());
      renderInventoryStats();
      if (msg) {
        msg.textContent = "";
        msg.className = "message";
      }
      if (coverInput) coverInput.value = "";
    });

    table.addEventListener("click", function (e) {
      const btn = e.target.closest("button");
      if (!btn) return;
      const viewId = btn.getAttribute("data-view-book");
      const editId = btn.getAttribute("data-edit-id");
      const deleteId = btn.getAttribute("data-delete-id");
      const archiveId = btn.getAttribute("data-archive-id");

      if (viewId) {
        const book = getJSON(KEYS.books, []).find((b) => b.id === viewId);
        if (book) showBookDetailsModal(book);
      }
      if (editId) {
        const book = getJSON(KEYS.books, []).find((b) => b.id === editId);
        if (!book) return;
        pendingCoverDataUrl = "";
        const mt = document.getElementById("bookModalTitle");
        if (mt) mt.textContent = "Edit Book";
        fillBookForm(book);
        openModal("bookModal");
      }
      if (deleteId) {
        const books = getJSON(KEYS.books, []).filter((b) => b.id !== deleteId);
        const rm = getJSON(KEYS.books, []).find((b) => b.id === deleteId);
        setJSON(KEYS.books, books);
        logLibraryActivity(rm ? `Deleted "${rm.title}"` : `Deleted inventory item`, "Delete", "");
        renderInventory(currentFilter());
        renderInventoryStats();
      }
      if (archiveId) {
        const books = getJSON(KEYS.books, []);
        const idx = books.findIndex((b) => b.id === archiveId);
        if (idx === -1) return;
        books[idx].archived = !books[idx].archived;
        setJSON(KEYS.books, books);
        logLibraryActivity(`${books[idx].archived ? "Archived" : "Unarchived"} "${books[idx].title}"`, "Archive", "");
        renderInventory(currentFilter());
        renderInventoryStats();
      }
    });
  }

  function getBorrowableBooks() {
    return getJSON(KEYS.books, []).filter((b) => !b.archived && Number(b.quantity) > 0);
  }

  function initBorrow() {
    const select = document.getElementById("borrowBook");
    const form = document.getElementById("borrowForm");
    if (!select || !form) return;

    const msg = document.getElementById("borrowMessage");
    const borrowerEl = document.getElementById("borrowerName");
    const borrowerEmailEl = document.getElementById("borrowerEmail");
    const studentIdEl = document.getElementById("borrowStudentId");
    const studentCourseEl = document.getElementById("borrowStudentCourse");
    const studentYearEl = document.getElementById("borrowStudentYear");
    const borrowDateEl = document.getElementById("borrowDate");
    const dueDateEl = document.getElementById("dueDate");
    const bookStockEl = document.getElementById("borrowAvailStockDisp");
    const bookTitleDisp = document.getElementById("borrowBookTitleDisp");
    const bookIdDisp = document.getElementById("borrowBookIdDisp");
    const auth = getAuth();

    function studentByEmail(email) {
      const q = String(email || "").trim().toLowerCase();
      return getJSON(KEYS.students, []).find((s) => String(s.email || "").toLowerCase() === q);
    }

    document.getElementById("borrowLookupStudentBtn")?.addEventListener("click", function (e) {
      e.preventDefault();
      const st = studentByEmail(borrowerEmailEl?.value);
      if (!st) {
        if (msg) {
          msg.textContent = "No registered student matched that EVSU email.";
          msg.className = "message error";
        }
        return;
      }
      if (borrowerEl) borrowerEl.value = st.name || "";
      if (studentIdEl) studentIdEl.value = st.studentId || "";
      if (studentCourseEl) studentCourseEl.value = st.course || "";
      if (studentYearEl) studentYearEl.value = st.yearLevel || "";
      if (msg) msg.textContent = "";
    });

    function updateBookDisp() {
      const bookId = select.value;
      const b = getJSON(KEYS.books, []).find((bk) => bk.id === bookId);
      if (bookIdDisp) bookIdDisp.textContent = bookId ? shortId(bookId, 14) : "—";
      if (bookTitleDisp) bookTitleDisp.textContent = b ? b.title : "—";
      if (bookStockEl) bookStockEl.textContent = b ? String(b.quantity) : "—";
    }

    function renderBorrowTxnTable(qText) {
      const body = document.getElementById("borrowTableBody");
      if (!body) return;
      const today = todayISO();
      const q = String(qText || "").trim().toLowerCase();
      const txns = getJSON(KEYS.transactions, []);
      const filtered = txns.filter((t) =>
        `${t.borrowerName} ${t.bookTitle} ${t.borrowerEmail} ${t.borrowerStudentId}`.toLowerCase().includes(q)
      );
      if (!filtered.length) {
        body.innerHTML = "<tr><td colspan='6' class='muted'>No transactions match this search.</td></tr>";
        return;
      }
      body.innerHTML = filtered
        .slice(-80)
        .reverse()
        .map(
          (t) =>
            `<tr><td>${shortId(t.id)}</td><td>${t.borrowerStudentId || "—"}</td><td>${shortId(t.bookId)}</td><td>${t.borrowDate || "—"}</td><td>${t.returnDate || "—"}</td><td>${borrowTxnStatus(t, today)}</td></tr>`
        )
        .join("");
    }

    function renderBorrowStats() {
      const books = getJSON(KEYS.books, []);
      const txns = getJSON(KEYS.transactions, []);
      const today = todayISO();
      const setText = (id, v) => {
        const n = document.getElementById(id);
        if (n) n.textContent = String(v);
      };
      setText("borrowTotalTodayCount", txns.filter((t) => t.borrowDate === today && t.bookId).length);
      setText("borrowAvailableTitlesAlt", books.filter((b) => !b.archived && Number(b.quantity) > 0).length);
      setText("borrowAvailableTitles", books.filter((b) => !b.archived && Number(b.quantity) > 0).length);
      setText("borrowActiveCount", txns.filter((t) => t.status === "Borrowed").length);
      setText("borrowDueTodayCount", txns.filter((t) => t.status === "Borrowed" && t.dueDate === today).length);
      const overdueDistinct = txns.filter((t) => overdueBorrowedTxn(t, today)).length;
      setText("borrowOverdueBorrowers", overdueDistinct);
      setText("borrowOverdueCount", overdueDistinct);
      renderBorrowTxnTable(document.getElementById("globalSearch")?.value || "");
    }

    function fillSelect(withList) {
      const list = withList || getBorrowableBooks();
      select.innerHTML = list.length
        ? list.map((b) => `<option value="${b.id}">${b.title} (${b.quantity} available)</option>`).join("")
        : "<option value=''>No available books</option>";
      updateBookDisp();
    }

    fillSelect();
    select.addEventListener("change", updateBookDisp);

    document.getElementById("globalSearch")?.addEventListener("input", function () {
      renderBorrowTxnTable(this.value);
    });

    renderBorrowStats();

    if (borrowDateEl && !borrowDateEl.value) borrowDateEl.value = todayISO();
    if (dueDateEl && !dueDateEl.value) {
      const due = new Date();
      due.setDate(due.getDate() + 7);
      dueDateEl.value = due.toISOString().slice(0, 10);
    }

    document.getElementById("openBorrowModalBtn")?.addEventListener("click", () => {
      fillSelect();
      openModal("borrowModal");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const borrowerName = borrowerEl ? borrowerEl.value.trim() : "";
      const borrowerEmail = borrowerEmailEl ? borrowerEmailEl.value.trim() : "";
      const bookId = select.value;
      const borrowDate = borrowDateEl ? borrowDateEl.value : "";
      const dueDate = dueDateEl ? dueDateEl.value : "";
      const sid = studentIdEl ? studentIdEl.value.trim() : "";
      const course = studentCourseEl ? studentCourseEl.value.trim() : "";
      const yearLv = studentYearEl ? studentYearEl.value.trim() : "";
      if (!borrowerName || !bookId || !borrowDate || !dueDate) {
        if (msg) {
          msg.textContent = "Please complete student name, book, and dates.";
          msg.className = "message error";
        }
        return;
      }
      const books = getJSON(KEYS.books, []);
      const transactions = getJSON(KEYS.transactions, []);
      const idx = books.findIndex((b) => b.id === bookId);
      if (idx === -1 || Number(books[idx].quantity) <= 0 || books[idx].archived) {
        if (msg) {
          msg.textContent = "Book is not available.";
          msg.className = "message error";
        }
        return;
      }
      books[idx].quantity -= 1;
      transactions.push({
        id: uid(),
        borrowerName,
        borrowerEmail,
        borrowerStudentId: sid,
        studentCourse: course,
        studentYearLevel: yearLv,
        bookId,
        bookTitle: books[idx].title,
        borrowDate,
        dueDate,
        returnDate: "",
        status: "Borrowed",
        borrowedByName: auth?.name || "",
        returnedToName: "",
        penalty: "",
        returnCondition: "",
        remarks: "",
        returnId: "",
      });
      setJSON(KEYS.books, books);
      setJSON(KEYS.transactions, transactions);
      logLibraryActivity(`Borrow recorded: "${books[idx].title}" → ${borrowerName}`, "Borrow", "");
      if (msg) {
        msg.textContent = "Borrow transaction saved.";
        msg.className = "message success";
      }
      form.reset();
      fillSelect();
      if (borrowDateEl) borrowDateEl.value = todayISO();
      if (dueDateEl) {
        const due = new Date();
        due.setDate(due.getDate() + 7);
        dueDateEl.value = due.toISOString().slice(0, 10);
      }
      renderBorrowStats();
      closeModal("borrowModal");
    });
  }

  let pendingReturnTxnId = null;

  function renderReturnTable() {
    const body = document.getElementById("returnTableBody");
    if (!body) return;
    const localEl = document.getElementById("returnSearch");
    const q = localEl ? localEl.value.trim().toLowerCase() : "";
    const records = getJSON(KEYS.transactions, []).filter((t) => t.status === "Borrowed");
    const filtered = records.filter((r) =>
      `${r.bookId} ${r.borrowerStudentId} ${r.borrowDate}`.toLowerCase().includes(q)
    );
    if (!filtered.length) {
      body.innerHTML = "<tr><td colspan='6' class='muted'>No borrowed records found.</td></tr>";
      return;
    }
    body.innerHTML = filtered
      .map(
        (r) =>
          `<tr>
          <td>${shortId(r.id)}</td>
          <td>${r.borrowerStudentId || "—"}</td>
          <td>${shortId(r.bookId)}</td>
          <td>${r.borrowDate || "—"}</td>
          <td>${r.returnDate || "—"}</td>
          <td class="table-actions">${borrowTxnStatus(r, todayISO())} <button type="button" class="btn-accent icon-btn" data-return-id="${r.id}" title="Confirm return"><i class="fa-solid fa-rotate-left"></i></button></td>
        </tr>`
      )
      .join("");
  }

  function renderReturnStats() {
    const today = todayISO();
    const txns = getJSON(KEYS.transactions, []);
    const records = txns.filter((t) => t.status === "Borrowed");
    const setText = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = String(v);
    };
    setText("returnReturnedTodayCount", txns.filter((t) => t.status === "Returned" && t.returnDate === today).length);
    setText("returnPendingCount", records.length);
    setText("returnPendingReturnsCount", records.length);
    setText("returnDueTodayCount", records.filter((t) => t.dueDate === today).length);
    setText("returnOverdueCount", records.filter((t) => t.dueDate && t.dueDate < today).length);
    setText("returnOverdueReturnsCount", records.filter((t) => t.dueDate && t.dueDate < today).length);
    setText("returnDamagedReturnsCount", txns.filter((t) => t.returnCondition === "Damaged").length);
  }

  function initReturn() {
    const table = document.getElementById("returnTableBody");
    if (!table) return;
    const localSearch = document.getElementById("returnSearch");
    const globalSearch = document.getElementById("globalSearch");
    if (localSearch) localSearch.addEventListener("input", renderReturnTable);
    if (globalSearch && localSearch) {
      globalSearch.addEventListener("input", function () {
        localSearch.value = globalSearch.value;
        renderReturnTable();
      });
    }
    renderReturnTable();
    renderReturnStats();

    document.getElementById("returnConfirmForm")?.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!pendingReturnTxnId) return;
      const books = getJSON(KEYS.books, []);
      const txns = getJSON(KEYS.transactions, []);
      const txn = txns.find((t) => t.id === pendingReturnTxnId);
      if (!txn || txn.status !== "Borrowed") return;
      const auth = getAuth();

      const condition = document.getElementById("returnCondition")?.value || "Good";
      const remarks = document.getElementById("returnRemarks")?.value.trim() || "";
      const penalty = document.getElementById("returnPenalty")?.value.trim() || "";
      const statusSelect = document.getElementById("returnStatusSelect")?.value || "Returned";

      txn.returnId = uid();
      txn.returnDate = todayISO();
      txn.returnCondition = condition;
      txn.remarks = remarks;
      txn.penalty = penalty;
      txn.returnedToName = auth?.name || "";

      txn.status = statusSelect === "Lost" ? "Lost" : "Returned";

      const book = books.find((b) => b.id === txn.bookId);
      if (txn.status === "Returned" && book) {
        if (condition === "Damaged") book.damagedQty += 1;
        else book.quantity += 1;
      }

      setJSON(KEYS.books, books);
      setJSON(KEYS.transactions, txns);
      logLibraryActivity(`Return recorded: "${txn.bookTitle}" from ${txn.borrowerName}`, "Return", "");

      pendingReturnTxnId = null;
      closeModal("returnConfirmModal");
      renderReturnTable();
      renderReturnStats();
    });

    table.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-return-id]");
      const id = btn ? btn.getAttribute("data-return-id") : null;
      if (!id) return;
      const txn = getJSON(KEYS.transactions, []).find((t) => t.id === id);
      if (!txn || txn.status !== "Borrowed") return;
      pendingReturnTxnId = id;

      const lbl = document.getElementById("returnModalSummary");
      if (lbl) {
        lbl.innerHTML = `<strong>${txn.borrowerName}</strong> • <em>${txn.bookTitle}</em><br/><span class="muted">Borrowed: ${txn.borrowDate} · Due: ${txn.dueDate}</span>`;
      }

      const penaltyField = document.getElementById("returnPenalty");
      if (penaltyField) penaltyField.value = "";
      const remarksField = document.getElementById("returnRemarks");
      if (remarksField) remarksField.value = "";
      const cond = document.getElementById("returnCondition");
      if (cond) cond.value = "Good";
      const st = document.getElementById("returnStatusSelect");
      if (st) st.value = "Returned";

      openModal("returnConfirmModal");
    });
  }

  function renderRecords() {
    const body = document.getElementById("historyTableBody");
    if (!body) return;
    const historySearchEl = document.getElementById("historySearch");
    const statusFilterEl = document.getElementById("statusFilter");
    const q = (historySearchEl?.value || document.getElementById("globalSearch")?.value || "").trim().toLowerCase();
    const status = statusFilterEl?.value || "All";
    const txns = getJSON(KEYS.transactions, []);
    const today = todayISO();
    const filtered = txns.filter((t) => {
      const matchQ =
        `${t.bookId || ""} ${t.borrowerStudentId || ""} ${t.borrowDate || ""} ${t.returnDate || ""}`.toLowerCase().includes(q);
      let matchStatus = true;
      if (status === "Borrowed") matchStatus = t.status === "Borrowed" && !overdueBorrowedTxn(t, today);
      else if (status === "Overdue") matchStatus = t.status === "Borrowed" && overdueBorrowedTxn(t, today);
      else if (status === "Returned") matchStatus = t.status === "Returned";
      else if (status === "Lost") matchStatus = t.status === "Lost";
      else if (status !== "All") matchStatus = t.status === status;
      return matchQ && matchStatus;
    });
    if (!filtered.length) {
      body.innerHTML = "<tr><td colspan='6' class='muted'>No records found.</td></tr>";
      return;
    }
    body.innerHTML = filtered
      .slice()
      .reverse()
      .map(
        (t) =>
          `<tr><td>${shortId(t.id)}</td><td>${t.borrowerStudentId || "—"}</td><td>${shortId(t.bookId)}</td><td>${t.borrowDate || "—"}</td><td>${t.returnDate || "—"}</td><td>${effectiveLoanStatus(t)}</td></tr>`
      )
      .join("");
    renderRecordsStats();
  }

  function renderRecordsStats() {
    const txns = getJSON(KEYS.transactions, []);
    const today = todayISO();
    const totalEl = document.getElementById("historyTotalCount");
    const borrowedEl = document.getElementById("historyBorrowedCount");
    const returnedEl = document.getElementById("historyReturnedCount");
    const overdueEl = document.getElementById("historyOverdueCount");
    if (!totalEl && !borrowedEl && !returnedEl && !overdueEl) return;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setText("historyTotalCount", txns.length);
    setText("historyBorrowedCount", txns.filter((t) => t.status === "Borrowed").length);
    setText("historyReturnedCount", txns.filter((t) => t.status === "Returned").length);
    setText("historyOverdueCount", txns.filter((t) => overdueBorrowedTxn(t, today)).length);
  }

  function initRecords() {
    const body = document.getElementById("historyTableBody");
    if (!body) return;
    const historySearch = document.getElementById("historySearch");
    const statusFilter = document.getElementById("statusFilter");
    const globalSearch = document.getElementById("globalSearch");
    historySearch?.addEventListener("input", renderRecords);
    statusFilter?.addEventListener("change", renderRecords);
    if (globalSearch) {
      globalSearch.addEventListener("input", function () {
        if (historySearch) historySearch.value = globalSearch.value;
        renderRecords();
      });
    }
    renderRecords();
    renderRecordsStats();
  }

  function initStudentsAdmin() {
    const body = document.getElementById("studentsTableBody");
    if (!body || (document.body.dataset.page !== "students" && document.body.dataset.page !== "borrowers")) return;

    function renderStudents() {
      const qEl = document.getElementById("studentsSearchFilter");
      const q = qEl ? qEl.value.trim().toLowerCase() : "";
      const students = getJSON(KEYS.students, []).filter((s) =>
        `${s.name} ${s.email} ${s.studentId} ${s.phone_number || ""} ${s.course}`.toLowerCase().includes(q)
      );
      if (!students.length) {
        body.innerHTML = "<tr><td colspan='5' class='muted'>No students found.</td></tr>";
        return;
      }
      body.innerHTML = students
        .map(
          (s) =>
            `<tr><td>${s.studentId}</td><td>${s.email}</td><td>${s.name}</td><td>${s.phone_number || "—"}</td><td>Student</td></tr>`
        )
        .join("");
      const elTotal = document.getElementById("studentsTotalStat");
      if (elTotal) elTotal.textContent = String(getJSON(KEYS.students, []).length);
    }

    document.getElementById("studentsSearchFilter")?.addEventListener("input", renderStudents);
    document.getElementById("globalSearch")?.addEventListener("input", function () {
      const local = document.getElementById("studentsSearchFilter");
      if (local) local.value = this.value;
      renderStudents();
    });
    renderStudents();
  }

  function initIcsAdmin() {
    const body = document.getElementById("icsTableBody");
    if (!body || document.body.dataset.page !== "ics") return;
    function renderICS() {
      const rows = getJSON(KEYS.icsRecords, []);
      body.innerHTML = rows.length
        ? rows
            .slice()
            .reverse()
            .slice(0, 80)
            .map(
              (r) =>
                `<tr><td>${shortId(r.id)}</td><td>${shortId(r.bookId)}</td><td>${Number(r.quantity || 0)}</td><td>${r.dateReceived || "—"}</td><td>${r.recordedBy || "—"}</td></tr>`
            )
            .join("")
        : "<tr><td colspan='5' class='muted'>No ICS records yet.</td></tr>";
      const stat = document.getElementById("icsTotalRecords");
      if (stat) stat.textContent = String(rows.length);
    }
    renderICS();
  }

  function initReportsPage() {
    if (document.body.dataset.page !== "reports") return;
    const holder = document.getElementById("reportsSummary");
    if (!holder) return;
    const books = getJSON(KEYS.books, []);
    const txns = getJSON(KEYS.transactions, []);
    const today = todayISO();
    const borrowed = txns.filter((t) => t.status === "Borrowed").length;
    const overdue = txns.filter((t) => overdueBorrowedTxn(t, today)).length;
    holder.innerHTML = `<ul class="clean-list">
      <li>Total titles: <strong>${books.filter((b) => !b.archived).length}</strong></li>
      <li>Registered students: <strong>${getJSON(KEYS.students, []).length}</strong></li>
      <li>Open loans: <strong>${borrowed}</strong></li>
      <li>Overdue (active): <strong>${overdue}</strong></li>
    </ul>`;
  }

  function initSettingsPage() {
    if (document.body.dataset.page !== "settings") return;
    const tz = document.getElementById("settingsTimezoneDisp");
    if (tz) tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "—";
    const stor = document.getElementById("settingsStorageNotice");
    if (stor) stor.innerHTML =
      '<p class="muted">This MVP stores data locally in your browser (localStorage). Production builds should persist to your database/API.</p>';
  }

  function init() {
    ensureData();
    requireAuth();
    initPasswordToggles();
    attachModalClosers();
    navHandlers();
    initTopbarWidgets();
    initLogin();
    initStudentAuthPage();
    initStudentDashboard();
    initStudentLibrary();
    initDashboard();
    initInventory();
    initBorrow();
    initReturn();
    initRecords();
    initStudentsAdmin();
    initIcsAdmin();
    initReportsPage();
    initSettingsPage();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
