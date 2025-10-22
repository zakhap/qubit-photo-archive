import ImageGrid from '@/components/ImageGrid';
import { getArenaImages } from '@/lib/arena';

export default async function Home() {
  const images = await getArenaImages();

  return <ImageGrid images={images} />;
}
