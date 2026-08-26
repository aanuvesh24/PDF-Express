# PDFExpress 🚀

> **100% Client-Side, Zero-Backend PDF Utility PWA ("iLovePDF" Minimal Clone)**

PDFExpress is a modern, privacy-first Progressive Web App designed to perform fast PDF transformations strictly inside your browser using WebAssembly and Web Workers. No files are ever sent to any remote server.

---

## ✨ Features

- 🗂️ **Merge PDF (`/merge`)**: Combine multiple PDF documents into a single file with custom drag-and-drop ordering and page count inspection.
- 🔄 **Organize & Rotate (`/organize`)**: Visually sort pages with `@dnd-kit`, rotate individual or all pages ($90^\circ, 180^\circ, 270^\circ$), delete unwanted pages, duplicate pages, or extract selections into new documents.
- 🖼️ **PDF to Image (`/pdf-to-img`)**: High-DPI canvas rendering (1x, 2x, 3x scale) to PNG, JPG, or WebP with automatic ZIP archive bundling (`JSZip`).
- 📄 **Image to PDF (`/img-to-pdf`)**: Convert JPG, PNG, and WebP images into tailored PDF documents with customizable page sizes (A4, Letter, Fit to Image), orientations, and margins.
- 🔒 **100% Client-Side Privacy**: All processing runs locally via `pdf-lib` and `pdfjs-dist`. Zero server uploads.
- 📱 **Progressive Web App (PWA)**: Works offline and can be installed directly onto desktop or mobile devices.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Static Export `output: 'export'`)
- **Styling**: Tailwind CSS, `clsx`, `tailwind-merge`
- **PDF Processing**: `pdf-lib`, `pdfjs-dist` (with dedicated offline Web Worker)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **File Utilities**: `jszip`, `file-saver`, `canvas-confetti`, `lucide-react`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build Static Export (Production)
```bash
npm run build
```
The static export files will be generated in the `/out` directory, ready to deploy to GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

---

## 📄 License
MIT License
