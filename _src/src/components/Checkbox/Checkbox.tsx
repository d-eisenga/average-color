import {Signal} from '@preact/signals';
import clsx from 'clsx';
import {JSX} from 'preact/jsx-runtime';

import './Checkbox.scss';

export type CheckboxProps = (
  Omit<JSX.HTMLAttributes<HTMLInputElement>, 'value' | 'checked'> & {
    value: Signal<boolean>;
  }
);

export const Checkbox = ({class: cls, value, ...props}: CheckboxProps) => (
  <input
    type="checkbox"
    class={clsx('checkbox', cls)}
    checked={value.value}
    onChange={e => { value.value = e.currentTarget.checked; }}
    {...props}
  />
);
