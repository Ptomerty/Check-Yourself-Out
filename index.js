function applyCheckedStyling(radio) {
	radio.parentNode.classList.add("active");
}

function applyUncheckedStyling(radio) {
	radio.parentNode.classList.remove("active");
}

function onRadio() {
	var radioButtons = document.getElementsByName("tipradio");
	for (let value of radioButtons) {
		if (value.checked) {
			applyCheckedStyling(value);
		} else {
			applyUncheckedStyling(value);
		}
	}
}

var radioButtons = document.getElementsByName("tipradio");
for (let value of radioButtons) {
	value.setAttribute("onchange", "onRadio()");
}
onRadio();