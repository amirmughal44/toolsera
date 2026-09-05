import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, TOOLS_REGISTRY } from '@/lib/tools/registry';
import { ToolLayout } from '@/components/tools/ToolLayout';

// Tool Implementations
import { PdfMergerTool } from '@/components/tools/implementations/PdfMergerTool';
import { PdfSplitterTool } from '@/components/tools/implementations/PdfSplitterTool';
import { PdfRotateTool } from '@/components/tools/implementations/PdfRotateTool';
import { PdfWatermarkTool } from '@/components/tools/implementations/PdfWatermarkTool';
import { WordToPdfTool } from '@/components/tools/implementations/WordToPdfTool';
import { SpreadsheetTool } from '@/components/tools/implementations/SpreadsheetTool';
import { ImageCompressorTool } from '@/components/tools/implementations/ImageCompressorTool';
import { ImageConverterTool } from '@/components/tools/implementations/ImageConverterTool';
import { ImageResizeCropTool } from '@/components/tools/implementations/ImageResizeCropTool';
import { FaviconGeneratorTool } from '@/components/tools/implementations/FaviconGeneratorTool';
import { ColorPickerTool } from '@/components/tools/implementations/ColorPickerTool';
import { SitemapGeneratorTool } from '@/components/tools/implementations/SitemapGeneratorTool';
import { RobotsGeneratorTool } from '@/components/tools/implementations/RobotsGeneratorTool';
import { MetaTagGeneratorTool } from '@/components/tools/implementations/MetaTagGeneratorTool';
import { SchemaGeneratorTool } from '@/components/tools/implementations/SchemaGeneratorTool';
import { SeoAnalyzerTool } from '@/components/tools/implementations/SeoAnalyzerTool';
import { JsonFormatterTool } from '@/components/tools/implementations/JsonFormatterTool';
import { JwtDecoderTool } from '@/components/tools/implementations/JwtDecoderTool';
import { HashGeneratorTool } from '@/components/tools/implementations/HashGeneratorTool';
import { RegexTesterTool } from '@/components/tools/implementations/RegexTesterTool';
import { UnixTimestampTool } from '@/components/tools/implementations/UnixTimestampTool';
import { CronGeneratorTool } from '@/components/tools/implementations/CronGeneratorTool';
import { TextDiffTool } from '@/components/tools/implementations/TextDiffTool';
import { TextStatsTool } from '@/components/tools/implementations/TextStatsTool';
import { CaseConverterTool } from '@/components/tools/implementations/CaseConverterTool';
import { QrGeneratorTool } from '@/components/tools/implementations/QrGeneratorTool';
import { CalculatorsTool } from '@/components/tools/implementations/CalculatorsTool';
import { AiProductivityTool } from '@/components/tools/implementations/AiProductivityTool';

interface PageProps {
  params: Promise<{ toolSlug: string }>;
}

export async function generateStaticParams() {
  return TOOLS_REGISTRY.map((tool) => ({
    toolSlug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);
  if (!tool) {
    return {
      title: 'Tool Not Found — Toolora',
    };
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `https://toolora.com/${tool.slug}`,
      siteName: 'Toolora',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool) {
    notFound();
  }

  const renderToolComponent = () => {
    switch (tool.slug) {
      case 'pdf-merger':
        return <PdfMergerTool tool={tool} />;
      case 'pdf-splitter':
        return <PdfSplitterTool tool={tool} />;
      case 'rotate-pdf':
        return <PdfRotateTool tool={tool} />;
      case 'pdf-watermark':
        return <PdfWatermarkTool tool={tool} />;
      case 'word-to-pdf':
        return <WordToPdfTool tool={tool} />;
      case 'excel-generator':
        return <SpreadsheetTool tool={tool} />;
      case 'csv-to-json':
        return <JsonFormatterTool tool={tool} />;
      case 'image-compressor':
        return <ImageCompressorTool tool={tool} />;
      case 'image-converter':
        return <ImageConverterTool tool={tool} />;
      case 'image-resizer':
        return <ImageResizeCropTool tool={tool} />;
      case 'favicon-generator':
        return <FaviconGeneratorTool tool={tool} />;
      case 'color-picker':
        return <ColorPickerTool tool={tool} />;
      case 'sitemap-generator':
        return <SitemapGeneratorTool tool={tool} />;
      case 'robots-txt-generator':
        return <RobotsGeneratorTool tool={tool} />;
      case 'meta-tag-generator':
        return <MetaTagGeneratorTool tool={tool} />;
      case 'schema-generator':
        return <SchemaGeneratorTool tool={tool} />;
      case 'seo-analyzer':
        return <SeoAnalyzerTool tool={tool} />;
      case 'json-formatter':
        return <JsonFormatterTool tool={tool} />;
      case 'jwt-decoder':
        return <JwtDecoderTool tool={tool} />;
      case 'hash-generator':
        return <HashGeneratorTool tool={tool} />;
      case 'regex-tester':
        return <RegexTesterTool tool={tool} />;
      case 'unix-timestamp':
        return <UnixTimestampTool tool={tool} />;
      case 'cron-generator':
        return <CronGeneratorTool tool={tool} />;
      case 'text-diff':
        return <TextDiffTool tool={tool} />;
      case 'text-analyzer':
        return <TextStatsTool tool={tool} />;
      case 'case-converter':
        return <CaseConverterTool tool={tool} />;
      case 'qr-code-generator':
        return <QrGeneratorTool tool={tool} />;
      case 'loan-emi-calculator':
      case 'percentage-calculator':
        return <CalculatorsTool tool={tool} />;
      case 'ai-productivity':
        return <AiProductivityTool tool={tool} />;
      default:
        return <JsonFormatterTool tool={tool} />;
    }
  };

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `https://toolora.com/${tool.slug}`,
    description: tool.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: tool.accessLevel === 'premium' ? '100' : '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />
      <ToolLayout tool={tool}>{renderToolComponent()}</ToolLayout>
    </>
  );
}
