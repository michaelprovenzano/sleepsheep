export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.classList.add('alert--hide');
    window.setTimeout(() => el.parentElement.removeChild(el), 500);
  }
};

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('nav').insertAdjacentHTML('beforeend', markup);
  window.setTimeout(hideAlert, 2500);
};
