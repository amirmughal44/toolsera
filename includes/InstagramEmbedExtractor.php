<?php
/**
 * TOOLSERA - Instagram Embed Extractor
 * 
 * Instagram's /embed/captioned/ endpoint provides high resilience
 * because it is designed to be embedded in external websites without requiring login.
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

class InstagramEmbedExtractor implements ExtractorInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getName(): string
    {
        return 'Instagram Embed Driver';
    }

    public function extract(string $url, string $shortcode): ?array
    {
        $embedUrl = "https://www.instagram.com/p/{$shortcode}/embed/captioned/";

        $ch = curl_init();
        $headers = [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Cache-Control: no-cache',
            'Pragma: no-cache',
            'Sec-Fetch-Dest: iframe',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: cross-site',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        ];

        curl_setopt_array($ch, [
            CURLOPT_URL => $embedUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);

        if (!empty($this->config['proxy']['enabled']) && !empty($this->config['proxy']['server'])) {
            curl_setopt($ch, CURLOPT_PROXY, $this->config['proxy']['server']);
            if (!empty($this->config['proxy']['auth'])) {
                curl_setopt($ch, CURLOPT_PROXYUSERPWD, $this->config['proxy']['auth']);
            }
        }

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || empty($html)) {
            return null;
        }

        // Look for embedded JSON or video elements
        $videoUrl = null;
        $thumbnail = null;
        $author = 'Instagram Creator';
        $caption = 'Toolsera High Quality Instagram Video';

        // 1. Direct video URL in HTML
        if (preg_match('/class="EmbeddedMediaVideo"[^>]*src="([^"]+)"/i', $html, $matches)) {
            $videoUrl = html_entity_decode($matches[1]);
        } elseif (preg_match('/"video_url"\s*:\s*"([^"]+)"/i', $html, $matches)) {
            $videoUrl = stripcslashes($matches[1]);
        }

        // 2. Poster / Thumbnail extraction
        if (preg_match('/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i', $html, $matches)) {
            $thumbnail = html_entity_decode($matches[1]);
        } elseif (preg_match('/"display_url"\s*:\s*"([^"]+)"/i', $html, $matches)) {
            $thumbnail = stripcslashes($matches[1]);
        }

        // 3. Author extraction
        if (preg_match('/class="UsernameText"[^>]*>([^<]+)<\/span>/i', $html, $matches)) {
            $author = trim($matches[1]);
        }

        // 4. Caption / Description extraction
        if (preg_match('/class="Caption"[^>]*>(.*?)<\/div>/is', $html, $matches)) {
            $caption = trim(strip_tags($matches[1]));
            if (strlen($caption) > 120) {
                $caption = substr($caption, 0, 117) . '...';
            }
        }

        if (empty($videoUrl)) {
            return null;
        }

        return [
            'id'        => $shortcode,
            'title'     => !empty($caption) ? $caption : "Instagram Video ({$shortcode})",
            'caption'   => $caption,
            'author'    => '@' . ltrim($author, '@'),
            'thumbnail' => $thumbnail,
            'video_url' => $videoUrl,
            'quality'   => '1080p Full HD',
            'formats'   => [
                [
                    'label'   => '1080p Full HD (MP4)',
                    'quality' => '1080p',
                    'type'    => 'video',
                    'url'     => $videoUrl,
                    'badge'   => 'HD'
                ],
                [
                    'label'   => 'Audio Only (MP3/AAC)',
                    'quality' => 'High Quality',
                    'type'    => 'audio',
                    'url'     => $videoUrl,
                    'badge'   => 'Audio'
                ]
            ],
            'source'    => $this->getName(),
        ];
    }
}
