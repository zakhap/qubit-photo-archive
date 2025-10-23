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
          title: block.generated_title || block.title || 'Untitled',
          thumbnailUrl: block.image!.display.url,
          fullUrl: block.image!.original.url,
        }));

      allImages = [...allImages, ...images];

      // Check if there are more pages
      hasMorePages = channel.contents.length === perPage;
      page++;
    }

    // Sort images: group by base title, then by trailing number
    allImages.sort((a, b) => {
      // Extract base title (everything except trailing numbers)
      const getBaseName = (title: string) => title.replace(/\s+\d+\s*$/, '').trim();
      const getTrailingNumber = (title: string) => {
        const match = title.match(/\s+(\d+)\s*$/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const baseA = getBaseName(a.title);
      const baseB = getBaseName(b.title);
      const numA = getTrailingNumber(a.title);
      const numB = getTrailingNumber(b.title);

      // First, sort by base title alphabetically
      if (baseA < baseB) return -1;
      if (baseA > baseB) return 1;

      // Within the same base title, sort by trailing number
      return numA - numB;
    });

    return allImages;
  } catch (error) {
    console.error('Error fetching from Are.na:', error);
    return [];
  }
}
