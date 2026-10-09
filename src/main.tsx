// Two apps share this entry point. The talk (the default) is in src/talk/.
// The earlier lab-based version is still here for reference: open it with ?legacy.
if (new URLSearchParams(location.search).has("legacy")) {
  void import("./legacy").then((m) => m.start());
} else {
  void import("./talk/main").then((m) => m.start());
}
