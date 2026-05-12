<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Borrow</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="borrow">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Borrow Transactions";
        $SEARCH_PLACEHOLDER = "Filter borrow table by student, book, ID…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>

        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Borrowing</h2>
              <p class="page-note">Record new borrow transactions, check availability, and track active loans and overdue borrowers.</p>
            </div>
            <div class="btn-row">
              <button type="button" id="openBorrowModalBtn" class="btn-accent icon-btn-text" title="New borrow">
                <i class="fa-solid fa-plus"></i><span>New Borrow</span>
              </button>
              <a class="btn-link btn-secondary icon-btn" href="return.php" title="Return"><i class="fa-solid fa-rotate-left"></i></a>
              <a class="btn-link btn-secondary icon-btn" href="history.php" title="History"><i class="fa-solid fa-clock-rotate-left"></i></a>
            </div>
          </div>

          <section class="grid grid-cards-4" aria-label="Borrow statistics">
            <div class="stat highlight"><div class="label">Total Borrowed Today</div><div class="value" id="borrowTotalTodayCount">0</div></div>
            <div class="stat highlight"><div class="label">Active Borrow Transactions</div><div class="value" id="borrowActiveCount">0</div></div>
            <div class="stat danger-zone"><div class="label">Overdue Borrowers</div><div class="value" id="borrowOverdueBorrowers">0</div></div>
          </section>

          <div class="card table-wrap">
              <h3>Borrow Table</h3>
            <table>
              <thead>
                <tr>
                  <th>Borrow ID</th>
                  <th>User ID</th>
                  <th>Book ID</th>
                  <th>Borrow Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="borrowTableBody"></tbody>
            </table>
          </div>

            <div class="grid grid-two top-space">
              <div class="card table-wrap">
                <h3>Student Lookup Table</h3>
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody id="borrowStudentLookupBody"></tbody>
                </table>
              </div>
              <div class="card table-wrap">
                <h3>Book Lookup Table</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Book ID</th>
                      <th>Title</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody id="borrowBookLookupBody"></tbody>
                </table>
              </div>
            </div>
        </div>
      </main>
    </div>

    <div id="borrowModal" class="modal">
      <div class="card modal-card modal-wide">
        <div class="content-head">
          <h3 class="content-title">Borrow Form</h3>
          <button type="button" class="btn-secondary icon-btn" data-close-modal="borrowModal"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="borrowForm" class="form-sections">
          <fieldset class="form-fieldset">
            <legend>Student Information</legend>
            <div class="form-grid-two">
              <div>
                <label for="borrowStudentId">User ID</label>
                <input id="borrowStudentId" type="text" />
              </div>
              <div><label for="borrowerName">Name *</label><input id="borrowerName" type="text" required /></div>
              <div><label for="borrowerEmail">Email</label><input id="borrowerEmail" type="email" placeholder="name@evsu.edu.ph" /></div>
            </div>
          </fieldset>
          <fieldset class="form-fieldset">
            <legend>Book Information</legend>
            <div class="form-grid-two">
              <div class="span-2">
                <label for="borrowBook">Book</label>
                <select id="borrowBook"></select>
              </div>
              <div><label>Book ID</label><div id="borrowBookIdDisp" class="readonly-disp">—</div></div>
              <div><label>Book Title</label><div id="borrowBookTitleDisp" class="readonly-disp">—</div></div>
              <div><label>Available Stock</label><div id="borrowAvailStockDisp" class="readonly-disp">—</div></div>
              <div><label for="borrowDate">Borrow Date *</label><input id="borrowDate" type="date" required /></div>
              <div><label for="dueDate">Due Date *</label><input id="dueDate" type="date" required /></div>
            </div>
          </fieldset>
          <button class="btn-primary icon-btn-text" type="submit"><i class="fa-solid fa-handshake"></i><span>Save Borrow</span></button>
          <p id="borrowMessage" class="message"></p>
        </form>
      </div>
    </div>

    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js"></script>
  </body>
</html>
