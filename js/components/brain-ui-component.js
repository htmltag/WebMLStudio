import localDatastore from '../utils/local-datastore.js';
import Datastore from '../models/datastore.js';

const templateDanfo = document.createElement("template");
templateDanfo.innerHTML = `
<style>
@import "/css/pico.min.css";
@import "/css/custom.css";
@import "/assets/fontawesome/css/all.css";
h1 {
    font-size: 1.2rem
}

h2 {
    font-size: 1.1rem
}

.hide {
    display: none;
}

.show {
    display: block;
}

.wrapper {
text-align: center;
}

.flex-grid {
    display: flex;
}

#danfo-output {
    background-color: #fff;
    min-height: 400px;
    padding-left: .6rem;
}

#danfo-inputdata {
    width: 70%;
    height: 100%;
}

#danfo-outputdata {
    width: 25%;
    height: 100%;
}
</style>
<div>
    <nav>
        <ul>
            <li><a href="#" role="button" id="load-btn">Load</a></li>
            <li><a href="#" role="button" id="network-btn">Network</a></li>
            <li><a href="#" role="button" id="empty-btn" class="warning"><i class="fa-solid fa-trash-can"></i></a></li>
        </ul>
    </nav>
    <div id="panel-load">
        <div class="grid">
            <select id="select-filetype-load">
                <option value="NONE" disabled selected>Filetype</option>
                <option value="JSON">JSON</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
            </select>
            <input type="text" id="delimiter" placeholder="Delimiter for CSV (default is comma , )">
        </div>
        <hr/>
        <div class="grid">
            <div>
                <h2>From file</h2>
                <input type="file" id="file-dataset" name="file-dataset">
            </div>
            <div>
                <h2>From URL</h2>
                <div class="grid">
                    <input type="txt" id="url-to-dataset" placeholder="Url..."><button id="load-from-url">Load</button>
                </div>
            </div>
            <div>
                <h2>Local storage</h2>
                <div class="grid">
                    <select id="select-localstorage-load">
                        <option value="NONE" disabled selected>Dataset to load from</option>
                    </select>
                    <button id="load-localstorage-input-btn">Input</button>
                    <button id="load-localstorage-output-btn">Output</button>
                </div>
            </div>
        </div>
    </div>
    <div id="panel-network">
        <div class="grid">
            <label for="select-network">
                Network type
            <select id="select-network">
                <option value="NONE" disabled selected>Select network</option>
                <option value="NEURALNETWORK">Neural Network</option>
                <option value="RECURRENTNEURALNETWORK">Recurrent Neural Network</option>
            </select>
            </label>
            <label for="network-size">
                Network size
                <input type="text" id="network-size" placeholder="Array of ints">
            </label>
        </div>
        <div id="network-nn-fields" class="grid">
            <label for="network-binarythresh">
                Binary Thresh
                <input type="text" id="network-binarythresh" placeholder="binaryThresh">
            </label>
            <label for="select-activation">
                Activation
                <select id="select-activation">
                    <option value="NONE" disabled selected>Select Activation</option>
                    <option value="SIGMOID">Sigmoid</option>
                    <option value="RELU">Relu</option>
                    <option value="LEAKYRELU">Leaky-relu</option>
                    <option value="TANH">tanh</option>
                </select>
            </label>
            <label for="network-leaky-relu-alpha">
                Leaky Relu Alpha
                <input type="text" id="network-binarythresh" placeholder="Leaky Relu Alpha">
            </label>
        </div>
    </div>
    
    <div id="danfo-output">
        <div id="danfo-inputdata"></div>
        <div id="danfo-outputdata"></div>
    </div>
</div>
`;

class BrainUIEditor {
    #dfInput;
    #dfOutput;
    #datastores;
    #selectedFiletypeLoad = "NONE";
    #selectedLocalStorageLoad = "NONE";
    #inputLoaded = false;
    #outputLoaded = false;
    #brainTrainingData;

    #selectedNetwork;
    

    constructor(shadow) {
        // Load Danfo data
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.DANFO_OUTPUTDATA = shadow.querySelector("#danfo-outputdata");
        this.DANFO_INPUTDATA = shadow.querySelector("#danfo-inputdata");
        this.FILE_DATASET = shadow.querySelector("#file-dataset");
        this.SELECT_FILETYPE_LOAD = shadow.querySelector("#select-filetype-load");
        this.SELECT_LOCALSTORAGE_LOAD = shadow.querySelector("#select-localstorage-load");
        this.URL_TO_DATASET = shadow.querySelector("#url-to-dataset");
        this.DELIMITER = shadow.querySelector("#delimiter");
        
        shadow.querySelector("#empty-btn").addEventListener('click', this.empty.bind(this));
        shadow.querySelector("#file-dataset").addEventListener('change', this.loadInputFile.bind(this));
        shadow.querySelector("#select-filetype-load").addEventListener('change', this.selectFiletypeLoadChange.bind(this));
        shadow.querySelector("#load-from-url").addEventListener('click', this.loadFromURL.bind(this));
        shadow.querySelector("#load-localstorage-input-btn").addEventListener('click', this.loadLocalStorageInput.bind(this));
        shadow.querySelector("#load-localstorage-output-btn").addEventListener('click', this.loadLocalStorageOutput.bind(this));
        shadow.querySelector("#select-localstorage-load").addEventListener('change', this.selectLocalStorageLoadChange.bind(this));
        
        // Network
        this.SELECTED_NETWORK = shadow.querySelector("#select-network");
        this.NETWORK_SIZE = shadow.querySelector("#network-size");

        shadow.querySelector("#select-network").addEventListener('change', this.selectedNetworkChange.bind(this));
        
        
        this.init();
    }

    init() {
         this.loadDatastoreNames();
    }

    loadDatastoreNames() {
        const names = localDatastore.getNames();
        if(names?.length > 0) {
            for (const n of names) {
                this.SELECT_LOCALSTORAGE_LOAD.add(new Option(n, n));
            }
            this.#datastores = localDatastore.getDatastores();
        }
    }

    empty() {
        location.reload();
    }

    play() {
        try {
            if (this.#dfInput) {
                this.hasInputLoaded();
                this.#dfInput.print();
                this.#dfInput.plot(this.DANFO_INPUTDATA).table();
            }

            if (this.#dfOutput) {
                this.hasOutputLoaded();
                this.#dfOutput.print();
                this.#dfOutput.plot(this.DANFO_OUTPUTDATA).table();
            }
            
        } catch(err) {
            console.log(err);
            toastr.error("Ooops! Something whent wrong.", err)
        }
        
    }

    //************** */
    // Load Danfo
    //************** */

    selectFiletypeLoadChange() {
        this.#selectedFiletypeLoad = this.SELECT_FILETYPE_LOAD.options[this.SELECT_FILETYPE_LOAD.selectedIndex].value;
    }

    selectLocalStorageLoadChange() {
        this.#selectedLocalStorageLoad = this.SELECT_LOCALSTORAGE_LOAD.options[this.SELECT_LOCALSTORAGE_LOAD.selectedIndex].value;
    }

    loadInputFile() {
        try {
            const inputfile = this.FILE_DATASET.files[0];
            const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";
            switch (this.#selectedFiletypeLoad) {
                case 'NONE':
                    toastr.error("Please select filetype");
                    break;
                case 'JSON':
                    dfd.readJSON(inputfile).then((df) => {
                        this.#dfInput = df;
                        this.play();
                    });
                    break;
                case 'EXCEL':
                    dfd.readExcel(inputfile).then((df) => {
                        this.#dfInput = df;
                        this.play();
                    })
                    break;
                case 'CSV':
                    dfd.readCSV(inputfile, {delimeter: delimiter}).then((df) => {
                        this.#dfInput = df;
                        this.play();
                    });
                    break;
            }
            this.#inputLoaded = true;
            toastr.success("Input data loaded");
            this.convertToBrainDataFormat();
        } catch {
            toastr.error("Failed to load input data");
        }
    }

    loadFromURL() {
        try {
            const url = this.URL_TO_DATASET.value;
            const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";

            switch (this.#selectedFiletypeLoad) {
                case 'NONE':
                    toastr.error("Please select filetype");
                    break;
                case 'JSON':
                    dfd.readJSON(url).then((df) => {
                        this.#dfOutput = df;
                        this.play();
                    });
                    break;
                case 'EXCEL':
                    dfd.readExcel(url).then((df) => {
                        this.#dfOutput = df;
                        this.play();
                    });
                    break;
                case 'CSV':
                    dfd.readCSV(url, {delimeter: delimiter}).then((df) => {
                        this.#dfOutput = df;
                        this.play();
                    });
                    break;
            }
        } catch {
            toastr.error("Failed to load output data");
        }
    }

    loadLocalStorageInput(){
        if(this.#selectedLocalStorageLoad === "NONE") toastr.error("Select or fill inn dataset to save to local storage");
        this.#dfInput = new dfd.DataFrame(JSON.parse(this.#datastores.find((data) => data.getName() === this.#selectedLocalStorageLoad).getInput()));
        this.play();
    }

    loadLocalStorageOutput(){
        if(this.#selectedLocalStorageLoad === "NONE") toastr.error("Select data to load from local storage");
        this.#dfOutput = new dfd.DataFrame(JSON.parse(this.#datastores.find((data) => data.getName() === this.#selectedLocalStorageLoad).getOutput()));
        this.play();
    }

    hasInputLoaded() {
        if (!this.#inputLoaded) {
            this.#inputLoaded = true;
            toastr.success("Input data loaded");
            this.convertToBrainDataFormat();
        }
    }

    hasOutputLoaded() {
        if (!this.#outputLoaded) {
            this.#outputLoaded = true;
            toastr.success("Output data loaded");
            this.convertToBrainDataFormat();
        }
    }

    convertToBrainDataFormat() {
        if ( this.#inputLoaded && this.#outputLoaded ) {
            const inputJson = dfd.toJSON(this.#dfInput);
            const outputJson = dfd.toJSON(this.#dfOutput);
            let data = [];
            for (let i = 0; i < inputJson.length; i++) {
                data.push({input: inputJson[i], output: outputJson[i]})
            }
            this.#brainTrainingData = data;
            console.log(data);

            console.log("Input lenght: " + data[0].input.length);
            //test brain - remove later
            
            var net = new brain.NeuralNetwork();

            net.train(data);

            var output = net.run({
                Age: 0.42,
                Gender: 1,
                Height: 0.736,
                Weight: 0.492
              }); // { white: 0.99, black: 0.002 }
              
            console.log(output);

            

            //end test brain
            
            toastr.success("Starting conversion");
        }
    }

    //************** */
    // Network
    //************** */
    selectedNetworkChange(){
        this.#selectedNetwork = this.SELECTED_NETWORK.options[this.SELECTED_NETWORK.selectedIndex].value;

        switch (this.#selectedNetwork) {
            case "NEURALNETWORK":
                this.initNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.initRecurrentNeuralNetwork();
                break;
        }
    }

    initNeuralNetwork() {
        this.calculateNetworkSize();
    }

    initRecurrentNeuralNetwork() {
        this.calculateNetworkSize();
    }

    calculateNetworkSize() {
        if (this.NETWORK_SIZE.value !== "") return;

        let s = [];
        if (this.#brainTrainingData[0].input.length) {
            s.push(this.#brainTrainingData[0].input.length);
            s.push(Math.max(3, Math.floor(his.#brainTrainingData[0].input.length / 2)));
            s.push(this.#brainTrainingData[0].output.length);
        } else {
            let inputLenght = 0;
            for (var i in this.#brainTrainingData[0].input) { inputLenght++; }
            let outputLenght = 0;
            for (var i in this.#brainTrainingData[0].output) { outputLenght++; }
            
            s.push(inputLenght);
            s.push(Math.max(3, Math.floor(inputLenght / 2)));
            s.push(outputLenght);
        }
        this.NETWORK_SIZE.value = s;
    }

    //************** */
    // Training
    //************** */

    //************** */
    // Test
    //************** */

}

class BrainUIContentSwitcher {

    constructor(shadow) {
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.DANFO_OUTPUTDATA = shadow.querySelector("#danfo-outputdata");
        this.DANFO_INPUTDATA = shadow.querySelector("#danfo-inputdata");

        this.PANEL_LOAD = shadow.querySelector("#panel-load");
        this.PANEL_NETWORK = shadow.querySelector("#panel-network");
        

        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        shadow.querySelector("#network-btn").addEventListener('click', this.showNetwork.bind(this));
        this.hideAll();
        this.showLoad();
    }

    showLoad() {
        this.hideAll();
        this.DANFO_OUTPUT_ELEMENT.classList.add("show");
        this.DANFO_OUTPUT_ELEMENT.classList.add("flex-grid");
        this.DANFO_OUTPUTDATA.classList.add("show");
        this.DANFO_INPUTDATA.classList.add("show");
        this.PANEL_LOAD.classList.add("show");
    }

    showNetwork() {
        this.hideAll();
        this.PANEL_NETWORK.classList.add("show");
    }

    hideAll(){
        this.PANEL_LOAD.classList.remove("show");
        this.PANEL_LOAD.classList.add("hide");

        this.DANFO_OUTPUT_ELEMENT.classList.remove("show");
        this.DANFO_OUTPUT_ELEMENT.classList.remove("flex-grid");
        this.DANFO_OUTPUT_ELEMENT.classList.add("hide");

        this.DANFO_OUTPUTDATA.classList.remove("show");
        this.DANFO_OUTPUTDATA.classList.add("hide");

        this.DANFO_INPUTDATA.classList.remove("show");
        this.DANFO_INPUTDATA.classList.add("hide");

        this.PANEL_NETWORK.classList.remove("show");
        this.PANEL_NETWORK.classList.add("hide");
    }

}

class BrainUI extends HTMLElement {

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(templateDanfo.content.cloneNode(true));
        this.brainUIContentSwitcher = new BrainUIContentSwitcher(shadow);
        this.brainUIEditor = new BrainUIEditor(shadow);
    }

    // connect component
    connectedCallback() {
        
    }

}

// register component
customElements.define('brain-ui', BrainUI );