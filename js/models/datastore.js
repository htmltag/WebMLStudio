class Datastore {
    #name;
    #inputdata;
    #outputdata;

    constructor(name, input, output) {
        this.#name = name;
        this.#inputdata = input;
        this.#outputdata = output;
    }

    set input(indata) {
        this.#inputdata = indata;
    }

    get input() {
        return this.#inputdata;
    }

    set output(outdata) {
        this.#outputdata = outdata;
    }

    get output() {
        return this.#outputdata;
    }

    get name() {
        return this.#name;
    }

    set name(name) {
        this.#name = name;
    }
}