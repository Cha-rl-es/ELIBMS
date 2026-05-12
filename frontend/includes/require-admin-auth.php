<?php
/**
 * Require an authenticated Admin session (blocks Library Staff on admin-only pages).
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/session.php';

if (!elbis_admin_session_ok()) {
    header('Location: staff-dashboard.php');
    exit;
}

