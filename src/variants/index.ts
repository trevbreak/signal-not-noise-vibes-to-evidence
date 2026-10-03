import aussie from "./aussie";
import genz from "./genz";
import pm from "./pm";
import type { Variant, VariantId } from "./types";

// Which telling of the talk is running. Pick it from the presenter view, or with ?variant=genz.
// It's read once at load: switching reloads every window.

// Agile coach is parked (docs/variant-ideas.md): too long to read at a glance, and it made fun of the audience.
export const VARIANTS: Variant[] = [aussie, genz, pm];
const KEY = "variant";

function choose(): Variant {
  const fromUrl = new URLSearchParams(location.search).get("variant");
  let stored: string | null = null;
  try {
    if (fromUrl) localStorage.setItem(KEY, fromUrl);
    stored = localStorage.getItem(KEY);
  } catch {
    // Private windows can block storage: the URL still works.
  }
  const id = fromUrl ?? stored;
  return VARIANTS.find((v) => v.id === id) ?? aussie;
}

export const VARIANT = choose();

/** Saved demo state is kept per variant, so switching never mixes the two. Aussie keeps the original keys. */
export const variantKey = (name: string) => (VARIANT.id === "aussie" ? name : `${name}:${VARIANT.id}`);

export function switchVariant(id: VariantId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Fall through to the URL.
  }
  const params = new URLSearchParams(location.search);
  params.set("variant", id);
  location.href = `${location.pathname}?${params.toString().replace("presenter=", "presenter")}${location.hash}`;
}

export type { Variant, VariantId };
