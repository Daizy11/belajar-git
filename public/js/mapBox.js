/* eslint-disable*/
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

var map = L.map('map', { zoomControl: true });
//to disable + - zoom
// var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  crossOrigin: '',
}).addTo(map);

const points = [];
locations.forEach((loc) => {
    console.log(loc)
//   const el = document.createElement('div');
//   el.className = 'marker';
//   L.marker({ content: el, pane: 'bottom' })
//     .addTo(map)
//     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//     .openPopup();
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .openPopup() // for display information while click
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
});

const bounds = L.latLngBounds(points).pad(0.5); //lintang-bujur
map.fitBounds(bounds);

map.scrollWheelZoom.disable(); //to disable zoom by mouse wheel
