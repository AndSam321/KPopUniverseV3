// Downscale/compress an image in the browser before upload. Phone photos are
// often 5-12MP; sending them raw is slow on mobile and spikes server memory when
// Active Storage decodes them. Resizing here keeps uploads small and fast.
// GIFs are passed through untouched so their animation survives.
export async function resizeImage(file, { maxDim = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // unsupported browser — let the server handle it
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_000_000) {
    bitmap.close?.();
    return file; // already small enough
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.\w+$/, "") || "image";
  return new File([blob], `${name}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
