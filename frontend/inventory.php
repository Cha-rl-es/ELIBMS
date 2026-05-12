<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Inventory</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="inventory">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Book Inventory";
        $SEARCH_PLACEHOLDER = "Search accession, ISBN, title…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>

        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Inventory</h2>
              <p class="page-note">Browse the book catalog and current stock levels. Use this view to monitor availability and inventory status.</p>
            </div>
          </div>

          <section class="grid grid-cards-4" aria-label="Inventory snapshots">
            <div class="stat highlight"><div class="label">Total Inventory</div><div class="value" id="invTotalInventory">0</div></div>
            <div class="stat"><div class="label">Total Categories</div><div class="value" id="invTotalCategories">0</div></div>
            <div class="stat highlight"><div class="label">Available Stocks</div><div class="value" id="invAvailableStocks">0</div></div>
            <div class="stat highlight"><div class="label">Borrowed Stocks</div><div class="value" id="invBorrowedStocks">0</div></div>
          </section>

          <div class="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody id="bookTableBody"></tbody>
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
