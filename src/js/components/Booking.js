import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor() {
    const thisBooking = this;

    thisBooking.render(document.querySelector(select.containerOf.booking));
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey     + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('bookings', bookings);
        //console.log('eventsCurrent',  eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('this.Booking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);


    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else{
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove(classNames.booking.tablePicked);


      table.addEventListener('updated', function(){
        //table.classList.remove(classNames.booking.tablePicked);
        thisBooking.updateDOM();
      });
    }
    //console.log('To:',thisBooking.booked);

  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    let startHour = '';

    if(isNaN(hour)){
      startHour = utils.hourToNumber(hour);
    }else {
      startHour = hour;
    }
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(parseInt(table));
    }

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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.bookButton = thisBooking.dom.wrapper.querySelector(select.booking.submit);

    thisBooking.dom.phoneInput = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.addressInput = thisBooking.dom.wrapper.querySelector(select.booking.address);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.bookButton.addEventListener('click', function(){
      event.preventDefault();
      thisBooking.sendOrder();
    });

    for(let table of thisBooking.dom.tables) {
      table.addEventListener('click', function(){
        const clickedElement = this;
        clickedElement.classList.toggle(classNames.booking.tablePicked);
        //thisBooking.bookedTableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);
      });
    }
  }


  sendOrder() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    thisBooking.dom.markedTables = thisBooking.dom.wrapper.querySelectorAll('.clicked');
    console.log('thisBooking.dom.markedTables', thisBooking.dom.markedTables);

    thisBooking.markedTablesIDs = [];
    for (let markedTable of thisBooking.dom.markedTables) {
      thisBooking.markedTablesIDs.push(markedTable.getAttribute(settings.booking.tableIdAttribute));
    }

    console.log('thisBooking.markedTablesIDs', thisBooking.markedTablesIDs);


    for (let markedTablesId of thisBooking.markedTablesIDs) {
      const payload = {
        date: thisBooking.date,
        hour: thisBooking.hour,
        table:  markedTablesId,
        peopleAmount: thisBooking.peopleAmount.value,
        duration: thisBooking.hoursAmount.value,
        phone: thisBooking.dom.phoneInput.value,
        adress: thisBooking.dom.addressInput.value,
      };

      console.log('payload',payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response) {
          return response.json();
        }) .then(function(parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });

      thisBooking.makeBooked(payload.date, utils.numberToHour(payload.hour), payload.duration, parseInt(payload.table));
      console.log('thisBookingBooked', thisBooking.booked);
    }
  }

}

export default Booking;
