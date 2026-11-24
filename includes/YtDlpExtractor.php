<?php
/**
 * TOOLSERA - yt-dlp CLI Fallback Extractor
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

class YtDlpExtractor implements ExtractorInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getName(): string
    {
        return 'yt-dlp Core Driver';
    }

    public function extract(string $url, string $shortcode): ?array
    {
        if (empty($this->config['pipeline']['enable_ytdlp'])) {
            return null;
        }

        $escapedUrl = escapeshellarg($url);
        $command = "yt-dlp --dump-json --no-warnings --no-playlist {$escapedUrl} 2>&1";

        @exec($command, $output, $returnCode);

        if ($returnCode !== 0 || empty($output)) {
            return null;
        }

        $jsonStr = implode("\n", $output);
        $data = json_decode($jsonStr, true);

        if (!$data || empty($data['url'])) {
            return null;
        }

        return [
            'id'        => $shortcode,
            'title'     => $data['title'] ?? "Instagram Video ({$shortcode})",
            'caption'   => $data['description'] ?? $data['title'] ?? '',
            'author'    => '@' . ($data['uploader'] ?? 'instagram_user'),
            'thumbnail' => $data['thumbnail'] ?? null,
            'video_url' => $data['url'],
            'quality'   => '1080p Full HD',
            'duration'  => isset($data['duration']) ? gmdate("i:s", (int)$data['duration']) : null,
            'formats'   => [
                [
                    'label'   => '1080p Full HD (MP4)',
                    'quality' => '1080p',
                    'type'    => 'video',
                    'url'     => $data['url'],
                    'badge'   => 'HD'
                ],
                [
                    'label'   => 'Audio Only (MP3)',
                    'quality' => 'Audio',
                    'type'    => 'audio',
                    'url'     => $data['url'],
                    'badge'   => 'Audio'
                ]
            ],
            'source'    => $this->getName(),
        ];
    }
}
