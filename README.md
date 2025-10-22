# QUBIT PERFORMANCE ARCHIVE

A Next.js-based static portfolio site that fetches images from Are.na and displays them in a responsive grid with lightbox functionality.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   └── ImageGrid.tsx     # Grid with lightbox functionality
├── lib/
│   └── arena.ts          # Are.na API integration
├── types/
│   └── arena.d.ts        # TypeScript definitions for are.na package
└── next.config.ts        # Configured for static export
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory with your Are.na channel details:
   ```bash
   ARENA_CHANNEL_SLUG=your-channel-slug
   ```

   **Note**: The Are.na channel must be set to **public** for the site to fetch images without authentication.

3. **Development**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build static site**:
   ```bash
   npm run build
   ```
   Output will be in the `out/` directory

## Features

- Static site generation (no server needed)
- Optimized for images with Next.js Image component
- Responsive grid layout
- TypeScript for type safety
- Tailwind CSS for styling
- Ready to deploy to GitHub Pages, Netlify, Vercel, etc.

## Next Steps

- Customize `app/page.tsx` with your content
- Add images to `public/images/`
- Update styling in components and pages
- Add metadata in `app/layout.tsx`
