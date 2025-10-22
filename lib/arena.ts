import Arena from 'are.na';

export interface ArenaImage {
  id: number;
  title: string;
  thumbnailUrl: string;
  fullUrl: string;
}

export async function getArenaImages(): Promise<ArenaImage[]> {
  const arena = new Arena();
  const channelSlug = process.env.ARENA_CHANNEL_SLUG || 'qubit-image-archive';

  try {
    let allImages: ArenaImage[] = [];
    let page = 1;
    let hasMorePages = true;
    const perPage = 100; // Max per page

    while (hasMorePages) {
      const channel = await arena.channel(channelSlug).get({ page, per: perPage });

      // Filter for image blocks only
      const images = channel.contents
        .filter(block => block.class === 'Image' && block.image)
        .map(block => ({
          id: block.id,
          title: (() => {
            let title = block.title || 'Untitled';
            // Remove file extensions
            title = title.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
            // Replace -22 with -" and 22- with "-
            title = title.replace(/-22-/g, '-"-');
            title = title.replace(/-22([a-z])/gi, '-"$1');
            title = title.replace(/([a-z])22-/gi, '$1"-');
            // Replace remaining hyphens with spaces
            title = title.replace(/-/g, ' ');
            // Clean up multiple spaces
            title = title.replace(/\s+/g, ' ');
            // Remove ALL spaces around quotes first
            title = title.replace(/\s*"\s*/g, '"');
            // Now add spaces around the entire quoted phrase: "word" becomes " "word" "
            title = title.replace(/("[^"]*")/g, ' $1 ');
            // Clean up multiple spaces again
            title = title.replace(/\s+/g, ' ');
            // Wrap 4-digit years in parentheses
            title = title.replace(/\b(\d{4})\b/g, '($1)');
            // Clean up and trim
            return title.trim();
          })(),
          thumbnailUrl: block.image!.display.url,
          fullUrl: block.image!.original.url,
        }));

      allImages = [...allImages, ...images];

      // Check if there are more pages
      hasMorePages = channel.contents.length === perPage;
      page++;
    }

    return allImages;
  } catch (error) {
    console.error('Error fetching from Are.na:', error);
    return [];
  }
}
