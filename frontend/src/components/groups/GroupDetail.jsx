import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../../api/groupsApi";
import PostCard from "../posts/PostCard";
import CreatePost from "../posts/CreatePost";
import "./GroupDetail.css";

const GroupDetail = () => {
  const { id } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchGroupData(currentPage);
  }, [id, currentPage]);

  const fetchGroupData = async (page) => {
    try {
      setLoading(true);
      const data = await getGroup(id, page);
      setGroupData(data.group);
      setPosts(data.posts);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
      setError("");
    } catch (err) {
      setError("Failed to load group. Please try again.");
      console.error("Error fetching group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && !groupData) {
    return <div className="group-detail__loading">Loading group...</div>;
  }

  if (error && !groupData) {
    return <div className="group-detail__error">{error}</div>;
  }

  return (
    <div className="group-detail">
      <div className="group-detail__header">
        {groupData.logo_url && (
          <div className="group-detail__logo">
            <img src={groupData.logo_url} alt={groupData.name} />
          </div>
        )}
        <div className="group-detail__info">
          <h1>{groupData.name}</h1>
          {groupData.description && (
            <p className="group-detail__description">{groupData.description}</p>
          )}
        </div>
      </div>

      <div className="group-detail__content">
        <div className="group-detail__posts-header">
          <h2>Posts</h2>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="group-detail__create-btn"
          >
            {showCreatePost ? 'Cancel' : '+ Create Post'}
          </button>
        </div>

        {showCreatePost && (
          <CreatePost
            onPostCreated={handlePostCreated}
            defaultGroupId={parseInt(id)}
          />
        )}

        {loading ? (
          <div className="group-detail__loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="group-detail__empty">
            <p>No posts in this group yet. Be the first to post!</p>
          </div>
        ) : (
          <>
            <div className="group-detail__posts">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="group-detail__pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="group-detail__page-btn"
                >
                  Previous
                </button>
                <span className="group-detail__page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="group-detail__page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
