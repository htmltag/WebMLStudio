export default class Datastore {
    #name;
    #inputdata;
    #outputdata;

    constructor(name, input, output) {
        this.#name = name;
        this.#inputdata = input;
        this.#outputdata = output;
    }

    setInput(indata) {
        this.#inputdata = indata;
    }

    getInput() {
        return this.#inputdata;
    }

    setOutput(outdata) {
        this.#outputdata = outdata;
    }

    getOutput() {
        return this.#outputdata;
    }

    getName() {
        return this.#name;
    }

    setName(name) {
        this.#name = name;
    }
}