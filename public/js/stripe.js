import { showAlert } from './alerts';

export const bookTour = async (tourID) => {
  try {
    const stripe = Stripe(
      'pk_test_51NmfEyAud4S6ER4emv2nO0hFMCoYfAvT5BKOA0OWWpjTpxAnfkEpbNCdA61DbDf5BrCAhkrOoVcFqvKbxEp7JO1n00rFE4WgRf'
    );
    // 1. Get checkout session from API
    const session = await fetch(
      `/api/v1/bookings/checkout-session/${tourID}`
    ).then(function (response) {
      return response.json();
    })

    console.log(session);
    // 2. create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
