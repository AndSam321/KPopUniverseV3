import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../../api/groupsApi";
import { toggleMuteGroup } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import { BellOff, Bell, ChevronDown, ChevronUp } from "lucide-react";
import PostCard from "../posts/PostCard";
import CommunitiesSection from "../communities/CommunitiesSection";
import FadeImage from "../common/FadeImage";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import CreatePost from "../posts/CreatePost";
import "./GroupDetail.css";
import "../skeletons/Skeleton.css";

const GROUP_TYPE_LABELS = {
  boy_group: "Boy Group",
  girl_group: "Girl Group",
  solo: "Soloist",
  coed: "Co-ed Group",
};

const ALBUM_TYPE_LABELS = {
  album: "Album",
  ep: "EP",
  single: "Single",
  compilation: "Compilation",
};

const formatYear = (date) => (date ? String(date).slice(0, 4) : "");

const INITIAL_ALBUMS = 5;
const ALBUM_BATCH = 10;

const GroupDetail = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { startLoading, completeLoading } = useNavigationLoading();
  const [groupData, setGroupData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [albumsShown, setAlbumsShown] = useState(INITIAL_ALBUMS);
  const [albumsExpanded, setAlbumsExpanded] = useState(false);
  const albumSentinelRef = useRef(null);
  const discographyRef = useRef(null);

  useEffect(() => {
    if (user?.muted_group_ids && id) {
      setIsMuted(user.muted_group_ids.includes(parseInt(id)));
    }
  }, [user, id]);

  const handleToggleMute = async () => {
    try {
      const data = await toggleMuteGroup(id);
      setIsMuted(data.muted);
      const updatedMutedIds = data.muted
        ? [...(user.muted_group_ids || []), parseInt(id)]
        : (user.muted_group_ids || []).filter((gid) => gid !== parseInt(id));
      updateUser({ ...user, muted_group_ids: updatedMutedIds });
    } catch (err) {
      console.error("Error toggling mute:", err);
    }
  };

  useEffect(() => {
    fetchGroupData(currentPage);
  }, [id, currentPage]);

  useEffect(() => {
    setAlbumsShown(INITIAL_ALBUMS);
    setAlbumsExpanded(false);
  }, [id]);

  useEffect(() => {
    if (!albumsExpanded) return;
    const total = groupData?.albums?.length || 0;
    if (albumsShown >= total) return;
    const sentinel = albumSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAlbumsShown((count) => Math.min(count + ALBUM_BATCH, total));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [albumsExpanded, albumsShown, groupData]);

  const handleShowMoreAlbums = () => {
    setAlbumsExpanded(true);
    setAlbumsShown((count) =>
      Math.min(count + ALBUM_BATCH, groupData.albums.length)
    );
  };

  const handleCollapseAlbums = () => {
    setAlbumsExpanded(false);
    setAlbumsShown(INITIAL_ALBUMS);
    discographyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const albums = groupData.albums || [];
  const visibleAlbums = albums.slice(0, albumsShown);
  const hasMoreAlbums = albumsShown < albums.length;

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
          {groupData.korean_name && (
            <span className="group-detail__korean">{groupData.korean_name}</span>
          )}
          {groupData.description && (
            <p className="group-detail__description">{groupData.description}</p>
          )}
          <div className="group-detail__meta">
            {groupData.group_type && (
              <span className="group-detail__tag">
                {GROUP_TYPE_LABELS[groupData.group_type] || groupData.group_type}
              </span>
            )}
            {groupData.company && (
              <span className="group-detail__tag">{groupData.company}</span>
            )}
            {groupData.debut_date && (
              <span className="group-detail__tag">
                Debuted {formatYear(groupData.debut_date)}
              </span>
            )}
            {groupData.fandom_name && (
              <span className="group-detail__tag group-detail__tag--fandom">
                {groupData.fandom_name}
              </span>
            )}
          </div>
        </div>
        {user && (
          <button
            className={`group-detail__mute-btn ${isMuted ? "group-detail__mute-btn--muted" : ""}`}
            onClick={handleToggleMute}
            title={isMuted ? "Unmute notifications" : "Mute notifications"}
          >
            {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
            <span>{isMuted ? "muted" : "mute"}</span>
          </button>
        )}
      </div>

      {groupData.members?.length > 0 && (
        <section className="group-detail__section">
          <h2 className="group-detail__section-title">Members</h2>
          <div className="group-detail__members">
            {groupData.members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-card__photo">
                  {member.photo_url ? (
                    <FadeImage src={member.photo_url} alt={member.stage_name} />
                  ) : (
                    <span>{member.stage_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="member-card__name">{member.stage_name}</div>
                {member.position && (
                  <div className="member-card__position">{member.position}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="group-detail__section" ref={discographyRef}>
          <h2 className="group-detail__section-title">Discography</h2>
          <div className="group-detail__albums">
            {visibleAlbums.map((album) => (
              <div key={album.id} className="album-card">
                <div className="album-card__cover">
                  {album.cover_url ? (
                    <FadeImage src={album.cover_url} alt={album.title} />
                  ) : (
                    <span>♪</span>
                  )}
                </div>
                <div className="album-card__title">{album.title}</div>
                <div className="album-card__meta">
                  {[ALBUM_TYPE_LABELS[album.album_type] || album.album_type, formatYear(album.release_date)]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            ))}
          </div>

          {hasMoreAlbums && !albumsExpanded && (
            <button
              className="group-detail__show-more"
              onClick={handleShowMoreAlbums}
            >
              Show all {albums.length} releases
              <ChevronDown size={16} />
            </button>
          )}

          {albumsExpanded && hasMoreAlbums && (
            <div ref={albumSentinelRef} className="group-detail__albums-sentinel" />
          )}

          {albumsExpanded && (
            <button
              className="group-detail__show-more"
              onClick={handleCollapseAlbums}
            >
              Show less
              <ChevronUp size={16} />
            </button>
          )}
        </section>
      )}

      <CommunitiesSection groupId={id} />

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
            groupId={parseInt(id)}
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
