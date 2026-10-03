// "Stage size": the projector window's text scaled up for a room. Labs and review screens are
// laid out in rem, so scaling the root font scales everything. Remembered per browser; Z toggles it.

const KEY = "stage-size";

export function stageSizeOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function applyStageSize(on = stageSizeOn()) {
  document.documentElement.classList.toggle("stage-size", on);
}

export function toggleStageSize() {
  const on = !stageSizeOn();
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* private window: still toggles for this session */
  }
  applyStageSize(on);
}
