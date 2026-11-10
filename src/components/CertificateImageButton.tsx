"use client";

import { useCallback, useState, type ReactNode } from "react";
import ImageLightbox from "./ImageLightbox";

interface CertificateImageButtonProps {
  /** Full-size image shown in the lightbox. */
  image: string;
  /** Alt text for the full-size image. */
  alt: string;
  /** Accessible name of the lightbox dialog. */
  label: string;
  /** Accessible name. Starts with any visible text (WCAG 2.5.3 Label in Name). */
  ariaLabel: string;
  className: string;
  /** Visible content. */
  children: ReactNode;
}

/** A button that opens one diploma or certificate in the shared image lightbox. */
export default function CertificateImageButton({ image, alt, label, ariaLabel, className, children }: CertificateImageButtonProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={ariaLabel} className={className}>
        {children}
      </button>
      <ImageLightbox
        images={[image]}
        altFor={() => alt}
        label={label}
        index={0}
        open={open}
        onClose={close}
        onIndexChange={() => {}}
      />
    </>
  );
}
