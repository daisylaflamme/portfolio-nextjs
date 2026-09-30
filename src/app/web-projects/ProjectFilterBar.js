"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ALL_PROJECTS_FILTER, PROJECT_FILTERS } from "./projectFilters";
import { CheckIcon, ChevronDownIcon, EllipsisIcon, XIcon } from "./FilterIcons";

const primaryFilters = PROJECT_FILTERS.filter((filter) => filter.placement === "primary");
const moreFilters = PROJECT_FILTERS.filter((filter) => filter.placement === "more");

const MENU_WIDTH = 256;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-shadow-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const chipBase = `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border min-h-9 px-3.5 text-[13px] font-medium leading-none cursor-pointer select-none transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${focusRing}`;

const chipIdle =
  "border-[var(--color-petal-border)] bg-white text-[var(--color-font-primary)] hover:bg-[var(--color-petal-bg)] hover:border-[var(--color-center-circle)]";

const chipActive =
  "border-[var(--color-font-primary)] bg-[var(--color-font-primary)] text-white hover:bg-[#454545] hover:border-[#454545]";

function chipDomId(filterId) {
  return `project-filter-${filterId}`;
}

function FilterChip({ id, label, Icon, active, removable, onClick }) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={active}
      onClick={onClick}
      className={`${chipBase} ${active ? chipActive : chipIdle}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
      {active && removable ? <XIcon className="w-3.5 h-3.5 shrink-0 -mr-0.5 opacity-80" /> : null}
    </button>
  );
}

function MoreFiltersMenu({ selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const focusOnOpen = useRef("first");
  const menuId = useId();
  const hasActive = moreFilters.some((filter) => selected.has(filter.id));

  useEffect(() => {
    if (!open) return;

    const items = itemRefs.current.filter(Boolean);
    (focusOnOpen.current === "last" ? items[items.length - 1] : items[0])?.focus();

    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openMenu = (focusTarget = "first") => {
    const rect = buttonRef.current?.getBoundingClientRect();
    setAlignRight(Boolean(rect) && rect.left + MENU_WIDTH > window.innerWidth - 12);
    focusOnOpen.current = focusTarget;
    setOpen(true);
  };

  const onTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(event.key === "ArrowUp" ? "last" : "first");
    }
  };

  const onMenuKeyDown = (event) => {
    const items = itemRefs.current.filter(Boolean);
    const index = items.indexOf(document.activeElement);
    const focusAt = (next) => items[(next + items.length) % items.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(items.length - 1);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  const selectItem = (filterId) => {
    onToggle(filterId);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={hasActive ? "More filters (some active)" : "More filters"}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={`${chipBase} ${chipIdle} ${open ? "bg-[var(--color-petal-bg)] border-[var(--color-center-circle)]" : ""}`}
      >
        <EllipsisIcon className="w-4 h-4 shrink-0" />
        <span>More</span>
        {hasActive ? (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-font-primary)]" aria-hidden="true" />
        ) : null}
        <ChevronDownIcon
          className={`w-4 h-4 shrink-0 -mr-1 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label="More filters"
          onKeyDown={onMenuKeyDown}
          style={{ width: MENU_WIDTH }}
          className={`absolute top-full z-30 mt-2 max-w-[calc(100vw-1.5rem)] rounded-xl border border-[var(--color-petal-border)] bg-white p-1.5 shadow-[0_10px_30px_-12px_rgba(46,46,46,0.28)] ${alignRight ? "right-0" : "left-0"}`}
        >
          {moreFilters.map((filter, index) => {
            const active = selected.has(filter.id);
            const { Icon } = filter;
            return (
              <li key={filter.id} role="none">
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={active}
                  tabIndex={-1}
                  onClick={() => selectItem(filter.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-font-primary)] cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:bg-[var(--color-petal-bg)] focus-visible:bg-[var(--color-petal-bg)] focus-visible:outline-none ${active ? "font-semibold" : ""}`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[var(--color-font-secondary)]" />
                  <span className="flex-1">{filter.label}</span>
                  {active ? <CheckIcon className="w-4 h-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Pill row for filtering projects. `selected` is a Set of PROJECT_FILTERS ids.
 */
export default function ProjectFilterBar({ selected, onToggle, onClear }) {
  const activeMoreFilters = moreFilters.filter((filter) => selected.has(filter.id));
  const [revealId, setRevealId] = useState(null);

  useEffect(() => {
    if (!revealId) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(chipDomId(revealId))?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    setRevealId(null);
  }, [revealId]);

  const toggleFromMenu = (filterId) => {
    if (!selected.has(filterId)) setRevealId(filterId);
    onToggle(filterId);
  };

  const { Icon: AllIcon, label: allLabel } = ALL_PROJECTS_FILTER;

  return (
    <div role="group" aria-label="Filter projects" className="flex items-center gap-2 sm:flex-wrap">
      <div className="-m-1 flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:contents">
        <FilterChip
          label={allLabel}
          Icon={AllIcon}
          active={selected.size === 0}
          onClick={onClear}
        />
        {primaryFilters.map((filter) => (
          <FilterChip
            key={filter.id}
            id={chipDomId(filter.id)}
            label={filter.label}
            Icon={filter.Icon}
            active={selected.has(filter.id)}
            removable
            onClick={() => onToggle(filter.id)}
          />
        ))}
        {activeMoreFilters.map((filter) => (
          <FilterChip
            key={filter.id}
            id={chipDomId(filter.id)}
            label={filter.label}
            Icon={filter.Icon}
            active
            removable
            onClick={() => onToggle(filter.id)}
          />
        ))}
      </div>
      <MoreFiltersMenu selected={selected} onToggle={toggleFromMenu} />
    </div>
  );
}
