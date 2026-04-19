const OUTPUT_SIZE = 800;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const toRadians = (deg) => (deg * Math.PI) / 180;

export default async function getCroppedBlob(imageSrc, cropPixels, rotation = 0) {
  const image = await loadImage(imageSrc);

  const rotatedCanvas = document.createElement("canvas");
  const rotatedCtx = rotatedCanvas.getContext("2d");
  const rad = toRadians(rotation);
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const rotatedWidth = image.width * cos + image.height * sin;
  const rotatedHeight = image.width * sin + image.height * cos;

  rotatedCanvas.width = rotatedWidth;
  rotatedCanvas.height = rotatedHeight;
  rotatedCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotatedCtx.rotate(rad);
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const output = document.createElement("canvas");
  output.width = OUTPUT_SIZE;
  output.height = OUTPUT_SIZE;
  const ctx = output.getContext("2d");

  ctx.drawImage(
    rotatedCanvas,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return new Promise((resolve) => {
    output.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}
