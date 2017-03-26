"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx_1 = require("rxjs/Rx");
var IndexedDBHandler = (function () {
    function IndexedDBHandler() {
        this.storeName = 'testObjectStore';
        this.version = 1;
        this.DBName = 'testdbv2';
        this.addRequests = [];
    }
    IndexedDBHandler.checkIndexedDBSupport = function () {
        return 'indexedDB' in window;
    };
    IndexedDBHandler.prototype.initIndexedDB = function () {
        var _this = this;
        if (IndexedDBHandler.checkIndexedDBSupport) {
            var database_1 = indexedDB.open('testdbv2', 6);
            database_1.onsuccess = function (e) {
                console.log('Entering onsucces');
                _this.workableDB = database_1.result;
                Rx_1.Observable.from(_this.addRequests)
                    .subscribe(function (r) { _this.addItemToStore(r); });
            };
            database_1.onupgradeneeded = function (e) {
                console.log('onupgradeneeded started');
                _this.dbInstance = database_1.result;
                _this.checkObjectStore(_this.dbInstance);
            };
        }
    };
    IndexedDBHandler.prototype.addItem = function (object) {
        if (!this.workableDB) {
            console.log("Adding data to array: IndexedDB not ready}");
            this.addRequests.push(object);
        }
        else {
            this.addItemToStore(object);
        }
    };
    IndexedDBHandler.prototype.getItem = function (key) {
        console.log("getting data: " + key);
        var transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        var store = transaction.objectStore(this.storeName);
        var request = store.get(key);
        return request;
    };
    IndexedDBHandler.prototype.deleteItem = function (data) {
        console.log("Deleting data: " + data);
        var transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        var store = transaction.objectStore(this.storeName);
        var request = store.delete(data.item['email']);
        return request;
    };
    IndexedDBHandler.prototype.getAllData = function () {
        var transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        var store = transaction.objectStore(this.storeName);
        var cursor = store.openCursor();
        cursor.onsuccess = function (e) {
            var result = e.target['result'];
            if (result) {
                console.log(result['value']);
                result.continue();
            }
        };
    };
    IndexedDBHandler.prototype.getAllDataWithRange = function (upperbound) {
        if (!this.os) {
            var transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
            this.os = transaction.objectStore(this.storeName);
        }
        if (!this.documentIndex) {
            this.documentIndex = this.os.index('defaultindex');
        }
        var range = IDBKeyRange.upperBound(upperbound);
        var cursor = this.documentIndex.openCursor(range);
        cursor.onsuccess = function () {
            console.log(JSON.stringify(cursor.result['value']));
        };
    };
    IndexedDBHandler.prototype.updateItem = function (data) {
        var _this = this;
        var response = this.getItem(data.item['email']);
        response.onsuccess = function () {
            var data = response.result;
            data.age = 30;
            console.log("Updating data: " + data);
            var transaction = _this.workableDB.transaction([_this.storeName.toString()], 'readwrite');
            var store = transaction.objectStore(_this.storeName);
            var request = store.put(data);
        };
    };
    IndexedDBHandler.prototype.preloadData = function (persons) {
        this.addRequests = this.addRequests.concat(persons);
    };
    IndexedDBHandler.prototype.checkObjectStore = function (dbInstance) {
        console.log('Checking db instance', dbInstance.objectStoreNames);
        if (!dbInstance.objectStoreNames.contains(this.storeName)) {
            console.log('Creating object store');
            this.os = dbInstance.createObjectStore(this.storeName, { keyPath: 'email' });
            this.createDefaultIndex(this.os);
            this.multifieldIndex = this.os.createIndex('multifield', 'hobbies', { unique: false, multiEntry: true });
        }
        else {
            console.log('Deleting and recreating object store');
            dbInstance.deleteObjectStore(this.storeName);
            this.os = dbInstance.createObjectStore(this.storeName, { keyPath: 'email' });
            this.createDefaultIndex(this.os);
            this.multifieldIndex = this.os.createIndex('multifield', 'hobbies', { unique: false, multiEntry: true });
        }
    };
    IndexedDBHandler.prototype.createDefaultIndex = function (objectStoreInstance) {
        console.log('Creating index');
        this.documentIndex = objectStoreInstance.createIndex('defaultindex', 'name');
    };
    IndexedDBHandler.prototype.addItemToStore = function (object) {
        var transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        var store = transaction.objectStore(this.storeName);
        var request = store.add(object.item);
    };
    IndexedDBHandler.prototype.indexedDBConfigurationWithObservable = function () {
        var _this = this;
        var database = indexedDB.open('testdb', 1);
        Rx_1.Observable.of(database)
            .map(function (d) {
            d.onsuccess = function (e) {
                console.log("Succes with DB, onsucces is defined");
                var instance = e.target['result'];
                console.log(instance.objectStoreNames.contains('testdbdocument'));
            };
            d.onerror = function () { console.log('Something bad happenend'); };
            d.onupgradeneeded = function (e) {
                console.log('Upgrade needed');
                var instance = e.target['result'];
                _this.checkObjectStore(instance);
            };
            d.onblocked = function () { console.log('Access denied'); };
        })
            .subscribe()
            .unsubscribe();
        console.log('Database with linked events >>', database);
    };
    return IndexedDBHandler;
}());
exports.IndexedDBHandler = IndexedDBHandler;
//# sourceMappingURL=indexedDB.js.map