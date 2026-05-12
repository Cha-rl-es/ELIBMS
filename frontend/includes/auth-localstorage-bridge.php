<?php
/**
 * Sync PHP session into localStorage key used by assets/js/app.js (elbis_auth).
 * Include once per page, immediately before app.js.
 */

require_once __DIR__ . '/session.php';

$u = $_SESSION['elbis_user'] ?? null;
if (!is_array($u) || empty($u['email'])) {
    return;
}

$payload = [
    'type' => 'user',
    'id' => (string) ($u['user_id'] ?? $u['id'] ?? ''),
    'name' => (string) ($u['name'] ?? ''),
    'email' => (string) ($u['email'] ?? ''),
    'role' => (string) ($u['role'] ?? 'Library Staff'),
];

$json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false) {
    return;
}
?>
<script>
(function () {
  try {
    localStorage.setItem("elbis_auth", <?php echo json_encode($json, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>);
  } catch (e) {}
})();
</script>
