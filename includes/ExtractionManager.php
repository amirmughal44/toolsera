<?php
/**
 * TOOLSERA - Extraction Orchestrator
 * 
 * Manages drivers, validates URLs, extracts shortcodes,
 * and ensures lifetime resilience through automated fallbacks.
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

require_once __DIR__ . '/ExtractorInterface.php';
require_once __DIR__ . '/IndownExtractor.php';
require_once __DIR__ . '/InstagramEmbedExtractor.php';
require_once __DIR__ . '/InstagramDirectExtractor.php';
require_once __DIR__ . '/RapidApiExtractor.php';
require_once __DIR__ . '/YtDlpExtractor.php';

class ExtractionManager
{
    private array $config;
    /** @var ExtractorInterface[] */
    private array $drivers = [];

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->registerDrivers();
    }

    private function registerDrivers(): void
    {
        // 1. High-Speed Indown Driver (Primary - High success rate on public reels & videos)
        $this->drivers[] = new IndownExtractor($this->config);

        // 2. Embed Extractor
        if (!empty($this->config['pipeline']['enable_embed_extractor'])) {
            $this->drivers[] = new InstagramEmbedExtractor($this->config);
        }

        // 3. Direct Web / JSON-LD Extractor
        if (!empty($this->config['pipeline']['enable_direct_extractor'])) {
            $this->drivers[] = new InstagramDirectExtractor($this->config);
        }

        // 4. Local yt-dlp Extractor
        if (!empty($this->config['pipeline']['enable_ytdlp'])) {
            $this->drivers[] = new YtDlpExtractor($this->config);
        }

        // 5. RapidAPI High Availability Fallback
        if (!empty($this->config['pipeline']['enable_rapidapi_fallback']) || !empty($this->config['rapidapi']['enabled'])) {
            $this->drivers[] = new RapidApiExtractor($this->config);
        }
    }

    /**
     * Extracts the media shortcode from all standard Instagram URL formats:
     * - https://www.instagram.com/reel/C7-ABC1234/
     * - https://www.instagram.com/p/C7-ABC1234/?igsh=...
     * - https://www.instagram.com/tv/C7-ABC1234/
     * - https://instagram.com/share/reel/C7-ABC1234/
     */
    public function parseShortcode(string $url): ?string
    {
        $cleanUrl = trim($url);

        // Standard patterns: /p/{code}, /reel/{code}, /tv/{code}, /reels/{code}
        if (preg_match('#instagram\.com/(?:p|reel|reels|tv)/([A-Za-z0-9_-]+)#i', $cleanUrl, $matches)) {
            return $matches[1];
        }

        // Share URLs: /share/p/{code} or /share/reel/{code}
        if (preg_match('#instagram\.com/share/(?:p|reel)/([A-Za-z0-9_-]+)#i', $cleanUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Executes the extraction pipeline across registered drivers
     */
    public function extract(string $url): array
    {
        $shortcode = $this->parseShortcode($url);

        if (!$shortcode) {
            return [
                'success' => false,
                'message' => 'Invalid Instagram URL format. Please paste a link to a valid Reel, Video, or Post.'
            ];
        }

        $lastError = null;

        foreach ($this->drivers as $driver) {
            try {
                $result = $driver->extract($url, $shortcode);
                if ($result && !empty($result['video_url'])) {
                    return [
                        'success' => true,
                        'data'    => $result,
                        'driver'  => $driver->getName(),
                    ];
                }
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
                continue;
            }
        }

        return [
            'success' => false,
            'message' => 'Could not extract video. The post might be private, deleted, or temporarily restricted by Instagram.',
            'debug'   => $lastError
        ];
    }
}
