"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { WorkItem } from "@/data/types";
import ImageLightbox from "./ImageLightbox";

interface ImageSetButtonProps {
  item: Pick<WorkItem, "title" | "summary" | "images" | "imageAlt">;
  /** next/image sizes for the cover at its rendered width. */
  sizes: string;
  /** Only for the page's LCP image. */
  priority?: boolean;
  /** Tailwind aspect-ratio class for the cover box. */
  aspectClass?: string;
}

/**
 * Cover image as a button that opens every image of the item in the lightbox.
 * The visible title and summary live next to it, so the button's name only says what it does.
 */
export default function ImageSetButton({ item, sizes, priority = false, aspectClass = "aspect-[4/3]" }: ImageSetButtonProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const close = useCallback(() => setOpen(false), []);
  const count = item.images.length;

  const altFor = (i: number) => (count > 1 ? `${item.imageAlt} (${i + 1} of ${count})` : item.imageAlt);
  const captionFor = () => `${item.title}. ${item.summary}`;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-label={`View ${item.title} full size${count > 1 ? `, ${count} images` : ""}`}
        className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-line bg-img ${aspectClass}`}
      >
        <Image
          src={item.images[0]}
          alt={item.imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {count > 1 ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/75 px-2.5 py-1 font-mono text-xs text-white">
            {count} images
          </span>
        ) : null}
      </button>
      <ImageLightbox
        images={item.images}
        altFor={altFor}
        captionFor={captionFor}
        label={`${item.title} images`}
        index={index}
        open={open}
        onClose={close}
        onIndexChange={setIndex}
      />
    </>
  );
}
