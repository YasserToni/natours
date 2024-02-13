/*eslint-disable*/
// const { default: axios } = require('axios');
// const stripe = Stripe(
//   'pk_test_51OhAKBHBhgk8Fu9SXczjlAqP0TSvhqPGyO4VW09nFC7q0GU42QwwtWGkbc9KYKJTq8aa8T9lau9FnjyDPnwcCfI000XbHgtjLR',
// );
var stripe = Stripe(
  'pk_test_51OhAKBHBhgk8Fu9SXczjlAqP0TSvhqPGyO4VW09nFC7q0GU42QwwtWGkbc9KYKJTq8aa8T9lau9FnjyDPnwcCfI000XbHgtjLR',
);

const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    alert('error', err);
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
