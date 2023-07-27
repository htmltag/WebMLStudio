/*
* 
* For storing input and output datasets to use for Brain.js and TensorFlow.js 
*
*/

import Datastore from '../models/datastore.js';

const localDatastore = {
  prefixIn: "data_input_",
  prefixOut: "data_output_",
  datanamesKey: "datanames",
  
  getNames() {
    if (localStorage.getItem(this.datanamesKey)?.length) {
        return JSON.parse(localStorage.getItem(this.datanamesKey));
    } else {
        return [];
    }
  },

  getDatastores() {
    const names = this.getNames();
    let ds = [];
    if(names.length > 0) {
        for (const n of names) {
            ds.push(new Datastore(n, localStorage.getItem(this.prefixIn + n), localStorage.getItem(this.prefixOut + n)));
        }
        return  ds;
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
    localStorage.setItem(this.prefixIn + name, JSON.stringify(input));
  },

  addOutputData(name, output) {
    this.addName(name);
    localStorage.setItem(this.prefixOut + name, JSON.stringify(output));
  },

}

export default localDatastore;