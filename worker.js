onmessage = e => {
  const {imageData, pathsD, minX, maxX, minY, maxY} = e.data;
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  ctx.putImageData(imageData, 0, 0);
  const path = new Path2D(pathsD);
  const result = [];
  for (let x=minX; x<maxX; x++) {
    for (let y=minY; y<maxY; y++) {
      if (ctx.isPointInPath(path, x, y)) {
        const i = (y * imageData.width + x) * 4;
        result.push(imageData.data.subarray(i, i + 3));
      }
    }
  }
  postMessage(result);
};
