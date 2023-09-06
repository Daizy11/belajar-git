/* eslint-disable*/
import { login,logout } from './login';
import '@babel/polyfill';
import { displayMap } from './mapBox';
import {updateSettings} from './updateSettings'
import {bookTour} from './stripe'

//DOM ELEMENT
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBTN = document.getElementById('book-tour')


//DELEGATION
if(bookBTN){
  bookBTN.addEventListener('click',e =>{
    e.target.textContent = 'Processing'
    const {tourId} = e.target.dataset //element was clicked, data-tour-id's value on tour pug
    console.log(tourId)
    bookTour(tourId)
  })
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm){
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async function (e) {
    if (!e.target.classList.contains('form-user-data')) {
      return;
    }
    e.preventDefault();
    // document.querySelector('.btn--save-settings').textContent = 'UPDATING...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];
    await updateSettings({ name, email, photo },'data' );
    // document.querySelector('.btn--save-settings').textContent = 'SAVE SETTINGS';
    location.reload(true);
  });
}


if(userPasswordForm){
  userPasswordForm.addEventListener('submit',async e =>{
    e.preventDefault()
    document.querySelector('.btn--save-password').innerHTML = "updating..."
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings({passwordCurrent,password,passwordConfirm},'password')

    document.querySelector('.btn--save-password').innerHTML = "Save password"
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';


  })
}

if (logOutBtn) logOutBtn.addEventListener('click',logout)