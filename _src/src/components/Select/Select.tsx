import {Signal, useComputed, useSignal} from '@preact/signals';
import clsx from 'clsx';
import {ComponentChildren} from 'preact';
import {useCallback} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {Button} from '../Button/Button';
import {Popup} from '../Popup/Popup';

import './Select.scss';

export type SelectOption<T> = {
  value: T;
  label: ComponentChildren;
};

export type SelectProps<T> = (
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'value' | 'children'> & {
    value: Signal<T>;
    options: SelectOption<T>[]
  }
);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const Select = <T extends unknown>({
  class: cls,
  value,
  options,
  ...props
}: SelectProps<T>) => {
  const isOpen = useSignal(false);
  const close = useCallback(() => { isOpen.value = false; }, [isOpen]);
  const selectedOption = useComputed(
    () => options.find(({value: optionValue}) => optionValue === value.value)
  );
  return (
    <div class={clsx('select', cls)} {...props}>
      <div class="select__box" onClick={() => { isOpen.value = !isOpen.value; }}>
        <div class="select__box-value">
          {selectedOption.value?.label ?? 'Select'}
          <div class="select_hidden">
            {options.map(({label}) => label)}
          </div>
        </div>
        <Button class="select__box-button">▼</Button>
      </div>
      {isOpen.value && (
        <Popup class="select__popup" close={close}>
          {options.map(({value: optionValue, label}) => (
            <div
              key={optionValue}
              class="select__option" onClick={() => {
                value.value = optionValue;
                close();
              }}
            >
              {label}
            </div>
          ))}
        </Popup>
      )}
    </div>
  );
};
