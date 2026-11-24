<?php
/**
 * TOOLSERA - Indown Engine Extractor
 * 
 * Extracts high-definition direct CDN video URLs for public Instagram posts and reels.
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

class IndownExtractor implements ExtractorInterface
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function getName(): string
    {
        return 'Toolsera High-Speed Engine';
    }

    public function extract(string $url, string $shortcode): ?array
    {
        $cleanUrl = "https://www.instagram.com/reel/{$shortcode}/";

        // 1. Fetch Metadata from Instagram oEmbed API v1
        $title = "Instagram Video ({$shortcode})";
        $author = "@instagram_creator";
        $thumbnail = null;

        $chOembed = curl_init("https://www.instagram.com/api/v1/oembed/?url=" . urlencode($cleanUrl));
        curl_setopt_array($chOembed, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_HTTPHEADER => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-IG-App-ID: 936619743392459'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);
        $oembedRes = curl_exec($chOembed);
        curl_close($chOembed);

        if ($oembedRes) {
            $oembedData = json_decode($oembedRes, true);
            if (is_array($oembedData)) {
                if (!empty($oembedData['title'])) {
                    $title = $oembedData['title'];
                }
                if (!empty($oembedData['author_name'])) {
                    $author = '@' . ltrim($oembedData['author_name'], '@');
                }
                if (!empty($oembedData['thumbnail_url'])) {
                    $thumbnail = $oembedData['thumbnail_url'];
                }
            }
        }

        // 2. Fetch Token from indown.io
        $cookieJar = tempnam(sys_get_temp_dir(), 'indown_cookie_');
        $chHome = curl_init("https://indown.io/");
        curl_setopt_array($chHome, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_COOKIEJAR => $cookieJar,
            CURLOPT_HTTPHEADER => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);
        $homeHtml = curl_exec($chHome);
        curl_close($chHome);

        if (!$homeHtml || !preg_match('/name="_token"\s*value="([^"]+)"/', $homeHtml, $mToken)) {
            @unlink($cookieJar);
            return null;
        }

        $token = $mToken[1];

        // 3. Post to indown.io/download
        $chPost = curl_init("https://indown.io/download");
        curl_setopt_array($chPost, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query([
                '_token' => $token,
                'link'   => $cleanUrl
            ]),
            CURLOPT_COOKIEFILE => $cookieJar,
            CURLOPT_TIMEOUT => 14,
            CURLOPT_HTTPHEADER => [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Referer: https://indown.io/',
                'Origin: https://indown.io'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
        ]);
        $postHtml = curl_exec($chPost);
        curl_close($chPost);
        @unlink($cookieJar);

        if (!$postHtml) {
            return null;
        }

        // Extract direct video URL
        $videoUrl = null;
        if (preg_match_all('/href="(https:\/\/[^"]*(?:cdninstagram\.com|fbcdn\.net)[^"]*)"/i', $postHtml, $matches)) {
            foreach ($matches[1] as $candidate) {
                $candidate = html_entity_decode($candidate);
                if (str_contains($candidate, '.mp4')) {
                    $videoUrl = $candidate;
                    break;
                }
            }
        }

        if (!$videoUrl && preg_match('/href="(https:\/\/[^"]*indown\.io\/fetch\?url=[^"]*)"/i', $postHtml, $matches)) {
            $videoUrl = html_entity_decode($matches[1]);
        }

        if (empty($videoUrl)) {
            return null;
        }

        $finalThumbnail = $thumbnail ?? 'assets/images/favicon.svg';
        $proxyThumbnail = (!empty($thumbnail) && str_starts_with($thumbnail, 'http'))
            ? 'api/image_proxy.php?url=' . urlencode($thumbnail)
            : $finalThumbnail;

        return [
            'id'              => $shortcode,
            'title'           => $title,
            'caption'         => $title,
            'author'          => $author,
            'thumbnail'       => $proxyThumbnail,
            'thumbnail_raw'   => $thumbnail,
            'thumbnail_proxy' => $proxyThumbnail,
            'video_url'       => $videoUrl,
            'quality'         => '1080p Full HD',
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
