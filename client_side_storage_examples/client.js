"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var Rx_1 = require("rxjs/Rx");
var indexedDB_1 = require("./indexedDB");
var dbHandler = new indexedDB_1.IndexedDBHandler();
var data = { item: { name: 'Simon', email: 'simon@test.be', hobbies: ['cycling', 'swimming'] } };
console.log('Checking suppport for indexedDB >>', indexedDB_1.IndexedDBHandler.checkIndexedDBSupport());
Rx_1.Observable.fromEvent(window, 'storage')
    .subscribe({
    next: function (item) {
        console.log("Testing storage event with RxJs: " + item);
        console.log("old value: " + item['oldValue']);
        console.log("new value: " + item['newValue']);
    },
    error: function (err) { console.log("" + err); }
});
var clientNames = ['Simon', 'Lucas'];
if (window.localStorage) {
    localStorage.setItem('names', JSON.stringify(clientNames));
    $('#datacontainer').text(JSON.parse(localStorage.getItem('names')));
}
else {
    console.log('Web API: localStorage not supported');
}
$("#ADD").click(function () {
    var item = dbHandler.addItem(data);
    alert(JSON.stringify(data));
});
$("#GET").click(function () {
    var item = dbHandler.getItem("simon@test.be");
    item.onsuccess = function () {
        alert(JSON.stringify(item.result));
    };
});
$("#PUT").click(function () {
    var item = dbHandler.updateItem(data);
    var changedItem = dbHandler.getItem("simon@test.be");
    changedItem.onsuccess = function () {
        alert(JSON.stringify(changedItem.result));
    };
});
$("#DELETE").click(function () {
    var item = dbHandler.deleteItem(data);
    item.onsuccess = function () {
        alert(JSON.stringify(item.result));
    };
});
$("#GETALL").click(function () {
    dbHandler.getAllData();
});
$("#GETALLRANGE").click(function () {
    dbHandler.getAllDataWithRange('lucas');
});
$(document).ready(function () {
    dbHandler.preloadData([data, { item: { name: 'Lucas', email: 'lucas@test.be', hobbies: ['hiking', 'poker'] } },
        { item: { name: 'Peter', email: 'peter@test.be', hobbies: ['playing games', 'hiking'] } }]);
    dbHandler.initIndexedDB();
});
//# sourceMappingURL=client.js.map