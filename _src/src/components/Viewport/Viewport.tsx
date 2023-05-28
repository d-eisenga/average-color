import clsx from 'clsx';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {ZOOM_DEFAULT} from '../../constants';
import {panBy, zoomOnPosition} from '../../state/actions/editorActions';
import {height, pan, width, zoom, zoomIndex} from '../../state/state';

import './Viewport.scss';

export type ViewportProps = JSX.HTMLAttributes<HTMLDivElement>;

export const Viewport = ({
  class: cls,
  onWheelCapture,
  onMouseDownCapture,
  children,
  ...props
}: ViewportProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll: JSX.WheelEventHandler<HTMLDivElement> = useCallback(e => {
    e.preventDefault();
    const mouseX = e.clientX - e.currentTarget.offsetLeft;
    const mouseY = e.clientY - e.currentTarget.offsetTop;
    zoomOnPosition(
      mouseX,
      mouseY,
      e.deltaY < 0 ? 1 : -1
    );
    onWheelCapture?.(e);
  }, []);

  const handleMouseDown: JSX.MouseEventHandler<HTMLDivElement> = useCallback(evt => {
    if (evt.button !== 1) {
      onMouseDownCapture?.(evt);
      return;
    }

    evt.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      panBy(e.movementX, e.movementY);
    };

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    onMouseDownCapture?.(evt);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) { return; }
      if (e.ctrlKey && (e.code === 'Digit0' || e.code === 'Numpad0')) {
        zoomOnPosition(
          containerRef.current.clientWidth / 2,
          containerRef.current.clientHeight / 2,
          ZOOM_DEFAULT - zoomIndex.value
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      class={clsx('viewport', cls)}
      onWheelCapture={handleScroll}
      onMouseDownCapture={handleMouseDown}
      ref={containerRef}
      {...props}
    >
      <div
        class="viewport__mover"
        style={{
          width: width.value * zoom.value,
          height: height.value * zoom.value,
          transform: `translate(${pan.value.x}px, ${pan.value.y}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
