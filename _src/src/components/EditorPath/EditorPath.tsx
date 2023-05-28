import clsx from 'clsx';
import {useCallback} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {MODE_READY} from '../../constants';
import {setPathPoints} from '../../state/actions/pathActions';
import {mode, pan, zoom} from '../../state/state';
import {Path} from '../../types';
import {pointsToString} from '../../utils/pointsToString';

import './EditorPath.scss';

export type EditorPathProps = JSX.SVGAttributes<SVGGElement> & {
  path: Path;
};

export const EditorPath = ({class: cls, path, ...props}: EditorPathProps) => {
  const d = pointsToString(path.points);

  const handleMouseDown = useCallback((evt: JSX.TargetedMouseEvent<SVGRectElement>) => {
    if (mode.value !== MODE_READY || evt.button !== 0) { return; }
    evt.preventDefault();
    evt.stopPropagation();
    const rectEl = evt.currentTarget;
    const points = path.points;
    const pointIndex = parseInt(evt.currentTarget.dataset.pointIndex ?? '', 10);
    const groupEl = evt.currentTarget.closest<SVGGElement>('.editor-path');
    const path1El = groupEl?.querySelector<SVGPathElement>('.editor-path__path-1');
    const path2El = groupEl?.querySelector<SVGPathElement>('.editor-path__path-2');
    const viewportEl = evt.currentTarget.closest<HTMLDivElement>('.editor');
    if (
      !isFinite(pointIndex) ||
      !groupEl ||
      !path1El ||
      !path2El ||
      !viewportEl
    ) { return; }
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = Math.round((e.clientX - viewportEl.offsetLeft - pan.value.x) / zoom.value);
      const mouseY = Math.round((e.clientY - viewportEl.offsetTop - pan.value.y) / zoom.value);
      const newPoints = [
        ...points.slice(0, pointIndex),
        {x: mouseX, y: mouseY},
        ...points.slice(pointIndex + 1),
      ];
      const newD = pointsToString(newPoints);
      path1El.setAttribute('d', newD);
      path2El.setAttribute('d', newD);
      rectEl.setAttribute('x', `${mouseX}`);
      rectEl.setAttribute('y', `${mouseY}`);
    };
    const handleMouseUp = (e: MouseEvent) => {
      const mouseX = Math.round((e.clientX - viewportEl.offsetLeft - pan.value.x) / zoom.value);
      const mouseY = Math.round((e.clientY - viewportEl.offsetTop - pan.value.y) / zoom.value);
      const newPoints = [
        ...points.slice(0, pointIndex),
        {x: mouseX, y: mouseY},
        ...points.slice(pointIndex + 1),
      ];
      setPathPoints(path, newPoints);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [path]);

  return (
    <g class={clsx('editor-path', cls)} {...props}>
      <path class="editor-path__path-1" d={d} />
      <path class="editor-path__path-2" d={d} />
      {path.points.map((point, i) => (
        <rect
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          class="editor-path__point"
          x={point.x}
          y={point.y}
          data-point-index={i}
          onMouseDownCapture={handleMouseDown}
        />
      ))}
    </g>
  );
};
