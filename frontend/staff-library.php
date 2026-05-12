<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Staff Library</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="staff-library">
    <div class="app-shell">
      <?php include __DIR__ . "/includes/admin-sidebar.php"; ?>
      <main class="main-panel">
        <?php
        $PAGE_TITLE = "Staff Library";
        $SEARCH_PLACEHOLDER = "Search title, author, category, ISBN…";
        include __DIR__ . "/includes/admin-topbar.php";
        ?>
        <div class="container">
          <div class="card hero">
            <div class="content-head">
              <h2 class="content-title">Library inventory management</h2>
              <p class="page-note">Staff view of the book catalog—search titles and check current stock availability at a glance.</p>
            </div>
          </div>
          <section class="grid grid-cards-4 top-space">
            <article class="stat"><div class="label">Total Inventory</div><div class="value" id="invTotalInventory">0</div></article>
            <article class="stat"><div class="label">Available Stocks</div><div class="value" id="invAvailableStocks">0</div></article>
            <article class="stat"><div class="label">Borrowed Stocks</div><div class="value" id="invBorrowedStocks">0</div></article>
            <article class="stat"><div class="label">Categories</div><div class="value" id="invTotalCategories">0</div></article>
          </section>
          <div class="card table-wrap top-space">
            <table>
              <thead>
                <tr>
                  <th>Book ID</th><th>Title</th><th>Author</th><th>Category</th><th>Year</th><th>Stock</th>
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
    <script src="assets/js/app.js?v=7"></script>
  </body>
</html>
