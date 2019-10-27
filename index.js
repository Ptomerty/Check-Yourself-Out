function applyCheckedStyling(radio) {
	radio.parentNode.classList.add("active");
}

function applyUncheckedStyling(radio) {
	radio.parentNode.classList.remove("active");
}

function applyToRadioButtons(func) {
	var radioButtons = document.getElementsByClassName("fancy-radio");
	for (let value of radioButtons) {
		var x = value.getElementsByTagName("input");
		for (let y of x) {
			func(y);
		}
	}
}

function applyToItemCheckboxes(func) {
	var checkboxes = document.getElementsByClassName("big-checkbox");
	for (let x of checkboxes) {
		func(x);
	}
}

function onRadio() {
	applyToRadioButtons(x => {
		if (x.checked) {
			applyCheckedStyling(x);
		} else {
			applyUncheckedStyling(x);
		}
	});
}

applyToRadioButtons(x => x.setAttribute("onchange", "onRadio()"));
onRadio();

function getItemString(id, name, description, price) {
	return `<label class="list-group-item list-group-item-action d-flex lh-condensed">
			<input type="checkbox" class="big-checkbox" name="${id}">
			<div class="d-flex justify-content-between flex-fill pl-3">
				<div>
					<h6 class="my-0">${name}</h6>
					<small class="text-muted">${description}</small>
				</div>
				<span class="text-muted">$${price}</span>
			</div>
		</label>`;
}

function getTotalString(total) {
	return `<li class="list-group-item d-flex justify-content-between">
			<span>Total (USD)</span>
			<strong>$${total}</strong>
		</li>`;
}

function appendHiddenToForm(f, name, value) {
	var input = document.createElement('input');
	input.setAttribute('name', name);
	input.setAttribute('value', value);
	input.setAttribute('type', 'hidden');
	f.appendChild(input);
}

function httpGetAsync(theUrl, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		console.log("GET request: " + xmlHttp.readyState + " - " + xmlHttp.status);
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
		}
	}
	xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	xmlHttp.send(null);
}

// Dummy
document.getElementById("loaded-items").innerHTML = getItemString(1, "Salad", "Crisp Vegetables", 12) + getItemString(1, "Chicken", "Not Beef", 16) + getTotalString(20);

function getRequests() {
	var s1 = location.search.substring(1, location.search.length).split('&'), r = {}, s2, i;
	for (i = 0; i < s1.length; i += 1) {
		s2 = s1[i].split('=');
		r[decodeURIComponent(s2[0]).toLowerCase()] = decodeURIComponent(s2[1]);
	}
	return r;
};

var requests = getRequests();

if (requests['table'] === undefined) {
	requests['table'] = '1';
}

items = httpGetAsync('http://localhost:3000/items/' + requests['table'], text => {
	items = JSON.parse(text);
	document.getElementById("num-items").innerHTML = items.length; // Number of items
	
	totalItemString = "";
	totalPrice = 0;
	items.forEach(item => {
		totalItemString += getItemString("item-" + item.ItemId, item.Name, item.Description, item.UnitPrice);
		totalPrice += item.UnitPrice;
	});

	document.getElementById("loaded-items").innerHTML = totalItemString + getTotalString(totalPrice);
});
//items = JSON.parse('[{"ItemId":1711709,"Description":"Very yummy! Also not pork.","Name":"Chicken Sandwich","UnitPrice":7.5}]');

function getCheckoutItemString(name, description, price) {
	return `<li class="list-group-item d-flex justify-content-between lh-condensed">
							<div>
								<h6 class="my-0">${name}</h6>
								<small class="text-muted">${description}</small>
							</div>
							<span class="text-muted">${price}</span>
						</li>`;
}

function processForm(e) {
	jsonItems = items;
	items = [];
	applyToItemCheckboxes(itemCheckbox => {
		if (itemCheckbox.checked) {
			items.push(parseInt(itemCheckbox.name.substring("item-".length)));
		}
	});
	numItems = items.length;
	checkoutItems = "";
	totalPrice = 0;
	items.forEach(item => {
		name = "Error";
		description = "Error";
		price = "Error";
		jsonItems.forEach(x => {
			if (x.ItemId === item) {
				name = x.Name;
				description = x.Description;
				price = x.UnitPrice;
			}
		});
		checkoutItems += getCheckoutItemString(name, description, price);
		totalPrice += price;
	});
	titleTemplate = `<h4 class="d-flex justify-content-between align-items-center mb-3">
						<span class="text-muted">Your cart</span>
						<span class="badge badge-secondary badge-pill">${numItems}</span>
					</h4>`
	prefix = '<ul class="list-group mb-3">'
	totalPriceTemplate = `<li class="list-group-item d-flex justify-content-between">
							<span>Total (USD)</span>
							<strong>${totalPrice}</strong>
						</li>`
	postfix = '</ul>'
	appended = titleTemplate + prefix + checkoutItems + totalPriceTemplate + postfix;
	selectForm = document.getElementById('selectForm');
	appendHiddenToForm(selectForm, 'carthtml', encodeURIComponent(appended));
	appendHiddenToForm(selectForm, 'item-ids', JSON.stringify(items));
}
document.getElementById('selectForm').addEventListener("submit", processForm);