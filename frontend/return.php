<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Return</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="return">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Return Transactions";
        $SEARCH_PLACEHOLDER = "Search borrower name or title…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>

        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Returning</h2>
              <p class="page-note">Confirm returns, update loan status, and keep inventory counts accurate—including overdue and pending items.</p>
            </div>
            <div class="btn-row">
              <a class="btn-link btn-secondary icon-btn" href="borrow.php" title="Borrow"><i class="fa-solid fa-handshake"></i></a>
              <a class="btn-link btn-secondary icon-btn" href="history.php" title="History"><i class="fa-solid fa-clock-rotate-left"></i></a>
            </div>
          </div>

          <section class="grid grid-cards-4" aria-label="Return statistics">
            <div class="stat highlight"><div class="label">Returned Today</div><div class="value" id="returnReturnedTodayCount">0</div></div>
            <div class="stat highlight"><div class="label">Pending Returns</div><div class="value" id="returnPendingReturnsCount">0</div></div>
            <div class="stat danger-zone"><div class="label">Overdue Returns</div><div class="value" id="returnOverdueReturnsCount">0</div></div>
          </section>

          <div class="card top-space filter-bar-inline">
            <label for="returnSearch">Find active loan</label>
            <input id="returnSearch" type="text" placeholder="Student or book title" />
          </div>

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
              <tbody id="returnTableBody"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <div id="returnConfirmModal" class="modal">
      <div class="card modal-card modal-mid">
        <div class="content-head">
          <h3 class="content-title">Return confirmation</h3>
          <button type="button" class="btn-secondary icon-btn" data-close-modal="returnConfirmModal"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p id="returnModalSummary" class="return-modal-summary muted"></p>
        <form id="returnConfirmForm">
          <div>
            <label for="returnStatusSelect">Status</label>
            <select id="returnStatusSelect">
              <option value="Returned">Returned</option>
            </select>
          </div>
          <button class="btn-primary icon-btn-text" type="submit"><i class="fa-solid fa-circle-check"></i><span>Complete return</span></button>
        </form>
      </div>
    </div>

    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js"></script>
  </body>
</html>
