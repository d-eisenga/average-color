import clsx from 'clsx';
import {useCallback} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {
  copyBlue,
  copyGreen,
  copyRed,
  copyRgb,
  removeResult,
  renameResult,
} from '../../state/actions/resultsActions';
import {Color} from '../../types';
import {Button} from '../Button/Button';
import {MenuItem} from '../Menu/Menu';
import {SplitButton} from '../SplitButton/SplitButton';

import './Result.scss';

export type ResultProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'style'> & {
  result: Color;
  style?: JSX.CSSProperties;
};

export const Result = ({
  class: cls,
  style = {},
  result,
  ...props
}: ResultProps) => {
  const {r, g, b, name} = result;
  const dark = r + g + b < 384;

  const handleNameChange = useCallback((e: JSX.TargetedEvent<HTMLInputElement>) => {
    renameResult(result, e.currentTarget.value);
  }, [result]);

  const handleNameKeyDown = useCallback((e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
    switch (e.code) {
      case 'Escape': {
        e.currentTarget.value = result.name;
        e.currentTarget.blur();
        break;
      }
      case 'Enter':
      case 'NumpadEnter': {
        e.currentTarget.blur();
      }
    }
  }, [result]);

  return (
    <div
      class={clsx('result', dark && 'result--dark', cls)}
      style={{backgroundColor: `rgb(${r}, ${g}, ${b})`, ...style}}
      {...props}
    >
      <input
        class="result__name"
        type="text"
        value={name}
        onChange={handleNameChange}
        onKeyDown={handleNameKeyDown}
      />
      <SplitButton
        button={<Button onClick={() => copyRgb(result)}>Copy</Button>}
        options={(
          <>
            <MenuItem onClick={() => copyRed(result)}>Copy Red</MenuItem>
            <MenuItem onClick={() => copyGreen(result)}>Copy Green</MenuItem>
            <MenuItem onClick={() => copyBlue(result)}>Copy Blue</MenuItem>
            <MenuItem onClick={() => removeResult(result)}>Delete</MenuItem>
          </>
        )}
      />
    </div>
  );
};
