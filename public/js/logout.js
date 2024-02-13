/* eslint-disable*/
// const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) el.parentElement.removeChild(el);
// };

// // type is 'success' or 'error'
// const showAlert = (type, msg) => {
//   hideAlert();
//   const markup = `<div class="alert alert--${type}">${msg}</div>`;
//   document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//   window.setTimeout(hideAlert, 5000);
// };

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.assign('/'); //location.reload(true);
  } catch (err) {
    console.log('error');
  }
};
const loggedout = document.getElementById('logout');
if (loggedout) loggedout.addEventListener('click', logout);
