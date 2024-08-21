export interface Film {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    trailer_key?: string | null;
}

export interface FilmsData {
    results: Film[];
    page: number;
    total_results: number;
    total_pages: number;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}