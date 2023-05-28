import clsx from 'clsx';
import {JSX} from 'preact/jsx-runtime';

import './Button.scss';

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;

export const Button = ({class: cls, ...props}: ButtonProps) => (
  <button class={clsx('button', cls)} {...props} />
);
