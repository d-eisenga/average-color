// #region Utils
// =============

const $ = (...args) => document.querySelector(...args);

const svgElements = ['svg', 'rect', 'path', 'g', 'image', 'defs', 'clipPath'];
const el = (tagName, attrs = {}, children = []) => {
  const isSvg = svgElements.includes(tagName);
  const result = isSvg
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

const getPathsBounds = _paths => {
  const result = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
  };
  for (const path of _paths) {
    for (const point of path.points) {
      result.left = Math.min(result.left, point.x);
      result.right = Math.max(result.right, point.x);
      result.top = Math.min(result.top, point.y);
      result.bottom = Math.max(result.bottom, point.y);
    }
  }
  return {
    left: Math.floor(result.left) - 1,
    right: Math.ceil(result.right) + 1,
    top: Math.floor(result.top) - 1,
    bottom: Math.ceil(result.bottom) + 1,
    width: result.right - result.left + 2,
    height: result.bottom - result.top + 2,
  };
}

// #endregion

// #region DOM elements
// ====================

const loadFileEl = $('#load-file');
const calculateButtonEl = $('#calculate');
const fileInputEl = $('input');
const canvasEl = $('canvas');
const svgEl = $('#editor-paths');
const resultsEl = $('#results');
const pathsEl = $('#paths');

// #endregion

// #region Constants
// =================

const READY = Symbol();
const DRAWING = Symbol();
const DRAGGING = Symbol();
const CALCULATING = Symbol();
const SVG_NS = 'http://www.w3.org/2000/svg';

// #endregion

// #region State
// =============

let image = null;
let imageName = null;
let width = 0;
let height = 0;
let mode = READY;
let paths = [];
let currentPath = null;
const results = [];

// #endregion

// #region Toolbar
// ===============

const lockButtons = () => {
  fileInputEl.disabled = true;
  calculateButtonEl.disabled = true;
};

const unlockButtons = () => {
  fileInputEl.disabled = false;
  calculateButtonEl.disabled = false;
};

loadFileEl.onclick = () => fileInputEl.click();

// #endregion

// #region Load image
// ==================

fileInputEl.onchange = () => {
  if (fileInputEl.files.length === 0) { return; }
  lockButtons();
  const fr = new FileReader();
  fr.onload = () => {
    const _image = new Image();
    _image.onload = () => {
      setImage(_image, fileInputEl.files[0].name);
      fileInputEl.value = null;
    };
    _image.src = fr.result;
  };
  fr.readAsDataURL(fileInputEl.files[0]);
};

const setImage = (_image, name) => {
  image = _image;
  imageName = name;
  width = canvasEl.width = _image.width;
  height = canvasEl.height = _image.height;
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  ctx.drawImage(_image, 0, 0, width, height);
  for (const path of paths) {
    svgEl.removeChild(path.groupEl);
  }
  paths = [];
  currentPath = null;
  updatePaths();
  unlockButtons();
};

// #endregion

// #region Drawing
// ===============

svgEl.oncontextmenu = evt => evt.preventDefault();
svgEl.onmousedown = evt => {
  if (imageName === null || mode === CALCULATING) { return; }
  if (evt.which === 1) { return handleLeftClick(evt); }
  if (evt.which === 3) { return handleRightClick(evt); }
};

window.onmousemove = evt => {
  if (mode === DRAWING) {
    updatePaths(evt);
  }
};

const handleLeftClick = evt => {
  if (evt.target.tagName === 'rect' && mode === READY) { return beginDragPoint(evt.target); }
  if (mode === DRAWING) { return addPoint(evt.offsetX, evt.offsetY); }
  if (mode === READY) { return beginPath(evt.offsetX, evt.offsetY); }
};

const handleRightClick = () => {
  if (mode === DRAWING) {
    if (currentPath.points.length < 3) { return cancelPath();}
    return endPath();
  }
};

const addPoint = (x, y) => {
  const rect = el('rect', {x, y, 'data-path-index': paths.length});
  currentPath.groupEl.appendChild(rect);
  currentPath.points.push({x, y, rect});
  updatePaths();
};

const beginPath = (x, y) => {
  mode = DRAWING;
  currentPath = {name: `Path ${paths.length + 1}`, points: []};
  const pathEl1 = el('path', {
    class: 'path1',
    onmouseenter: highlightPath(currentPath),
    onmouseleave: unhighlightPath(currentPath),
  });
  const pathEl2 = el('path', {class: 'path2'});
  const groupEl = el('g', {}, [pathEl1, pathEl2]);
  svgEl.appendChild(groupEl);
  Object.assign(currentPath, {pathEl1, pathEl2, groupEl});
  paths.push(currentPath);
  lockButtons();
  addPoint(x, y);
};

const endPath = () => {
  mode = READY;
  currentPath = null;
  updatePaths();
  unlockButtons();
};

const cancelPath = () => {
  svgEl.removeChild(currentPath.groupEl);
  paths.pop();
  endPath();
};

const pointFromRect = rect => {
  for (const path of paths) {
    for (const point of path.points) {
      if (point.rect === rect) {
        return point;
      }
    }
  }
};

const beginDragPoint = rect => {
  mode = DRAGGING;
  const point = pointFromRect(rect);
  if (!point) { return; }
  const dragMove = evt => {
    point.x = evt.offsetX;
    point.y = evt.offsetY;
    rect.setAttribute('x', evt.offsetX);
    rect.setAttribute('y', evt.offsetY);
    updatePaths();
  };
  const dragEnd = () => {
    window.removeEventListener('mousemove', dragMove);
    window.removeEventListener('mouseup', dragEnd);
    mode = READY;
    updatePaths();
  };
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);
};

// #endregion

// #region Paths
// =============

const renamePath = path => {
  const newName = prompt('New name:', path.name);
  if (!newName) { return; }
  path.name = newName;
  updatePaths();
};

const deletePath = path => {
  paths.splice(paths.indexOf(path), 1);
  svgEl.removeChild(path.groupEl);
  updatePaths();
}

const handlePathMenuSelect = path => evt => {
  switch (evt.target.value) {
    case 'rename': {renamePath(path); break;}
    case 'delete': {deletePath(path); break;}
  }
};

const squareBounds = bounds => {
  const {left, right, top, bottom, width, height} = bounds;
  const size = Math.max(width, height);
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  return {
    left: centerX - size / 2,
    right: centerX + size / 2,
    top: centerY - size / 2,
    bottom: centerY + size / 2,
    width: size,
    height: size,
  };
};

const addPathEl = path => {
  const menuEl = el('select', {class: 'dropdown', onchange: handlePathMenuSelect(path)}, [
    el('option', {value: 'rename'}, ['Rename']),
    el('option', {value: 'delete'}, ['Delete']),
  ]);
  const id = Math.random().toString(36).slice(2);
  menuEl.value = '';
  const bounds = squareBounds(getPathsBounds([path]));

  const sidebarEl = (
    el('div', {class: 'path'}, [
      el('svg', {
        class: 'path-thumbnail',
        viewBox: `${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`,
      }, [
        el('defs', {}, [
          el('clipPath', {id}, [
            el('path', {d: path.pathEl1.getAttribute('d')}),
          ]),
        ]),
        el('image', {href: image.src, x: 0, y: 0, width, height, 'clip-path': `url(#${id})`}),
      ]),
      el('div', {class: 'path-name', title: path.name}, [path.name]),
      el('div', {class: 'button dropdown-button'}, ['▼', menuEl]),
    ])
  );
  pathsEl.appendChild(sidebarEl);
  path.sidebarEl = sidebarEl;
};

const updatePaths = evt => {
  if (mode === READY) {
    pathsEl.innerHTML = '';
  }
  for (const path of paths) {
    let d = '';
    d += `M${path.points[0].x},${path.points[0].y}`;
    for (let i=1; i<path.points.length; i++) {
      d += `L${path.points[i].x},${path.points[i].y}`;
    }
    if (mode === DRAWING && path === currentPath && evt) {
      d += `L${evt.offsetX},${evt.offsetY}`;
    }
    d += 'Z';
    path.pathEl1.setAttribute('d', d);
    path.pathEl2.setAttribute('d', d);
    if (mode === READY) {
      if (path !== currentPath) {
        addPathEl(path);
      }
    }
  }
};

const highlightPath = path => () => {
  if (mode === DRAWING || !path) { return; }
  path.sidebarEl.classList.add('highlighted');
};

const unhighlightPath = path => () => {
  if (mode === DRAWING || !path) { return; }
  path.sidebarEl.classList.remove('highlighted');
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
  const pathsBounds = getPathsBounds(paths);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pathsD = paths.map(path => path.pathEl1.getAttribute('d')).join('');
  const landscape = pathsBounds.width > pathsBounds.height;
  const threads = navigator.hardwareConcurrency ?? 4;
  const sliceSize = landscape ? Math.ceil(pathsBounds.width / threads) : Math.ceil(pathsBounds.height / threads);

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
    for (let x = pathsBounds.left; x < pathsBounds.right; x += sliceSize) {
      const worker = new Worker('./worker.js');
      worker.onmessage = onMessage;
      worker.postMessage({
        imageData,
        pathsD,
        minX: x,
        maxX: Math.min(pathsBounds.right, x + sliceSize),
        minY: pathsBounds.top,
        maxY: pathsBounds.bottom,
      });
      workersPending++;
    }
  } else {
    for (let y = pathsBounds.top; y < pathsBounds.bottom; y += sliceSize) {
      const worker = new Worker('./worker.js');
      worker.onmessage = onMessage;
      worker.postMessage({
        imageData,
        pathsD,
        minX: pathsBounds.left,
        maxX: pathsBounds.right,
        minY: y,
        maxY: Math.min(pathsBounds.right, y + sliceSize),
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

  addResult(Math.sqrt(red / count), Math.sqrt(green / count), Math.sqrt(blue / count));
};

// #endregion

// #region Results
// ===============

const addResult = (r, g, b) => {
  results.push({r, g, b, name: imageName});
  updateResults();
  unlockButtons();
};

const deleteResult = result => {
  results.splice(results.indexOf(result), 1);
  updateResults();
};

const renameResult = result => {
  const newName = prompt('New name:', result.name);
  if (!newName) { return; }
  result.name = newName;
  updateResults();
};

const handleResultMenuSelect = result => evt => {
  switch (evt.target.value) {
    case 'copy-hex': {copyHex(result); break;}
    case 'copy-css-rgb': {copyCssRgb(result); break;}
    case 'copy-css-rgb': {copyCssRgb(result); break;}
    case 'copy-blender': {copyBlender(result); break;}
    case 'rename': {renameResult(result); break;}
    case 'delete': {deleteResult(result); break;}
  }
  evt.target.value = '';
  evt.target.blur();
};

const addResultEl = (result, allowDelete = true) => {
  const {r, g, b, name} = result;
  const dark = (r + g + b) / 3 < 128;
  const menuEl = el('select', {class: 'dropdown', onchange: handleResultMenuSelect(result)}, [
    el('option', {value: 'copy-hex'}, ['Copy as hex']),
    el('option', {value: 'copy-css-rgb'}, ['Copy as CSS rgb()']),
    el('option', {value: 'copy-blender'}, ['Copy as Blender color']),
    ...(allowDelete ? [
      el('option', {value: 'rename'}, ['Rename']),
      el('option', {value: 'delete'}, ['Delete']),
    ] : []),
  ]);
  menuEl.value = '';
  resultsEl.appendChild(
    el('div', {
      class: `result ${dark ? 'result--dark' : ''}`,
      style: {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
      },
    }, [
      el('div', {class: 'result-name', title: name}, [name]),
      el('div', {class: 'button dropdown-button'}, [
        '▼',
        menuEl,
      ]),
    ])
  );
};

const updateResults = () => {
  resultsEl.innerHTML = '';
  for (const result of results) {
    addResultEl(result);
  }
  if (results.length > 1) {
    const [r, g, b] = results.reduce(
      ([ra, ga, ba], {r, g, b}) => [ra + r ** 2, ga + g ** 2, ba + b ** 2],
      [0, 0, 0]
    ).map(x => Math.sqrt(x / results.length));
    addResultEl({r, g, b, name: 'Average of all results'}, false);
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

const ctx = canvasEl.getContext('2d', {willReadFrequently: true});

window.onresize = () => {
  const ratio = Math.max(
    window.innerWidth / window.outerWidth,
    window.innerHeight / window.outerHeight
  );
  document.body.style.setProperty('--zoom', ratio);
};

window.onresize();
