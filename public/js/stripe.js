/* eslint-disable */

import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe('pk_test_51NJCPDSJto3yYpNWpRGuE7Se7jfLa0G10MKeWh8hPWAzBWpP1tCa3CJIHbTdQ9MeBYNx60CemDFdHmJ1goU9sQcC00M4w3GJ1Y');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
