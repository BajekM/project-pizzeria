import {templates, select, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

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

    // app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
