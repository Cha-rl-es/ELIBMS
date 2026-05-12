<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Library Staff Dashboard</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="staff-dashboard">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Library Staff Dashboard";
        $SEARCH_PLACEHOLDER = "Search books, borrowers, and transactions…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>
        <div class="container" id="studentDashboardRoot">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Staff dashboard overview</h2>
              <p class="page-note">Quick view for staff operations—recent borrowing activity, overdue transactions, and key counts for the day.</p>
            </div>
          </div>
          <section class="grid grid-cards-4 top-space">
            <article class="stat highlight"><div class="label">Borrowed Books</div><div class="value" id="studentBorrowedCount">0</div></article>
            <article class="stat"><div class="label">Overdue Books</div><div class="value" id="studentOverdueCount">0</div></article>
            <article class="stat"><div class="label">Available Books</div><div class="value" id="studentAvailableBooks">0</div></article>
            <article class="stat"><div class="label">Total Transactions</div><div class="value" id="dashTotalTransactions">0</div></article>
          </section>
          <section class="grid grid-two top-space">
            <div class="card table-wrap">
              <h3>Recent Borrow Transactions</h3>
              <p class="page-note">Borrow alerts: <strong id="staffBorrowAlertsCount">0</strong></p>
              <table><thead><tr><th>Borrow ID</th><th>Borrower</th><th>Book</th><th>Borrow Date</th><th>Status</th></tr></thead><tbody id="studentBorrowHistoryBody"></tbody></table>
            </div>
            <div class="card table-wrap">
              <h3>Overdue Transactions</h3>
              <p class="page-note">Overdue alerts: <strong id="staffOverdueAlertsCount">0</strong></p>
              <table><thead><tr><th>Borrow ID</th><th>Borrower</th><th>Book</th><th>Due Date</th><th>Status</th></tr></thead><tbody id="studentOverdueTableBody"></tbody></table>
            </div>
          </section>
        </div>
      </main>
    </div>
    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js?v=7"></script>
  </body>
</html>
