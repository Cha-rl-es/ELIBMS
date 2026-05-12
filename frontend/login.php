<?php
require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/auth.php';

$u = elbis_current_user();
if ($u) {
    header('Location: ' . elbis_redirect_url_for_role(strtolower((string) ($u['role'] ?? ''))));
    exit;
}

$loginError = isset($_SESSION['login_error']) ? (string) $_SESSION['login_error'] : '';
unset($_SESSION['login_error']);
$loginSuccess = isset($_SESSION['login_success']) ? (string) $_SESSION['login_success'] : '';
unset($_SESSION['login_success']);
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Staff Login</title>
    <link rel="stylesheet" href="assets/css/styles.css?v=5" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="login" class="login-body">
    <header class="login-top-bar">
      <a class="login-brand-mark" href="login.php" aria-label="ELBIS — EVSU Library">
        <img src="assets/img/evsu-logo.svg" width="52" height="52" alt="" />
      </a>
      <h1 class="login-site-name">EVSU LIBRARY</h1>
      <span class="login-top-spacer" aria-hidden="true"></span>
    </header>
    <p class="login-tagline">EVSU Library Borrowing and Inventory System</p>

    <main class="login-main">
      <div class="login-panel">
        <div class="card login-card">
          <div class="login-card-head">
            <div class="login-card-head-icon" aria-hidden="true"><i class="fa-solid fa-book-open-reader"></i></div>
            <div class="login-card-head-text">
              <h2 class="login-title">ADMIN / STAFF LOGIN</h2>
              <p class="login-support">
                Use your EVSU account for inventory, borrowing, returns, and ICS records.
              </p>
            </div>
          </div>

          <p class="muted login-hint">Demo: <strong>admin@evsu.edu.ph</strong> / <strong>admin123</strong></p>
          <p class="muted login-hint">Demo: <strong>staff@evsu.edu.ph</strong> / <strong>staff123</strong></p>

          <form id="loginForm" class="login-form" method="post" action="login-action.php" autocomplete="on">
            <div>
              <label for="email">EVSU email</label>
              <input id="email" name="email" type="email" autocomplete="username" placeholder="name@evsu.edu.ph" required />
            </div>
            <div>
              <label for="password">Password</label>
              <div class="password-field">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" class="password-toggle" data-target="password" aria-label="Show password">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            <button class="btn-primary icon-btn-text" type="submit">
              <i class="fa-solid fa-right-to-bracket"></i><span>Sign in</span>
            </button>
            <p
              id="loginMessage"
              class="message<?php echo $loginError !== '' ? ' error' : ($loginSuccess !== '' ? ' success' : ''); ?>"
              role="status"
            ><?php
            if ($loginError !== '') {
                echo htmlspecialchars($loginError, ENT_QUOTES, 'UTF-8');
            } elseif ($loginSuccess !== '') {
                echo htmlspecialchars($loginSuccess, ENT_QUOTES, 'UTF-8');
            }
            ?></p>
          </form>

          <div class="login-cross-links top-space">
            <a class="login-cross-link" href="create-account.php"><i class="fa-solid fa-user-plus"></i><span>Create staff account</span></a>
          </div>

        </div>
      </div>
    </main>

    <script src="assets/js/app.js?v=6"></script>
  </body>
</html>
