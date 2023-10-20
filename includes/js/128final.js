// global array to store object items from apiCall and one for cart items:
let myProductArray=[];
let myCartDisplay = [];

//Global variables:
let cartSubTotal;
let currencyRate=1;
let currency; //currency api json object
let currencyCode;
let shippingTotal;
let tax;
let orderTotal;
let submission; //submit json object through post

//api links:
const fakeProdURL ='https://fakestoreapi.com/products?';
const prodBackupURL='https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json';
const currencyURL ='https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json';

//regex:
const securityCodeReg= /^(\d{3}$)/; //only 3 digits
const creditCardReg = /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/;
const charOnlyReg = /^[A-za-z]{3,}$/; //characters only - at least 3 letters
const charCityReg = /^[A-za-z]{4,}$/; //characters only - at least 4 characters 
const addressReg =/(\s*?\w\s*?){6,}$/  //at least 6 characters long (but spaces ok - just not all spaces only)
const emailReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const postalCodeReg = /^([abceghj-nprstvxyABCEGHJ-NPRSTVXY][0-9][abceghj-nprstv-zABCEGHJ-NPRSTV-Z][0-9][abceghj-nprstv-zABCEGHJ-NPRSTV-Z][0-9])|([abceghj-nprstvxyABCEGHJ-NPRSTVXY][0-9][abceghj-nprstv-zABCEGHJ-NPRSTV-Z] [0-9][abceghj-nprstv-zABCEGHJ-NPRSTV-Z][0-9])$/;
const phoneNumReg =  /^(\d{10}$)|((\(\d{3}\))([ -/.])(\d{3})([ -/.])(\d{4}))|((\d{3})([ -/.])(\d{3})([ -/.])(\d{4}))$/;

//_________________________________________________________
//----------------Create an Items class--------------------
//_________________________________________________________
class Item{
  constructor(id, image, title, description, price){
    this._id = id;
    this._image = image;
    this._title = title;
    this._description = description;
    this._price = price;
  }
  //id getter/setter:
  set id(id){
    this._id = id;
  }

  get id(){
    return this._id;
  }
  //image getter/setter:
  set image(image){
    this._image = image;
  }

  get image(){
    return this._image;
  }
  //title getter/setter:
  set title(title){
    this._title = title;
  }

  get title(){
    return this._title;
  }
  //description getter/setter:
  set description(description){
    this._description = description;
  }

  get description(){
    return this._description;
  }
  //price getter/setter:
  set price(price){
    this._price = price;
  }

  get price(){
    return this._price;
  }
}

//_________________________________________________________
//______________________Function Definitions_______________
//_________________________________________________________
    
  //----function for cart item display:
  let showCartItems =() =>{
      //remove all existing item:
      $('tr.cartItem').remove();
      //repopulate table with current cart items array:
      for(let i=0; i<myCartDisplay.length;i++){
          let thePrice = (myCartDisplay[i]._price *currencyRate).toFixed(2);
          let CartItem = `
          <tr id="cartItem${i}" class="cartItem">
            <th scope="row">${i+1}</th>
            <td>${myCartDisplay[i]._title}</td>
            <td><span class="cartItemPrice">${thePrice}</span><span class="cartCurrencySymbole"></span></td>
            <td>1</td>
            <td><button id="${i+1001}" class="removeButton"><i class="fa-solid fa-xmark fa-2xl" style="color: #01bbf9;"></i></button></td>
          </tr>
            `
          document.querySelector("tbody#cartDisplayTable").insertAdjacentHTML("beforeend", CartItem);
      }

        // after above is loaded
        //delete individual item from cart button functionality:
      $(document).ready(()=>{
            $(".removeButton").click( function(){
              let itemToRemove = Number(this.id-1001); //get the id and convert it to a number (that will be its index in the array)
              myCartDisplay.splice(itemToRemove,1); //splice out that item
              showCartItems(); //call this function to update the cart display
              calcCartTotal();
            });
      });
  }

  //----display cart subtotal function:
  let calcCartTotal=() =>{
    upDateCurrency()
    try{
      cartSubTotal = 0.00;
      
      if (myCartDisplay.length ==0){
        cartSubTotal = 0.00;
        $('#displaySubtotal').html(cartSubTotal.toFixed(2));
      }
      else{
        for (let i =0; i<myCartDisplay.length; i++){
          cartSubTotal =cartSubTotal+ myCartDisplay[i]._price*currencyRate;
        }
        //cartSubTotal = cartSubTotal *currencyRate;
        $('#displaySubtotal').html(cartSubTotal.toFixed(2));
      }
      } catch (er){
      $('#api4Error').html("error calculating total price: "+ er);
    }
  }

 //----empty the cart function:
 let emptyCart = ()=>{
    let newEmptyArray = [];
    myCartDisplay = newEmptyArray; //myCartDisplay = empty array
    $('tr.cartItem').remove(); //remove all items from html table
    calcCartTotal(); //recalc and show new display total (0)
    showCartItems(); // this will remove all table elements since array is now empty
 }

   //---function for currency updates based on currency radio button selection
   function upDateCurrency(){
    try{
      if ($("#canadian").is(':checked')){
        currencyRate=1;
        ($('.itemCurrencySymbol').html(' $ CDN'));
        ($('.cartCurrencySymbole').html(' $ '));
        ($('#finalTotalCurrency').html(' $ CDN '));
        currencyCode ='cad';
      }
      else if($("#usa").is(':checked')){
        currencyRate= currency.cad.usd;
        ($('.itemCurrencySymbol').html(' $ US'));
        ($('.cartCurrencySymbole').html(' $'));
        ($('#finalTotalCurrency').html(' $ US'));
        currencyCode ='usd';
      }
      else{
        currencyRate= currency.cad.gbp;
        ($('.itemCurrencySymbol').html(' £'));
        ($('.cartCurrencySymbole').html(' £'));
        ($('#finalTotalCurrency').html(' £'));
        currencyCode ='gbp';
      }
    }catch (err){
      currencyRate = 1;
      currencyCode ="cad";
        $("#api3Error").html("Error with currency, all prices are in $ CND :" + err);
        $("#currencyErrorOffCan").html("Error with currency, all prices are in $ CND :");
    }
  }


//----------------API call to fake store API---START of async function--------------------
const getProducts = async(url) =>{
    let response = await fetch(url);
    let products = await response.json();
    
    for(let i=0; i<products.length;i++){
        //for each item in the Json array, create an HTML card  with relavant data (bootstrap responsive)
        let itemPrice = (products[i].price*currencyRate).toFixed(2);
        let myCard = `
          <div class="col-md-4 insertCard">
            <div id="card${i}" class="card">
              <img src="${products[i].image}" class="card-img-top" alt="${products[i].title} ">
              <div class="card-body">
                <h5 class="card-title">${products[i].title} </h5>
                <p class="card-text">${products[i].description} </p>
                <h4><span id ="item${i}Price" class="itemPrice"> ${itemPrice}</span><span class="itemCurrencySymbol"> $ CDN</span></h4>
                <a href="#/" id="${i}" class="btn btn-dark btn-outline-info addToCartButton">Add to Cart</a>
              </div>
            </div>
          </div>
        `
        //inserts the cards in the div with id 'productCards' one after another:
        document.querySelector("div#productCards").insertAdjacentHTML("beforeend", myCard); 
        //pass data to Items class constructor and add to myProductArray for later access:
        myProductArray[i] = new Item(products[i].id, products[i].image, products[i].title, products[i].description, products[i].price);
    }

    //---buttons created dynamically so button functionality defined after doc has fully loaded:
    $(document).ready( ()=>{
        //add items to cart when any add to cart button is clicked:
        $(".addToCartButton").click( function(){
            let buttonId = Number(this.id); //takes the id of whatever button was clicked, convert to Number and assign it to a variable
            myCartDisplay.push(myProductArray[buttonId]); //add product from product array at index 'id' to cart array
            showCartItems();
            calcCartTotal();
            upDateCurrency();
            $("#cartIsEmptyMessage").html("");
        });

        //if empty Cart button is clicked, run the empty cart function 
        $('#emptyCartButton').click( ()=>{
        emptyCart();
        })
        
        //update currency when a different currency radio button is selected.
        $("#currencyRadio").change(()=>{
          upDateCurrency();
          calcCartTotal();
          showCartItems();
          for (let i=0; i<myProductArray.length; i++){
            let currencyPrice = (myProductArray[i]._price* currencyRate).toFixed(2);
            document.getElementById(`item${i}Price`).innerHTML= currencyPrice;
          } 
        });
    });
  
    //---CheckoutButton functionality:
      //only open payment modal if cart is NOT empty
    $("#checkoutButton").click( function(){
        if( myCartDisplay.length==0){
          $("#cartIsEmptyMessage").html("Cart is empty, please select at least one item to continue");
        }
        else{
          $("#cartIsEmptyMessage").html("");
          $("#paymentModal").modal('show');
        }
    });
  }
//-------------------end of async function fakeProduct API------------------------



//----------------API call#2 to Currency API---START of async function--------------------

const getCurrency = async(url) =>{
  let responseCurr = await fetch(url);
  currency = await responseCurr.json();
}
//-------------------end of async function Currency API------------------------



//_________________________________________________________
//________________Regex and checkout validation____________
//_________________________________________________________

//------------------Payment modal validation-----------------

function validateCC(){
  let userCC= $('#ccInput').val();
  let CC = new RegExp(creditCardReg);

  if (CC.test(userCC)){
    $('#ccInput').css("border-color", "green");
    $('#ccError').empty(); //empty the error div
    return(userCC);
  }
  else{
    $('#ccInput').css("border-color", "red");
    $('#ccError').html("Please enter valid 16 digit CC with no spaces (starting with 4 or 5):").css("color","red");
    return("");
  }
}
function validateCode(){
  let userCode= $('#codeInput').val();
  let code = new RegExp(securityCodeReg);

  if (code.test(userCode)){
    $('#codeInput').css("border-color", "green");
    $('#securityCodeError').empty();
    return(userCode);
  }
  else{
    $('#codeInput').css("border-color", "red");
    $('#securityCodeError').html("Please enter your 3 digit security code with no spaces:").css("color","red");

    return("");
  }
}

function validateCCMonth(){
  let userCCMonth = $('#ccMonth').val();
  if (userCCMonth != "none"){
    $('#ccMonth').css("border-color", "green");
    return(userCCMonth);
  }
  else{
    $('#ccMonth').css("border-color", "red");
    return("");
  }
}
function validateCCYear(){
  let userCCYear = $('#ccYear').val();
  if (userCCYear != "none"){
    $('#ccYear').css("border-color", "green");
    return(userCCYear);
  }
  else{
    $('#ccYear').css("border-color", "red");
    return("");
  }
}
//---BUTTON - toBillingButton functionality:
//when clicked -only if all info on modal validated, go to next modal (Billing modal) 
$("#toBillingButton").on( "click", () =>{
  validateCC();
  validateCode();
  validateCCMonth();
  validateCCYear();

  if ((validateCC() != "") && (validateCode() != "") &&(validateCCMonth() != "") && (validateCCYear() != "")){
      $("#paymentModal").modal('hide');
      $("#billingModal").modal('show');
  }
});

//------------------Billing modal validation-----------------


function valFName(){
  let userfName= $('#fName').val();
  let fName = new RegExp(charOnlyReg);
  if (fName.test(userfName)){
    $('#fName').css("border-color", "green");
    $('#fNameError').empty();
    return(userfName);
  }
  else{
    $('#fName').css("border-color", "red");
    $('#fNameError').html("Please enter your first name with letters only and at least 3 characters:").css("color","red");
    return("");
  }
}

function valLName(){
  let userlName= $('#lName').val();
  let lName = new RegExp(charOnlyReg);
  if (lName.test(userlName)){
    $('#lName').css("border-color", "green");
    $('#lNameError').empty();
    return(userlName);
  }
  else{
    $('#lName').css("border-color", "red");
    $('#lNameError').html("Please enter your last name with letters only and at least 3 characters:").css("color","red");
    return("");
  }
}

function valEmail(){
  let userEmail= $('#email1').val();
  let email = new RegExp(emailReg);
  if (email.test(userEmail)){
    $('#email1').css("border-color", "green");
    $('#emailError').empty();
    return(userEmail);
  }
  else{
    $('#email1').css("border-color", "red");
    $('#emailError').html("Please enter valid email in abc@def.gh format:").css("color","red");
    return("");
  }
}

function valPhone(){
  let userPhone= $('#phoneNum').val();
  let phone = new RegExp(phoneNumReg);
  if (phone.test(userPhone)){
    $('#phoneNum').css("border-color", "green");
    $('#phoneError').empty();
    return(userPhone);
  }
  else{
    $('#phoneNum').css("border-color", "red");
    $('#phoneError').html("Please enter valid phone # with area code and no letters:").css("color","red");
    return("");
  }
}

function valBillAddress(){
  let userBillAddress= $('#billAddress').val();
  let billAddress = new RegExp(addressReg);
  if (billAddress.test(userBillAddress)){
    $('#billAddress').css("border-color", "green");
    $('#billError').empty();
    return(userBillAddress);
  }
  else{
    $('#billAddress').css("border-color", "red");
    $('#billError').html("Please enter valid address, this field must contain at lease 6 characters (letters and numbers only):").css("color","red");
    return("");
  }
}

function valCity(){
  let userCity= $('#city').val();
  let city = new RegExp(charCityReg);
  if (city.test(userCity)){
    $('#city').css("border-color", "green");
    $('#cityError').empty();

    return(userCity);
  }
  else{
    $('#city').css("border-color", "red");
    $('#cityError').html("Please enter your city name with at lease 4 characters and with letters only:").css("color","red");
    return("");
  }
}

function valProvince(){
  let userProvince = $('#province').val();
  if (userProvince != "none"){
    $('#province').css("border-color", "green");
    return(userProvince);
  }
  else{
    $('#province').css("border-color", "red");
    return("");
  }
}

function valCountry(){
  let userCountry= $('#country').val();
  if (userCountry!="none"){
    $('#country').css("border-color", "green");
    return(userCountry);
  }
  else{
    $('#country').css("border-color", "red");
    return("");
  }
}

function valPostalCode(){
  let userPostalCode= $('#postalCode1').val();
  let postalCode = new RegExp(postalCodeReg);

  if (postalCode.test(userPostalCode)){
    $('#postalCode1').css("border-color", "green");
    $('#postalError').empty();
    return(userPostalCode);
  }
  else{
    $('#postalCode1').css("border-color", "red");
    $('#postalError').html("Please enter valid postal code in A#A#A# format:").css("color","red");
    return("");
  }
}

//---BUTTON - toShippingButton functionality:
//when clicked -only if all info on modal validated, go to next modal (Billing modal) 
$("#toShippingButton").on( "click", () =>{
  valFName();
  valLName();
  valEmail();
  valPostalCode();
  valCountry();
  valCity();
  valProvince();
  valPhone()
  valBillAddress()

  if ((valFName() != "")&&
      (valLName() != "") &&
      (valEmail()!= "") &&
      (valPostalCode()!= "")&&
      (valCountry() != "") &&
      (valCity() !="")&&
      (valProvince()!="")&&
      (valPhone()!="") &&
      (valBillAddress() !="")){

      $("#billingModal").modal('hide');
      $("#shippingModal").modal('show');
  }
});


//------------------Shipping modal validation-----------------
//if checkbox is clicked - populate with same info as Billing if unchecked, clear the inputs:
$("#sameAsOption").change(()=>{
  if ($("#sameAsOption").is(':checked')){
    $("#fNameShipping").val(valFName());
    $("#lNameShipping").val(valLName());
    $("#provinceShipping").val(valProvince());
    $("#shippingAddress").val(valBillAddress());
    $("#cityShipping").val( valCity());
    $("#countryShipping").val(valCountry());
    $("#postalCode1Shipping").val(valPostalCode());
  }
  else{
    $("#fNameShipping").val("");
    $("#lNameShipping").val("");
    $("#provinceShipping").prop('selectedIndex',0);
    $("#shippingAddress").val("");
    $("#cityShipping").val("");
    $("#countryShipping").prop('selectedIndex',0);
    $("#postalCode1Shipping").val("");
  }
})

//using same Regex from Billing and Payment sections above:
function valFNameShipping(){
  let userfNameShip= $('#fNameShipping').val();
  let fNameShip = new RegExp(charOnlyReg);
  if (fNameShip.test(userfNameShip)){
    $('#fNameShipping').css("border-color", "green");
    $('#shipFNameError').empty();

    return(userfNameShip);
  }
  else{
    $('#fNameShipping').css("border-color", "red");
    $('#shipFNameError').html("Please enter your first name with letters only and at least 3 characters:").css("color","red");
    return("");
  }
}

function valLNameShipping(){
  let userlNameShip= $('#lNameShipping').val();
  let lNameShip = new RegExp(charOnlyReg);
  if (lNameShip.test(userlNameShip)){
    $('#lNameShipping').css("border-color", "green");
    $('#shipLNameError').empty();
    return(userlNameShip);
  }
  else{
    $('#lNameShipping').css("border-color", "red");
    $('#shipLNameError').html("Please enter your last name with letters only and at least 3 characters:").css("color","red");
    return("");
  }
}

function valAddressShipping(){
  let userShipAddress= $('#shippingAddress').val();
  let shipAddress = new RegExp(addressReg);
  if (shipAddress.test(userShipAddress)){
    $('#shippingAddress').css("border-color", "green");
    $('#shipAddressError').empty();

    return(userShipAddress);
  }
  else{
    $('#shippingAddress').css("border-color", "red");
    $('#shipAddressError').html("Please enter valid address, this field must contain at lease 6 characters (letters and numbers only):").css("color","red");

    return("");
  }
}

function valCityShipping(){
  let userCityShip= $('#cityShipping').val();
  let cityShip = new RegExp(charCityReg);
  if (cityShip.test(userCityShip)){
    $('#cityShipping').css("border-color", "green");
    $('#shipCityError').empty();
    return(userCityShip);
  }
  else{
    $('#cityShipping').css("border-color", "red");
    $('#shipCityError').html("Please enter your city at lease 4 characters long with letters only:").css("color","red");
    return("");
  }
}

function valProvinceShipping(){
  let userProvinceShip = $('#provinceShipping').val();
  if (userProvinceShip != "none"){
    $('#provinceShipping').css("border-color", "green");
    return(userProvinceShip);
  }
  else{
    $('#provinceShipping').css("border-color", "red");
    return("");
  }
}

function valCountryShipping(){
  let userCountryShipping= $('#countryShipping').val();

  if (userCountryShipping !="none"){
    $('#countryShipping').css("border-color", "green");
    return(userCountryShipping);
  }
  else{
    $('#countryShipping').css("border-color", "red");
    return("");
  }
}


function valPostalCodeShipping(){
  let userPostalCodeShipping= $('#postalCode1Shipping').val();
  let postalCodeShipping = new RegExp(postalCodeReg);

  if (postalCodeShipping.test(userPostalCodeShipping)){
    $('#postalCode1Shipping').css("border-color", "green");
    $('#shipPostalError').empty();
    return(userPostalCodeShipping);
  }
  else{
    $('#postalCode1Shipping').css("border-color", "red");
    $('#shipPostalError').html("Please enter valid postal code in A#A#A# format:").css("color","red");
    return("");
  }
}
//---BUTTON - toShippingButton functionality:
//when clicked -only if all info on modal validated, go to next modal (Billing modal) 
$("#toOrderButton").on( "click", () =>{
  valFNameShipping();
  valLNameShipping();
  valAddressShipping();
  valCityShipping();
  valProvinceShipping();
  valCountryShipping();
  valPostalCodeShipping();

  if ((valFNameShipping() != "")&&
      (valLNameShipping() != "") &&
      (valAddressShipping()!= "") &&
      (valCityShipping() != "")&&
      (valProvinceShipping() != "") &&
      (valCountryShipping() !="")&&
      (valPostalCodeShipping()!="")){

      $("#shippingModal").modal('hide');
      $("#orderModal").modal('show');
      showOrderConfirmation();
      }
});


//------------------Order Confirmation modal -----------------

    //---function for cart item display:
    let showOrderConfirmation =() =>{
      //remove all existing items:
      $('tr.finalItem').remove();
      //repopulate table with current cart items array:
      for(let i=0; i<myCartDisplay.length;i++){
          let theOrderPrice = (myCartDisplay[i]._price *currencyRate).toFixed(2);
          let finalOrderItems = `
          <tr id="finalItem${i}" class="finalItem">
            <th scope="row">${i+1}</th>
            <td>${myCartDisplay[i]._title}</td>
            <td><span class="finalItemPrice">${theOrderPrice}</span><span class="cartCurrencySymbole"></span></td>
            <td>1</td>
          </tr>
            `
          document.querySelector("tbody#finalOrder").insertAdjacentHTML("beforeend", finalOrderItems);
      }

      //show subtotal:
      $('#finalSubtotal').html(cartSubTotal.toFixed(2));

      //show shipping:
      shippingTotal = (5*myCartDisplay.length).toFixed(2);
      $('#finalShipping').html(shippingTotal);

      //show tax:
      shippingTotal = (5*myCartDisplay.length).toFixed(2);
      let taxRate;
      let area = $('#province').val();
      switch(area){
        case "AB":
          taxRate = (0.05);
          break;
        case "BC":
          taxRate = (0.12);
          break;
        case "MB":
          taxRate = (0.12);
          break;
        case "NB":
          taxRate = (0.15);
          break;
        case "NL":
          taxRate = (0.15);
          break;
        case "NT":
          taxRate = (0.05);
          break;
        case "NS":
          taxRate = (0.15);
          break;
        case "NU":
          taxRate = (0.05);
          break;
        case "ON":
          taxRate = (0.13);
          break;
        case "PE":
          taxRate = (0.15);
          break;
        case "QC":
          taxRate = (0.14975); //quebec always having to be extra.
          break;
        case "SK":
          taxRate = (0.11);
          break;
        case "YT":
          taxRate = (0.5);
          break;
        default:
          taxRate = (0.15);//just in case
      }
      tax = (cartSubTotal * taxRate).toFixed(2);
      $('#finalTax').html(tax);

      //show TOTAL:
      shippingTotal = (5*myCartDisplay.length).toFixed(2);
      orderTotal = (cartSubTotal+shippingTotal*1).toFixed(2);
      $('#finalTotal').html(orderTotal);
    }

//____________Create and submit the Json Object:________________________

function sendData(){
  submission = { 
    card_number: $('#ccInput').val().replace(/\s+/g, ''), //removes all the white spaces
    expiry_month: $('#ccMonth').val(),
    expiry_year: $('#ccYear').val(),
    security_code: $('#codeInput').val(),
    amount: orderTotal,
    currency: currencyCode,
    billing: {
        first_name: $('#fName').val(),
        last_name: $('#lName').val(),
        address_1: $('#billAddress').val(),
        address_2: '',
        city: $('#city').val(),
        province: $('#province').val(),
        country: 'CA',
        postal: $('#postalCode1').val().replace(/\s+/g, ''),
        phone: $('#phoneNum').val(),
        email: $('#email1').val(),
    },
    shipping: {
        first_name: $('#fNameShipping').val(),
        last_name: $('#lNameShipping').val(),
        address_1: $('#shippingAddress').val(),
        address_2: '',
        city: $('#cityShipping').val(),
        province: $('#provinceShipping').val(),
        country: 'CA',
        postal: $('#postalCode1Shipping').val().replace(/\s+/g, '')
    }
  }


  let theData = new FormData();
  theData.append('submission', JSON.stringify(submission));

  const post = async()=>{
      let submissionResponse = await fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', 
      { method: "POST", 
          cache: 'no-cache', 
          body: theData
      }) 

      let theStatus = await submissionResponse.json();
      //if successfull, clean up:
      if (theStatus.status =='SUCCESS'){
          $("#orderModal").modal('hide');
          $("#successModal").modal('show');
          //clear modal data 
          document.getElementById('paymentForm').reset();
          document.getElementById('billingForm').reset();
          document.getElementById('shippingForm').reset();
          $("#sameAsOption").prop('checked', false);//uncheck billig same as shipping checkbox on shipping modal
            emptyCart(); //empty the cart
            calcCartTotal(); //recalc and show new display total (0)
            showCartItems(); // this will remove all table elements since array is now empty
      
      }
      else{
          //error can be different so to show the error object as string in error display modal change it back to an json object and strip out special characters:
          $("#errorCode").html((JSON.stringify(theStatus.error)).replace(/[^a-zA-Z0-9 ]/g, ' ').toLowerCase());
          //close and open correct modals:
          $("#orderModal").modal('hide');
          $("#errorModal").modal('show');
      }
  }
  post();
}

//Confirm order button functionality:
//when clicked, it will send the data and clear the modal inputs and empty the cart
$('#confirmOrderButton').click(function(){
  try{
    sendData();
  
  } catch (error){
    $("#api2Error").html("Error sending Data: " + error);
  }
})

//____________Start the whole thing:________________________

try{
  getProducts(fakeProdURL);
} catch (ex){
  $("#api1Error").html("Error connecting to first APIs: "+ ex); 
  try{
    getProducts(prodBackupURL);
  } catch (er){
    $("#api2Error").html("Error connecting to secondary API " + er);
  }

} finally{
  getCurrency(currencyURL);//errors for this one are handled in upDateCurrency function
}
