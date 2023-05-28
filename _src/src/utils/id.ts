export const getId = (() => {
  let nextId = 1;
  return () => (nextId++).toFixed(0);
})();
