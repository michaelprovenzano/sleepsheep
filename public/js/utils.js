export const getId = (event, dataAttr) => {
  let id;
  const form = event.target.closest('form');
  form.getAttribute(dataAttr) ? (id = form.getAttribute(dataAttr)) : (id = '');
  return id;
};
