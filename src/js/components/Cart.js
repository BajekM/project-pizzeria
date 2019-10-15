import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();

    //console.log('New Cart', thisCart);

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    console.log('To: ', thisCart.dom.phone.value);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function() {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct) {
    const thisCart = this;

    /*generate HTML based on template */

    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHTML*/

    thisCart.element = utils.createDOMFromHTML(generatedHTML);

    /*add element to menu*/

    thisCart.dom.productList.appendChild(thisCart.element);

    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
    //console.log('thisCart.products', thisCart.products);

    /* calculate price and amount*/
    thisCart.update();
  }

  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let thisCartProduct of thisCart.products) {
      thisCart.subtotalPrice += thisCartProduct.price;
      thisCart.totalNumber += thisCartProduct.amount;
    }


    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('totalNumber: ', thisCart.totalNumber, 'subtotalPrice: ', thisCart.subtotalPrice, 'thisCart.totalPrice: ', thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys) {
      for(let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }

  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    const deleted = thisCart.products.splice(index, 1);

    console.log('Usunięto: ', deleted);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      products: []
    };

    for(const thisCartProduct of thisCart.products) {
      payload.products.push(thisCartProduct.getData());
    }

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
  }

}

export default Cart;