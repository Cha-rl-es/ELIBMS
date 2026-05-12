<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - ICS Records</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="ics">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "ICS Records";
        $SEARCH_PLACEHOLDER = "ICS search placeholder (wire to API)";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>
        <div class="container">
          <div class="stat highlight slim-stat-inline">
            <div class="label">ICS entries</div>
            <div class="value" id="icsTotalRecords">0</div>
          </div>
          <div class="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ICS ID</th>
                  <th>Book ID</th>
                  <th>Quantity</th>
                  <th>Date Received</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody id="icsTableBody"></tbody>
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
