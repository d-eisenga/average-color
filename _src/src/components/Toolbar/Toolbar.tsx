import {useSignal} from '@preact/signals';
import clsx from 'clsx';
import {useCallback} from 'preact/hooks';
import {JSX} from 'preact/jsx-runtime';
import {MODE_READY} from '../../constants';
import {calculate} from '../../state/actions/calculateActions';
import {setImage} from '../../state/actions/editorActions';
import {image, mode, zoom} from '../../state/state';
import {Button} from '../Button/Button';
import {FilePicker} from '../FilePicker/FilePicker';
import {Settings} from '../Settings/Settings';

import './Toolbar.scss';

export type ToolbarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>;

export const Toolbar = ({class: cls, ...props}: ToolbarProps) => {
  const showSettings = useSignal(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => setImage(file.name, img);
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div class={clsx('toolbar', cls)} {...props}>
      <FilePicker disabled={mode.value !== MODE_READY} onChange={handleFileChange} />
      <pre>{Math.round(zoom.value * 1000) / 10}%</pre>
      <Button
        disabled={mode.value !== MODE_READY || !image.value}
        onClick={calculate}
      >
        Get average color
      </Button>
      <div>
        <Button onClick={() => { showSettings.value = true; }}>Settings</Button>
        {showSettings.value && (
          <Settings close={() => { showSettings.value = false; }} />
        )}
      </div>
    </div>
  );
};
