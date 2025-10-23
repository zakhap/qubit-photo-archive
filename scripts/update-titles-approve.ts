import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PERSONAL_TOKEN = process.env.PERSONAL_TOKEN;
const CHANNEL_SLUG = process.env.ARENA_CHANNEL_SLUG || 'qubit-image-archive';

function cleanTitle(title: string): string {
  // Remove file extensions
  title = title.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');

  // Handle special cases for quotes
  // Replace 22 at start of word with opening quote
  title = title.replace(/\b22([a-z])/gi, '"$1');
  // Replace 22 at end of word with closing quote
  title = title.replace(/([a-z])22\b/gi, '$1"');
  // Replace 22 between hyphens with quote
  title = title.replace(/-22-/g, '-"-');

  // Replace remaining hyphens with spaces
  title = title.replace(/-/g, ' ');

  // Clean up multiple spaces
  title = title.replace(/\s+/g, ' ');

  // Remove ALL spaces around quotes first
  title = title.replace(/\s*"\s*/g, '"');

  // Now add spaces around the entire quoted phrase
  title = title.replace(/("[^"]*")/g, ' $1 ');

  // Clean up multiple spaces again
  title = title.replace(/\s+/g, ' ');

  // Wrap 4-digit years in parentheses
  title = title.replace(/\b(\d{4})\b/g, '($1)');

  // Clean up and trim
  return title.trim();
}

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

async function updateBlockTitle(blockId: number, newTitle: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.are.na/v2/blocks/${blockId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${PERSONAL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTitle }),
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

  // Filter to only blocks that need changes
  const blocksToUpdate = blocks
    .map(block => ({
      block,
      oldTitle: block.title || 'Untitled',
      newTitle: cleanTitle(block.title || 'Untitled')
    }))
    .filter(item => item.oldTitle !== item.newTitle);

  console.log(`Found ${blocksToUpdate.length} blocks that need updating out of ${blocks.length} total\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let currentIndex = 0;
  let updated = 0;
  let skipped = 0;

  const processNext = () => {
    if (currentIndex >= blocksToUpdate.length) {
      console.log(`\n✓ Done! Updated: ${updated}, Skipped: ${skipped}`);
      rl.close();
      return;
    }

    const item = blocksToUpdate[currentIndex];

    console.log(`\n[${currentIndex + 1}/${blocksToUpdate.length}]`);
    console.log(`OLD: ${item.oldTitle}`);
    console.log(`NEW: ${item.newTitle}`);

    rl.question('\nApprove? (y/n/q to quit): ', async (answer) => {
      const trimmed = answer.trim().toLowerCase();

      if (trimmed === 'q') {
        console.log(`\nQuitting. Updated: ${updated}, Skipped: ${skipped}`);
        rl.close();
        return;
      }

      if (trimmed === 'y' || trimmed === 'yes') {
        console.log('Updating...');
        const success = await updateBlockTitle(item.block.id, item.newTitle);
        if (success) {
          console.log('✓ Updated!');
          updated++;
        } else {
          console.log('✗ Failed');
        }
      } else {
        console.log('Skipped.');
        skipped++;
      }

      currentIndex++;
      processNext();
    });
  };

  processNext();
}

main().catch(console.error);
