const menu = document.querySelector('.header__menu')
const menu_icon = menu.querySelector('.menu__icon')
const menu_body = menu.querySelector('.menu__body')

menu_icon.addEventListener('click', (e) => {
  e.preventDefault;

  menu_icon.classList.toggle('active')
  menu_body.classList.toggle('active')
})