import clsx from 'clsx';
import {JSX} from 'preact/jsx-runtime';
import {paths, results} from '../../state/state';
import {Details} from '../Details/Details';
import {Result} from '../Result/Result';
import {SidebarPath} from '../SidebarPath/SidebarPath';

import './Sidebar.scss';

export type SidebarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>;

export const Sidebar = ({class: cls, ...props}: SidebarProps) => (
  <div class={clsx('sidebar', cls)} {...props}>
    <Details
      summary="Results"
      content={
        results.value.map(result => (
          <Result key={result.name} class="sidebar__result" result={result} />
        ))
      }
    />
    <Details
      summary="Paths"
      content={
        paths.value.map(path => (
          <SidebarPath key={path.name} path={path} />
        ))
      }
    />
  </div>
);
