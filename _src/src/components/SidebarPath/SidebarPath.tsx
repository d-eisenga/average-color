import clsx from 'clsx';
import {useCallback, useMemo} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {deletePath, renamePath} from '../../state/actions/pathActions';
import {image} from '../../state/state';
import {Path} from '../../types';
import {pointsBounds} from '../../utils/pointsBounds';
import {pointsToString} from '../../utils/pointsToString';
import {squareBounds} from '../../utils/squareBounds';
import {Button} from '../Button/Button';

import './SidebarPath.scss';

export type SidebarPathProps = (
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
  & {
    path: Path;
  }
);

export const SidebarPath = ({class: cls, path, ...props}: SidebarPathProps) => {
  const bounds = useMemo(() => squareBounds(pointsBounds(path.points)), [path.points]);

  const handleNameChange = useCallback((e: JSX.TargetedEvent<HTMLInputElement>) => {
    renamePath(path, e.currentTarget.value);
  }, [path]);

  const handleNameKeyDown = useCallback((e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    switch (e.code) {
      case 'Escape': {
        e.currentTarget.value = path.name;
        e.currentTarget.blur();
        break;
      }
      case 'Enter':
      case 'NumpadEnter': {
        e.currentTarget.blur();
      }
    }
  }, [path]);

  return (
    <div class={clsx('sidebar-path', cls)} {...props}>
      <svg
        class="sidebar-path__thumbnail"
        viewBox={`${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`}
      >
        <defs>
          <clipPath id={`path-${path.id}`}>
            <path d={pointsToString(path.points)} />
          </clipPath>
        </defs>
        <image href={image.value?.el.src} clip-path={`url(#path-${path.id})`} />
      </svg>
      <input
        class="sidebar-path__name"
        type="text"
        value={path.name}
        onChange={handleNameChange}
        onKeyDown={handleNameKeyDown}
      />
      <Button class="sidebar-path__delete" onClick={() => deletePath(path)}>✖</Button>
    </div>
  );
};
