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

document.getElementById("num-items").innerHTML = 5;
document.getElementById("loaded-items").innerHTML = getItemString(1, "Salad", "Crisp Vegetables", 12) + getItemString(1, "Chicken", "Not Beef", 16) + getTotalString(20);

function processForm(e) {
	appendHiddenToForm(document.getElementById('selectForm'), 'cartHtml', 'abc');
}
document.getElementById('selectForm').addEventListener("submit", processForm);