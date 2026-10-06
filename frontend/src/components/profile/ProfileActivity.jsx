import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { getPosts } from "../../api/postsApi";
import { getUserComments } from "../../api/userApi";
import PostCard from "../posts/PostCard";
import "./ProfileActivity.css";

const timeAgo = (dateString) => {
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
};

function ProfileActivity({ user }) {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState(null);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPosts(null);
    setComments(null);
    setTab("posts");
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    const needsPosts = tab === "posts" && posts === null;
    const needsComments = tab === "comments" && comments === null;
    if (!needsPosts && !needsComments) return;

    setLoading(true);
    const request = needsPosts
      ? getPosts(1, { userId: user.id }).then((res) => !cancelled && setPosts(res.data))
      : getUserComments(user.username).then((res) => !cancelled && setComments(res.data));

    request
      .catch(() => {
        if (cancelled) return;
        needsPosts ? setPosts([]) : setComments([]);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [tab, user.id, user.username, posts, comments]);

  const removePost = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <section className="profile-activity">
      <div className="profile-activity__tabs">
        <button
          type="button"
          className={`profile-activity__tab ${tab === "posts" ? "is-active" : ""}`}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>
        <button
          type="button"
          className={`profile-activity__tab ${tab === "comments" ? "is-active" : ""}`}
          onClick={() => setTab("comments")}
        >
          Comments
        </button>
      </div>

      {loading && <p className="profile-activity__status">loading…</p>}

      {!loading && tab === "posts" && posts && (
        posts.length === 0 ? (
          <p className="profile-activity__empty">No posts yet.</p>
        ) : (
          <div className="profile-activity__posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDeleted={removePost} />
            ))}
          </div>
        )
      )}

      {!loading && tab === "comments" && comments && (
        comments.length === 0 ? (
          <p className="profile-activity__empty">No comments yet.</p>
        ) : (
          <div className="profile-activity__comments">
            {comments.map((comment) => (
              <Link
                key={comment.id}
                to={`/posts/${comment.post.id}`}
                className="profile-comment"
              >
                <div className="profile-comment__context">
                  <MessageSquare size={13} strokeWidth={2.2} />
                  <span>
                    on <strong>{comment.post.title}</strong>
                  </span>
                  <span className="profile-comment__time">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="profile-comment__body">{comment.content}</p>
              </Link>
            ))}
          </div>
        )
      )}
    </section>
  );
}

export default ProfileActivity;
