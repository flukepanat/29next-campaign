// 
// Variables
// 
let lineArr = [];

// form
const formEl = document.querySelector('.form');
const firstName = document.querySelector("#id_first_name");
const lastName = document.querySelector("#id_last_name");
const email = document.querySelector("#id_email");
const phone = document.querySelector("#id_phone_number");
const phoneFull = document.querySelector("#fullNumber");
const btnCreateCart = document.querySelector(".btn-cart");





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

        // getCampaignData(data);


    } catch (error) {
        console.log(error);
    }
}



/**
 *  Create Cart / New Prospect
 */

const createCart = async () => {

    console.log("create prospect");
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData);
    btnCreateCart.disabled = true;
    btnCreateCart.textContent = btnCreateCart.dataset.loadingText;

    console.log(data);

    const cartData = {
        "user": {
            "first_name": data.first_name,
            "last_name": data.last_name,
            "email": data.email
        },
        "lines": lineArr,
        "shipping_address": {
            "first_name": data.first_name,
            "last_name": data.last_name,
            "line1": data.shipping_address_line1,
            "line4": data.shipping_address_line4,
            "state": data.shipping_state,
            "postcode": data.shipping_postcode,
            "phone_number": data.phone_number,
            "country": data.shipping_country
        },
        "shipping_method": data.shipping_method
    }

    try {
        const response = await fetch(cartsCreateURL, {
            method: 'POST',
            headers,
            body: JSON.stringify(cartData),
        });
        const result = await response.json()

        if (!response.ok) {
            console.log('Something went wrong');
            btnCreateCart.disabled = false;
            btnCreateCart.textContent = btnCreateCart.dataset.text;
            return;
        }

        // Convert object to JSON string and store in session storage
          sessionStorage.setItem('formData', JSON.stringify(cartData));



        location.href = campaign.nextStep(nextURL);


    } catch (error) {
        console.log(error);

    }
}



const retrieveCampaign = campaign.once(getCampaign);

retrieveCampaign();




/**
 * Create Packages
 */

const renderPackages = () => {
    const template = `
                    <div class="offer-header d-flex justify-content-between align-items-center border-bottom">
                        <div class="offer-title d-flex align-items-center px-3">
                            <span class="offer-title-text fs-5  text-nowrap"></span>
                        </div>
                        <div class="px-3 py-3 text-nowrap fs-7 fw-bold">
                            <span class="shipping-cost"></span> SHIPPING
                        </div>
                    </div>
                    <div class="offer-content d-flex align-items-center ps-4 py-2">
                        <div class="offer-content-img">
                            <img src="" class="img-fluid p-image">
                        </div>
                        <div class="offer-content-info pe-2 ms-3">
                            <div class="offer-content-price-each  text-primary">
                                <span class="price-each h4 fw-bold"></span>
                                <span class="fs-8 fw-light">/each</span>
                            </div>
                            <div class="offer-content-price-orig text-secondary">
                                <s> 
                                Orig
                                    <span class="price-each-retail"></span>
                                </s>
                            </div>
                            <div class="offer-content-price-total h6 fw-bold text-success">
                                Total:
                                <span class="price-total"></span>
                            </div>
                        </div>
                       
                    </div>
                    `;

    const container = document.querySelector(".offers");

    for (let package of offers.packages) {

        let item = document.createElement("div");
        item.classList.add('offer');
        item.dataset.packageId = package.id;
        item.dataset.name = package.name;
        item.dataset.quantity = package.quantity;
        item.dataset.priceTotal = package.priceTotal.toFixed(2);
        item.dataset.priceEach = package.price.toFixed(2);
        item.dataset.priceShipping = package.shippingPrice.toFixed(2);
        item.dataset.shippingMethod = package.shippingMethod;
        item.innerHTML = template;
        item.querySelector(".offer-title-text").textContent = package.name;
        item.querySelector(".p-image").src = package.image;
        item.querySelector(".price-each-retail").textContent = campaign.currency.format(offers.priceRetail);

        // prices
        let priceElement = item.querySelector('.price-each');
        let priceTotalElement = item.querySelector('.price-total');

        priceElement.textContent = campaign.currency.format(package.price);
        priceTotalElement.textContent = campaign.currency.format(package.priceTotal);

        const truncateByDecimalPlace = (value, numDecimalPlaces) => Math.trunc(value * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces)

        if (package.shippingPrice != 0) {
            item.querySelector(".shipping-cost").textContent = package.shippingPrice;
            item.querySelector(".offer-content-price-total").style.display = "none"
        } else {
            item.querySelector(".shipping-cost").textContent = "FREE";
        }

        container.appendChild(item);
    }
}


/**
 * Calculate totals 
 */
const calculateTotal = () => {

    let selectedPackage = document.querySelector(".offer.selected");
    let packagePrice
    let shippingPrice = selectedPackage.dataset.priceShipping

    packagePrice = selectedPackage.dataset.priceTotal;

    let checkoutTotal = parseFloat(packagePrice) + parseFloat(shippingPrice);

    let orderTotal = document.querySelector(".order-summary-total-value");

    orderTotal.textContent = campaign.currency.format(checkoutTotal);
}


// 
// Inits & Event Listeners
// 

document.addEventListener("DOMContentLoaded", function(event) {

    renderPackages();

    let firstLineItem = { package_id: selectedOfferId, quantity: 1, is_upsell: false };

    lineArr.push(firstLineItem);

    const summaryShipPrice = document.querySelector('.selected-shipping-price');

    const $offer = document.querySelectorAll('.offer');

    if ($offer) {

        $offer.forEach(function(el, key) {

            el.addEventListener('click', function() {

                el.classList.toggle("selected");

                let pid = el.dataset.packageId;

                let pName = el.dataset.name;

                let pPriceEach = el.dataset.priceEach;

                let pPriceShipping = el.dataset.priceShipping;

                let shippingMethod = el.dataset.shippingMethod;

                let pQuantity = el.dataset.quantity;

                document.getElementById('shipping_method').value = shippingMethod;
                document.querySelector('.selected-product-name').textContent = pName;

                document.querySelector('.selected-product-price').textContent = campaign.currency.format(pPriceEach);

                if (pPriceShipping != 0.00) {
                    summaryShipPrice.textContent = campaign.currency.format(pPriceShipping);

                } else {
                    summaryShipPrice.textContent = "FREE";
                }

                $offer.forEach(function(ell, els) {
                    if (key !== els) {
                        ell.classList.remove('selected');
                    }

                });

                firstLineItem.package_id = pid


                console.log("Change Line Items:", lineArr);

                calculateTotal()


            });
        });
    }


    // initial package setup
    for (const offer of $offer) {

        packageId = offer.dataset.packageId;
        shippingId = offer.dataset.shippingMethod;
        if (packageId === selectedOfferId) {
            offer.classList.add('selected');
            offer.style.order = '-1';
            document.getElementById('shipping_method').value = shippingId;
            document.querySelector('.selected-product-name').textContent = offer.dataset.name;
            document.querySelector('.selected-product-price').textContent = campaign.currency.format(offer.dataset.priceEach);
            if (offer.dataset.priceShipping != 0.00) {
                summaryShipPrice.textContent = campaign.currency.format(offer.dataset.priceShipping);

            } else {
                summaryShipPrice.textContent = "FREE";
            }
        }
    }

    console.log("Default Line Items:", lineArr);
    calculateTotal()

});


btnCreateCart.addEventListener('click', event => {
    formEl.requestSubmit();
});