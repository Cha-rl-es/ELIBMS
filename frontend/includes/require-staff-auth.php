<?php
/**
 * Require an authenticated staff session (blocks Student role on staff pages).
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/session.php';

if (!elbis_staff_session_ok()) {
    header('Location: login.php');
    exit;
}
