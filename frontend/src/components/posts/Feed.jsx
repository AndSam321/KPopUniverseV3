import React, { useState, useEffect, useRef, useCallback } from "react";
import { getPosts, getFollowingFeed } from "../../api/postsApi";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import PostCard from "./PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import "./Feed.css";

const Feed = ({ variant = "for-you" }) => {
  const { startLoading, completeLoading } = useNavigationLoading();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  const fetchFn = variant === "following" ? getFollowingFeed : getPosts;

  useEffect(() => {
    let cancelled = false;
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError("");
    setInitialLoading(true);
    startLoading();

    fetchFn(1)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.data);
        setHasMore(data.meta.current_page < data.meta.total_pages);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load posts. Please try again.");
      })
      .finally(() => {
        completeLoading();
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [variant]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchFn(nextPage);
      setPosts((prev) => [...prev, ...data.data]);
      setPage(nextPage);
      setHasMore(data.meta.current_page < data.meta.total_pages);
    } catch (err) {
      setError("Failed to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, initialLoading, page, fetchFn]);

  useEffect(() => {
    if (!hasMore || initialLoading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, initialLoading, loadMore]);

  const retry = () => {
    setError("");
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
    fetchFn(1)
      .then((data) => {
        setPosts(data.data);
        setHasMore(data.meta.current_page < data.meta.total_pages);
      })
      .catch(() => setError("Failed to load posts. Please try again."))
      .finally(() => setInitialLoading(false));
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
      ) : error && posts.length === 0 ? (
        <div className="feed__error">
          <p>{error}</p>
          <button onClick={retry} className="feed__retry-btn">
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
          <div className="feed__posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="feed__sentinel" aria-hidden="true">
              {loadingMore && (
                <div className="feed__more-loading">
                  <div className="feed__more-spinner" />
                  <span>loading more…</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="feed__end">you're all caught up ✨</div>
          )}

          {error && posts.length > 0 && (
            <div className="feed__more-error">
              <span>{error}</span>
              <button onClick={loadMore} className="feed__retry-btn">
                retry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;
