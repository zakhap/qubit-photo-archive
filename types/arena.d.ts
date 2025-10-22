declare module 'are.na' {
  export interface ArenaBlock {
    id: number;
    title: string;
    class: string;
    image?: {
      thumb: {
        url: string;
      };
      display: {
        url: string;
      };
      original: {
        url: string;
      };
    };
  }

  export interface ArenaChannel {
    id: number;
    title: string;
    slug: string;
    contents: ArenaBlock[];
  }

  export default class Arena {
    constructor(config?: { accessToken?: string });
    channel(slug: string): {
      get(options?: { page?: number; per?: number }): Promise<ArenaChannel>;
    };
  }
}
