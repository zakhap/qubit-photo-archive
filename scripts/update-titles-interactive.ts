import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PERSONAL_TOKEN = process.env.PERSONAL_TOKEN;
const CHANNEL_SLUG = process.env.ARENA_CHANNEL_SLUG || 'qubit-image-archive';

function cleanTitle(title: string): string {
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
}

async function getBlocks(): Promise<any[]> {
  const response = await fetch(`https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=100`, {
    headers: { 'Authorization': `Bearer ${PERSONAL_TOKEN}` }
  });
  const data = await response.json();
  return data.contents.filter((block: any) => block.class === 'Image');
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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let currentIndex = 0;

  const processNext = () => {
    if (currentIndex >= blocks.length) {
      console.log('\n✓ Done!');
      rl.close();
      return;
    }

    const block = blocks[currentIndex];
    const oldTitle = block.title || 'Untitled';
    const suggestedTitle = cleanTitle(oldTitle);

    console.log(`\n[${currentIndex + 1}/${blocks.length}]`);
    console.log(`OLD: ${oldTitle}`);
    console.log(`SUGGESTED: ${suggestedTitle}`);

    rl.question('\nEnter new title (press Enter to use suggested, "s" to skip): ', async (answer) => {
      const trimmed = answer.trim();

      if (trimmed.toLowerCase() === 's') {
        console.log('Skipped.');
        currentIndex++;
        processNext();
      } else {
        const finalTitle = trimmed === '' ? suggestedTitle : trimmed;

        if (finalTitle !== oldTitle) {
          console.log(`Updating to: ${finalTitle}`);
          const success = await updateBlockTitle(block.id, finalTitle);
          console.log(success ? '✓ Updated!' : '✗ Failed');
        } else {
          console.log('No change needed.');
        }

        currentIndex++;
        processNext();
      }
    });
  };

  processNext();
}

main().catch(console.error);
