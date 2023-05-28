import {signal} from '@preact/signals';
import clsx from 'clsx';
import {useEffect, useMemo, useRef} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';

import './Popup.scss';

export type PopupProps = JSX.HTMLAttributes<HTMLDivElement> & {
  close: () => void;
  backgroundClass?: string;
};

const popupStack = signal<symbol[]>([]);

export const Popup = ({class: cls, close, children, backgroundClass, ...props}: PopupProps) => {
  const id = useMemo(() => Symbol('id'), []);
  useEffect(() => {
    popupStack.value = [...popupStack.value, id];
    return () => {
      popupStack.value = popupStack.value.filter(x => x !== id);
    };
  }, [id]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popupStack.value[popupStack.value.length - 1] === id) {
        popupStack.value = popupStack.value.filter(x => x !== id);
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) { return; }
    const {style} = ref.current;
    const {left, right, top, bottom, width, height} = ref.current.getBoundingClientRect();
    const {innerWidth, innerHeight} = window;
    if (width > innerWidth) {
      style.left = '0';
      style.right = '0';
    } else if (left < 0) {
      style.right = 'auto';
      style.left = '0';
    } else if (right > innerWidth) {
      style.left = 'auto';
      style.right = '0';
    }
    if (height > innerHeight) {
      style.top = '0';
      style.bottom = '0';
    } else if (top < 0) {
      style.bottom = 'auto';
      style.top = '0';
    } else if (bottom > innerHeight) {
      style.top = 'auto';
      style.bottom = '0';
    }
    style.visibility = 'visible';
  }, [ref.current]);

  return (
    <div class="popup-wrapper">
      <div class="popup" {...props}>
        <div class={clsx('popup__background', backgroundClass)} onClick={close} />
        <div class={clsx('popup__content', cls)} ref={ref}>
          {children}
        </div>
      </div>
    </div>
  );
};

