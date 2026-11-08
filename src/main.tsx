// Three apps share this entry point. The talk (the default) is in src/talk/.
// The service-agent telling of the same talk is in src/service/: open it with ?service.
// The earlier lab-based version is still here for reference: open it with ?legacy.
const params = new URLSearchParams(location.search);
/** ?service, or ?variant=service (the old lab app's spelling), picks the service-agent telling. */
const wantsService = params.has("service") || params.get("variant") === "service";

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
  if (wantsService || (params.has("presenter") && (await serviceProjectorOpen()))) {
    if (!params.has("service")) {
      // Rewrite to the canonical ?service so the talk's own ?service checks (and O) see it.
      params.delete("variant");
      const rest = params.toString().replace(/=(?=&|$)/g, "");
      history.replaceState(null, "", `${location.pathname}?service${rest ? `&${rest}` : ""}${location.hash}`);
    }
    return (await import("./service/main")).start();
  }
  return (await import("./talk/main")).start();
})();
