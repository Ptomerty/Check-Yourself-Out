'use strict';
require('dotenv').config();
const fetch = require('node-fetch');
var util = require('util');
var exec = require('child_process').exec;

class OrderTemplate {
	constructor(tableID, orderNum) {
		var time = new Date();
		// object params
		this.TableReference = tableID;
		this.IsClosed = true;
		this.OrderNumber = "Table" + this.TableReference + "_" + orderNum;
		this.IsPaid = true;
		this.TaxAmount = 0;
		this.TipAmount = 0;
		this.OrderDateTime = time;
		this.OrderDueDateTime = time;
		this.LineItems = [];
		this.Notes = ["New order started at " + time];
		this.Payments = [];
	}

	addItem(itemObj, tax = 0.00) {
		this.LineItems.push(itemObj);
		// console.log(typeof itemObj['UnitPrice'])
		this.TaxAmount += itemObj['UnitPrice'] * tax;
		//query for item ID
	}

}

class Table {
	constructor(UUID, taxRate = 0.00) {
		this.tableID = UUID;
		this.items = [];
		this.orderNum = 0;
		this.taxRate = taxRate;
	}

	async createAndSendOrder() {
		let order = new OrderTemplate(this.tableID, this.orderNum);
		// console.log(this.items)
		this.items.forEach((item) => {
			order.addItem(item, this.taxRate);
		});
		let check_only = true;
		// let URL = `https://api-reg-apigee.ncrsilverlab.com/v2/orders?store_number=1&validate_only=${check_only}`;
		// const params = {
		// 	method: 'POST',
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 		"Accept": "application/json",
		// 		"authorization": "Bearer " + this.token
		// 	},
		// 	body: {
		// 		"Orders": [JSON.parse(JSON.stringify(order).replace(/\'/g, "\""))],
		// 		// "Orders": [order],
		// 		"SourceApplicationName": "SCR"
		// 		// "Orders" : []
		// 	}
		// }

		// so the API wouldn't let us pass in the object itself
		// give it a try and let me know if you can fix it
		let curl = `curl -X POST --header 'Content-Type: application/json' \\
		--header 'Accept: application/json' \\
		--header 'authorization: Bearer ${this.token}' \\
		-d '{ "Orders": [${JSON.stringify(order).replace(/\'/g, "\"")}], "SourceApplicationName": "SCR"}' \\
		'https://api-reg-apigee.ncrsilverlab.com/v2/orders?store_number=1&validate_only=${check_only}'`;
		// console.log("working string:" + JSON.stringify(order).replace(/\'/g, "\""));
		console.log(curl);
		let child = exec(curl, (e, o, err) => {
			console.log("stdout:" + o);
		});
	}

	async addItem(itemID) {
		let date = new Date();
		if (date >= this.expDate) {
			await generateToken();
		}
		let URL = `https://api-reg-apigee.ncrsilverlab.com/v2/inventory/items/item?item_master_id=${itemID}`
		const params = {
			headers: {
				"Accept": "application/json",
				"authorization": "Bearer " + this.token
			}
		}
		let data = await fetch(URL, params);
		let json = await data.json();
		json = json['Result'];
		this.items.push({
			"ItemId": json['ItemVariations'][0]['ItemId'],
			"Quantity": 1,
			"Name": json['Name'],
			"UnitPrice": json['RetailPrice']
		});
	}

	async generateToken() {
		let id = process.env.client_id;
		let secret = process.env.client_secret;
		const URL = "https://api-reg-apigee.ncrsilverlab.com/v2/oauth2/token";
		const params = {
			headers: {
				"Accept": "application/json",
				"client_id": id,
				'client_secret': secret
			}
		}
		let data = await fetch(URL, params);
		let json = await data.json();
		this.token = json['Result']['AccessToken'];
		this.expDate = json['Result']['AccessTokenExpirationUtc'];
	}
}

async function main() {
	let table = new Table("1");
	await table.generateToken();
	console.log("token: " + table.token);
	await table.addItem(1019923);
	await table.createAndSendOrder();
	// console.log(table.items)
}

main();
