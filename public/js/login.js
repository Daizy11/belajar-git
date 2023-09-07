/* eslint-disable*/


import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError'
import { showAlert } from './alerts';

  export const login = catchAsync(async (email, password) => {
    try {
      const url = '/api/v1/users/login';
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
    const url = '/api/v1/users/logout';
    const res = await fetch(url, {
      method: 'GET',
    });
    location.reload(); //force to reload server
  } catch (err) {
    showAlert('error', err);
  }
};
