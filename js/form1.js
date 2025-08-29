/**
 * Phone number validation with intl-tel-input 
*/
const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];
const errorMsg = document.querySelector(".invalid-ph");

window.intlTelInput(phone, {
    onlyCountries: ["us"],
    preferredCountries:[""],
    utilsScript: "js/utils.js",
});

const iti = window.intlTelInputGlobals.getInstance(phone);

const reset = () => {
    phone.classList.remove("is-invalid");
    errorMsg.innerHTML = "";
    phoneFull.value = "";
};

phone.setAttribute("maxlength", "20");
//on blur: validate
phone.addEventListener('blur', () => {
  reset();
  let intlNumber = iti.getNumber();
  if (phone.value.trim()) {
    if (iti.isValidNumber()) {
        phoneFull.value = intlNumber;
    } else {
      phone.classList.add("is-invalid");
      const errorCode = iti.getValidationError();
      if (errorCode != -99) {
        errorMsg.innerHTML = errorMap[errorCode];
        } else {

            errorMsg.innerHTML = `Invalid phone number.`;
        }

      errorMsg.classList.remove("hide");
      // errorMsg.innerHTML = `Invalid phone number.`;
      console.log(errorCode)
    }
  }
});

// on keyup / change flag: reset
phone.addEventListener('change', reset);
phone.addEventListener('keyup', reset);

/**
 * Form validation with just-validatate.js
 */
const validate = new JustValidate(formEl, {
    errorFieldCssClass: ['is-invalid']
});

validate
    .addField(
        '#id_first_name',
        [{
                rule: 'required',
                errorMessage: 'First name is required',
            },

            {
                rule: 'maxLength',
                value: 255,
            },
            {
                rule: 'customRegexp',
                value: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+$/gi,
                errorMessage: 'Contains an invalid character',
            },

        ],

        {
            errorsContainer: '.invalid-fname',
        }
    )
    .addField(
        '#id_last_name',
        [{
                rule: 'required',
                errorMessage: 'Last name is required',
            },

            {
                rule: 'maxLength',
                value: 255,
            },
            {
                rule: 'customRegexp',
                value: /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+$/gi,
                errorMessage: 'Contains an invalid character',

            },
        ],

        {
            errorsContainer: '.invalid-lname',
        }
    )

    .addField(
        '#id_email',
        [{
                rule: 'required',
                errorMessage: 'Email is required',
            },
            {
                rule: 'email',
                errorMessage: 'Email is invalid!',
            },
            {
                rule: 'maxLength',
                value: 255,
            },
        ],

        {
            errorsContainer: '.invalid-email',

        }
    )
    .addField('#id_phone_number', [{


        validator: (value, context) => () =>
            new Promise((resolve) => {
                reset();
                let intlNumber = iti.getNumber();
                if (phone.value.trim()) {
                    if (iti.isValidNumber()) {
                        phoneFull.value = intlNumber;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(true);
                }
            }),

        errorMessage: () => {
            const errorCode = iti.getValidationError();
            if (errorCode != -99) {
                return errorMap[errorCode];
            } else {
                return 'Invalid phone number.'
            }
        },
    }, ], {

        errorsContainer: '.invalid-ph',

    })
    .addField('#id_shipping_address_line1', [{
            rule: 'required',
            errorMessage: 'Shipping address is required',
        },
        {
            rule: 'maxLength',
            value: 255,
        },
    ], {

        errorsContainer: '.invalid-shipping_address_line1',

    })
    .addField('#id_shipping_address_line4', [{
            rule: 'required',
            errorMessage: 'Shipping city is required',
        },
        {
            rule: 'maxLength',
            value: 255,
        },

    ], {

        errorsContainer: '.invalid-shipping_address_line4',

    })
    .addField('#id_shipping_state', [{
        rule: 'required',
        errorMessage: 'Shipping state/province is required',
    }, ], {

        errorsContainer: '.invalid-shipping_state',

    })
    .addField('#id_shipping_postcode', [{
            rule: 'required',
            errorMessage: 'Shipping ZIP/Postcode is required',
        },
        {
            rule: 'maxLength',
            value: 11,
        },
        {
            rule: 'minLength',
            value: 5,
        },
        {
            rule: 'customRegexp',
            value: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
            errorMessage: 'Not a valid US Postcode Format',
        },
    ], {

        errorsContainer: '.invalid-shipping_postcode',

    })
    .addField('#id_shipping_country', [{
        rule: 'required',
        errorMessage: 'Shipping country is required',
    }, ], {

        errorsContainer: '.invalid-shipping_country',

    })


    .onFail((fields) => {
        console.log('Field validation fail', fields);
    })
    .onSuccess((event) => {
        console.log('Field validation pass, create cart', event);
        createCart()
    });





