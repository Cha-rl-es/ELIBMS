<?php require_once __DIR__ . "/includes/require-admin-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Dashboard</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="dashboard">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Dashboard";
        $SEARCH_PLACEHOLDER = "Search across tables (borrow list, ICS, etc.)…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>
        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Library snapshot</h2>
              <p class="page-note">Overview of key library stats and recent activity such as inventory totals, borrowing/returns, and overdue items.</p>
            </div>
          </div>

          <section class="grid grid-cards-4" aria-label="Dashboard statistics">
            <div class="stat highlight"><div class="label">Total Books</div><div class="value" id="totalBooksCopies">0</div></div>
            <div class="stat highlight"><div class="label">Available Books</div><div class="value" id="availableBooks">0</div></div>
            <div class="stat highlight"><div class="label">Borrowed Books</div><div class="value" id="borrowedBooks">0</div></div>
            <div class="stat danger-zone"><div class="label">Overdue Books</div><div class="value" id="overdueBooks">0</div></div>

            <div class="stat"><div class="label">Total Students</div><div class="value" id="dashTotalStudents">0</div></div>
            <div class="stat"><div class="label">Total Transactions</div><div class="value" id="dashTotalTransactions">0</div></div>
            <div class="stat"><div class="label">New ICS Records</div><div class="value" id="dashNewIcsRecords">0</div></div>
          </section>

          <div class="grid grid-two top-space">
            <div class="card table-wrap">
              <h3>Recent Borrow Transactions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Borrow ID</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Borrow Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="dashRecentBorrowBody"></tbody>
              </table>
            </div>

            <div class="card table-wrap">
              <h3>Recently Returned Books</h3>
              <table>
                <thead>
                  <tr>
                    <th>Borrow ID</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="dashRecentReturnsBody"></tbody>
              </table>
            </div>
          </div>

          <div class="grid grid-two top-space">
            <div class="card table-wrap">
              <h3>Overdue Books</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="dashOverdueBody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js"></script>
  </body>
</html>