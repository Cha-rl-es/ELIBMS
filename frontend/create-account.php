<?php
require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/auth.php';

$u = elbis_current_user();
if ($u) {
    header('Location: ' . elbis_redirect_url_for_role(strtolower((string) ($u['role'] ?? ''))));
    exit;
}

$registerError = isset($_SESSION['register_error']) ? (string) $_SESSION['register_error'] : '';
unset($_SESSION['register_error']);
$prefill = isset($_SESSION['register_prefill']) && is_array($_SESSION['register_prefill']) ? $_SESSION['register_prefill'] : [];
unset($_SESSION['register_prefill']);

$prefillName = isset($prefill['name']) ? (string) $prefill['name'] : '';
$prefillEmail = isset($prefill['email']) ? (string) $prefill['email'] : '';
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ELBIS - Create Staff Account</title>
    <link rel="stylesheet" href="assets/css/styles.css?v=5" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  </head>
  <body data-page="login" class="login-body create-account-body">
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
            <div class="login-card-head-icon" aria-hidden="true"><i class="fa-solid fa-user-plus"></i></div>
            <div class="login-card-head-text">
              <h2 class="login-title">Create Staff Account</h2>
              <p class="login-support">Use your EVSU email to create a Library Staff account for ELBIS.</p>
            </div>
          </div>

          <form id="staffRegisterForm" class="login-form" method="post" action="create-account-action.php" autocomplete="on">
            <div>
              <label for="name">Full name</label>
              <input id="name" name="name" type="text" placeholder="Your name" required value="<?php echo htmlspecialchars($prefillName, ENT_QUOTES, 'UTF-8'); ?>" />
            </div>
            <div>
              <label for="email">EVSU email</label>
              <input id="email" name="email" type="email" autocomplete="username" placeholder="name@evsu.edu.ph" required value="<?php echo htmlspecialchars($prefillEmail, ENT_QUOTES, 'UTF-8'); ?>" />
            </div>
            <div>
              <label for="password">Password</label>
              <div class="password-field">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Create a password"
                  required
                />
                <button type="button" class="password-toggle" data-target="password" aria-label="Show password">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            <div>
              <label for="passwordConfirm">Confirm password</label>
              <div class="password-field">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Re-enter your password"
                  required
                />
                <button type="button" class="password-toggle" data-target="passwordConfirm" aria-label="Show password">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>

            <button class="btn-primary icon-btn-text" type="submit">
              <i class="fa-solid fa-user-plus"></i><span>Create account</span>
            </button>

            <p id="registerMessage" class="message<?php echo $registerError !== '' ? ' error' : ''; ?>" role="status">
              <?php echo $registerError !== '' ? htmlspecialchars($registerError, ENT_QUOTES, 'UTF-8') : ''; ?>
            </p>
          </form>
          <div class="login-cross-links top-space">
            <a class="login-cross-link" href="login.php"><i class="fa-solid fa-arrow-left"></i><span>Back to Login</span></a>
          </div>
        </div>
      </div>
    </main>

    <script src="assets/js/app.js?v=6"></script>
  </body>
</html>

