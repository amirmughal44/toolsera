<?php
/**
 * TOOLSERA - Media Downloader Configuration
 * Professional Multi-Tier Extraction Engine
 */

declare(strict_types=1);

// Disable error display in production; log errors instead
ini_set('display_errors', '0');
error_reporting(E_ALL);

return [
    'app' => [
        'name'        => 'Toolsera',
        'tagline'     => 'Fast, Free & High Quality Instagram Video Downloader',
        'domain'      => 'toolsera.com',
        'brand_color' => '#635BFF',
        'version'     => '2.4.0',
        'max_retries' => 3,
        'user_agent'  => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    ],

    /**
     * Extraction Pipeline Configuration
     * The ExtractionManager runs through these drivers in priority order.
     * If the first fails, it seamlessly falls through to the next.
     */
    'pipeline' => [
        'enable_embed_extractor'  => true, // Highly reliable, bypasses standard login walls
        'enable_direct_extractor' => true, // Parses JSON-LD, GraphQL & meta tags
        'enable_ytdlp'            => false, // Set to true if yt-dlp is installed on server
        'enable_rapidapi_fallback'=> false, // Set to true if you add a RapidAPI key below
    ],

    /**
     * Optional RapidAPI Fallback
     * Used as an unbreakable secondary tier if server IP faces temporary challenges.
     */
    'rapidapi' => [
        'enabled' => false,
        'key'     => '', // e.g. 'YOUR_RAPIDAPI_KEY'
        'host'    => 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com',
    ],

    /**
     * Optional Proxy Settings
     * If using rotating residential proxies (e.g., Webshare, Smartproxy)
     */
    'proxy' => [
        'enabled' => false,
        'server'  => '', // e.g. 'http://proxy.example.com:8080'
        'auth'    => '', // e.g. 'username:password'
    ],

    /**
     * Rate Limiting & Security (per IP)
     */
    'security' => [
        'max_requests_per_minute' => 30,
        'allowed_domains' => ['instagram.com', 'www.instagram.com', 'instagr.am'],
    ],
];
