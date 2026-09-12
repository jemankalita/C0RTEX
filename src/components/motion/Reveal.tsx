"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  /** Delay in seconds before the animation starts once in view. */
  delay?: number;
  /** Travel distance of the slide-in, in px. */
  y?: number;
  /** Extra classes for the wrapper. */
  className?: string;
  /** Render as another element (e.g. "li"). Defaults to "div". */
  as?: "div" | "li" | "section" | "article" | "span" | "p" | "footer";
};

/**
 * Scroll-triggered reveal: fades + slides an element in the first time it
 * enters the viewport. Uses framer-motion's `whileInView` — no manual
 * IntersectionObserver wiring needed.
 */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

type StaggerGroupProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child's animation. */
  stagger?: number;
  as?: "div" | "ul" | "ol";
  childAs?: "div" | "li" | "article";
};

/**
 * Container that staggers its direct children with the same reveal motion.
 * Wrap each child in `StaggerItem`.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.09,
  as = "div",
  childAs = "div",
}: StaggerGroupProps) {
  const reduced = useReducedMotion();
  const GroupTag = as;

  if (reduced) {
    return <GroupTag className={className}>{children}</GroupTag>;
  }

  const MotionGroup = motion[as];
  return (
    <MotionGroup
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </MotionGroup>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const ItemTag = as;

  if (reduced) {
    return <ItemTag className={className}>{children}</ItemTag>;
  }

  const MotionItem = motion[as];
  return (
    <MotionItem
      className={className}
      variants={{
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
      }}
    >
      {children}
    </MotionItem>
  );
}
