/* eslint-disable*/

const updatedata = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data,
    });
    if (res.data.status === 'success') {
      alert('Data updated successfully');
      location.reload(true);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
const updateData = document.querySelector('.form-user-data');
if (updateData)
  updateData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updatedata(form);
  });

// upate password
const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMyPassword',
      data: {
        passwordCurrent,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      alert('Password updated successfully');
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
const pass = document.querySelector('.form-user-settings');
if (pass)
  pass.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updatePassword(passwordCurrent, password, passwordConfirm);

    document.querySelector('.btn--save-password').textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
