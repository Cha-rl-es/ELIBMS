<?php
require_once __DIR__ . '/auth.php';
$__elbis_sidebar_user = elbis_current_user();
$__elbis_role = strtolower((string) ($__elbis_sidebar_user['role'] ?? ''));
$__is_admin = $__elbis_role === 'admin';
?>
<aside class="sidebar">
  <div class="sidebar-brand-row">
    <div class="sidebar-logo" aria-hidden="true"><i class="fa-solid fa-book-open"></i></div>
    <div>
      <div class="brand">ELBIS</div>
      <div class="brand-sub">Eastern Visayas State University Library MIS</div>
    </div>
  </div>
  <nav class="nav-menu" aria-label="Main navigation">
    <?php if ($__is_admin): ?>
      <a class="nav-link" data-page-target="dashboard" href="dashboard.php"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
      <a class="nav-link" data-page-target="inventory" href="inventory.php"><i class="fa-solid fa-book"></i> Inventory</a>
      <a class="nav-link" data-page-target="borrow" href="borrow.php"><i class="fa-solid fa-handshake"></i> Borrow</a>
      <a class="nav-link" data-page-target="return" href="return.php"><i class="fa-solid fa-rotate-left"></i> Return</a>
      <a class="nav-link" data-page-target="history" href="history.php"><i class="fa-solid fa-clock-rotate-left"></i> History</a>
    <?php else: ?>
      <a class="nav-link" data-page-target="staff-dashboard" href="staff-dashboard.php"><i class="fa-solid fa-gauge-high"></i> Staff Dashboard</a>
      <a class="nav-link" data-page-target="staff-library" href="staff-library.php"><i class="fa-solid fa-book-open"></i> Staff Library</a>
      <a class="nav-link" data-page-target="borrowers" href="borrowers.php"><i class="fa-solid fa-users"></i> Borrowers</a>
      <a class="nav-link" data-page-target="borrow" href="borrow.php"><i class="fa-solid fa-handshake"></i> Borrow</a>
      <a class="nav-link" data-page-target="return" href="return.php"><i class="fa-solid fa-rotate-left"></i> Return</a>
      <a class="nav-link" data-page-target="history" href="history.php"><i class="fa-solid fa-clock-rotate-left"></i> History</a>
    <?php endif; ?>
  </nav>
</aside>
