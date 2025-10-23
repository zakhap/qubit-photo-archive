import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PERSONAL_TOKEN = process.env.PERSONAL_TOKEN;
const CHANNEL_SLUG = process.env.ARENA_CHANNEL_SLUG || 'qubit-image-archive';

async function getBlocks(): Promise<any[]> {
  let allBlocks: any[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(`https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=100&page=${page}`, {
      headers: { 'Authorization': `Bearer ${PERSONAL_TOKEN}` }
    });
    const data = await response.json();
    const imageBlocks = data.contents.filter((block: any) => block.class === 'Image');

    if (imageBlocks.length === 0) break;

    allBlocks = [...allBlocks, ...imageBlocks];
    if (data.contents.length < 100) break;
    page++;
  }

  return allBlocks;
}

async function updateBlockDescription(blockId: number, description: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.are.na/v2/blocks/${blockId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${PERSONAL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });
    return response.ok;
  } catch (error) {
    console.error('Update failed:', error);
    return false;
  }
}

async function main() {
  if (!PERSONAL_TOKEN) {
    console.error('Error: PERSONAL_TOKEN not found');
    process.exit(1);
  }

  console.log('Fetching blocks...\n');
  const blocks = await getBlocks();

  console.log(`Found ${blocks.length} blocks\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const title = block.title || 'Untitled';

    console.log(`[${i + 1}/${blocks.length}] Updating block ${block.id}: ${title}`);

    const success = await updateBlockDescription(block.id, title);

    if (success) {
      console.log('✓ Updated description');
      updated++;
    } else {
      console.log('✗ Failed');
      failed++;
    }

    // Rate limit: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✓ Done! Updated: ${updated}, Failed: ${failed}`);
}

main().catch(console.error);
