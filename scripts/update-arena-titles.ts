import Arena from 'are.na';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
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

async function main() {
  if (!PERSONAL_TOKEN) {
    console.error('Error: PERSONAL_TOKEN not found in environment variables');
    process.exit(1);
  }

  const arena = new Arena({ accessToken: PERSONAL_TOKEN });

  console.log(`Fetching images from channel: ${CHANNEL_SLUG}...`);

  let allBlocks: any[] = [];
  let page = 1;
  let hasMorePages = true;
  const perPage = 100;

  while (hasMorePages) {
    const channel = await arena.channel(CHANNEL_SLUG).get({ page, per: perPage });
    const imageBlocks = channel.contents.filter(
      (block: any) => block.class === 'Image' && block.image
    );
    allBlocks = [...allBlocks, ...imageBlocks];
    hasMorePages = channel.contents.length === perPage;
    page++;
  }

  console.log(`\nFound ${allBlocks.length} images\n`);

  // Prepare changes
  const changes = allBlocks.map((block) => ({
    id: block.id,
    oldTitle: block.title || 'Untitled',
    newTitle: cleanTitle(block.title || 'Untitled'),
  }));

  // Show preview
  console.log('=== PROPOSED CHANGES ===\n');
  changes.forEach((change, index) => {
    if (change.oldTitle !== change.newTitle) {
      console.log(`${index + 1}.`);
      console.log(`  OLD: ${change.oldTitle}`);
      console.log(`  NEW: ${change.newTitle}`);
      console.log('');
    }
  });

  const changesCount = changes.filter(c => c.oldTitle !== c.newTitle).length;
  console.log(`\nTotal changes: ${changesCount} out of ${allBlocks.length} images\n`);

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Do you want to proceed with these changes? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      console.log('\nUpdating titles...');

      let updated = 0;
      for (const change of changes) {
        if (change.oldTitle !== change.newTitle) {
          try {
            // Update the block title via API
            await fetch(`https://api.are.na/v2/blocks/${change.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${PERSONAL_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: change.newTitle,
              }),
            });
            updated++;
            console.log(`✓ Updated: ${change.newTitle}`);
          } catch (error) {
            console.error(`✗ Failed to update block ${change.id}:`, error);
          }
        }
      }

      console.log(`\n✓ Updated ${updated} titles successfully!`);
    } else {
      console.log('\nCancelled. No changes were made.');
    }

    rl.close();
  });
}

main().catch(console.error);
