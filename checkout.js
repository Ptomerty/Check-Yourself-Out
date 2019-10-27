function getRequests() {
	var s1 = location.search.substring(1, location.search.length).split('&'), r = {}, s2, i;
	for (i = 0; i < s1.length; i += 1) {
		s2 = s1[i].split('=');
		r[decodeURIComponent(s2[0]).toLowerCase()] = decodeURIComponent(s2[1]);
	}
	return r;
};

var requests = getRequests();
// lol don't mind me
document.getElementById("cartElement").innerHTML = decodeURIComponent(requests["carthtml"])

// Send post request to backend
itemIds = requests["item-ids"];

function appendHiddenToForm(f, name, value) {
	var input = document.createElement('input');
	input.setAttribute('name', name);
	input.setAttribute('value', value);
	input.setAttribute('type', 'hidden');
	f.appendChild(input);
}

async function processForm(e) {
	var xhr = new XMLHttpRequest();
	address = 'http://checkyourselfout.online:3000/pay/' + requests['table'];
	xhr.open("POST", address, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
		'data': btoa(itemIds)
	}));
	alert("Payment successful!");
}

var checkoutForm = document.getElementById('checkoutForm');
checkoutForm.setAttribute("action", "index.html");
appendHiddenToForm(checkoutForm, "table", requests['table']);
checkoutForm.addEventListener("submit", processForm); 