import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../../api/groupsApi";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import PostCard from "../posts/PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import CreatePost from "../posts/CreatePost";
import "./GroupDetail.css";
import "../skeletons/Skeleton.css";

const GroupDetail = () => {
  const { id } = useParams();
  const { startLoading, completeLoading } = useNavigationLoading();
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
      if (!groupData) startLoading();
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
      completeLoading();
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
    return (
      <div className="group-detail-skeleton">
        <div className="group-detail-skeleton__header">
          <div className="skeleton skeleton--circle group-detail-skeleton__logo" />
          <div className="group-detail-skeleton__info">
            <div className="skeleton skeleton--title" style={{ width: "50%" }} />
            <div className="skeleton skeleton--text" style={{ width: "80%" }} />
            <div className="skeleton skeleton--text" style={{ width: "45%" }} />
          </div>
        </div>
        <div className="group-detail-skeleton__posts-header">
          <div className="skeleton skeleton--title" style={{ width: 80 }} />
          <div className="skeleton skeleton--button" style={{ width: 140 }} />
        </div>
        <div className="group-detail-skeleton__posts">
          <PostCardSkeleton showImage={true} />
          <PostCardSkeleton showImage={false} />
        </div>
      </div>
    );
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
