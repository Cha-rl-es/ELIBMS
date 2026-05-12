<?php if (!isset($PAGE_TITLE)) { $PAGE_TITLE = "ELBIS"; } ?>
<?php if (!isset($PAGE_TARGET)) { $PAGE_TARGET = ""; } ?>
<?php if (!isset($BC_CURRENT)) { $BC_CURRENT = $PAGE_TITLE; } ?>
<?php if (!isset($SEARCH_PLACEHOLDER)) { $SEARCH_PLACEHOLDER = "Search books, students, transactions…"; } ?>
<?php
require_once __DIR__ . '/auth.php';
$__elbis_topbar_user = elbis_current_user();
$__elbis_topbar_role = (string) ($__elbis_topbar_user['role'] ?? 'Library Staff');
$__elbis_topbar_role_l = strtolower($__elbis_topbar_role);
$__is_admin_topbar = $__elbis_topbar_role_l === 'admin';
?>
<header class="topbar">
  <div class="topbar-left">
    <div class="page-info">
      <h1 class="topbar-title"><?php echo htmlspecialchars($PAGE_TITLE, ENT_QUOTES, 'UTF-8'); ?></h1>
      <div class="breadcrumb">
        <span><?php echo $__is_admin_topbar ? 'Administration' : 'Library Staff'; ?></span>
        <i class="fa-solid fa-angle-right" aria-hidden="true"></i>
        <span><?php echo htmlspecialchars($BC_CURRENT, ENT_QUOTES, 'UTF-8'); ?></span>
      </div>
    </div>
  </div>
  <div class="header-search">
    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
    <input type="text" id="globalSearch" placeholder="<?php echo htmlspecialchars($SEARCH_PLACEHOLDER, ENT_QUOTES, 'UTF-8'); ?>" aria-label="Global Search" />
  </div>
  <div class="topbar-right">
    <?php if ($__is_admin_topbar): ?>
      <span class="soft-chip" data-admin-name><?php echo htmlspecialchars((string) ($__elbis_topbar_user['name'] ?? 'Admin'), ENT_QUOTES, 'UTF-8'); ?></span>
    <?php endif; ?>
    <button class="icon-btn notification-btn" aria-label="Notifications" type="button" title="Notifications">
      <i class="fa-solid fa-bell"></i><span class="notification-count">0</span>
    </button>
    <div id="liveDateTime" class="soft-chip" aria-label="Current Date and Time">—</div>
    <div class="system-status online"><span class="status-dot"></span> Online</div>
    <span id="roleBadgeShell" data-role-badge class="role-badge librarian"><?php echo htmlspecialchars($__elbis_topbar_role, ENT_QUOTES, 'UTF-8'); ?></span>
    <div class="profile-dropdown">
      <button type="button" id="userCircleBtn" class="user-circle-btn" aria-label="User Menu" title="Account Menu">A</button>
      <div class="dropdown-menu">
        <button type="button" data-open-modal="profileModal"><i class="fa-solid fa-user"></i> View/Edit Profile</button>
        <button type="button" data-open-modal="profileModal"><i class="fa-solid fa-key"></i> Change Password</button>
        <button type="button" data-action="logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
      </div>
    </div>
  </div>
</header>
