<?php
/**
 * TOOLSERA - Media Extraction Contract
 */

declare(strict_types=1);

namespace Toolsera\Extractor;

interface ExtractorInterface
{
    /**
     * Attempts to extract media details from a given Instagram URL.
     *
     * @param string $url The sanitized Instagram URL
     * @param string $shortcode The extracted Instagram media shortcode
     * @return array|null Returns structured media data or null on failure
     */
    public function extract(string $url, string $shortcode): ?array;

    /**
     * Unique identifier for the extractor driver
     */
    public function getName(): string;
}
