// #region Utils
// =============

const $ = (...args) => document.querySelector(...args);
const el = (tagName, attrs = {}, children = []) => {
  const result = tagName === 'rect'
    ? document.createElementNS(SVG_NS, tagName)
    : document.createElement(tagName);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style') {
      Object.assign(result.style, value);
    } else if (key.startsWith('on')) {
      result[key] = value;
    } else {
      result.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      result.appendChild(document.createTextNode(child));
    } else {
      result.appendChild(child);
    }
  }
  return result;
};

// #endregion

// #region DOM elements
// ====================

const loadFileEl = $('#load-file');
const calculateButtonEl = $('#calculate');
const pathColorEl = $('#path-color');
const fileInputEl = $('input');
const colorInputEl = $('#color-input');
const canvasEl = $('canvas');
const svgEl = $('svg');
const pathEl = $('path');
const resultsEl = $('#results');

// #endregion

// #region Constants
// =================

const READY = Symbol();
const DRAWING = Symbol();
const CALCULATING = Symbol();
const SVG_NS = 'http://www.w3.org/2000/svg';
const RECT_SIZE = 8;
const HALF_RECT_SIZE = RECT_SIZE / 2;

// #endregion

// #region State
// =============

let imageName = null;
let width = 0;
let height = 0;
let mode = READY;
let paths = [];
let currentPath = null;
const results = [];

// #endregion

const ctx = canvasEl.getContext('2d', {willReadFrequently: true});

// #region Toolbar
// ===============

const lockButtons = () => {
  fileInputEl.disabled = true;
  calculateButtonEl.disabled = true;
  colorInputEl.disabled = true;
};

const unlockButtons = () => {
  fileInputEl.disabled = false;
  calculateButtonEl.disabled = false;
  colorInputEl.disabled = false;
};

colorInputEl.onchange = () => {
  const x = colorInputEl.value;
  svgEl.style.setProperty('--rect', `${x}88`);
  svgEl.style.setProperty('--fill', `${x}22`);
  svgEl.style.setProperty('--stroke', `${x}33`);
};

loadFileEl.onclick = () => fileInputEl.click();
pathColorEl.onclick = () => colorInputEl.click();

// #endregion

window.onresize = () => {
  const ratio = Math.max(
    window.innerWidth / window.outerWidth,
    window.innerHeight / window.outerHeight
  );
  document.body.style.setProperty('--zoom', ratio);
};

window.onresize();


// #region Load image
// ==================

fileInputEl.onchange = () => {
  if (fileInputEl.files.length === 0) { return; }
  lockButtons();
  const fr = new FileReader();
  fr.onload = () => {
    const image = new Image();
    image.onload = () => setImage(image);
    image.src = fr.result;
  };
  fr.readAsDataURL(fileInputEl.files[0]);
};

const setImage = image => {
  imageName = fileInputEl.files[0].name;
  width = canvasEl.width = image.width;
  height = canvasEl.height = image.height;
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  ctx.drawImage(image, 0, 0, width, height);
  for (const path of paths) {
    for (const point of path) {
      svgEl.removeChild(point.rect);
    }
  }
  paths = [];
  currentPath = null;
  updatePath();
  unlockButtons();
};

// #endregion

// #region Drawing
// ===============

svgEl.oncontextmenu = evt => evt.preventDefault();
svgEl.onmousedown = evt => {
  if (mode === CALCULATING) { return; }
  if (evt.which === 1) { return handleLeftClick(evt); }
  if (evt.which === 3) { return handleRightClick(evt); }
};

window.onmousemove = evt => {
  if (mode === DRAWING) {
    updatePath(evt);
  }
};

const handleLeftClick = evt => {
  if (evt.target.tagName === 'rect') { return beginDragPoint(evt.target); }
  if (mode === DRAWING) { return addPoint(evt.offsetX, evt.offsetY); }
  if (mode === READY) { return beginPath(evt.offsetX, evt.offsetY); }
};

const handleRightClick = () => {
  if (mode === DRAWING) {
    if (currentPath.length < 3) { return cancelPath();}
    return endPath();
  }
};

const addPoint = (x, y) => {
  const rect = el('rect', {
    x: x - HALF_RECT_SIZE,
    y: y - HALF_RECT_SIZE,
  });
  svgEl.appendChild(rect);
  currentPath.push({x, y, rect});
  updatePath();
};

const beginPath = (x, y) => {
  mode = DRAWING;
  currentPath = [];
  paths.push(currentPath);
  lockButtons();
  addPoint(x, y);
};

const endPath = () => {
  mode = READY;
  currentPath = null;
  updatePath();
  unlockButtons();
};

const cancelPath = () => {
  currentPath.forEach(point => svgEl.removeChild(point.rect));
  paths.pop();
  endPath();
};

const updatePath = evt => {
  let d = '';
  for (const path of paths) {
    d += `M${path[0].x},${path[0].y}`;
    for (let i=1; i<path.length; i++) {
      d += `L${path[i].x},${path[i].y}`;
    }
  }
  if (mode === DRAWING && evt) {
    d += `L${evt.offsetX},${evt.offsetY}`;
  }
  paths.length > 0 && (d += 'Z');
  pathEl.setAttribute('d', d);
};

const pointFromRect = rect => {
  for (const path of paths) {
    for (const point of path) {
      if (point.rect === rect) {
        return point;
      }
    }
  }
};

const beginDragPoint = rect => {
  const point = pointFromRect(rect);
  if (!point) { return; }
  const dragMove = evt => {
    point.x = evt.offsetX;
    point.y = evt.offsetY;
    rect.setAttribute('x', evt.offsetX - HALF_RECT_SIZE);
    rect.setAttribute('y', evt.offsetY - HALF_RECT_SIZE);
    updatePath();
  };
  const dragEnd = () => {
    window.removeEventListener('mousemove', dragMove);
    window.removeEventListener('mouseup', dragEnd);
  };
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);
};

// #endregion

// #region Calculate
// =================

calculateButtonEl.onclick = () => {
  lockButtons();
  if (paths.length > 0) { return calculateFromPath(); }
  calculateFromImage();
};

const calculateFromPath = () => {
  const pathRect = pathEl.getBoundingClientRect();
  const svgRect = svgEl.getBoundingClientRect();
  const pathX = pathRect.x - svgRect.x;
  const pathY = pathRect.y - svgRect.y;
  const pathWidth = pathRect.width;
  const pathHeight = pathRect.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pathD = pathEl.getAttribute('d');
  const landscape = pathWidth > pathHeight;
  const threads = navigator.hardwareConcurrency ?? 4;
  const sliceSize = landscape ? Math.ceil(pathWidth / threads) : Math.ceil(pathHeight / threads);

  let workersPending = 0;
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const onMessage = evt => {
    for (const [r, g, b] of evt.data) {
      red += r ** 2;
      green += g ** 2;
      blue += b ** 2;
      count++;
    }
    workersPending--;
    if (workersPending === 0) {
      addResult(Math.sqrt(red / count), Math.sqrt(green / count), Math.sqrt(blue / count));
    }
  };

  if (landscape) {
    for (let x = pathX; x < pathX + pathWidth; x += sliceSize) {
      const worker = new Worker('./worker.js');
      worker.onmessage = onMessage;
      worker.postMessage({
        imageData,
        pathD,
        minX: x,
        maxX: Math.min(pathX + pathWidth, x + sliceSize),
        minY: pathY,
        maxY: pathY + pathHeight,
      });
      workersPending++;
    }
  } else {
    for (let y = pathY; y < pathY + pathHeight; y += sliceSize) {
      const worker = new Worker('./worker.js');
      worker.onmessage = onMessage;
      worker.postMessage({
        imageData,
        pathD,
        minX: pathX,
        maxX: pathX + pathWidth,
        minY: y,
        maxY: Math.min(pathY + pathHeight, y + sliceSize),
      });
      workersPending++;
    }
  }
};

const calculateFromImage = () => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    red += imageData.data[i] ** 2;
    green += imageData.data[i + 1] ** 2;
    blue += imageData.data[i + 2] ** 2;
    count++;
  }

  console.log(red, green, blue);

  addResult(Math.sqrt(red / count), Math.sqrt(green / count), Math.sqrt(blue / count));
};

// #endregion

// #region Results
// ===============

const addResult = (r, g, b) => {
  results.push({r, g, b, image: imageName});
  updateResults();
  unlockButtons();
};

const deleteResult = result => {
  results.splice(results.indexOf(result), 1);
  updateResults();
};

const handleMenuSelect = result => evt => {
  switch (evt.target.value) {
    case 'copy-hex': return copyHex(result);
    case 'copy-css-rgb': return copyCssRgb(result);
    case 'copy-css-rgb': return copyCssRgb(result);
    case 'copy-blender': return copyBlender(result);
    case 'delete': return deleteResult(result);
  }
  evt.target.value = '';
  evt.target.blur();
};

const showResultMenu = evt => {
  evt.preventDefault();
  console.log(evt.target);
  evt.target.querySelector('.result-menu').focus();
};

const updateResults = () => {
  resultsEl.innerHTML = '';
  for (const result of results) {
    const {r, g, b, image} = result;
    const dark = (r + g + b) / 3 < 128;
    const menuEl = el('select', {class: 'result-menu', value: '', onchange: handleMenuSelect(result)}, [
      el('option', {value: 'copy-hex'}, ['Copy as hex']),
      el('option', {value: 'copy-css-rgb'}, ['Copy as CSS rgb()']),
      el('option', {value: 'copy-blender'}, ['Copy as Blender color']),
      el('option', {value: 'delete'}, ['Delete']),
    ]);
    menuEl.value = '';
    resultsEl.appendChild(
      el('div', {
        class: `result ${dark ? 'result--dark' : ''}`,
        style: {
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
        },
        oncontextmenu: showResultMenu,
      }, [
        el('div', {class: 'result-name', title: image}, [image]),
        el('div', {class: 'button result-menu-button'}, [
          '▼',
          menuEl,
        ]),
      ])
    );
  }
};

// #endregion

// #region Copy result
// ===================

const copy = x => navigator.clipboard.writeText(x);

const copyHex = ({r, g, b}) => {
  copy(`#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`);
};

const copyCssRgb = ({r, g, b}) => {
  copy(`rgb(${[r, g, b].map(Math.round).join(', ')})`);
};

const sRgbToLinear = x => x <= 0.0404482362771082 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;

const copyBlender = ({r, g, b}) => {
  copy(`[${[r, g, b].map(x => sRgbToLinear(x / 255).toFixed(6)).join(', ')}, 1.000000]`);
};

// #endregion
