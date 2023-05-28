import clsx from 'clsx';
import {ComponentChildren} from 'preact';
import {JSX} from 'preact/jsx-runtime';
import {Menu} from '../Menu/Menu';

import './SplitButton.scss';

export type SplitButtonProps = (
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
  & {
    button: ComponentChildren;
    options: ComponentChildren;
  }
);

export const SplitButton = ({class: cls, button, options, ...props}: SplitButtonProps) => (
  <div class={clsx('split-button', cls)} {...props}>
    {button}
    <Menu label="▼">
      {options}
    </Menu>
  </div>
);
