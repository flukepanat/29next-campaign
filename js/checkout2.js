// 
// Variables
// 


// form
const formEl = document.querySelector('.form');

const expMonth = document.getElementById("id_expiry_month");
const expYear = document.getElementById("id_expiry_year");
const cvvParent = document.getElementById("bankcard-cvv");
const numberParent = document.getElementById("bankcard-number");
const cardErrBlock = document.getElementById("payment-error-block")


const validErrBlock = document.getElementById("validation-error-block")

// pay method buttons
const btnPaypal = document.querySelector('.pay-with-paypal');
const btnCC = document.querySelector(".pay-with-cc");

const storedData = sessionStorage.getItem('formData');
const formDataObject = JSON.parse(storedData);
console.log('Retrieved from session storage:', formDataObject.lines);


/**
 *  Get Campaign
 */

const getCampaign = async () => {
    console.log("get campaign");
    try {

        const response = await fetch(campaignRetrieveURL, {
            method: 'GET',
            headers,
        });
        const data = await response.json()

        if (!response.ok) {
            console.log('Something went wrong');
            return;
        }

        console.log(data)

        getCampaignData(data);


    } catch (error) {
        console.log(error);
    }
}

const getCampaignData = (data) => {
    campaignName = data.name;
    campaignCurrency = data.currency;
    payEnvKey = data.payment_env_key;
    Spreedly.init(payEnvKey, { "numberEl": "bankcard-number", "cvvEl": "bankcard-cvv" });
}




/**
 * Use Create Order with Credit Card
 */

const createOrder = async () => {

    console.log("create order");
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData);

    btnCC.disabled = true;
    btnCC.textContent = btnCC.dataset.loadingText;
    validErrBlock.innerHTML = ``

    const orderData = {
        "user": formDataObject.user,
        "lines": formDataObject.lines,

        "use_default_shipping_address": false,

        "use_default_billing_address": false,
        "billing_same_as_shipping_address": data.billing_same_as_shipping_address,
        "payment_detail": {
            "payment_method": data.payment_method,
            "card_token": data.card_token,
        },
        "shipping_address": formDataObject.shipping_address,
        "shipping_method": formDataObject.shipping_method,
        "success_url": campaign.nextStep(nextURL)
    }


    console.log(orderData);

    try {
        const response = await fetch(ordersURL, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderData),
        });
        const result = await response.json()

        // Some examples of error handling from the API to expand on
        if (!response.ok && result.non_field_errors) {

            btnCC.disabled = false;
            btnCC.textContent = btnCC.dataset.text;

            console.log ('Something went wrong', result);
            let error = result.non_field_errors;
            validErrBlock.innerHTML = `
                <div class="alert alert-danger">
                    ${error}
                </div>
            `;
            return;

        } else if (!response.ok && result.postcode) {

            btnCC.disabled = false;
            btnCC.textContent = btnCC.dataset.text;

            console.log ('ZIP is incorrect', result);
            let error = result.postcode;
            validErrBlock.innerHTML = `
                <div class="alert alert-danger">
                    API Response Error: ${error}
                </div>
            `;
            return;
        
        } else if (!response.ok && result.shipping_address) {

            btnCC.disabled = false;
            btnCC.textContent = btnCC.dataset.text;

            console.log ('Phone number is not accepted', result);
            let error = result.shipping_address.phone_number;
            validErrBlock.innerHTML = `
                <div class="alert alert-danger">
                    API Response Error: ${error}
                </div>
            `;
            return;
        
        } else if (!response.ok) {
            
            btnCC.disabled = false;
            btnCC.textContent = btnCC.dataset.text;
            
            console.log ('Something went wrong', result);
            let error = Object.values(result)[0];
            document.getElementById("payment-error-block").innerHTML = `
                <div class="alert alert-danger">
                    ${error}
                </div>
            `;
            return;
        }

        sessionStorage.setItem('ref_id', result.ref_id);

        if (!result.payment_complete_url && result.number) {

            location.href = campaign.nextStep(nextURL);

        } else if (result.payment_complete_url) {

            window.location.href = result.payment_complete_url;
        }

    } catch (error) {
        console.log(error);
    }

}

/**
 * Use Create Order with PayPal
 */

const createPayPalOrder = async () => {
    console.log("create order paypal order");
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData);
    btnPaypal.disabled = true;
    const orderPPData = {
        "lines": formDataObject.lines,
        "payment_detail": {
            "payment_method": data.payment_method,
        },
        "shipping_method": formDataObject.shipping_method,
        "success_url": campaign.nextStep(nextURL)
    }

    try {
        const response = await fetch(ordersURL, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderPPData),
        });
        const result = await response.json()

        if (!response.ok) {
            console.log('Something went wrong');
            console.log(orderPPData);
            btnPaypal.disabled = false;
            return;
        }

        console.log(result)

        sessionStorage.setItem('ref_id', result.ref_id);

        window.location.href = result.payment_complete_url;

    } catch (error) {
        console.log(error);
    }


}
const retrieveCampaign = campaign.once(getCampaign);

retrieveCampaign();






// 
// Inits & Event Listeners
// 












btnPaypal.addEventListener('click', event => {

    console.log('Paypal Button Clicked');
    document.getElementById('payment_method').value = 'paypal';
    createPayPalOrder()
               
});

btnCC.addEventListener('click', event => {
    document.getElementById('payment_method').value = 'card_token';
    Spreedly.validate();
});