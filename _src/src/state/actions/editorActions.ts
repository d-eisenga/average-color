import {batch} from '@preact/signals';
import {MODE_READY, ZOOM_DEFAULT, ZOOM_LEVELS} from '../../constants';
import {image, mode, newPath, newPoint, pan, paths, zoomIndex} from '../state';

export const setImage = (name: string, el: HTMLImageElement) => batch(() => {
  image.value = {name, el};
  paths.value = [];
  newPath.value = null;
  newPoint.value = null;
  mode.value = MODE_READY;
  zoomIndex.value = ZOOM_DEFAULT;
  pan.value = {x: 0, y: 0};
});

export const zoomOnPosition = (
  centerX: number,
  centerY: number,
  zoomDelta: number
) => {
  const newZoomIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex.value + zoomDelta));
  if (newZoomIndex === zoomIndex.value) { return; }
  const newZoom = ZOOM_LEVELS[newZoomIndex];
  const zoomFactor = newZoom / ZOOM_LEVELS[zoomIndex.value];

  batch(() => {
    zoomIndex.value = newZoomIndex;
    pan.value = {
      x: centerX + ((pan.value.x - centerX) * zoomFactor),
      y: centerY + ((pan.value.y - centerY) * zoomFactor),
    };
  });
};

export const panBy = (dx: number, dy: number) => {
  pan.value = {
    x: pan.value.x + dx,
    y: pan.value.y + dy,
  };
};
