<?php
/**
 * TOOLSERA - Feedback & Issue Reporting Endpoint
 * Receives user feedback, bug reports, and feature requests.
 * Supports public submission and authenticated admin management.
 * Developed by Adeel Ahmad (adeelahmed3376@gmail.com)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$ADMIN_TOKEN = 'toolsera_admin_2026';
$OWNER_EMAIL = 'adeelahmed3376@gmail.com';
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$filePath = $dataDir . '/feedbacks.json';

function getFeedbacks($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $content = @file_get_contents($filePath);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : [];
}

function saveFeedbacks($filePath, $feedbacks) {
    @file_put_contents($filePath, json_encode($feedbacks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function checkAdminAuth($token) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (strpos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7)) === $token;
    }
    return (isset($_GET['token']) && $_GET['token'] === $token);
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET for Admin Feedback Dashboard
if ($method === 'GET') {
    if (!checkAdminAuth($ADMIN_TOKEN)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
        exit;
    }

    $feedbacks = getFeedbacks($filePath);
    $total = count($feedbacks);
    $newCount = 0;
    $reviewedCount = 0;
    $resolvedCount = 0;

    foreach ($feedbacks as $fb) {
        $st = $fb['status'] ?? 'New';
        if ($st === 'New') $newCount++;
        elseif ($st === 'Reviewed') $reviewedCount++;
        elseif ($st === 'Resolved') $resolvedCount++;
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'total' => $total,
            'new' => $newCount,
            'reviewed' => $reviewedCount,
            'resolved' => $resolvedCount
        ],
        'feedbacks' => $feedbacks
    ]);
    exit;
}

// Read JSON Input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

// Handle Admin Updates & Deletes via POST / PATCH / DELETE
$isAdminRequest = (isset($_GET['admin']) || checkAdminAuth($ADMIN_TOKEN));
$action = $input['action'] ?? ($method === 'DELETE' ? 'delete' : '');

if ($isAdminRequest && ($action === 'update_status' || $action === 'delete')) {
    if (!checkAdminAuth($ADMIN_TOKEN)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
        exit;
    }

    $fbId = $input['id'] ?? $_GET['id'] ?? '';
    $feedbacks = getFeedbacks($filePath);

    if ($action === 'update_status') {
        $newStatus = $input['status'] ?? 'Reviewed';
        $updated = false;
        foreach ($feedbacks as &$fb) {
            if (($fb['id'] ?? '') === $fbId) {
                $fb['status'] = $newStatus;
                $updated = true;
                break;
            }
        }
        if ($updated) {
            saveFeedbacks($filePath, $feedbacks);
            echo json_encode(['success' => true, 'message' => "Status updated to {$newStatus}"]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Feedback entry not found']);
        }
        exit;
    }

    if ($action === 'delete') {
        $origLen = count($feedbacks);
        $feedbacks = array_values(array_filter($feedbacks, function($fb) use ($fbId) {
            return ($fb['id'] ?? '') !== $fbId;
        }));
        if (count($feedbacks) < $origLen) {
            saveFeedbacks($filePath, $feedbacks);
            echo json_encode(['success' => true, 'message' => 'Feedback entry deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Feedback entry not found']);
        }
        exit;
    }
}

// Public Submission
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
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

$uniqueId = 'fb_' . bin2hex(random_bytes(4));
$name = trim($input['name'] ?? '') ?: 'Anonymous Visitor';
$email = trim($input['email'] ?? '') ?: 'None provided';
$subject = trim($input['subject'] ?? '') ?: 'General Feedback';
$category = trim($input['category'] ?? 'general');
$rating = intval($input['rating'] ?? 5);
if ($rating < 1 || $rating > 5) $rating = 5;

$entry = [
    'id' => $uniqueId,
    'timestamp' => time(),
    'date' => gmdate('Y-m-d H:i:s') . ' UTC',
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'category' => $category,
    'rating' => $rating,
    'message' => $message,
    'status' => 'New',
    'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 120)
];

$feedbacks = getFeedbacks($filePath);
array_unshift($feedbacks, $entry); // Insert newest first
saveFeedbacks($filePath, $feedbacks);

// Safe Email Notification Attempt
@mail(
    $OWNER_EMAIL,
    "[TOOLSERA Feedback] (" . strtoupper($category) . ") - " . $subject,
    "New feedback on TOOLSERA:\n\nID: {$uniqueId}\nFrom: {$name} ({$email})\nRating: {$rating}/5 Stars\nMessage:\n{$message}\n",
    "From: notifications@toolsera.com\r\nX-Mailer: PHP/" . phpversion()
);

echo json_encode([
    'success' => true,
    'id' => $uniqueId,
    'message' => 'Thank you for helping us improve TOOLSERA! Your feedback has been received.'
]);
