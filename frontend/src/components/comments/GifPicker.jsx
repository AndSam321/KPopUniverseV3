import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { fetchTrendingGifs, searchGifs, giphyEnabled } from "../../api/giphyApi";
import "./GifPicker.css";

const GifPicker = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const enabled = giphyEnabled();

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = query.trim()
          ? await searchGifs(query)
          : await fetchTrendingGifs();
        if (active) setGifs(results);
      } catch {
        if (active) setGifs([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, enabled]);

  return (
    <div className="gif-picker">
      <div className="gif-picker__header">
        <div className="gif-picker__search">
          <Search size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs"
            autoFocus
          />
        </div>
        <button className="gif-picker__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {!enabled ? (
        <div className="gif-picker__message">
          GIF search is unavailable. Set <code>VITE_GIPHY_API_KEY</code> to enable it.
        </div>
      ) : loading ? (
        <div className="gif-picker__message">Loading GIFs…</div>
      ) : gifs.length === 0 ? (
        <div className="gif-picker__message">No GIFs found.</div>
      ) : (
        <div className="gif-picker__grid">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              className="gif-picker__item"
              onClick={() => onSelect(gif.previewUrl)}
            >
              <img src={gif.previewUrl} alt={gif.title} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="gif-picker__attribution">Powered by GIPHY</div>
    </div>
  );
};

export default GifPicker;
