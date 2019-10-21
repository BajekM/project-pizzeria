import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor() {
    const thisBooking = this;

    thisBooking.render(document.querySelector(select.containerOf.booking));
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;


    /*generate HTML based on template */

    const generatedHTML = templates.bookingWidget();

    /* create empty object thisBooking.dom */

    thisBooking.dom = {};

    /* save argument as a thisBooking.dom.wrapper */

    thisBooking.dom.wrapper = element;

    /* change generated HTML to wrapper inner */

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /* save element in wrapper matching to selector select.booking.peopleAmount as thisBooking.dom.peopleAmount */

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    /* save element in wrapper matching to selector select.booking.hoursAmount as thisBooking.dom.hoursAmount */

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);


    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;
