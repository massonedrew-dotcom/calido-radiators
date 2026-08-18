import NextImage from 'next/image';
import type { ComponentProps } from 'react';

import { ASSETS, type AssetId } from '@/content/assets.generated';

type Props = Omit<ComponentProps<typeof NextImage>, 'src' | 'width' | 'height' | 'alt'> & {
  id: AssetId;
  alt: string;
};

/**
 * next/image bound to the generated manifest, so intrinsic dimensions always
 * match the file on disk and no section can shift layout while images decode.
 */
export function Img({ id, alt, ...rest }: Props) {
  const { src, width, height } = ASSETS[id];
  return <NextImage src={src} width={width} height={height} alt={alt} {...rest} />;
}
