<?php
/**
 * TOOLSERA - Feedback & Issue Reporting Endpoint
 * Receives user feedback, bug reports, and feature requests.
 * Developed by Adeel Ahmad (adeelahmed3376@gmail.com)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    $input = $_POST;
}

$message = trim($input['message'] ?? '');
if (empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your message or feedback details.'
    ]);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$filePath = $dataDir . '/feedbacks.json';

$existing = [];
if (file_exists($filePath)) {
    $content = @file_get_contents($filePath);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $existing = $decoded;
    }
}

$entry = [
    'timestamp' => time(),
    'date' => gmdate('Y-m-d H:i:s') . ' UTC',
    'name' => trim($input['name'] ?? '') ?: 'Anonymous User',
    'email' => trim($input['email'] ?? '') ?: 'None provided',
    'category' => trim($input['category'] ?? 'general'),
    'rating' => intval($input['rating'] ?? 5),
    'message' => $message,
    'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 120)
];

$existing[] = $entry;
@file_put_contents($filePath, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your feedback has been sent directly to Adeel Ahmad.'
]);
