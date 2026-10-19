"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";

import { getSwipeDirection, type SwipeDirection } from "@/lib/answers";
import type { DeckCard } from "@/lib/cards/schema";

const EXIT_DISTANCE_PX = 600;

const exitOffsets: Record<SwipeDirection, { x: number; y: number }> = {
  left: { x: -EXIT_DISTANCE_PX, y: 0 },
  right: { x: EXIT_DISTANCE_PX, y: 0 },
  up: { x: 0, y: -EXIT_DISTANCE_PX },
  down: { x: 0, y: EXIT_DISTANCE_PX },
};

export const swipeCardVariants = {
  enter: { scale: 0.95, opacity: 0 },
  center: { scale: 1, opacity: 1, x: 0, y: 0 },
  exit: (direction: SwipeDirection | null) => ({
    ...(direction ? exitOffsets[direction] : { x: 0, y: 0 }),
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

interface SwipeCardProps {
  card: DeckCard;
  onSwipe: (direction: SwipeDirection) => void;
}

export function SwipeCard({ card, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const direction = getSwipeDirection(info.offset, info.velocity);
    if (direction) {
      onSwipe(direction);
    }
  }

  return (
    <motion.article
      className="absolute inset-0 flex cursor-grab touch-none flex-col gap-6 rounded-2xl border bg-card p-6 text-card-foreground shadow-lg select-none active:cursor-grabbing"
      style={{ x, rotate }}
      drag
      dragSnapToOrigin
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      variants={swipeCardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby={`card-${card.id}`}
    >
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {card.theme.label}
      </p>
      <h2
        id={`card-${card.id}`}
        className="my-auto text-lg leading-snug font-semibold text-balance min-[400px]:text-xl sm:text-2xl"
      >
        {card.statement}
      </h2>
    </motion.article>
  );
}
