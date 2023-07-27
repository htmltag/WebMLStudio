/*
* 
* For storing input and output datasets to use for Brain.js and TensorFlow.js 
*
*/

import { Datastore } from '../models/datastore';

const localDatastore = {
  prefixIn: "data_in_",
  prefixOut: "data_out_",
  datanamesKey: "datanames",
  
  get names() {
    if (localStorage.getItem(this.datanamesKey)?.length) {
        return JSON.parse(localStorage.getItem(this.datanamesKey));
    } else {
        return [];
    }
  },

  get datastores() {
    const names = this.names();
    let ds = [];
    if(names.length > 0) {
        for (n of names) {
            ds.push(new Datastore(n, localStorage.getItem(this.prefixIn + n), localStorage.getItem(this.prefixOut + n)));
        }
        return  ds;
    } else {
        return ds;
    }
  },

  addName(name) {
    if (localStorage.getItem(this.datanamesKey)?.length) {
        const datanames = JSON.parse(localStorage.getItem(this.datanamesKey));
        if (!datanames.includes(name)) {
            const newdatanames = [...datanames, name];
            localStorage.setItem(this.datanamesKey, JSON.stringify(newdatanames));
        }
    } else {
        localStorage.setItem(this.datanamesKey, JSON.stringify([name]));
    }
  },

  addInputData(name, input) {
    this.addName(name);
    localStorage.setItem(this.prefixIn + name, input);
  },

  addOutputData(name, output) {
    this.addName(name);
    localStorage.setItem(this.prefixIn + name, output);
  },

}