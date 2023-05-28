import {useSignal} from '@preact/signals';
import clsx from 'clsx';
import {ComponentChildren} from 'preact';
import {useCallback, useRef} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';

import './Details.scss';

export type DetailsProps = (
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'content'>
  & {
    summary: ComponentChildren;
    content: ComponentChildren;
  }
);

const calcDuration = (height: number) => Math.sqrt(height) * 15;

export const Details = ({class: cls, summary, content, ...props}: DetailsProps) => {
  const open = useSignal(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const setOpen = useCallback(() => {
    if (!wrapperRef.current || !contentRef.current) { return; }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    open.value = true;
    const height = contentRef.current.offsetHeight;
    const duration = calcDuration(height);
    wrapperRef.current.style.height = `${height}px`;
    wrapperRef.current.style.transitionDuration = `${duration}ms`;
    timeoutRef.current = setTimeout(() => {
      wrapperRef.current!.style.height = 'auto';
    }, duration);
  }, []);

  const setClosed = useCallback(() => {
    if (!wrapperRef.current || !contentRef.current) { return; }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    open.value = false;
    const height = contentRef.current.offsetHeight;
    const duration = calcDuration(height);
    wrapperRef.current.style.height = `${height}px`;
    wrapperRef.current.style.transitionDuration = `${duration}ms`;
    requestAnimationFrame(() => {
      wrapperRef.current!.style.height = '0';
    });
  }, []);

  const toggleOpen = useCallback(() => {
    if (open.value) {
      setClosed();
    } else {
      setOpen();
    }
  }, []);

  return (
    <div class={clsx('details', cls)} {...props}>
      <div class="details__summary" onClick={toggleOpen}>
        <div class="details__indicator">{open.value ? '▼' : '►'}</div>
        {summary}
      </div>
      <div class="details__content-wrapper" ref={wrapperRef}>
        <div class="details__content" ref={contentRef}>
          {content}
        </div>
      </div>
    </div>
  );
};
