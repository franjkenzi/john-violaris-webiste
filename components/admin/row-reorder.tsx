"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Move a row up or down an ordered list — services.
 *
 * Not optimistic, unlike the publish toggle. A swap changes two rows and the
 * order of the whole list, and painting that before the server agrees would
 * mean guessing at the neighbour — which the client does not know, because the
 * neighbour is whichever row has the nearest `sort_order` rather than whichever
 * is next on screen. The buttons disable while the transition runs instead.
 *
 * `action` is the entity's own Server Action, passed in the way
 * `PublishToggle` takes one, so each list keeps its own rules about what
 * counts as a neighbour.
 *
 * `stopPropagation` because these sit inside a row that is itself a link to the
 * editor: without it, reordering would also navigate away from the list.
 */
export function RowReorder({
  id,
  label,
  isFirst,
  isLast,
  action,
}: {
  id: string;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  action: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await action(id, direction);
    });
  }

  return (
    <div
      className="flex items-center gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isFirst || pending}
        onClick={() => move("up")}
      >
        <ArrowUp aria-hidden="true" />
        <span className="sr-only">Move {label} up</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isLast || pending}
        onClick={() => move("down")}
      >
        <ArrowDown aria-hidden="true" />
        <span className="sr-only">Move {label} down</span>
      </Button>
    </div>
  );
}
