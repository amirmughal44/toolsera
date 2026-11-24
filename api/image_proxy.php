<?php
/**
 * TOOLSERA - Secure Thumbnail Image Proxy
 * Proxies Instagram CDN images with client caching to prevent CORS and referrer blocking.
 * Developed by Adeel Ahmad
 */
declare(strict_types=1);

if (!isset($_GET['url']) || empty($_GET['url'])) {
    http_response_code(400);
    die('Missing image URL');
}

$rawUrl = $_GET['url'];
if (!filter_var($rawUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    die('Invalid image URL');
}

$parsed = parse_url($rawUrl);
$host = strtolower($parsed['host'] ?? '');
$isAllowed = (
    str_ends_with($host, 'fbcdn.net') ||
    str_ends_with($host, 'cdninstagram.com') ||
    str_ends_with($host, 'instagram.com')
);

if (!$isAllowed) {
    http_response_code(403);
    die('Untrusted image origin');
}

$ch = curl_init($rawUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
]);

$imageData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
curl_close($ch);

if ($httpCode === 200 && $imageData) {
    header('Content-Type: ' . $contentType);
    header('Cache-Control: public, max-age=86400');
    header('Access-Control-Allow-Origin: *');
    header('Referrer-Policy: no-referrer');
    echo $imageData;
} else {
    http_response_code($httpCode ?: 500);
    echo 'Image fetch failed';
}
