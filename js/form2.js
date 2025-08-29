


/**
 * Card Validation with Spreedly iFrame
 */

const style = 'color: #212529; font-size: 1rem; line-height: 1.5; font-weight: 400;width: calc(100% - 20px); height: calc(100% - 2px); position: absolute;padding: 0.13rem .75rem';

// set placeholders and styles for iframe fields to make UI style
Spreedly.on("ready", function() {
    Spreedly.setFieldType('text');
    Spreedly.setPlaceholder('cvv', "CVV");
    Spreedly.setPlaceholder('number', "Card Number");
    Spreedly.setNumberFormat('prettyFormat');
    Spreedly.setStyle('cvv', style);
    Spreedly.setStyle('number', style);

    btnCC.removeAttribute('disabled');
});

// handle form submit and tokenize the card
function submitPaymentForm() {
    // reset form when submit, only for demo page, can ignore
    cardErrBlock.innerHTML = '';
    // Get required, non-sensitive, values from host page
    var requiredFields = {};
    requiredFields["first_name"] = formDataObject.user.first_name;
    requiredFields["last_name"] = formDataObject.user.last_name;
    requiredFields["month"] = expMonth.value;
    requiredFields["year"] = expYear.value;

    Spreedly.tokenizeCreditCard(requiredFields);

}

// handle tokenization errors from spreedly to show to end user
Spreedly.on('errors', function(errors) {
    console.log('Card validation fail', errors);
    let error_html = '';
    errors.forEach(element => {
        error_html += `${element.message}<br/>`;

        if (element["attribute"] == "number") {
            numberParent.classList.add("is-invalid");
            numberParent.classList.remove("is-valid");
        } else {
            numberParent.classList.remove("is-invalid");

        }
        if (element["attribute"] == "month") {

            expMonth.classList.add("is-invalid");
            document.querySelector('.is-invalid').focus();

        } else {
            expMonth.classList.remove("is-invalid");

        }
        if (element["attribute"] == "year") {

            expYear.classList.add("is-invalid");
            document.querySelector('.is-invalid').focus();

        } else {
            expYear.classList.remove("is-invalid");

        }
    });

    if (error_html) {
        cardErrBlock.innerHTML = `
                <div class="alert alert-danger">
                    ${error_html}
                </div>
            `;
    }

    btnCC.removeAttribute('disabled');
});

Spreedly.on('fieldEvent', function(name, type, activeEl, inputProperties) {

    if (type == "input" && name == "number") {
        if (inputProperties["validNumber"]) {
            Spreedly.setStyle('number', "background-color: #CDFFE6;")
            numberParent.classList.remove("is-invalid");
        } else {
            Spreedly.setStyle('number', "background-color: transparent;")
            numberParent.classList.remove("is-invalid");
            cardErrBlock.innerHTML = ``;
        }
    } else if (type == "input" && name == "cvv") {
        if (inputProperties["validCvv"]) {
            Spreedly.setStyle('cvv', "background-color: #CDFFE6;")
            cvvParent.classList.remove("is-invalid");
        } else {
            Spreedly.setStyle('cvv', "background-color: transparent")
            cvvParent.classList.remove("is-invalid");
            cardErrBlock.innerHTML = ``;
        }
    }

});

Spreedly.on('validation', function(inputProperties) {

    if (!inputProperties["validNumber"]) {
        numberParent.classList.add("is-invalid");
        Spreedly.transferFocus("number");
        numberParent.classList.remove("is-valid");
        cardErrBlock.innerHTML = `
                    <div class="alert alert-danger">
                        Please enter a valid card number
                    </div>
                `;
    } else if (!inputProperties["validCvv"]) {

        cvvParent.classList.add("is-invalid");
        Spreedly.transferFocus("cvv");
        cvvParent.classList.remove("is-valid");
        cardErrBlock.innerHTML = `
                    <div class="alert alert-danger">
                        Please enter a valid CVV number
                    </div>
                `;

    } else {
        submitPaymentForm();
    }



});



// handle payment method (card token) after successfully created
Spreedly.on('paymentMethod', function(token, pmData) {
    document.getElementById('card_token').value = token;
    createOrder();

});


