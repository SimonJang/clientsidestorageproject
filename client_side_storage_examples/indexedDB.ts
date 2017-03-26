import { Observable } from 'rxjs/Rx'
import { AddRequest } from './types/types';

export class IndexedDBHandler {

    storeName = 'testObjectStore'
    version = 1;
    DBName = 'testdbv2';
    documentIndex: IDBIndex;
    multifieldIndex: IDBIndex;
    dbInstance: IDBDatabase;
    os: IDBObjectStore;
    workableDB: IDBDatabase;
    addRequests: AddRequest[] = []

    static checkIndexedDBSupport() {
        return 'indexedDB' in window;
    }

    public initIndexedDB() {
        if (IndexedDBHandler.checkIndexedDBSupport) {

            let database: IDBOpenDBRequest = indexedDB.open('testdbv2', 6);

            // Only available for use from here since callback shows readiness of IndexedDB
            // Checks if there are requests to be processed when IndexedDB is ready
            database.onsuccess = (e) => {
                console.log('Entering onsucces');
                this.workableDB = database.result;

                Observable.from(this.addRequests)
                    .subscribe(r => { this.addItemToStore(r) })
            }

            database.onupgradeneeded = (e) => {
                console.log('onupgradeneeded started');
                this.dbInstance = database.result;
                this.checkObjectStore(this.dbInstance);
            }

        }
    }

    public addItem(object: AddRequest) {
        if(!this.workableDB) {
            console.log(`Adding data to array: IndexedDB not ready}`)
            this.addRequests.push(object);
        }
        else {
            this.addItemToStore(object);
        }
        
    }

    public getItem(key: string) {
        console.log(`getting data: ${key}`)
        let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        let store = transaction.objectStore(this.storeName);
        let request = store.get(key)
        return request;
    }

    public deleteItem(data: AddRequest) {
        console.log(`Deleting data: ${data}`)
        let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        let store = transaction.objectStore(this.storeName);
        let request = store.delete(data.item['email'])
        return request;
    }

    public getAllData() {
        let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        let store = transaction.objectStore(this.storeName);
        let cursor = store.openCursor();

        cursor.onsuccess = (e) => {
            let result:IDBCursor = e.target['result']
            if(result) {
                console.log(result['value']);
                result.continue();
            }
        }
    }

    // Remember that complex search is not the strongest part of IndexedDB
    // So beter use other filtering methods to filter the data if needed

    public getAllDataWithRange(upperbound: string) {
        if(!this.os) {
            let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
            this.os = transaction.objectStore(this.storeName);
        }
        if(!this.documentIndex) {
            this.documentIndex = this.os.index('defaultindex')
        }
        const range = IDBKeyRange.upperBound(upperbound);
        const cursor = this.documentIndex.openCursor(range);
        
        cursor.onsuccess = () => {
            console.log(JSON.stringify(cursor.result['value']));
        }
    }

    public updateItem(data: AddRequest) {
        
        let response = this.getItem(data.item['email']);
        response.onsuccess = () => {
            let data = response.result;

            data.age = 30;

            console.log(`Updating data: ${data}`)

            let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
            let store = transaction.objectStore(this.storeName);
            let request = store.put(data)
        }
    }

    public preloadData(persons: AddRequest[]) {
        this.addRequests = this.addRequests.concat(persons);
    }

    private checkObjectStore(dbInstance: IDBDatabase) {
        console.log('Checking db instance', dbInstance.objectStoreNames)
        if (!dbInstance.objectStoreNames.contains(this.storeName)) {
            console.log('Creating object store')
            this.os = dbInstance.createObjectStore(this.storeName, { keyPath: 'email' })
            this.createDefaultIndex(this.os);
            this.multifieldIndex = this.os.createIndex('multifield', 'hobbies', {unique: false, multiEntry: true}) // multiEntry example
        }
        else {
            console.log('Deleting and recreating object store')
            dbInstance.deleteObjectStore(this.storeName)
            this.os = dbInstance.createObjectStore(this.storeName, { keyPath: 'email' })
            this.createDefaultIndex(this.os);
            this.multifieldIndex = this.os.createIndex('multifield', 'hobbies', {unique: false, multiEntry: true}) // multiEntry example
        }
        
    }

    private createDefaultIndex(objectStoreInstance: IDBObjectStore) {
        console.log('Creating index');
        this.documentIndex = objectStoreInstance.createIndex('defaultindex', 'name');
    }


    private addItemToStore(object: AddRequest) {
        let transaction = this.workableDB.transaction([this.storeName.toString()], 'readwrite');
        let store = transaction.objectStore(this.storeName);
        let request = store.add(object.item);
    }

    // Unused
    // Rx needed for configuration, probably not best use case

    private indexedDBConfigurationWithObservable() {
        let database = indexedDB.open('testdb', 1);
        Observable.of(database)
            .map(d => {
                d.onsuccess = (e) => {
                    console.log(`Succes with DB, onsucces is defined`)
                    let instance = e.target['result']
                    console.log(instance.objectStoreNames.contains('testdbdocument'))
                };
                d.onerror = () => { console.log('Something bad happenend') };
                d.onupgradeneeded = (e) => {
                    console.log('Upgrade needed')
                    let instance = e.target['result'];
                    this.checkObjectStore(instance);
                }
                d.onblocked = () => { console.log('Access denied') }
            })
            .subscribe()
            .unsubscribe();

        console.log('Database with linked events >>', database)
    }
}


