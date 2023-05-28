import {useSignal} from '@preact/signals';
import {clsx} from 'clsx';
import {ComponentChildren} from 'preact';
import {JSX} from 'preact/jsx-runtime';
import {Button} from '../Button/Button';
import {Popup} from '../Popup/Popup';

import './Menu.scss';

export type MenuProps = JSX.HTMLAttributes<HTMLDivElement> & {
  label: ComponentChildren;
};

export const Menu = ({class: cls, label, children, ...props}: MenuProps) => {
  const isOpen = useSignal(false);
  const handleClose = () => { isOpen.value = false; };

  return (
    <div class={clsx('menu', cls)} {...props}>
      <Button onClick={() => { isOpen.value = true; }}>{label}</Button>
      {isOpen.value && (
        <Popup class="menu__popup" close={handleClose} onClick={handleClose}>
          {children}
        </Popup>
      )}
    </div>
  );
};

export type MenuItemProps = JSX.HTMLAttributes<HTMLDivElement>;
export const MenuItem = ({class: cls, ...props}: MenuItemProps) => (
  <div class={clsx('menu-item', cls)} {...props} />
);
