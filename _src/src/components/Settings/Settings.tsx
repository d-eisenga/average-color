import clsx from 'clsx';
import {JSX} from 'preact/jsx-runtime';
import {
  CHANNEL_FORMAT_FLOAT,
  CHANNEL_FORMAT_INT,
  RGB_FORMAT_BLENDER,
  RGB_FORMAT_CSS,
  RGB_FORMAT_HEX,
} from '../../constants';
import {channelFormat, convertSRGB, rgbFormat} from '../../state/state';
import {Checkbox} from '../Checkbox/Checkbox';
import {Popup} from '../Popup/Popup';
import {Select} from '../Select/Select';

import './Settings.scss';

export type SettingsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> & {
  close: () => void;
};

type OptionProps = JSX.HTMLAttributes<HTMLDivElement>;
const Option = ({class: cls, ...props}: OptionProps) => (
  <div class={clsx('settings__option', cls)} {...props} />
);

type CodeProps = JSX.HTMLAttributes<HTMLPreElement>;
const Code = ({class: cls, ...props}: CodeProps) => (
  <pre class={clsx('settings__code', cls)} {...props} />
);

export const Settings = ({class: cls, ...props}: SettingsProps) => (
  <Popup
    class={clsx('settings', cls)}
    backgroundClass="settings__background"
    {...props}
  >
    <h2>Color format</h2>
    <Select
      value={rgbFormat} options={[
        {value: RGB_FORMAT_HEX, label: <Option>Hex (<Code>#ff8000</Code>)</Option>},
        {value: RGB_FORMAT_CSS, label: <Option>CSS (<Code>rgb(255 128 0)</Code>)</Option>},
        {value: RGB_FORMAT_BLENDER, label: <Option>Blender (<Code>[1, 0.5, 0, 1]</Code>)</Option>},
      ]}
    />
    <h2>Single channel format</h2>
    <Select
      value={channelFormat} options={[
        {value: CHANNEL_FORMAT_INT, label: <Option>Integer (<Code>255</Code>)</Option>},
        {value: CHANNEL_FORMAT_FLOAT, label: <Option>Float (<Code>1.0</Code>)</Option>},
      ]}
    />
    <h2>Convert sRGB to linear</h2>
    <Checkbox value={convertSRGB} />
  </Popup>
);
