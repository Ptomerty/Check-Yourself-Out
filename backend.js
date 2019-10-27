'use strict';
require('dotenv').config();
const fetch = require('node-fetch');
const util = require('util');
const exec = require('child_process').exec;
const express = require('express');
const atob = require('atob');
const btoa = require('btoa');
const cors = require('cors');

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
		this.TaxAmount += itemObj['UnitPrice'] * tax;
	}

}

class Table {
	constructor(UUID, taxRate = 0.00) {
		this.tableID = UUID;
		this.items = [];
		this.orderNum = 0;
		this.taxRate = taxRate;
		this.token = "dummy";
	}

	async createAndSendOrder(orderArr) {
		let order = new OrderTemplate(this.tableID, this.orderNum);
		console.log(this.items);
		console.log(orderArr);
		for (var item of this.items) {
			if (orderArr.includes(item['ItemId'])) {
				order.addItem(item, this.taxRate);
				this.items.splice(this.items.indexOf(item), 1);
			}
		}
		console.log(order);
		let check_only = true;

		// so the API wouldn't let us pass in the object itself through js
		let curl = `curl -X POST --header 'Content-Type: application/json' \\
		--header 'Accept: application/json' \\
		--header 'authorization: Bearer ${this.token}' \\
		-d '{ "Orders": [${JSON.stringify(order).replace(/\'/g, "\"")}], "SourceApplicationName": "SCR"}' \\
		'https://api-reg-apigee.ncrsilverlab.com/v2/orders?store_number=1&validate_only=${check_only}'`;
		// console.log("working string:" + JSON.stringify(order).replace(/\'/g, "\""));
		console.log(curl);
		let child = exec(curl, (e, o, err) => {
			console.log(o);
		});
		// this.items = [];
		console.log(this.items);
	}

	async addItem(itemID) {
		await this.generateToken(); // be safe
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
			"Description": json['Description'],
			"Name": json['Name'],
			"UnitPrice": json['RetailPrice'],
			"Quantity": 1
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
	}
}

async function main() {
	let tableArr = []
	let table = new Table("1");
	await table.generateToken();
	let table2 = new Table("2");
	await table2.generateToken();
	tableArr.push(table);
	tableArr.push(table2);
	let app = express();
	app.use(express.urlencoded({extended: true}));
	app.use(express.json());
	app.use(cors());

	app.get('/',(function(req,res){
		// console.log(req);
	    res.send(table.token);
	}));

	app.get('/items',(function(req,res){
	    res.send(table.items);
	}));

	app.get('/items/:tableNum',(function(req,res){
		console.log(req.params.tableNum);
	    res.send(tableArr[req.params.tableNum - 1].items);
	}));

	app.post('/pay',(function(req,res){
	    let data = req.body.data; // b64 encoded
	    let arr = JSON.parse(atob(data));
	    table.createAndSendOrder(arr);
	}));

	app.post('/pay/:tableNum',(function(req,res){
	    let data = req.body.data; // b64 encoded
	    let arr = JSON.parse(atob(data));
	    tableArr[req.params.tableNum - 1].createAndSendOrder(arr);
	}));

	app.post('/add',( async function(req,res){
	    let data = req.body.data; // b64 encoded
	    let arr = JSON.parse(atob(data));
	    for (var item of arr) {
			await table.addItem(item);
		}
	}));

	app.post('/add/:tableNum',( async function(req,res){
	    let data = req.body.data; // b64 encoded
	    let arr = JSON.parse(atob(data));
	    for (var item of arr) {
			await tableArr[req.params.tableNum - 1].addItem(item);
		}
	}));

	app.listen(3000, () => console.log('SCR listening on port 3000!'));

}

main();
