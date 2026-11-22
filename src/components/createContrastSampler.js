// Read the compact color map once the GPU has finished copying it.
export default function createContrastSampler(gl) {
  const width = 256;
  const height = 128;
  const pixels = new Uint8Array(width * height * 4);
  const buffer = gl.createBuffer();
  let fence = null;
  let ready = false;
  let opacity = 1;

  if (buffer) {
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, pixels.byteLength, gl.STREAM_READ);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
  }

  return {
    width,
    height,
    get pending() { return fence !== null || ready; },
    queue(nextOpacity) {
      opacity = nextOpacity;
      if (!buffer) {
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        ready = true;
        return;
      }
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
    },
    poll() {
      if (fence) {
        const status = gl.clientWaitSync(fence, 0, 0);
        if (status === gl.TIMEOUT_EXPIRED) return null;
        gl.deleteSync(fence);
        fence = null;
        if (status === gl.WAIT_FAILED) return null;
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buffer);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        ready = true;
      }
      if (!ready) return null;
      ready = false;
      return { pixels, width, height, opacity };
    },
    dispose() {
      if (fence) gl.deleteSync(fence);
      if (buffer) gl.deleteBuffer(buffer);
    },
  };
}
