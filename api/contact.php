<?php
/**
 * CONTACT FORM HANDLER
 * File: /htdocs/api/contact.php
 * Processes contact form submissions with validation and security
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// CORS headers (adjust for production)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
define('ADMIN_EMAIL', 'bijaykoirala003@gmail.com');
define('SITE_NAME', 'Bijay Koirala Portfolio');
define('MAX_MESSAGE_LENGTH', 1000);
define('MIN_MESSAGE_LENGTH', 10);
define('RATE_LIMIT_MINUTES', 5);
define('MAX_ATTEMPTS', 3);
define('ENABLE_DATABASE', false); // Set to true if using database
define('ENABLE_EMAIL', false); // Set to true when email is configured
define('LOG_SUBMISSIONS', true);
define('LOG_FILE', __DIR__ . '/../logs/contact_submissions.log');

// Response helper
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('c')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    http_response_code($success ? 200 : 400);
    echo json_encode($response);
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method. Only POST allowed.');
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// If JSON decode failed, try form data
if ($data === null) {
    $data = $_POST;
}

// Validate required fields
$required_fields = ['name', 'email', 'subject', 'message'];
$errors = [];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        $errors[] = ucfirst($field) . ' is required';
    }
}

if (!empty($errors)) {
    sendResponse(false, 'Validation failed', ['errors' => $errors]);
}

// Sanitize input data
$name = filter_var(trim($data['name']), FILTER_SANITIZE_STRING);
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$subject = filter_var(trim($data['subject']), FILTER_SANITIZE_STRING);
$message = filter_var(trim($data['message']), FILTER_SANITIZE_STRING);

// Additional data
$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$referrer = $data['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? 'Direct';
$timestamp = date('Y-m-d H:i:s');

// Validate name
if (strlen($name) < 2 || strlen($name) > 50) {
    sendResponse(false, 'Name must be between 2 and 50 characters');
}

if (!preg_match("/^[a-zA-Z\s'-]+$/", $name)) {
    sendResponse(false, 'Name contains invalid characters');
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email address');
}

// Check for disposable email domains (optional)
$disposable_domains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
$email_domain = substr(strrchr($email, "@"), 1);
if (in_array($email_domain, $disposable_domains)) {
    sendResponse(false, 'Please use a valid email address');
}

// Validate subject
if (strlen($subject) < 3 || strlen($subject) > 100) {
    sendResponse(false, 'Subject must be between 3 and 100 characters');
}

// Validate message
if (strlen($message) < MIN_MESSAGE_LENGTH || strlen($message) > MAX_MESSAGE_LENGTH) {
    sendResponse(false, 'Message must be between ' . MIN_MESSAGE_LENGTH . ' and ' . MAX_MESSAGE_LENGTH . ' characters');
}

// Check for spam patterns
$spam_patterns = [
    '/\b(?:viagra|cialis|casino|lottery|winner|click here|free money)\b/i',
    '/\[url=.*\]/i',
    '/<a\s+href=/i',
    '/https?:\/\/[^\s]+/i' // URLs in message (optional, might be too strict)
];

foreach ($spam_patterns as $pattern) {
    if (preg_match($pattern, $message) || preg_match($pattern, $subject)) {
        sendResponse(false, 'Message rejected due to spam detection');
    }
}

// Honeypot check (if field exists and has value, it's likely spam)
if (isset($data['website']) && !empty($data['website'])) {
    // Silently reject but return success to confuse bots
    sendResponse(true, 'Message sent successfully');
}

// Rate limiting check
session_start();
$session_key = 'contact_attempts';
$current_time = time();

if (isset($_SESSION[$session_key])) {
    $attempts = $_SESSION[$session_key];
    
    // Clean old attempts
    $attempts = array_filter($attempts, function($time) use ($current_time) {
        return ($current_time - $time) < (RATE_LIMIT_MINUTES * 60);
    });
    
    if (count($attempts) >= MAX_ATTEMPTS) {
        $wait_time = RATE_LIMIT_MINUTES - round((time() - min($attempts)) / 60);
        sendResponse(false, "Too many attempts. Please wait $wait_time minutes before trying again.");
    }
    
    $attempts[] = $current_time;
    $_SESSION[$session_key] = $attempts;
} else {
    $_SESSION[$session_key] = [$current_time];
}

// Prepare submission data
$submission = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'ip_address' => $ip_address,
    'user_agent' => $user_agent,
    'referrer' => $referrer,
    'timestamp' => $timestamp
];

// Save to database (if enabled)
if (ENABLE_DATABASE) {
    try {
        // Database configuration (update with your InfinityFree credentials)
        $db_host = 'sql.infinityfree.com';
        $db_name = 'your_database';
        $db_user = 'your_username';
        $db_pass = 'your_password';
        
        $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $sql = "INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent, referrer, created_at) 
                VALUES (:name, :email, :subject, :message, :ip_address, :user_agent, :referrer, :timestamp)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($submission);
        
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        // Continue execution even if database fails
    }
}

// Send email notification (if enabled)
if (ENABLE_EMAIL) {
    // Note: mail() function might be disabled on InfinityFree
    // Consider using PHPMailer with SMTP instead
    
    $to = ADMIN_EMAIL;
    $email_subject = "[" . SITE_NAME . "] New Contact: " . $subject;
    
    // HTML email body
    $email_body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
            .content { background: #f4f4f4; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Contact Form Submission</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Name:</div>
                    <div class='value'>" . htmlspecialchars($name) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div class='value'>" . htmlspecialchars($email) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Subject:</div>
                    <div class='value'>" . htmlspecialchars($subject) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Message:</div>
                    <div class='value'>" . nl2br(htmlspecialchars($message)) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Submitted:</div>
                    <div class='value'>$timestamp</div>
                </div>
                <div class='field'>
                    <div class='label'>IP Address:</div>
                    <div class='value'>$ip_address</div>
                </div>
            </div>
            <div class='footer'>
                This email was sent from your portfolio contact form.
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Plain text version
    $plain_body = "
    New Contact Form Submission
    
    Name: $name
    Email: $email
    Subject: $subject
    
    Message:
    $message
    
    Submitted: $timestamp
    IP Address: $ip_address
    ";
    
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . SITE_NAME . ' <noreply@' . $_SERVER['HTTP_HOST'] . '>',
        'Reply-To: ' . $name . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Try to send email
    $email_sent = @mail($to, $email_subject, $email_body, implode("\r\n", $headers));
    
    if (!$email_sent) {
        error_log('Failed to send email notification');
    }
}

// Send auto-reply to user (optional)
if (ENABLE_EMAIL && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $reply_subject = "Thank you for contacting " . SITE_NAME;
    
    $reply_body = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #6366f1;'>Thank you for reaching out!</h2>
            <p>Hi " . htmlspecialchars($name) . ",</p>
            <p>I've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
            <p>Here's a copy of your message:</p>
            <div style='background: #f4f4f4; padding: 15px; border-left: 4px solid #6366f1;'>
                <strong>Subject:</strong> " . htmlspecialchars($subject) . "<br>
                <strong>Message:</strong><br>" . nl2br(htmlspecialchars($message)) . "
            </div>
            <p>In the meantime, feel free to:</p>
            <ul>
                <li>Check out my <a href='https://github.com/bijay085'>GitHub</a></li>
                <li>Connect on <a href='https://linkedin.com/in/bijay-koirala'>LinkedIn</a></li>
                <li>Browse my <a href='https://bijaykoirala0.com.np/#projects'>projects</a></li>
            </ul>
            <p>Best regards,<br>Bijay Koirala</p>
            <hr style='margin-top: 30px; border: none; border-top: 1px solid #ddd;'>
            <p style='font-size: 12px; color: #888;'>
                This is an automated response. Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    ";
    
    $reply_headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . SITE_NAME . ' <noreply@' . $_SERVER['HTTP_HOST'] . '>',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    @mail($email, $reply_subject, $reply_body, implode("\r\n", $reply_headers));
}

// Log submission (if enabled)
if (LOG_SUBMISSIONS) {
    $log_dir = dirname(LOG_FILE);
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $log_entry = date('[Y-m-d H:i:s]') . ' ' . json_encode($submission) . PHP_EOL;
    @file_put_contents(LOG_FILE, $log_entry, FILE_APPEND | LOCK_EX);
}

// Success response
$response_data = [
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'timestamp' => $timestamp
];

sendResponse(true, 'Thank you for your message! I\'ll get back to you soon.', $response_data);
?>