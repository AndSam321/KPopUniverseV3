const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const BASE_URL = "https://api.giphy.com/v1/gifs";

export const giphyEnabled = () => Boolean(GIPHY_KEY);

function mapGifs(data = []) {
  return data
    .filter((gif) => gif.images?.fixed_width?.url)
    .map((gif) => ({
      id: gif.id,
      previewUrl: gif.images.fixed_width.url,
      title: gif.title || "GIF",
    }));
}

async function fetchGifs(path, params) {
  const query = new URLSearchParams({
    api_key: GIPHY_KEY,
    limit: "24",
    rating: "pg-13",
    ...params,
  });
  const response = await fetch(`${BASE_URL}/${path}?${query}`);
  if (!response.ok) throw new Error("Giphy request failed");

  const json = await response.json();
  return mapGifs(json.data);
}

export const fetchTrendingGifs = async () => {
  if (!GIPHY_KEY) return [];
  return fetchGifs("trending", {});
};

export const searchGifs = async (query) => {
  if (!GIPHY_KEY) return [];
  if (!query.trim()) return fetchTrendingGifs();
  return fetchGifs("search", { q: query });
};
