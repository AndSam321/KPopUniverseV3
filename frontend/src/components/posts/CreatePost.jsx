import React, { useState, useEffect } from "react";
import { createPost } from "../../api/postsApi";
import { getGroups } from "../../api/groupsApi";
import "./CreatePost.css";

const CreatePost = ({ onPostCreated, defaultGroupId }) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState(
    defaultGroupId ? [defaultGroupId] : []
  );
  const [selectedFlair, setSelectedFlair] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const flairs = [
    { value: "discussion", label: "Discussion", color: "#757bc8" },
    { value: "question", label: "Question", color: "#6ee7d8" },
    { value: "music", label: "Music", color: "#ff6fb1" },
    { value: "news", label: "News", color: "#ffd166" },
    { value: "media", label: "Media/Photos", color: "#9fa0ff" },
    { value: "fan-content", label: "Fan Content", color: "#ff8ccf" },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (defaultGroupId && !selectedGroups.includes(defaultGroupId)) {
      setSelectedGroups([defaultGroupId]);
    }
  }, [defaultGroupId]);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

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

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleGroupToggle = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const postData = {
        title,
        caption,
        images,
        groupIds: selectedGroups,
        flair: selectedFlair,
      };

      const newPost = await createPost(postData);

      setTitle("");
      setCaption("");
      setImages([]);
      setSelectedGroups([]);
      setSelectedFlair("");
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setImagePreviews([]);

      if (onPostCreated) {
        onPostCreated(newPost);
      }
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

        {defaultGroupId ? (
          <div className="create-post__field">
            <label>Select Flair</label>
            <div className="create-post__flairs">
              {flairs.map((flair) => (
                <label
                  key={flair.value}
                  className={`create-post__flair-tag ${
                    selectedFlair === flair.value ? "selected" : ""
                  }`}
                  style={{
                    borderColor:
                      selectedFlair === flair.value ? flair.color : undefined,
                    background:
                      selectedFlair === flair.value
                        ? `${flair.color}15`
                        : undefined,
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
        ) : (
          // Show group selector when posting from main feed
          <div className="create-post__field">
            <label>Tag K-pop Groups</label>
            <div className="create-post__groups">
              {groups.map((group) => (
                <label key={group.id} className="create-post__group-tag">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                  />
                  <span>{group.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !title}
          className="create-post__submit"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
