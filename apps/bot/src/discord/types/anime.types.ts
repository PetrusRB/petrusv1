export interface AnimeItem {
  id: string;
  name: string;
  img: string;
  episodes?: {
    eps: number | null;
    sub: number | null;
    dub: number | null;
  };
  duration?: string;
  rated?: boolean;
  releasedYear?: string;
}

export interface AnimeSearchResponse {
  results: AnimeItem[];
  currentPage: number;
  hasNextPage: boolean;
  totalPages?: number;
}

export interface AnimeListResponse {
  results: AnimeItem[];
  currentPage: number;
  hasNextPage: boolean;
}
