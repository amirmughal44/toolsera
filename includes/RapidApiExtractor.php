<?php
/**
 * TOOLSERA - RapidAPI Fallback Extractor
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

class RapidApiExtractor implements ExtractorInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getName(): string
    {
        return 'RapidAPI High-Availability Driver';
    }

    public function extract(string $url, string $shortcode): ?array
    {
        if (empty($this->config['rapidapi']['enabled']) || empty($this->config['rapidapi']['key'])) {
            return null;
        }

        $apiKey = $this->config['rapidapi']['key'];
        $apiHost = $this->config['rapidapi']['host'] ?? 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com';

        $endpoint = "https://{$apiHost}/get-info?url=" . urlencode($url);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => [
                "x-rapidapi-host: {$apiHost}",
                "x-rapidapi-key: {$apiKey}"
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);

        $res = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || empty($res)) {
            return null;
        }

        $data = json_decode($res, true);
        if (!$data) {
            return null;
        }

        $videoUrl = $data['download_url'] ?? $data['media'] ?? $data['url'] ?? $data['video_url'] ?? null;
        $thumbnail = $data['thumbnail'] ?? $data['thumb'] ?? null;
        $title = $data['title'] ?? "Instagram Video ({$shortcode})";

        if (empty($videoUrl)) {
            return null;
        }

        return [
            'id'        => $shortcode,
            'title'     => $title,
            'caption'   => $title,
            'author'    => $data['author'] ?? '@instagram_user',
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
                    'label'   => 'Audio Only (MP3)',
                    'quality' => 'Audio',
                    'type'    => 'audio',
                    'url'     => $videoUrl,
                    'badge'   => 'Audio'
                ]
            ],
            'source'    => $this->getName(),
        ];
    }
}
