<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Transaction History</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="history">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Transaction History";
        $SEARCH_PLACEHOLDER = "Search student name, book, IDs…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>

        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Unified transaction history</h2>
              <p class="page-note">Search and review all borrow and return records in one place, including current status and dates.</p>
            </div>
            <div class="btn-row">
              <a class="btn-link btn-secondary icon-btn" href="borrow.php" title="Borrow"><i class="fa-solid fa-handshake"></i></a>
              <a class="btn-link btn-secondary icon-btn" href="return.php" title="Return"><i class="fa-solid fa-rotate-left"></i></a>
            </div>
          </div>

          <section class="grid grid-cards-4" aria-label="History statistics">
            <div class="stat highlight"><div class="label">Total Transactions</div><div class="value" id="historyTotalCount">0</div></div>
            <div class="stat highlight"><div class="label">Total Returned</div><div class="value" id="historyReturnedCount">0</div></div>
            <div class="stat highlight"><div class="label">Total Borrowed</div><div class="value" id="historyBorrowedCount">0</div></div>
            <div class="stat danger-zone"><div class="label">Total Overdue</div><div class="value" id="historyOverdueCount">0</div></div>
          </section>

          <div class="card table-wrap">
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
              <tbody id="historyTableBody"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js"></script>
  </body>
</html>
