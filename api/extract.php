<?php
/**
 * TOOLSERA - Media Extraction API Endpoint
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.'
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

$configFile = dirname(__DIR__) . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration missing.']);
    exit;
}
$config = require $configFile;

require_once dirname(__DIR__) . '/includes/ExtractionManager.php';

// Parse incoming request payload (support JSON and form data)
$rawBody = file_get_contents('php://input');
$inputData = json_decode($rawBody, true) ?? [];
$targetUrl = trim($inputData['url'] ?? $_POST['url'] ?? '');

if (empty($targetUrl)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide an Instagram post or reel URL.'
    ]);
    exit;
}

// Basic domain check
$parsedUrl = parse_url($targetUrl);
$host = strtolower($parsedUrl['host'] ?? '');
$allowedDomains = $config['security']['allowed_domains'] ?? ['instagram.com', 'www.instagram.com', 'instagr.am'];

$isAllowed = false;
foreach ($allowedDomains as $allowed) {
    if ($host === $allowed || str_ends_with($host, '.' . $allowed)) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Only valid Instagram URLs are supported (reels, videos, posts).'
    ]);
    exit;
}

// Execute Extraction
$manager = new \Toolsera\Extractor\ExtractionManager($config);
$result = $manager->extract($targetUrl);

if (!$result['success']) {
    http_response_code(422);
    echo json_encode($result, JSON_UNESCAPED_SLASHES);
    exit;
}

// Inject streaming download proxy URLs to avoid browser playback & CORS issues
$media = $result['data'];
$encodedCdn = base64_encode($media['video_url']);
$cleanTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', substr($media['title'], 0, 30));

$downloadProxyUrl = "api/download.php?v=" . urlencode($encodedCdn) . "&title=" . urlencode($cleanTitle);

$media['download_stream_url'] = $downloadProxyUrl;
$media['direct_download_url'] = $media['video_url'];
foreach ($media['formats'] as &$fmt) {
    $fmt['download_url'] = $downloadProxyUrl . "&type=" . $fmt['type'];
    $fmt['direct_url'] = $media['video_url'];
}

echo json_encode([
    'success' => true,
    'data'    => $media,
    'driver'  => $result['driver'] ?? 'Direct Engine',
], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
