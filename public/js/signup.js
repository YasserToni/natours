/* eslint-disable*/

const signup = async (name, email, password, passwordConfirm) => {
  try {
    console.log(name, email, password, passwordConfirm);
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      // alert(
      //   'Verifiy your email first (Verification sent to email), and then try to login',
      // );
      alert('signup successfully');
      window.setTimeout(() => {
        // location.assign('/login');
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    console.log(err.response.data);
    alert('try again with anthor name or email');
  }
};
const signupForm = document.querySelector('.signup');
if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name1').value;
    const email = document.getElementById('email1').value;
    const password = document.getElementById('password1').value;
    const passwordConfirm = document.getElementById('passwordConfirm1').value;
    signup(name, email, password, passwordConfirm);
  });
