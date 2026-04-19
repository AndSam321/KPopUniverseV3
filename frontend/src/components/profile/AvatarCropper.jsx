import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";
import getCroppedBlob from "./getCroppedBlob";
import "./AvatarCropper.css";

function AvatarCropper({ file, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  }, [file]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || saving) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
      onSave(blob);
    } catch (err) {
      console.error("avatar crop failed:", err);
      setSaving(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="cropper-modal__backdrop" role="dialog" aria-modal="true">
      <div className="cropper-modal">
        <header className="cropper-modal__header">
          <h2 className="cropper-modal__title">adjust photo</h2>
          <p className="cropper-modal__hint">drag to position, zoom to fit</p>
        </header>

        <div className="cropper-modal__stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            restrictPosition
            zoomSpeed={0.4}
          />
        </div>

        <div className="cropper-modal__controls">
          <div className="cropper-control">
            <ZoomOut size={14} strokeWidth={2.5} className="cropper-control__icon" />
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="zoom"
              className="cropper-control__slider"
            />
            <ZoomIn size={14} strokeWidth={2.5} className="cropper-control__icon" />
          </div>

          <button
            type="button"
            className="cropper-control__rotate"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            aria-label="rotate 90°"
          >
            <RotateCw size={14} strokeWidth={2.5} />
            rotate
          </button>
        </div>

        <div className="cropper-modal__actions">
          <button
            type="button"
            className="cropper-btn cropper-btn--cancel"
            onClick={onCancel}
            disabled={saving}
          >
            <X size={14} strokeWidth={2.5} />
            cancel
          </button>
          <button
            type="button"
            className="cropper-btn cropper-btn--save"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
          >
            {saving ? (
              "cropping…"
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarCropper;
