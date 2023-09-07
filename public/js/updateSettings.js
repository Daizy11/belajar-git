/* eslint-disable*/
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  const dt = { ...data };
  let options = { method: 'PATCH' };
  try {
    let url = '/api/v1/users/';
    if (type === 'data') {
      url += 'updateMe';
      let form = new FormData();
      form.append('name', dt.name);
      form.append('email', dt.email);
      form.append('photo', dt.photo);
      options.body = form;
    } else {
      url += 'updateMyPassword';
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(dt);
    }
 
    let response = await fetch(url, options);
    if (!response.ok) throw response;
    let data = await response.json();
 
    if (data.status === 'Success') {
      showAlert('success', `Updated User ${type} successfully`);
    }
  } catch (err) {
    err.text().then((errorMessage) => {
      showAlert('error', JSON.parse(errorMessage).message);
    });
  }
};
