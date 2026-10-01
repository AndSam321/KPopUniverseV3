import React, { useState, useEffect } from "react";
import { createPost } from "../../api/postsApi";
import { getGroupCommunities } from "../../api/communitiesApi";
import "./CreatePost.css";

const FLAIRS = [
  { value: "discussion", label: "Discussion", color: "#757bc8" },
  { value: "question", label: "Question", color: "#6ee7d8" },
  { value: "music", label: "Music", color: "#ff6fb1" },
  { value: "news", label: "News", color: "#ffd166" },
  { value: "media", label: "Media/Photos", color: "#9fa0ff" },
  { value: "fan-content", label: "Fan Content", color: "#ff8ccf" },
];

const CreatePost = ({ onPostCreated, groupId, community }) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFlair, setSelectedFlair] = useState("");
  const [communities, setCommunities] = useState(community ? [community] : []);
  const [communityId, setCommunityId] = useState(community?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locked = Boolean(community);

  useEffect(() => {
    if (locked || !groupId) return;
    getGroupCommunities(groupId)
      .then((data) => {
        setCommunities(data);
        const preferred = data.find((c) => c.official) || data[0];
        if (preferred) setCommunityId(preferred.id);
      })
      .catch(() => setError("Could not load communities to post in"));
  }, [groupId, locked]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      setError("You can only upload up to 10 images");
      return;
    }
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be less than 5MB");
        return false;
      }
      return true;
    });
    setImages([...images, ...validFiles]);
    setImagePreviews([
      ...imagePreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!communityId) {
      setError("Pick a community to post in");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const newPost = await createPost({
        title,
        caption,
        images,
        flair: selectedFlair,
        communityId,
      });
      setTitle("");
      setCaption("");
      setImages([]);
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setImagePreviews([]);
      setSelectedFlair("");
      if (onPostCreated) onPostCreated(newPost);
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(", ") || "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>Create New Post</h2>

      {error && <div className="create-post__error">{error}</div>}

      <form onSubmit={handleSubmit} className="create-post__form">
        <div className="create-post__field">
          <label htmlFor="community">Community *</label>
          {locked ? (
            <div className="create-post__community-locked">{community.name}</div>
          ) : (
            <select
              id="community"
              className="create-post__select"
              value={communityId}
              onChange={(e) => setCommunityId(Number(e.target.value))}
              required
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.official ? " (General)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="create-post__field">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="What's on your mind?"
          />
        </div>

        <div className="create-post__field">
          <label htmlFor="caption">Caption</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Add more details..."
          />
        </div>

        <div className="create-post__field">
          <label htmlFor="images">Images (up to 10, max 5MB each)</label>
          <input
            type="file"
            id="images"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handleImageChange}
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="create-post__previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="create-post__preview">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="create-post__remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="create-post__field">
          <label>Select Flair</label>
          <div className="create-post__flairs">
            {FLAIRS.map((flair) => (
              <label
                key={flair.value}
                className={`create-post__flair-tag ${
                  selectedFlair === flair.value ? "selected" : ""
                }`}
                style={{
                  borderColor:
                    selectedFlair === flair.value ? flair.color : undefined,
                  background:
                    selectedFlair === flair.value ? `${flair.color}15` : undefined,
                }}
              >
                <input
                  type="radio"
                  name="flair"
                  value={flair.value}
                  checked={selectedFlair === flair.value}
                  onChange={(e) => setSelectedFlair(e.target.value)}
                />
                <span
                  style={{
                    color:
                      selectedFlair === flair.value ? flair.color : undefined,
                  }}
                >
                  {flair.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !communityId}
          className="create-post__submit"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
