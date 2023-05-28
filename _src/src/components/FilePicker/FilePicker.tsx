import clsx from 'clsx';
import {useCallback, useRef} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {Button} from '../Button/Button';

import './FilePicker.scss';

export type FilePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> & {
  onChange?: (file: File | null) => void;
  disabled?: boolean;
};

export const FilePicker = ({class: cls, onChange, disabled, ...props}: FilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handleChange = useCallback((e: JSX.TargetedEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] ?? null;
    onChange?.(file);
    e.currentTarget.value = '';
  }, []);

  return (
    <div class={clsx('file-picker', cls)} {...props}>
      <Button disabled={disabled} onClick={handleClick}>Load file</Button>
      <input
        class="file-picker__input"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
};
