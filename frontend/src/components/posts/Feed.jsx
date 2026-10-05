import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
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
  const [showSkeleton, setShowSkeleton] = useState(false);
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
    setShowSkeleton(false);
    startLoading();

    // Only show skeletons if the load is actually slow — fast (cached/seeded)
    // loads skip straight to a gentle fade-in instead of a skeleton flash.
    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setShowSkeleton(true);
    }, 180);

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
        clearTimeout(skeletonTimer);
        completeLoading();
        if (!cancelled) {
          setInitialLoading(false);
          setShowSkeleton(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
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
        <h1 className="page-title feed__title">{variant === "following" ? "Following" : "For You"}</h1>
        <div className="feed__tabs">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "feed__tab feed__tab--active" : "feed__tab")}>
            For You
          </NavLink>
          <NavLink to="/following" className={({ isActive }) => (isActive ? "feed__tab feed__tab--active" : "feed__tab")}>
            Following
          </NavLink>
        </div>
      </div>

      {initialLoading ? (
        showSkeleton ? (
          <div className="feed__posts feed__posts--enter">
            <PostCardSkeleton showImage={true} />
            <PostCardSkeleton showImage={false} />
            <PostCardSkeleton showImage={true} />
          </div>
        ) : null
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
              ? "No posts from your communities yet. Join communities to fill this feed!"
              : "No posts yet. Be the first to create one!"}
          </p>
        </div>
      ) : (
        <>
          <div className="feed__posts feed__posts--enter" key={variant}>
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
