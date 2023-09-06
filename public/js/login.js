/* eslint-disable*/
<<<<<<< HEAD


const login = async(email, password) => {
    console.log({email,password})
    try {
        const url = "http://localhost:3000/api/v1/users/login";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
       
        if(res.status === 200){
          alert('Loggin in successfully')
          window.setTimeout(()=>{
            location.assign('/')
          },1500)
        }
        console.log(res)
        }
    catch(err){
        alert(err.message)
    }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('tombol di tekan');
  login(email, password);
});
=======
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError'
import { showAlert } from './alerts';

  export const login = catchAsync(async (email, password) => {
    try {
      const url = 'http://127.0.0.1:3000/api/v1/users/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 200) {
        showAlert('success', 'Logged in successfully!');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }else {
        const data = await res.json(); // Parse the response JSON
        showAlert('error', data.message); // Assuming the server sends error messages as JSON with a 'message' field
      }
     
    } catch (err) {
      showAlert('error',err);
    }
  });

export const logout = async () => {
  try {
    const url = 'http://127.0.0.1:3000/api/v1/users/logout';
    const res = await fetch(url, {
      method: 'GET',
    });
    location.reload(); //force to reload server
  } catch (err) {
    showAlert('error', err);
  }
};
>>>>>>> 12c4885f (Initial commit)
