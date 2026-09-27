import React, { useState, useRef, useEffect } from "react";

const FadeImage = ({ src, alt = "", className }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.35s ease" }}
    />
  );
};

export default FadeImage;
