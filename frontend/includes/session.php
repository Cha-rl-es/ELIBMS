<?php
/**
 * Safe session bootstrap for ELBIS (call once per request before output).
 */

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
