import React, { useState } from "react";
import { createGroup } from "../../api/groupsApi";
import "./CreateGroup.css";

const CreateGroup = ({ onGroupCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const groupData = {
        name,
        description,
        logo_url: logoUrl,
      };

      const newGroup = await createGroup(groupData);

      setName("");
      setDescription("");
      setLogoUrl("");

      if (onGroupCreated) {
        onGroupCreated(newGroup);
      }
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(", ") || "Failed to create group"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group">
      <h2>Create New Group</h2>

      {error && <div className="create-group__error">{error}</div>}

      <form onSubmit={handleSubmit} className="create-group__form">
        <div className="create-group__field">
          <label htmlFor="name">Group Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., TWICE Chicago Show 2025"
          />
        </div>

        <div className="create-group__field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What's this group about?"
          />
        </div>

        <div className="create-group__field">
          <label htmlFor="logoUrl">Logo URL (optional)</label>
          <input
            type="url"
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name}
          className="create-group__submit"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
