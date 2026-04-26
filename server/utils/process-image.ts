import { ResizeFilterType, Transformer } from '@napi-rs/image';

export default async function processImage(
  buffer: Buffer,
  options: { width: number; height: number },
): Promise<Buffer> {
  return await new Transformer(buffer)
    .resize(options.width, options.height, ResizeFilterType.Lanczos3)
    .webp(90);
}
