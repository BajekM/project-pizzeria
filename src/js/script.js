/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //////////console.log('newProduct: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /*generate HTML based on template */

      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML*/

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*find menu container*/

      const menuContainer = document.querySelector(select.containerOf.menu);

      /*add element to menu*/

      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      // /* find the clickable trigger (the element that should react to clicking) */

      // const clickableTrigger= thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */

      thisProduct.accordionTrigger.addEventListener('click', function(){

        /* prevent default action for event */

        event.preventDefault();

        /* toggle active class on element of thisProduct */

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

        /* find all active products */

        const activeProducts = document.querySelectorAll(classNames.menuProduct.wrapperActive);

        /* START LOOP: for each active product */

        for( let activeProduct in activeProducts) {

          /* START: if the active product isn't the element of thisProduct */

          if(activeProduct == thisProduct.element) {

            /* remove class active for the active product */

            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);

            /* END: if the active product isn't the element of thisProduct */
          }

        /* END LOOP: for each active product */
        }

      /* END: click event listener to trigger */
      });

    }

    initOrderForm(){
      const thisProduct = this;
      //////console.log('initOrderForm', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    /* // processOrder(){
    //   const thisProduct = this;
    //   //////console.log('processOrder', thisProduct);

    //   const formData = utils.serializeFormToObject(thisProduct.form);
    //   //////console.log('Form data', formData);


    //   /* set variable price to equal thisProduct.data.price */

    //   let price = thisProduct.data.price;

    //   /* przechodzimy bo wszystkich atrybutach */
    //   for(let param in formData) {

    //     //ustalamy jaką wartość w formData ma atrybut o nazwie "param"
    //     const paramValue = formData[param];
    //     //////console.log(param, paramValue);

    //     // przchodzimy po samych wyborach
    //     for(let option of paramValue) {

    //       const searchedParam = param;
    //       const searchedChoice = option;
    //       //////console.log(option);

    //       if(thisProduct.data.hasOwnProperty('params') && thisProduct.data.params.hasOwnProperty(searchedParam)) {
    //         const choice = thisProduct.data.params[searchedParam].options[searchedChoice];

    //         if(!choice.default) price = price + choice.price;

    //       }
    //     }

    //     if(thisProduct.data.hasOwnProperty('params') && thisProduct.data.params.hasOwnProperty(param)) {

    //       for(let choice in thisProduct.data.params[param].options) {

    //         const choiceValue = thisProduct.data.params[param].options[choice];
    //         //////console.log('Sprawdam opcje', choiceValue);
    //         //////console.log('Jest wybrana?', formData[param].includes(choice));
    //         //////console.log('Czy jest doyslna?', choiceValue.default);

    //         if(!formData[param].includes(choice) && choiceValue.default) {
    //           price = price - choiceValue.price;
    //         }
    //       }

    //     }

    //   }
    //   thisProduct.priceElem.innerHTML = price;
    // }

    //} */

    processOrder() {
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */

      const formData = utils.serializeFormToObject(thisProduct.form);

      /*make empty object an save it as thisProducr.params*/

      thisProduct.params = {};

      /* set variable price to equal thisProduct.data.price */

      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */

      for(let paramId in thisProduct.data.params){
        //////console.log('paramId', paramId);

        /* save the element in thisProduct.data.params with key paramId as const param */

        const param = thisProduct.data.params[paramId];
        //////console.log('param', param);

        /* START LOOP: for each optionId in param.options */

        for(let optionId in param.options){
          //////console.log('optionId', optionId);

          /* save the element in param.options with key optionId as const option */

          const option = param.options[optionId];
          //////console.log('option', option);

          /* START IF: if option is selected and option is not default */

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if (optionSelected && !option.default){

            /* add price of option to variable price */

            price = price + option.price;
            //////console.log('cena', price);

            /* END IF: if option is selected and option is not default */

          }

          /* START ELSE IF: if option is not selected and option is default */

          else if (!optionSelected && option.default){

            /* deduct price of option from price */

            price = price - option.price;
            //////console.log('cena', price);

            /* END ELSE IF: if option is not selected and option is default */

          }

          //generating images

          const image = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //////console.log('Obrazek', image);

          if(optionSelected){
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
          }


          if (optionSelected && image!=null){
            //////console.log('Zaznaczone:', image);
            image.classList.add(classNames.menuProduct.imageVisible);
          } else if (!optionSelected && image!=null){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }else {
            //////console.log('');
          }

          // }else {
          //   for(let image in allImages){
          //     //////console.log('Nie zaznaczone:', image);
          //     image.classList.remove(classNames.menuProduct.imageVisible);
          //   }
          // }

          /* END LOOP: for each optionId in param.options */

        }

        /* END LOOP: for each paramId in thisProduct.data.params */

      }

      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log('thisProduct.params', thisProduct.params);
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      //settings.amountWidget.defaultValue = 2;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      ////console.log('AmountWidget:', thisWidget);
      ////console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
        ////console.log('wartość', newValue);
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
        ////console.log('dodano 1');

      });

      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value - 1);

      });

    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });

      thisWidget.element.dispatchEvent(event);
    }


  }

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

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);


      //console.log('thisCardProduct', thisCartProduct);
      //console.log('productData', menuProduct);

      thisCartProduct.initAmountWidget();

      thisCartProduct.initActions();

    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(){
        event.preventDefault();
        thisCartProduct.remove();
        console.log('Wywołano metodę remove');
      });
    }

    getData() {
      const thisCartProduct = this;

      const singleProduct =  {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params
      };
      return singleProduct;
    }

  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      //////console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse) {
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /*save parsedResponse as thisApp.data.products */

          thisApp.data.products = parsedResponse;

          /*execute initMenu method*/
          thisApp.initMenu();
        });

      console.log('thisApp.data', thisApp.data);
    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);

      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      ////console.log('*** App starting ***');
      ////console.log('thisApp:', thisApp);
      ////console.log('classNames:', classNames);
      ////console.log('settings:', settings);
      ////console.log('templates:', templates);

      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();

    },
  };

  app.init();
}
