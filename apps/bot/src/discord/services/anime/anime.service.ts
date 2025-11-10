import ky from 'ky';
import {
  AnimeSearchResponse,
  AnimeListResponse,
} from 'discord/types/anime.types.js';

export async function fetchAnimeSearch(
  keyword: string,
  page: number
): Promise<AnimeSearchResponse> {
  const url = `${process.env.ANIME_API}/aniwatch/search`;

  try {
    const data = await ky
      .get(url, {
        searchParams: { keyword, page },
      })
      .json<any>();

    if (!data || !Array.isArray(data.animes)) {
      return {
        results: [],
        currentPage: 1,
        hasNextPage: false,
        totalPages: 1,
      };
    }

    return {
      results: data.animes,
      currentPage: data.currentPage ?? page,
      hasNextPage: data.hasNextPage ?? false,
      totalPages: data.totalPages ?? 1,
    };
  } catch (err) {
    console.error('[fetchAnimeSearch] ERROR:', err);
    throw err;
  }
}
export async function fetchAnimeDetails(id: string) {
  try {
    // Tenta buscar pelo próprio ID
    const data = await fetchAnimeSearch(id, 1);

    if (!data?.results?.length) {
      return null;
    }

    // Tenta encontrar match exato
    const anime = data.results.find((a) => a.id === id);

    return anime ?? null;
  } catch (err) {
    console.error('[fetchAnimeDetails] ERROR:', err);
    return null;
  }
}
export async function fetchAnimeList(page: number): Promise<AnimeListResponse> {
  const url = `${process.env.ANIME_API}/aniwatch/az-list`;

  try {
    const data = await ky
      .get(url, {
        searchParams: { page },
      })
      .json<any>();

    if (!data || !Array.isArray(data)) {
      return {
        results: [],
        currentPage: page,
        hasNextPage: false,
      };
    }

    return {
      results: data,
      currentPage: page,
      hasNextPage: false,
    };
  } catch (err) {
    console.error('[fetchAnimeList] ERROR:', err);
    throw err;
  }
}
