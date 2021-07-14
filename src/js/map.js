const map = document.querySelector('.map');
const addresses = Array.from(map.querySelectorAll(".map__address"))
const images = Array.from(map.querySelectorAll(".map__preview img"))

addresses.forEach((address, index) => {
  address.addEventListener('click', (e) => {
    e.preventDefault;

    addresses.forEach(address => address.classList.remove('map__address-active'))
    images.forEach(img => img.classList.remove('view'))
    
    let currentImg = e.target.id.split('-')[1] - 1;

    e.target.classList.add('map__address-active');
    images[currentImg].classList.add('view');
  })
})