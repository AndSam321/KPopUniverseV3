import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./ImageLightbox.css";

const ImageLightbox = ({ src, alt = "", onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="image-lightbox" onClick={onClose}>
      <button className="image-lightbox__close" onClick={onClose} aria-label="Close">
        <X size={24} />
      </button>
      <img
        src={src}
        alt={alt}
        className="image-lightbox__img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageLightbox;
