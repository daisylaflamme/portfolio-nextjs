<?php
/**
 * Contact form handler for the Next.js portfolio (www.daisylaflamme.net).
 * Accepts POST from the browser form (Option 2: direct form submit).
 * Returns HTML so the user sees a friendly success or error page with a link back.
 */

$siteUrl = 'https://www.daisylaflamme.net';
$contactUrl = $siteUrl . '/contact';

function htmlPage($title, $message, $isError = false) {
  global $contactUrl;
  $bg = $isError ? '#fef2f2' : '#f0fdf4';
  $color = $isError ? '#b91c1c' : '#15803d';
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . htmlspecialchars($title) . '</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:1.5rem;background:' . $bg . ';color:#111;"><h1 style="font-size:1.25rem;color:' . $color . ';">' . htmlspecialchars($title) . '</h1><p>' . htmlspecialchars($message) . '</p><p><a href="' . htmlspecialchars($contactUrl) . '" style="color:#2563eb;">&larr; Back to contact</a></p></body></html>';
}

header('Content-Type: text/html; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(400);
  echo htmlPage('Invalid request', 'Please use the contact form to send a message.', true);
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
  echo htmlPage('Error', 'Anti-spam check failed. Please go back and try again.', true);
  exit;
}

if ($name === '' || $email === '') {
  http_response_code(400);
  echo htmlPage('Error', 'Name and email are required.', true);
  exit;
}

$body = "From: $name\nE-Mail: $email\n\nMessage:\n$message";

if (mail($to, $subject, $body, $from)) {
  http_response_code(200);
  echo htmlPage('Message sent', 'Thank you! Your message has been sent. I\'ll get back to you soon.');
} else {
  http_response_code(500);
  echo htmlPage('Error', 'Something went wrong while sending your message. Please try again or email directly.', true);
}
