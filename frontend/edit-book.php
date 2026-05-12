<?php require_once __DIR__ . "/includes/require-staff-auth.php"; ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Edit Book</title>
    <link rel="stylesheet" href="assets/css/styles.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="edit-book">
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">EVSU Library MS</div>
        <div class="brand-sub">Management Portal</div>
        <nav class="nav-menu">
          <a class="nav-link" data-page-target="dashboard" href="dashboard.php"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
          <a class="nav-link" data-page-target="inventory" href="inventory.php"><i class="fa-solid fa-book"></i> Book Inventory</a>
          <a class="nav-link" data-page-target="add-book" href="add-book.php"><i class="fa-solid fa-square-plus"></i> Add Book</a>
          <a class="nav-link" data-page-target="transactions" href="transactions.php"><i class="fa-solid fa-arrows-rotate"></i> Transactions</a>
          <a class="nav-link" data-page-target="history" href="history.php"><i class="fa-solid fa-clock-rotate-left"></i> Transaction History</a>
          <a class="nav-link admin-only" data-page-target="users" href="admin-users.php"><i class="fa-solid fa-users-gear"></i> Admin Users</a>
        </nav>
      </aside>

      <main class="main-panel">
        <header class="topbar">
          <div class="topbar-title">Edit Book</div>
          <div class="topbar-right">
            <span id="currentUserLabel" class="soft-chip">User</span>
            <button class="btn-danger icon-btn" data-action="logout" title="Logout">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </header>

        <div class="container">
          <div class="card">
            <div class="content-head">
              <h2 class="content-title">Update Book Record</h2>
              <a class="btn-link btn-secondary icon-btn" href="inventory.php" title="Back to Inventory">
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
            <p class="page-note">Modify the selected book details and save your changes.</p>
          </div>

          <div class="card" style="max-width: 720px">
            <form id="editBookForm">
              <div>
                <label for="title">Title</label>
                <input id="title" type="text" />
              </div>
              <div>
                <label for="author">Author</label>
                <input id="author" type="text" />
              </div>
              <div>
                <label for="category">Category</label>
                <input id="category" type="text" />
              </div>
              <div>
                <label for="quantity">Quantity</label>
                <input id="quantity" type="number" min="0" />
              </div>
              <button class="btn-primary icon-btn" type="submit" title="Save Updates"><i class="fa-solid fa-check"></i></button>
              <p id="editBookMessage" class="message"></p>
            </form>
          </div>
        </div>
      </main>
    </div>
    <?php include __DIR__ . "/includes/auth-localstorage-bridge.php"; ?>
    <script src="assets/js/app.js"></script>
  </body>
</html>
