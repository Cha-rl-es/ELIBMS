<?php
/**
 * End staff session and clear browser auth state for the staff portal.
 */

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/auth.php';

elbis_logout();
header('Location: login.php');
exit;
