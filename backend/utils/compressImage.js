import sharp from "sharp";
import path from "path";

export const compressImage = async (inputPath) => {
  const outputPath = inputPath.replace(/(\.\w+)$/, "-compressed.jpg");

  await sharp(inputPath)
    .resize(1200) // good quality width
    .jpeg({ quality: 75 }) // compression
    .toFile(outputPath);

  return outputPath;
};