"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Single shared modal for project details. Open/close is controlled by
 * the project prop (truthy = open, null = closed).
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [project]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className="modal">
      {project && (
      <div className="project-modal-box modal-box w-11/12 max-w-5xl">
        <h3 className="font-bold text-lg text-[var(--color-font-primary)]">{project.title}</h3>
        <p className="py-4 text-[var(--color-font-primary)] project-card__description">{project.description}</p>
        <Image
          src={project.image}
          alt={project.imageAlt || project.title}
          width={800}
          height={500}
          className="w-full h-auto max-w-full rounded-lg border border-[var(--color-petal-border)]"
          sizes="(max-width: 1024px) 90vw, 800px"
        />
        {project.link && (
          <p className="pt-4">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-shadow-accent)] font-medium underline hover:opacity-80 transition-opacity"
            >
              Visit Site
              <span aria-hidden>↗</span>
            </a>
          </p>
        )}
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[var(--color-font-primary)]" aria-label="Close">
              ✕
            </button>
          </form>
        </div>
      </div>
      )}
      <form method="dialog" className="modal-backdrop project-modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
