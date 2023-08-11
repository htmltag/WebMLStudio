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

#network-render {
    background-color: #fff;
    min-height: 400px;
}
</style>
<div>
    <nav>
        <ul>
            <li><a href="#" role="button" id="load-btn">Load</a></li>
            <li><a href="#" role="button" id="network-btn">Network</a></li>
            <li><a href="#" role="button" id="training-btn">Training</a></li>
            <li><a href="#" role="button" id="testing-btn">Testing</a></li>
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
                <input type="text" id="network-leaky-relu-alpha" placeholder="Leaky Relu Alpha">
            </label>
        </div>
        <button id="network-render-graph">Render</button>
    </div>
    <div id="panel-training">
        <div class="grid">
            <label for="training-iterations">
                Iterations
                <input type="text" id="training-iterations" placeholder="Max Iterations">
            </label>
            <label for="training-error-thresh">
                Error Thresh
                <input type="text" id="training-error-thresh" placeholder="Error percentage">
            </label>
            <label for="training-learning-rate">
                Training rate
                <input type="text" id="training-learning-rate" placeholder="Learning rate">
            </label>
        </div>
        <button id="start-training-btn">Start training</button>
    </div>
    <div id="panel-testing">
        <div class="grid">
            <input type="text" id="testing-columns" placeholder="Array of input columns"/>
            <button id="testing-generate-form-btn">Generate form</button>
        </div>
        <div id="testing-form-wrapper"></div>
        <div id="testing-result-wrapper">
            <button id="testing-run-btn">Run</button>
            <span id="testing-result"></span> 
        </div>
    </div>

    <div id="danfo-output">
        <div id="danfo-inputdata"></div>
        <div id="danfo-outputdata"></div>
    </div>
    <div id="network-render"></div>
    <div id="training-output">
        <div id="training-output-log"></div>
        <progress id="training-progress" value="0" max="100"></progress>
    </div>
</div>
`;

class BrainUIEditor {
    #shadow;

    #dfInput;
    #dfOutput;
    #datastores;
    #selectedFiletypeLoad = "NONE";
    #selectedLocalStorageLoad = "NONE";
    #inputLoaded = false;
    #outputLoaded = false;
    #brainTrainingData;

    #selectedNetwork;
    #selectedNetworkActivation;
    #networkConfig;
    #network;

    #iterations;
    #errorThresh;
    #trainingProgress;
    

    constructor(shadow) {
        this.#shadow = shadow;
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
        this.NETWORK_BINARYTHRESH = shadow.querySelector("#network-binarythresh");
        this.SELECTED_NETWORK_ACTIVATION = shadow.querySelector("#select-activation");
        this.NETWORK_LEAKY_RELU_ALPHA = shadow.querySelector("#network-leaky-relu-alpha");
        this.NETWORK_RENDER = shadow.querySelector("#network-render");

        shadow.querySelector("#select-network").addEventListener('change', this.selectedNetworkChange.bind(this));
        shadow.querySelector("#select-activation").addEventListener('change', this.selectedNetworkChange.bind(this));
        shadow.querySelector("#network-render-graph").addEventListener('click', this.renderNetworkGraph.bind(this));

        //Training
        this.TRAINING_ITERATIONS = shadow.querySelector("#training-iterations");
        this.TRAINING_ERROR_THRESH = shadow.querySelector("#training-error-thresh");
        this.TRAINING_LEARNING_RATE = shadow.querySelector("#training-learning-rate");
        this.TRAINING_OUTPUT_LOG = shadow.querySelector("#training-output-log");
        this.TRAINING_PROGRESS = shadow.querySelector("#training-progress");

        shadow.querySelector("#training-btn").addEventListener('click', this.initTraining.bind(this));
        shadow.querySelector("#start-training-btn").addEventListener('click', this.startTraining.bind(this));

        //testing
        this.TESTING_INPUT_COLUMNS = shadow.querySelector("#testing-columns");
        this.TESTING_FORM = shadow.querySelector("#testing-form-wrapper");
        this.TESTING_RESULT = shadow.querySelector("#testing-result");

        shadow.querySelector("#testing-btn").addEventListener('click', this.initTesting.bind(this));
        shadow.querySelector("#testing-generate-form-btn").addEventListener('click', this.generateTestingForm.bind(this));
        shadow.querySelector("#testing-run-btn").addEventListener('click', this.runTest.bind(this));
        
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

    selectedNetworkActivationChange(){
        this.#selectedNetworkActivation = this.SELECTED_NETWORK_ACTIVATION.options[this.SELECTED_NETWORK_ACTIVATION.selectedIndex].value;
    }

    //Initialize neural network with default values
    initNeuralNetwork() {
        this.calculateNetworkSize();
        this.NETWORK_BINARYTHRESH.value = 0.5;

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

    renderNetworkGraph() {
        switch (this.#selectedNetwork) {
            case "NEURALNETWORK":
                this.renderNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                renderRecurrentNeuralNetwork();
                break;
        }
    }

    renderNeuralNetwork() {
        this.generateNeuralNetworkConfig();
        this.#network = new brain.NeuralNetwork(this.#networkConfig);
        this.NETWORK_RENDER.innerHTML = brain.utilities.toSVG(this.#network, {inputs:{labels: this.#dfInput.columns}});
    }

    renderRecurrentNeuralNetwork() {}

    generateNeuralNetworkConfig() {
        if (this.NETWORK_SIZE.value === "") this.calculateNetworkSize();
        const size = this.NETWORK_SIZE.value.split(',').map((item) => {return parseInt(item, 10)});
        this.#networkConfig = {
            inputSize: size[0],
            inputRange: size[0],
            hiddenLayers: size.slice(1, size.length - 1),
            outputSize: size[size.length - 1],
            leakyReluAlpha: this.NETWORK_LEAKY_RELU_ALPHA.value === "" ? 0.01 : this.NETWORK_LEAKY_RELU_ALPHA.value,
            binaryThresh: this.NETWORK_BINARYTHRESH.value === "" ? 0.5 : this.NETWORK_BINARYTHRESH.value,
            activation: this.#selectedNetworkActivation === undefined ? 'sigmoid' : this.#selectedNetworkActivation
        };
    }

    //************** */
    // Training
    //************** */

    //Initialize the training data
    initTraining() {
        if (this.#selectedNetwork == undefined || this.#selectedNetwork === "") toastr.error("No network type is selected");
        switch (this.#selectedNetwork) {
            case "NEURALNETWORK":
                this.initTrainingNeuralnetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.initTrainingRecurrentNeuralnetwork();
                break;
        }
    }

    // Set default values in training UI for neural network
    initTrainingNeuralnetwork() {
        this.TRAINING_ITERATIONS.value = 2000;
        this.TRAINING_ERROR_THRESH.value = 0.005;
        this.TRAINING_LEARNING_RATE.value = 0.3;
    }

    // Set default values in training UI for recurrent neural network
    initTrainingRecurrentNeuralnetwork() {
        this.TRAINING_ITERATIONS.value = 2000;
        this.TRAINING_ERROR_THRESH.value = 0.005;
        this.TRAINING_LEARNING_RATE.value = 0.1;
    }

    startTraining() {
        switch (this.#selectedNetwork) {
            case "NEURALNETWORK":
                this.trainNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.trainReccurentNeuralNetwork();
                break;
        }
    }

    trainNeuralNetwork() {
        this.#iterations = Number(this.TRAINING_ITERATIONS.value === "" ? 2000 : this.TRAINING_ITERATIONS.value);
        this.#errorThresh = Number(this.TRAINING_ERROR_THRESH.value === "" ? 0.005 : this.TRAINING_ERROR_THRESH.value);
        const learningRate = Number(this.TRAINING_LEARNING_RATE.value === "" ? 0.3 : this.TRAINING_LEARNING_RATE.value);
        this.TRAINING_PROGRESS.max = this.#iterations;
        const result = this.#network.train(this.#brainTrainingData, {
            iterations: this.#iterations,
            errorThresh: this.#errorThresh,
            learningRate: learningRate,
            log: details => this.trainingLog(details),
            logPeriod: 10, 
        });
        //console.log(result);
    }

    trainReccurentNeuralNetwork() {
        this.#iterations = Number(this.TRAINING_ITERATIONS.value === "" ? 2000 : this.TRAINING_ITERATIONS.value);
        this.#errorThresh = Number(this.TRAINING_ERROR_THRESH.value === "" ? 0.005 : this.TRAINING_ERROR_THRESH.value);
        const learningRate = Number(this.TRAINING_LEARNING_RATE.value === "" ? 0.3 : this.TRAINING_LEARNING_RATE.value);
        this.TRAINING_PROGRESS.max = this.#iterations;
        const result = this.#network.train(this.#brainTrainingData, {
            iterations: this.#iterations,
            errorThresh: this.#errorThresh,
            learningRate: learningRate,
            log: details => this.trainingLog(details),
            logPeriod: 10,
        });
        //console.log(result);
    }

    trainingLog(details) {
        this.TRAINING_PROGRESS.value = details.iterations;
        console.log(details);
        let output = "";
        if(this.#errorThresh >= details.error.toFixed(2)) {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem; color:red;'>";
        } else {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem;'>";
        }

        if(this.#iterations === details.iterations) {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem; color:green;'>";
        }

        output += "Error: " + (details.error * 100).toFixed(2) + "%. Limit: " + this.#errorThresh * 100 + "%";
        output += "<br/>";
        output += "Iterations: " + details.iterations + " of " + this.#iterations; 
        output += "</div>";

        this.TRAINING_OUTPUT_LOG.innerHTML = output;
    }

    //************** */
    // Test
    //************** */


    initTesting() {
        if (this.#dfInput.columns.length > 0) {
            this.TESTING_INPUT_COLUMNS.value = this.#dfInput.columns;
        }
    }
    
    generateTestingForm() {
        if (this.TESTING_INPUT_COLUMNS.value === "") toastr.error("Missing values to generate testing form");

        const inputTestColumns = this.TESTING_INPUT_COLUMNS.value.split(',');

        let elements = "";
        for (const key in inputTestColumns) {
            if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                const element = inputTestColumns[key];
                elements += this.getTestInputElement(element);
            }
        }

        this.TESTING_FORM.innerHTML = elements;
    }

    getTestInputElement(name) {
        let el = "<label for='testing-input-" + name + "'>" + name;
        el += "<input type='text' id='testing-input-" + name + "' placeholder='input value'></label>"
        return el;
    }

    runTest() {
        this.TESTING_RESULT.value = "";

        const testInput = this.generateTestInput;
        console.log("test input: " + testInput);

        this.TESTING_RESULT.value = this.#network.run(testInput);
    }

    generateTestInput() {
        if (this.TESTING_INPUT_COLUMNS.value === "") toastr.error("Missing values to generate testing form");

        const inputTestColumns = this.TESTING_INPUT_COLUMNS.value.split(',');

        let values = {};
        for (const key in inputTestColumns) {
            if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                const element = inputTestColumns[key];
                let el = this.#shadow.querySelector("#"+element);
                values[element] = el.value;
            }
        }

        return values;
    }

}

class BrainUIContentSwitcher {

    constructor(shadow) {
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.DANFO_OUTPUTDATA = shadow.querySelector("#danfo-outputdata");
        this.DANFO_INPUTDATA = shadow.querySelector("#danfo-inputdata");

        this.NETWORK_RENDER = shadow.querySelector("#network-render");

        this.TRAINING_OUTPUT = shadow.querySelector("#training-output");

        this.PANEL_LOAD = shadow.querySelector("#panel-load");
        this.PANEL_NETWORK = shadow.querySelector("#panel-network");
        this.PANEL_TRAINING = shadow.querySelector("#panel-training");
        this.PANEL_TESTING = shadow.querySelector("#panel-testing");

    
        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        shadow.querySelector("#network-btn").addEventListener('click', this.showNetwork.bind(this));
        shadow.querySelector("#training-btn").addEventListener('click', this.showTraining.bind(this));
        shadow.querySelector("#testing-btn").addEventListener('click', this.showTesting.bind(this));
        
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
        this.NETWORK_RENDER.classList.add("show");
    }

    showTraining() {
        this.hideAll();
        this.PANEL_TRAINING.classList.add("show");
        this.TRAINING_OUTPUT.classList.add("show");
    }

    showTesting() {
        this.hideAll();
        this.PANEL_TESTING.classList.add("show");
    }

    hideAll(){
        this.PANEL_LOAD.classList.remove("show");
        this.PANEL_LOAD.classList.add("hide");

        this.DANFO_OUTPUT_ELEMENT.classList.remove("show");
        this.DANFO_OUTPUT_ELEMENT.classList.remove("flex-grid");
        this.DANFO_OUTPUT_ELEMENT.classList.add("hide");

        this.NETWORK_RENDER.classList.remove("show");
        this.NETWORK_RENDER.classList.add("hide");

        this.DANFO_OUTPUTDATA.classList.remove("show");
        this.DANFO_OUTPUTDATA.classList.add("hide");

        this.DANFO_INPUTDATA.classList.remove("show");
        this.DANFO_INPUTDATA.classList.add("hide");

        this.PANEL_NETWORK.classList.remove("show");
        this.PANEL_NETWORK.classList.add("hide");

        this.PANEL_TRAINING.classList.remove("show");
        this.PANEL_TRAINING.classList.add("hide");

        this.TRAINING_OUTPUT.classList.remove("show");
        this.TRAINING_OUTPUT.classList.add("hide");

        this.PANEL_TESTING.classList.remove("show");
        this.PANEL_TESTING.classList.add("hide");
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