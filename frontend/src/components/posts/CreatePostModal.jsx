import { useEffect } from "react";
import { X } from "lucide-react";
import CreatePost from "./CreatePost";
import "./CreatePostModal.css";

export default function CreatePostModal({ onClose, onCreated, community, groupId }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="create-post-modal__overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="create-post-modal__close" onClick={onClose} aria-label="close">
          <X size={18} strokeWidth={2.5} />
        </button>
        <CreatePost onPostCreated={onCreated} community={community} groupId={groupId} />
      </div>
    </div>
  );
}
