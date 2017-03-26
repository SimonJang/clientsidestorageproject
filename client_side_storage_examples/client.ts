import * as $ from 'jquery';
import { Observable } from 'rxjs/Rx'
import { IndexedDBHandler } from './indexedDB';
import { AddRequest } from './types/types';

// http://caniuse.com/ voor ondersteuning te zien //

// Variables

const dbHandler = new IndexedDBHandler();
const data: AddRequest = {item: {name: 'Simon', email: 'simon@test.be', hobbies: ['cycling', 'swimming']}}

// functions

console.log('Checking suppport for indexedDB >>' ,IndexedDBHandler.checkIndexedDBSupport());

// Only fires when data is changed in another browser session in the localStorage

Observable.fromEvent(window, 'storage')
    .subscribe({
        next(item) {
            console.log(`Testing storage event with RxJs: ${item}`)
            console.log(`old value: ${item['oldValue']}`)
            console.log(`new value: ${item['newValue']}`)
        },
        error(err) {console.log(`${err}`)}
    })

// Putting data in localStorage

let clientNames = ['Simon', 'Lucas'];

if(window.localStorage) {
    localStorage.setItem('names', JSON.stringify(clientNames));
    $('#datacontainer').text(JSON.parse(localStorage.getItem('names')));
}
else {
    console.log('Web API: localStorage not supported');
}

// Setting click events

$("#ADD").click(function(){
        let item = dbHandler.addItem(data)
        alert(JSON.stringify(data));
    });


$("#GET").click(function(){
        let item = dbHandler.getItem("simon@test.be")
        item.onsuccess = () => {
            alert(JSON.stringify(item.result));
        }
    });

$("#PUT").click(function(){
        let item = dbHandler.updateItem(data)
        let changedItem = dbHandler.getItem("simon@test.be")
        changedItem.onsuccess = () => {
            alert(JSON.stringify(changedItem.result));
        }
    });

$("#DELETE").click(function(){
        let item = dbHandler.deleteItem(data)
        item.onsuccess = () => {
            alert(JSON.stringify(item.result));
        }
    });

$("#GETALL").click(function(){
        dbHandler.getAllData();
    });

$("#GETALLRANGE").click(function(){
        dbHandler.getAllDataWithRange('lucas');
    });

// Setting the main functions

$(document).ready(() => {
    
    dbHandler.preloadData([data, {item: {name: 'Lucas', email: 'lucas@test.be', hobbies: ['hiking', 'poker']}}, 
        {item: {name: 'Peter', email: 'peter@test.be', hobbies: ['playing games', 'hiking']}}])
    dbHandler.initIndexedDB();
    // dbHandler.addItem(data) // adding item to store
})



