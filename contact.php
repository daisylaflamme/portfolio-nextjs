<?php
/**
 * Contact form handler for the Next.js portfolio (www.daisylaflamme.net).
 * Accepts POST from the Next.js API route only. No HTML output for API calls.
 *
 * POST body (application/x-www-form-urlencoded): name, email, message, human=4, submit=Submit
 * Returns: 200 on success, 400 on validation failure.
 */

header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(400);
  echo 'Method not allowed. Use POST.';
  exit;
}

$name    = isset($_POST['name']) ? trim((string) $_POST['name']) : '';
$email   = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
$message = isset($_POST['message']) ? trim((string) $_POST['message']) : '';
$human   = isset($_POST['human']) ? trim((string) $_POST['human']) : '';

$to      = 'otli4ni4ka@yahoo.com';
$subject = 'Contact from daisylaflamme.net';
$from    = 'From: DaisyLaflammeWebsite';

if ($human !== '4') {
  http_response_code(400);
  echo 'Anti-spam check failed.';
  exit;
}

if ($name === '' || $email === '') {
  http_response_code(400);
  echo 'Name and email are required.';
  exit;
}

$body = "From: $name\nE-Mail: $email\n\nMessage:\n$message";

if (mail($to, $subject, $body, $from)) {
  http_response_code(200);
  echo 'OK';
} else {
  http_response_code(500);
  echo 'Mail send failed.';
}
