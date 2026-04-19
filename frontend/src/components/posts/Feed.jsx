import React, { useState, useEffect, useCallback } from "react";
import { getPosts, getFollowingFeed } from "../../api/postsApi";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import PostCard from "./PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import "./Feed.css";

const Feed = ({ variant = "for-you" }) => {
  const { startLoading, completeLoading } = useNavigationLoading();
  const [posts, setPosts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (page) => {
    try {
      if (posts.length === 0) {
        setInitialLoading(true);
        startLoading();
      } else {
        setPageLoading(true);
      }
      setError("");
      const data = variant === "following"
        ? await getFollowingFeed(page)
        : await getPosts(page);
      setPosts(data.data);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      setInitialLoading(false);
      setPageLoading(false);
      completeLoading();
    }
  }, [posts.length, variant, startLoading, completeLoading]);

  useEffect(() => {
    setPosts([]);
    setCurrentPage(1);
  }, [variant]);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);

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
        <h1>{variant === "following" ? "following" : "for you"}</h1>
      </div>

      {initialLoading ? (
        <div className="feed__posts">
          <PostCardSkeleton showImage={true} />
          <PostCardSkeleton showImage={false} />
          <PostCardSkeleton showImage={true} />
        </div>
      ) : error ? (
        <div className="feed__error">
          <p>{error}</p>
          <button onClick={() => fetchPosts(currentPage)} className="feed__retry-btn">
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="feed__empty">
          <p>
            {variant === "following"
              ? "No posts from people you follow yet. Find users to follow!"
              : "No posts yet. Be the first to create one!"}
          </p>
        </div>
      ) : (
        <>
          {pageLoading && (
            <div className="feed__page-loading">
              <div className="feed__page-spinner" />
            </div>
          )}
          <div className={`feed__posts${pageLoading ? " feed__posts--loading" : ""}`}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="feed__pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || pageLoading}
                className="feed__page-btn"
              >
                Previous
              </button>
              <span className="feed__page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || pageLoading}
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
