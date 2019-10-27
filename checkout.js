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

async function processForm(e) {
	var xhr = new XMLHttpRequest();
	address = 'http://localhost:3000/pay/' + requests['table'];
	xhr.open("POST", address, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
		'data': btoa(itemIds)
	}));
	alert("Payment successful!");
}

document.getElementById('checkoutForm').addEventListener("submit", processForm);