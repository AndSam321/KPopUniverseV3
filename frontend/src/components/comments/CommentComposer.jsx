import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, Film, X } from "lucide-react";
import GifPicker from "./GifPicker";
import "./CommentComposer.css";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = "image/jpeg,image/jpg,image/png,image/gif,image/webp";

const CommentComposer = ({
  onSubmit,
  placeholder = "Add a comment...",
  submitLabel = "Comment",
  onCancel,
  autoFocus = false,
  compact = false,
}) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const hasAttachment = Boolean(imageFile || gifUrl);
  const canSubmit = (text.trim() || hasAttachment) && !submitting;
  const previewSrc = imagePreview || gifUrl;

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearAttachment = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setGifUrl(null);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }
    clearAttachment();
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGifSelect = (url) => {
    clearAttachment();
    setGifUrl(url);
    setShowGifPicker(false);
  };

  const reset = () => {
    setText("");
    clearAttachment();
    setShowGifPicker(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ content: text.trim(), imageFile, imageUrl: gifUrl });
      reset();
    } catch {
      setError("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={`comment-composer ${compact ? "comment-composer--compact" : ""}`}
      onSubmit={handleSubmit}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="comment-composer__input"
        rows={compact ? 2 : 3}
        maxLength={5000}
        autoFocus={autoFocus}
      />

      {previewSrc && (
        <div className="comment-composer__preview">
          <img src={previewSrc} alt="attachment preview" />
          <button
            type="button"
            className="comment-composer__preview-remove"
            onClick={clearAttachment}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && <div className="comment-composer__error">{error}</div>}

      <div className="comment-composer__toolbar">
        <div className="comment-composer__tools">
          <button
            type="button"
            className="comment-composer__tool"
            onClick={() => fileInputRef.current?.click()}
            disabled={Boolean(gifUrl)}
            title="Add image"
            aria-label="Add image"
          >
            <ImagePlus size={18} />
          </button>
          <div className="comment-composer__gif-wrap">
            <button
              type="button"
              className="comment-composer__tool"
              onClick={() => setShowGifPicker((v) => !v)}
              disabled={Boolean(imageFile)}
              title="Add GIF"
              aria-label="Add GIF"
            >
              <Film size={18} />
            </button>
            {showGifPicker && (
              <GifPicker
                onSelect={handleGifSelect}
                onClose={() => setShowGifPicker(false)}
              />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept={ACCEPTED}
            hidden
            onChange={handleFile}
          />
        </div>

        <div className="comment-composer__actions">
          {onCancel && (
            <button
              type="button"
              className="comment-composer__cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="comment-composer__submit"
            disabled={!canSubmit}
          >
            {submitting ? "Posting..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
