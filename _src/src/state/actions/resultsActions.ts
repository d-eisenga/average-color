import {
  CHANNEL_FORMAT_FLOAT,
  CHANNEL_FORMAT_INT,
  RGB_FORMAT_BLENDER,
  RGB_FORMAT_CSS,
  RGB_FORMAT_HEX,
} from '../../constants';
import {Color} from '../../types';
import {channelFormat, convertSRGB, results, rgbFormat} from '../state';

export const addResult = (result: Color) => { results.value = [...results.value, result]; };

export const renameResult = (result: Color, name: string) => {
  const index = results.value.indexOf(result);
  if (index === -1) { return; }
  results.value = [
    ...results.value.slice(0, index),
    {...result, name},
    ...results.value.slice(index + 1),
  ];
};

export const removeResult = (result: Color) => {
  const index = results.value.indexOf(result);
  if (index === -1) { return; }
  results.value = [
    ...results.value.slice(0, index),
    ...results.value.slice(index + 1),
  ];
};

const copy = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {
    // eslint-disable-next-line no-alert
    alert('Failed to copy to clipboard.');
  });
};

const sRgbToLinear = (c: number) => (
  c <= 0.0404482362771082
    ? c / 12.92
    : ((c + 0.055) / 1.055) ** 2.4
);

const maybeConvertSRGB = (c: number) => convertSRGB.value ? sRgbToLinear(c) : c;

const toHexChannel = (c: number) => (
  Math.round(maybeConvertSRGB(c) * 255).toString(16).padStart(2, '0')
);
const toCssChannel = (c: number) => Math.round(maybeConvertSRGB(c) * 255).toString(10);
const toBlenderChannel = (c: number) => maybeConvertSRGB(c).toString(10);

export const copyRgb = ({r, g, b}: Color) => {
  const channels = [r, g, b].map(c => c / 255);
  switch (rgbFormat.value) {
    case RGB_FORMAT_HEX: {
      copy(`#${channels.map(toHexChannel).join('')}`);
      break;
    }
    case RGB_FORMAT_CSS: {
      copy(`rgb(${channels.map(toCssChannel).join(' ')})`);
      break;
    }
    case RGB_FORMAT_BLENDER: {
      copy(`[${channels.map(toBlenderChannel).join(', ')}, 1]`);
      break;
    }
  }
};

const copyChannel = (channel: 'r' | 'g' | 'b') => (result: Color) => {
  const c = result[channel];
  switch (channelFormat.value) {
    case CHANNEL_FORMAT_INT: {
      copy(Math.round(maybeConvertSRGB(c)).toString(10));
      break;
    }
    case CHANNEL_FORMAT_FLOAT: {
      copy(maybeConvertSRGB(c / 255).toString(10));
      break;
    }
  }
};

export const copyRed = copyChannel('r');
export const copyGreen = copyChannel('g');
export const copyBlue = copyChannel('b');
