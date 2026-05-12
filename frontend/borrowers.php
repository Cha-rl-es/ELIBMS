<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Borrowers</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="borrowers">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Borrowers";
        $SEARCH_PLACEHOLDER = "Filter borrowers and their transactions…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>
        <div class="container">
          <div class="stat highlight slim-stat-inline">
            <div class="label">Total Borrowers</div>
            <div class="value" id="studentsTotalStat">0</div>
          </div>
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Borrower records</h2>
              <p class="page-note">View registered borrowers and basic contact details. Use search to quickly find a student before creating transactions.</p>
            </div>
          </div>
          <div class="card table-wrap top-space">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody id="studentsTableBody"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    <?php include __DIR__ . "/includes/admin-profile-modals.php"; ?>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js?v=7"></script>
  </body>
</html>
