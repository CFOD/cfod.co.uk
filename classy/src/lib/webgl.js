/**
 * Returns true if the browser can create a WebGL context.
 * Used to decide between the 3D hero and the static gradient fallback.
 */
export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}
