/* eslint-disable spaced-comment */
/// <reference no-default-lib="true"/>
/// <reference lib="ES2020" />
/// <reference lib="webworker" />
/* eslint-enable spaced-comment */

import {WorkerMessage, WorkerResponse} from './types';

declare let self: WorkerGlobalScope & typeof globalThis;

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const {imageData, pathsD, left, right, top, bottom} = e.data;
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  if (!ctx) { return; }
  ctx.putImageData(imageData, 0, 0);
  const path = new Path2D(pathsD);
  const result: WorkerResponse = [];
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (ctx.isPointInPath(path, x, y)) {
        const i = ((y * imageData.width) + x) * 4;
        result.push([...imageData.data.subarray(i, i + 3)] as [number, number, number]);
      }
    }
  }
  self.postMessage(result);
});
