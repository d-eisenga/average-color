import {MODE_CALCULATING, MODE_READY} from '../../constants';
import {Bounds, WorkerMessage, WorkerResponse} from '../../types';
import {clampedBounds} from '../../utils/clampedBounds';
import {pointsBounds} from '../../utils/pointsBounds';
import {pointsToString} from '../../utils/pointsToString';
import {roundedBounds} from '../../utils/roundedBounds';
import {ctx, height, image, mode, paths, width} from '../state';
import {addResult} from './resultsActions';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const threads = navigator.hardwareConcurrency ?? 1;
const workers = (
  new Array(threads).fill(0).map(() => new Worker(new URL('../../worker.ts', import.meta.url)))
);

type Slice = Omit<Bounds, 'width' | 'height'>;
const makeSlices = (bounds: Bounds, isLandscape: boolean, sliceSize: number): Slice[] => {
  let left = bounds.left;
  let top = bounds.top;
  const slices: Slice[] = [];
  while (left < bounds.right && top < bounds.bottom) {
    slices.push({
      left: left,
      right: Math.min(bounds.right, left + (isLandscape ? sliceSize : bounds.width)),
      top: top,
      bottom: Math.min(bounds.bottom, top + (isLandscape ? bounds.height : sliceSize)),
    });
    if (isLandscape) {
      left = left + sliceSize;
    } else {
      top = top + sliceSize;
    }
  }
  return slices;
};

const calculateFromPaths = () => {
  if (!ctx.value || !image.value) { return; }
  const bounds = clampedBounds(roundedBounds(
    pointsBounds(paths.value.flatMap(path => path.points))
  ), width.value, height.value);
  const imageName = image.value.name;
  const imageData = ctx.value.getImageData(0, 0, width.value, height.value);
  const pathsD = paths.value.map(path => pointsToString(path.points)).join(' ');
  const isLandscape = bounds.width > bounds.height;
  const sliceSize = Math.ceil(isLandscape ? bounds.width / threads : bounds.height / threads);
  const slices = makeSlices(bounds, isLandscape, sliceSize);

  Promise.all(slices.map((slice, i) => new Promise<WorkerResponse>(res => {
    const message: WorkerMessage = {
      imageData: imageData,
      pathsD: pathsD,
      left: slice.left,
      right: slice.right,
      top: slice.top,
      bottom: slice.bottom,
    };
    const worker = workers[i];
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => res(e.data);
    worker.postMessage(message);
  }))).then(responses => {
    let red = 0;
    let green = 0;
    let blue = 0;
    let pixels = 0;
    for (const response of responses) {
      for (const [r, g, b] of response) {
        red = red + (r ** 2);
        green = green + (g ** 2);
        blue = blue + (b ** 2);
        pixels++;
      }
    }
    const [r, g, b] = [red, green, blue].map(c => Math.sqrt(c / pixels));
    if (!Number.isNaN(r) || !Number.isNaN(g) || !Number.isNaN(b)) {
      addResult({name: imageName, r: r, g: g, b: b});
    }
    mode.value = MODE_READY;
    // eslint-disable-next-line no-console
    console.log({
      bounds: bounds,
      sliceSize: sliceSize,
      slices: slices,
      sliceResults: responses,
      sums: [red, green, blue],
      pixels: pixels,
      averages: [r, g, b],
    });
  }).catch(() => {
    // eslint-disable-next-line no-alert
    alert('Error calculating average color');
  });
};

const calculateFromImage = () => {
  if (!ctx.value || !image.value) { return; }
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const imageData = ctx.value.getImageData(0, 0, width.value, height.value);
  for (let i = 0; i < imageData.data.length; i = i + 4) {
    red = red + (imageData.data[i] ** 2);
    green = green + (imageData.data[i + 1] ** 2);
    blue = blue + (imageData.data[i + 2] ** 2);
    count++;
  }

  const [r, g, b] = [red, green, blue].map(c => Math.sqrt(c / count));
  addResult({name: image.value.name, r: r, g: g, b: b});
  mode.value = MODE_READY;
};

export const calculate = () => {
  if (!image.value) { return; }
  mode.value = MODE_CALCULATING;
  if (paths.value.length > 0) {
    calculateFromPaths();
  } else {
    calculateFromImage();
  }
};
