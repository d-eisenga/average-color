import clsx from 'clsx';
import {useCallback} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {MODE_DRAWING, MODE_READY} from '../../constants';
import {
  cancelCurrentPath,
  commitCurrentPath,
  commitNewPoint,
  startNewPath,
  updateNewPoint,
} from '../../state/actions/pathActions';
import {
  ctx,
  height,
  image,
  mode,
  newPath,
  newPoint,
  pan,
  paths,
  width,
  zoom,
} from '../../state/state';
import {EditorPath} from '../EditorPath/EditorPath';
import {Viewport} from '../Viewport/Viewport';

import './Editor.scss';

export type EditorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'onContextMenu'>;

type MouseHandler = JSX.EventHandler<JSX.TargetedMouseEvent<HTMLDivElement>>;

export const Editor = ({
  class: cls,
  onMouseDown,
  onMouseMove,
  ...props
}: EditorProps) => {
  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas) { ctx.value = canvas.getContext('2d', {willReadFrequently: true})!; }
  };

  const handleMouseDown: MouseHandler = useCallback(e => {
    e.preventDefault();

    const mouseX = (e.clientX - e.currentTarget.offsetLeft - pan.value.x) / zoom.value;
    const mouseY = (e.clientY - e.currentTarget.offsetTop - pan.value.y) / zoom.value;
    if (e.button === 0 && mode.value === MODE_READY) {
      startNewPath(mouseX, mouseY);
    } else if (e.button === 0 && mode.value === MODE_DRAWING) {
      commitNewPoint(mouseX, mouseY);
    } else if (e.button === 2 && mode.value === MODE_DRAWING && newPath.value) {
      if (newPath.value.points.length < 3) {
        cancelCurrentPath();
      } else {
        commitCurrentPath();
      }
    }
    onMouseDown?.(e);
  }, []);

  const handleMouseMove: MouseHandler = useCallback(e => {
    e.preventDefault();

    if (mode.value === MODE_DRAWING) {
      const mouseX = (e.clientX - e.currentTarget.offsetLeft - pan.value.x) / zoom.value;
      const mouseY = (e.clientY - e.currentTarget.offsetTop - pan.value.y) / zoom.value;
      updateNewPoint(mouseX, mouseY);
    }

    onMouseMove?.(e);
  }, []);

  if (!image.value) { return null; }

  return (
    <Viewport
      class={clsx('editor', cls)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onContextMenu={e => e.preventDefault()}
      {...props}
    >
      <div class="editor__canvas-wrapper">
        <canvas
          ref={canvasRef}
          class="editor__canvas"
          style={{imageRendering: zoom.value > 1 ? 'pixelated' : 'auto'}}
        />
        <svg
          class="editor__paths"
          viewBox={`0 0 ${width.value} ${height.value}`}
          style={{
            '--dash': `${5 / zoom.value}px`,
            '--stroke': `${1 / zoom.value}px`,
            '--point': `${8 / zoom.value}px`,
          }}
        >
          {paths.value.map(path => (
            <EditorPath key={path.id} path={path} />
          ))}
          {newPath.value && newPoint.value && (
            <EditorPath
              path={{...newPath.value, points: [...newPath.value.points, newPoint.value]}}
            />
          )}
        </svg>
      </div>
    </Viewport>
  );
};
