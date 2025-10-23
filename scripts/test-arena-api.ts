import Arena from 'are.na';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CHANNEL_SLUG = process.env.ARENA_CHANNEL_SLUG || 'qubit-image-archive';

async function test() {
  const arena = new Arena();
  const channel = await arena.channel(CHANNEL_SLUG).get({ page: 1, per: 5 });

  console.log('\n=== First 5 blocks from are.na package ===\n');

  channel.contents
    .filter((block: any) => block.class === 'Image')
    .forEach((block: any) => {
      console.log('Block ID:', block.id);
      console.log('Title:', block.title);
      console.log('Generated Title:', block.generated_title);
      console.log('Description:', block.description);
      console.log('---');
    });
}

test().catch(console.error);
