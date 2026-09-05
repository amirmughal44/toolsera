import { ToolCategory, CategoryMetadata, ToolDefinition } from './types';

export const CATEGORIES: CategoryMetadata[] = [
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, organize, and compile PDF documents securely in your browser with zero uploads.',
    iconName: 'FileText',
  },
  {
    id: 'spreadsheet',
    name: 'Spreadsheet & Data',
    description: 'Interactive Excel grid with real formula calculation, templates, and XLSX/CSV export.',
    iconName: 'Table',
  },
  {
    id: 'image',
    name: 'Image Studio',
    description: 'High-speed browser canvas image compression with real-time quality comparison.',
    iconName: 'Image',
  },
  {
    id: 'qr',
    name: 'QR & Barcodes',
    description: 'Generate customizable high-resolution QR codes for links, WiFi, and business cards.',
    iconName: 'QrCode',
  },
  {
    id: 'developer',
    name: 'Developer Utilities',
    description: 'Inspect, validate, format, and minify JSON data structures with zero latency.',
    iconName: 'Code',
  },
];

export const TOOLS_REGISTRY: ToolDefinition[] = [
  // 1. PDF Merger
  {
    id: 'pdf-merger',
    name: 'PDF Merger & Organizer',
    slug: 'pdf-merger',
    category: 'pdf',
    description: 'Combine multiple PDF files into one clean document with custom page order. 100% private in-browser execution.',
    iconName: 'Layers',
    inputType: 'file',
    outputType: 'file',
    accessLevel: 'free',
    processingMethod: 'client-browser',
    acceptedFileTypes: ['.pdf', 'application/pdf'],
    maxFileSizeFreeMB: 25,
    maxFileSizePremiumMB: 150,
    tags: ['pdf', 'merge', 'combine', 'join', 'documents'],
    popular: true,
    featured: true,
    seoTitle: 'Free PDF Merger — Merge Multiple PDFs Securely Online | Toolora',
    seoDescription: 'Merge PDF documents in your browser without uploading to external servers. Fast, secure, zero-knowledge PDF merger by Toolora.',
    features: [
      'Zero-knowledge processing (files stay on your device)',
      'Rearrange and preview files before merging',
      'High-speed compilation via client WebAssembly & pdf-lib',
      'Preserves original vector quality, fonts, and hyperlinks'
    ],
    howItWorks: [
      { step: 1, title: 'Upload Files', desc: 'Select or drag & drop two or more PDF documents.' },
      { step: 2, title: 'Reorder Files', desc: 'Drag to adjust the exact order of the merged pages.' },
      { step: 3, title: 'Merge & Download', desc: 'Click Merge to generate your unified PDF instantly.' }
    ],
    faqs: [
      { q: 'Is it safe to merge confidential PDFs here?', a: 'Yes! All merging is performed locally in your web browser using WebAssembly. Your files are never uploaded to any remote server.' },
      { q: 'Is there a limit on how many PDFs I can combine?', a: 'Free users can combine up to 5 files per batch; Toolora All-Access unlocks unlimited batch merging.' }
    ]
  },

  // 2. Spreadsheet Engine
  {
    id: 'excel-generator',
    name: 'Smart Spreadsheet Engine',
    slug: 'excel-generator',
    category: 'spreadsheet',
    description: 'Build spreadsheets in your browser with live formula calculation (=SUM, =AVERAGE), business templates, and instant XLSX export.',
    iconName: 'Sheet',
    inputType: 'table',
    outputType: 'file',
    accessLevel: 'free',
    processingMethod: 'client-browser',
    tags: ['excel', 'spreadsheet', 'csv', 'xlsx', 'table', 'formulas'],
    popular: true,
    featured: true,
    seoTitle: 'Online Spreadsheet Generator & Editor — Export XLSX & CSV | Toolora',
    seoDescription: 'Create, edit, and export spreadsheets directly in your browser. Real formulas, business templates, and instant XLSX downloads with Toolora.',
    features: [
      'Live mathematical formula calculation (=SUM, =AVERAGE, arithmetic)',
      'Pre-loaded business templates (Invoices, Expense Trackers, Attendance)',
      'Import existing XLSX/CSV files or start from scratch',
      'One-click client-side Microsoft Excel (.xlsx) export via SheetJS'
    ],
    howItWorks: [
      { step: 1, title: 'Choose a Template or Blank', desc: 'Start with an invoice, budget tracker, or blank grid.' },
      { step: 2, title: 'Enter Data & Formulas', desc: 'Type numbers, edit cell values, or input formulas like =SUM(A1:A5).' },
      { step: 3, title: 'Export .XLSX File', desc: 'Download standard Excel or CSV files directly to your machine.' }
    ],
    faqs: [
      { q: 'Can I open the exported file in Microsoft Excel or Google Sheets?', a: 'Yes! The generated file uses standard OpenXML format (.xlsx) fully compatible with Microsoft Excel, Apple Numbers, and Google Sheets.' },
      { q: 'Are my financial figures stored on Toolora servers?', a: 'Never. All calculations and exports happen locally inside your browser memory.' }
    ]
  },

  // 3. Image Compressor
  {
    id: 'image-compressor',
    name: 'Image Compressor & Optimizer',
    slug: 'image-compressor',
    category: 'image',
    description: 'Compress JPG, PNG, and WebP images up to 85% without noticeable visual loss using client-side HTML5 canvas algorithms.',
    iconName: 'Minimize2',
    inputType: 'file',
    outputType: 'file',
    accessLevel: 'free',
    processingMethod: 'client-browser',
    acceptedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeFreeMB: 20,
    maxFileSizePremiumMB: 100,
    tags: ['image', 'compress', 'optimize', 'shrink', 'photo'],
    popular: true,
    featured: true,
    seoTitle: 'Free Client-Side Image Compressor — Optimize Photos Without Uploading | Toolora',
    seoDescription: 'Shrink photo and image sizes up to 85% directly inside your browser. No server storage, lightning-fast compression by Toolora.',
    features: [
      'Zero-upload image compression via HTML5 Canvas API',
      'Side-by-side original vs compressed visual comparison',
      'Adjustable quality slider with real-time byte calculation',
      'Supports JPG, PNG, and WebP formats'
    ],
    howItWorks: [
      { step: 1, title: 'Select Image', desc: 'Drop any photo from your device.' },
      { step: 2, title: 'Adjust Quality', desc: 'Use the slider to balance file size against visual clarity.' },
      { step: 3, title: 'Save Compressed Photo', desc: 'Download your optimized image instantly.' }
    ],
    faqs: [
      { q: 'Does image compression reduce photo resolution?', a: 'Resolution is retained while redundant metadata and high-frequency color artifacts are efficiently optimized.' },
      { q: 'Can I compress confidential photos?', a: 'Yes, because the image never leaves your computer.' }
    ]
  },

  // 4. Custom QR Code Studio
  {
    id: 'qr-code-generator',
    name: 'Custom QR Code Studio',
    slug: 'qr-code-generator',
    category: 'qr',
    description: 'Create custom QR codes for website URLs, WiFi credentials, contact vCards, and SMS with live preview and SVG/PNG download.',
    iconName: 'QrCode',
    inputType: 'form',
    outputType: 'preview',
    accessLevel: 'free',
    processingMethod: 'client-browser',
    tags: ['qr', 'generator', 'wifi', 'vcard', 'url', 'barcode'],
    popular: true,
    featured: true,
    seoTitle: 'Free Custom QR Code Generator — High-Resolution SVG & PNG | Toolora',
    seoDescription: 'Generate custom QR codes for websites, WiFi networks, and contact cards. Custom colors, instant vector SVG & PNG downloads with Toolora.',
    features: [
      'Multi-mode QR encoding: Website URLs, WiFi login, vCards, SMS, and Plain Text',
      'Custom foreground and background color palette pickers',
      'High-resolution pixel-perfect Canvas and SVG vector exports',
      'Zero tracking and forever-valid static QR codes'
    ],
    howItWorks: [
      { step: 1, title: 'Select Type', desc: 'Pick URL, WiFi, Contact vCard, or Plain Text.' },
      { step: 2, title: 'Customize Colors', desc: 'Personalize brand colors and scan contrast.' },
      { step: 3, title: 'Download QR Code', desc: 'Export as high-resolution PNG or vector SVG.' }
    ],
    faqs: [
      { q: 'Do these QR codes expire?', a: 'Never. These are direct static QR codes that contain your exact data without intermediate redirects.' },
      { q: 'Can I print these on physical banners?', a: 'Yes, export as SVG vector for crisp printing at any billboard or brochure scale.' }
    ]
  },

  // 5. Developer JSON Formatter
  {
    id: 'json-formatter',
    name: 'Developer JSON Formatter & Validator',
    slug: 'json-formatter',
    category: 'developer',
    description: 'Inspect, validate, prettify, and minify JSON code with real-time error diagnostics, indentation control, and one-click copy.',
    iconName: 'FileJson',
    inputType: 'text',
    outputType: 'text',
    accessLevel: 'free',
    processingMethod: 'client-browser',
    tags: ['json', 'formatter', 'beautify', 'minify', 'validator', 'developer'],
    popular: true,
    featured: true,
    seoTitle: 'Online JSON Formatter, Minifier & Validator | Toolora',
    seoDescription: 'Beautify, validate, and minify JSON data in your browser. Real-time syntax errors and one-click copy utility by Toolora.',
    features: [
      'Real-time syntax validator with exact line & token error indicators',
      'Configurable indentation: 2 spaces, 4 spaces, or compact minification',
      'One-click clipboard copy and formatted .json file download',
      'Completely client-side: safe for secret API payloads and configs'
    ],
    howItWorks: [
      { step: 1, title: 'Paste JSON', desc: 'Paste raw, minified, or malformed JSON into the editor.' },
      { step: 2, title: 'Format or Minify', desc: 'Click Prettify or Minify to format the payload.' },
      { step: 3, title: 'Copy or Save', desc: 'Copy directly to clipboard or download as a .json file.' }
    ],
    faqs: [
      { q: 'Is it safe to paste API secrets or authorization tokens?', a: 'Yes. Parsing executes locally inside your browser V8 engine without sending payloads across the network.' },
      { q: 'What happens if my JSON has a syntax error?', a: 'The tool pinpoints the exact parsing error so you can fix missing quotes or commas instantly.' }
    ]
  }
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS_REGISTRY.filter((tool) => tool.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter((tool) => tool.popular);
}

export function searchTools(query: string): ToolDefinition[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return TOOLS_REGISTRY.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
