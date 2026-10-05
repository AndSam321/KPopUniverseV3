import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, Check, Plus } from "lucide-react";
import {
  getCommunity,
  joinCommunity,
  leaveCommunity,
} from "../api/communitiesApi";
import { getPosts } from "../api/postsApi";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import CreatePost from "../components/posts/CreatePost";
import BackButton from "../components/common/BackButton";
import "./CommunityPage.css";

export default function CommunityPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCommunity(id), getPosts(1, { communityId: id })])
      .then(([communityData, postsRes]) => {
        setCommunity(communityData);
        setPosts(postsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const toggleMembership = async () => {
    if (pending) return;
    setPending(true);
    try {
      const updated = community.is_member
        ? await leaveCommunity(community.id)
        : await joinCommunity(community.id);
      setCommunity(updated);
    } catch {
      // keep current state on failure
    } finally {
      setPending(false);
    }
  };

  const handlePostCreated = (post) => {
    setPosts((prev) => [post, ...prev]);
    setShowCreate(false);
  };

  if (loading) return <div className="community-page__status">Loading...</div>;
  if (!community)
    return <div className="community-page__status">Community not found</div>;

  return (
    <div className="community-page">
      <BackButton fallback={`/groups/${community.group.id}`} />
      <div className="community-page__header">
        <div className="community-page__heading">
          <h1 className="page-title">{community.name}</h1>
          {community.official && (
            <span className="community-page__badge">Official</span>
          )}
        </div>
        <Link
          to={`/groups/${community.group.id}`}
          className="community-page__group-link"
        >
          {community.group.name}
        </Link>
        {community.description && (
          <p className="community-page__desc">{community.description}</p>
        )}
        <div className="community-page__meta">
          <span className="community-page__members">
            <Users size={14} strokeWidth={2.5} /> {community.member_count}{" "}
            {community.member_count === 1 ? "member" : "members"}
          </span>
          {user && (
            <button
              type="button"
              className={`community-page__join ${
                community.is_member ? "community-page__join--member" : ""
              }`}
              onClick={toggleMembership}
              disabled={pending}
            >
              {community.is_member ? (
                <>
                  <Check size={14} strokeWidth={2.5} /> Joined
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} /> Join
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="community-page__content">
        <div className="community-page__posts-header">
          <h2>Posts</h2>
          {user && (
            <button
              type="button"
              className="community-page__create-btn"
              onClick={() => setShowCreate(!showCreate)}
            >
              {showCreate ? "Cancel" : "+ Create Post"}
            </button>
          )}
        </div>

        {showCreate && (
          <CreatePost community={community} onPostCreated={handlePostCreated} />
        )}

        {posts.length === 0 ? (
          <div className="community-page__empty">
            <p>No posts in this community yet. Be the first!</p>
          </div>
        ) : (
          <div className="community-page__posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
