<?php
/**
 * TOOLSERA - Instagram Direct & JSON-LD Extractor
 * 
 * Inspects page metadata, OpenGraph tags, and Schema.org JSON-LD definitions.
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

class InstagramDirectExtractor implements ExtractorInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getName(): string
    {
        return 'Instagram Direct Web Driver';
    }

    public function extract(string $url, string $shortcode): ?array
    {
        $targetUrl = "https://www.instagram.com/reel/{$shortcode}/";

        $ch = curl_init();
        $headers = [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Sec-Ch-Ua: "Chromium";v="126", "Not=A?Brand";v="24", "Google Chrome";v="126"',
            'Sec-Ch-Ua-Mobile: ?0',
            'Sec-Ch-Ua-Platform: "Windows"',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Sec-Fetch-User: ?1',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        ];

        curl_setopt_array($ch, [
            CURLOPT_URL => $targetUrl,
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

        $videoUrl = null;
        $thumbnail = null;
        $author = 'Instagram Creator';
        $caption = 'Toolsera Instagram Video';

        // 1. JSON-LD Schema parser
        if (preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/is', $html, $matches)) {
            foreach ($matches[1] as $jsonStr) {
                $decoded = json_decode($jsonStr, true);
                if (is_array($decoded)) {
                    if (isset($decoded['video']) && is_array($decoded['video'])) {
                        $videoUrl = $decoded['video']['contentUrl'] ?? null;
                        $thumbnail = $decoded['video']['thumbnailUrl'] ?? null;
                        $caption = $decoded['video']['caption'] ?? $decoded['video']['description'] ?? $caption;
                    }
                    if (isset($decoded['author']['name'])) {
                        $author = $decoded['author']['name'];
                    }
                }
            }
        }

        // 2. OpenGraph Fallback
        if (empty($videoUrl)) {
            if (preg_match('/<meta\s+property="og:video(:secure_url)?"\s+content="([^"]+)"/i', $html, $m)) {
                $videoUrl = html_entity_decode($m[2]);
            }
        }

        if (empty($thumbnail)) {
            if (preg_match('/<meta\s+property="og:image"\s+content="([^"]+)"/i', $html, $m)) {
                $thumbnail = html_entity_decode($m[1]);
            }
        }

        if (preg_match('/<meta\s+property="og:title"\s+content="([^"]+)"/i', $html, $m)) {
            $ogTitle = html_entity_decode($m[1]);
            if (!empty($ogTitle)) {
                $author = explode('•', $ogTitle)[0];
            }
        }

        if (empty($videoUrl)) {
            return null;
        }

        return [
            'id'        => $shortcode,
            'title'     => !empty($caption) ? $caption : "Instagram Video ({$shortcode})",
            'caption'   => $caption,
            'author'    => '@' . trim(str_replace('@', '', $author)),
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
