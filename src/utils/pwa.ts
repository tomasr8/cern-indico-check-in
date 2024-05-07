export function isPwaInstalled() {
  // The display mode must correspond to the one from the manifest
  return window.matchMedia('(display-mode: standalone)').matches;
}
