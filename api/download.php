<?php
/**
 * TOOLSERA - High-Performance Chunked Download Proxy
 * 
 * Streams remote CDN video directly to the user's browser with
 * Content-Disposition: attachment, forcing direct download without memory bloat.
 */

declare(strict_types=1);

// Prevent memory limits during large streaming
ini_set('memory_limit', '128M');
set_time_limit(0);

if (!isset($_GET['v']) || empty($_GET['v'])) {
    http_response_code(400);
    die('Missing video reference.');
}

$rawUrl = base64_decode($_GET['v'], true);
if (!$rawUrl || !filter_var($rawUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    die('Invalid media reference.');
}

// Validate that the media is originating from verified Meta/Instagram CDN hosts
$parsed = parse_url($rawUrl);
$host = strtolower($parsed['host'] ?? '');

$isMetaCdn = (
    str_ends_with($host, 'cdninstagram.com') ||
    str_ends_with($host, 'fbcdn.net') ||
    str_ends_with($host, 'instagram.com') ||
    str_ends_with($host, 'indown.io')
);

if (!$isMetaCdn) {
    http_response_code(403);
    die('Untrusted CDN host origin.');
}

$requestedType = $_GET['type'] ?? 'video';
$rawTitle = $_GET['title'] ?? 'instagram_video';
$safeTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $rawTitle);
if (empty($safeTitle)) {
    $safeTitle = 'instagram_video_' . time();
}

$fileName = "toolsera_" . $safeTitle . ($requestedType === 'audio' ? '.mp3' : '.mp4');
$contentType = $requestedType === 'audio' ? 'audio/mpeg' : 'video/mp4';

// Check remote headers first for size and availability
$chHead = curl_init($rawUrl);
curl_setopt_array($chHead, [
    CURLOPT_NOBODY => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
]);
curl_exec($chHead);
$contentLength = curl_getinfo($chHead, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
curl_close($chHead);

// Output HTTP download headers
header('Content-Description: File Transfer');
header("Content-Type: {$contentType}");
header("Content-Disposition: attachment; filename=\"{$fileName}\"");
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');

if ($contentLength > 0) {
    header("Content-Length: {$contentLength}");
}

// Clear output buffers to prevent memory buffering
while (ob_get_level()) {
    ob_end_clean();
}

// Stream video in real-time chunks directly to client
$chStream = curl_init($rawUrl);
curl_setopt_array($chStream, [
    CURLOPT_HEADER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 600,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => 0,
    CURLOPT_WRITEFUNCTION => function ($ch, $chunk) {
        echo $chunk;
        flush();
        return strlen($chunk);
    }
]);

curl_exec($chStream);
curl_close($chStream);
exit;
