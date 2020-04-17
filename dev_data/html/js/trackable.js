const trackables = [...document.querySelectorAll('.trackable')];
trackables.forEach(el => el.addEventListener('click', updateColor));

function updateColor(event) {
  const checkbox = event.target.closest('INPUT[type="checkbox"]');
  const trackable = event.target.closest('.trackable');
  // console.log();

  if (checkbox && checkbox.checked) {
    trackable.classList.add('trackable-checked');
    trackable
      .querySelector('.trackable__line-2')
      .classList.remove('trackable__line-2__hidden');
  } else if (checkbox && !checkbox.checked) {
    trackable.classList.remove('trackable-checked');
    trackable
      .querySelector('.trackable__line-2')
      .classList.add('trackable__line-2__hidden');
  }
}
