import {batch} from '@preact/signals';
import {MODE_DRAWING, MODE_READY} from '../../constants';
import {Path, Point} from '../../types';
import {getId} from '../../utils/id';
import {mode, newPath, newPoint, paths} from '../state';

export const startNewPath = (x: number, y: number) => batch(() => {
  const id = getId();
  newPath.value = {
    id: id,
    name: `Path ${id}`,
    points: [{x: Math.round(x), y: Math.round(y)}],
  };
  newPoint.value = {x: Math.round(x), y: Math.round(y)};
  mode.value = MODE_DRAWING;
});

export const updateNewPoint = (x: number, y: number) => {
  if (!newPoint.value) { return; }
  newPoint.value = {x: Math.round(x), y: Math.round(y)};
};

export const commitNewPoint = (x: number, y: number) => {
  if (!newPath.value) { return; }
  newPath.value = {
    ...newPath.value,
    points: [...newPath.value.points, {x: Math.round(x), y: Math.round(y)}],
  };
};

export const cancelCurrentPath = () => batch(() => {
  newPath.value = null;
  newPoint.value = null;
  mode.value = MODE_READY;
});

export const commitCurrentPath = () => batch(() => {
  if (!newPath.value) { return; }
  paths.value = [
    ...paths.value,
    newPath.value,
  ];
  newPath.value = null;
  newPoint.value = null;
  mode.value = MODE_READY;
});

export const renamePath = (path: Path, name: string) => {
  const index = paths.value.indexOf(path);
  if (index === -1) { return; }
  paths.value = [
    ...paths.value.slice(0, index),
    {...path, name},
    ...paths.value.slice(index + 1),
  ];
};

export const deletePath = (path: Path) => {
  const index = paths.value.indexOf(path);
  if (index === -1) { return; }
  paths.value = [
    ...paths.value.slice(0, index),
    ...paths.value.slice(index + 1),
  ];
};

export const setPathPoints = (path: Path, points: Point[]) => {
  const index = paths.value.indexOf(path);
  if (index === -1) { return; }
  paths.value = [
    ...paths.value.slice(0, index),
    {...path, points},
    ...paths.value.slice(index + 1),
  ];
};
