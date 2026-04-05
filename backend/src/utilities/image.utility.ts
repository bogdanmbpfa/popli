import { createJimp } from '@jimp/core';
import webp from '@jimp/wasm-webp';

import { ExifImage } from 'exif';
import { defaultFormats, defaultPlugins } from 'jimp';

const jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

export const processImage = async (
  buffer: Buffer,
  options: { width: number; height: number },
): Promise<Buffer> => {
  let orientation: number | undefined;

  try {
    new ExifImage(buffer, (error, data) => {
      if (error) {
        return;
      }

      orientation = data.image.Orientation;
    });
  } catch (error) {
    throw new Error(
      `Error getting exif data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error },
    );
  }

  const image = await jimp.read(buffer);

  if (orientation) {
    image.rotate(orientation);
  }

  image.resize({ w: options.width, h: options.height });

  return await image.getBuffer('image/webp', { quality: 100 });
};
