// Three apps share this entry point. The talk (the default) is in src/talk/.
// The service-agent telling of the same talk is in src/service/: open it with ?service.
// The earlier lab-based version is still here for reference: open it with ?legacy.
const params = new URLSearchParams(location.search);

/** A bare ?presenter follows whichever talk has a projector window open: each projector holds its talk's lock. */
async function serviceProjectorOpen(): Promise<boolean> {
  try {
    const held = (await navigator.locks?.query())?.held?.map((l) => l.name) ?? [];
    return held.includes("service-talk-owner") && !held.includes("signal-talk-owner");
  } catch {
    return false;
  }
}

void (async () => {
  if (params.has("legacy")) return (await import("./legacy")).start();
  if (params.has("service") || (params.has("presenter") && (await serviceProjectorOpen()))) {
    if (!params.has("service")) history.replaceState(null, "", `${location.pathname}?service&presenter${location.hash}`);
    return (await import("./service/main")).start();
  }
  return (await import("./talk/main")).start();
})();
