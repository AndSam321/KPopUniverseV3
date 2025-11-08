import React, { useState, useEffect } from "react";
import { getPosts } from "../../api/postsApi";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    try {
      setLoading(true);
      const data = await getPosts(page);
      setPosts(data.data);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
      setError("");
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="feed">
      <div className="feed__header">
        <h1>for you</h1>
        <button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="feed__create-btn"
        >
          {showCreatePost ? "Cancel" : "+ Create Post"}
        </button>
      </div>

      {showCreatePost && <CreatePost onPostCreated={handlePostCreated} />}

      {error && <div className="feed__error">{error}</div>}

      {loading ? (
        <div className="feed__loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="feed__empty">
          <p>No posts yet. Be the first to create one!</p>
        </div>
      ) : (
        <>
          <div className="feed__posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="feed__pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="feed__page-btn"
              >
                Previous
              </button>
              <span className="feed__page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="feed__page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;
