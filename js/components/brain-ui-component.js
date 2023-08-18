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

#file-dataset-input::before {
    content: 'Input';
    margin-right: 10px;
}

#file-dataset-output::before {
    content: 'Output';
    margin-right: 10px;
}

.load-from-options {
	border: none;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	break-before: always;
	margin: 0 0 3em 0;
}

.floatBlock {
    margin: 0 1.81em 0 0;
  }
</style>
<div>
    <nav>
        <ul>
            <li><a href="#" role="button" id="load-btn">Load Training Data</a></li>
            <li><a href="#" role="button" id="network-btn">Network</a></li>
            <li><a href="#" role="button" id="training-btn">Training</a></li>
            <li><a href="#" role="button" id="testing-btn">Testing</a></li>
            <li><a href="#" role="button" id="export-btn">Export</a></li>
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
            <div id="raw-json-wrapper" class="hide">
                <label for="load-switch-raw-json">
                    <br/>  
                    <input type="checkbox" id="load-switch-raw-json" name="only-input" role="switch">
                    Raw JSON
                </label>
            </div>
            <input type="text" id="delimiter" class="hide" placeholder="Delimiter for CSV (default is comma , )">
        </div>
        <hr/>
        <div>
            <div class="load-from-options"> <span class="floatBlock">Load from:</span> 
                <label for="radio-load-from-file" class="floatBlock">
                    <input type="radio" id="radio-load-from-file" name="radio-load-from" value="File" checked>
                    File
                </label>
                <label for="radio-load-from-url" class="floatBlock">
                    <input type="radio" id="radio-load-from-url" name="radio-load-from" value="Url">
                    Url
                </label>
                <label for="large" class="floatBlock">
                    <input type="radio" id="radio-load-from-local-storage" name="radio-load-from" value="local-storage">
                    Local storage
                </label>
            </div>
            <div id="from-file">
                <div class="grid">
                    <input type="file" id="file-dataset-input" name="file-dataset">
                    <input type="file" id="file-dataset-output" name="file-dataset">
                </div>
            </div>
            <div id="from-url">
                <div class="grid">
                    <div class="grid">
                        <input type="txt" id="url-to-dataset-input" placeholder="Url..."><button id="load-from-url-input">Load input</button>
                    </div>
                    <div class="grid">
                        <input type="txt" id="url-to-dataset-output" placeholder="Url..."><button id="load-from-url-output">Load output</button>
                    </div>
                </div>
            </div>
            <div id="from-local-storage">
                <div class="grid">
                    <select id="select-localstorage-load">
                        <option value="NONE" disabled selected>Dataset to load from</option>
                    </select>
                    <button id="load-localstorage-input-btn">Input</button>
                    <button id="load-localstorage-output-btn">Output</button>
                </div>
            </div>
        </div>
        <hr/>
        <div class="grid">
            <label for="load-switch-only-input">  
                <input type="checkbox" id="load-switch-only-input" name="only-input" role="switch">
                Use only input data
            </label>
            <button id="convert-load-to-brain-btn">Load data to Brain training data</button>
        </div>
    </div>
    <div id="panel-network">
        <div class="grid">
            <label for="select-network">
                Network type
            <select id="select-network">
                <option value="NONE" disabled selected>Select network</option>
                <option value="NEURALNETWORK">Feedforward Neural Network</option>
                <option value="NEURALNETWORKGPU">Feedforward Neural Network GPU</option>
                <option value="RECURRENTNEURALNETWORK-RNN-TIME-STEP">Time Step Recurrent Neural Network (RNN)</option>
                <option value="RECURRENTNEURALNETWORK-LSTM-TIME-STEP">Time Step Long Short Term Memory Neural Network (LSTM)</option>
                <option value="RECURRENTNEURALNETWORK-GRU-TIME-STEP">Time Step Gated Recurrent Unit (GRU)</option>
                <option value="RECURRENTNEURALNETWORK-RNN">Recurrent Neural Network (RNN)</option>
                <option value="RECURRENTNEURALNETWORK-LSTM">Long Short Term Memory Neural Network (LSTM)</option>
                <option value="RECURRENTNEURALNETWORK-GRU">Gated Recurrent Unit (GRU)</option>
                <option value="NEURALNETWORK-FEED-FORWARD">Highly Customizable Feedforward Neural Network</option>
                <option value="RECURRENTNEURALNETWORK">Highly Customizable Recurrent Neural Network</option>
            </select>
            </label>
            <label for="network-size">
                Network size
                <input type="text" id="network-size" placeholder="Array of ints">
            </label>
        </div>
        <div id="network-nn-fields" class="hide">
            <span class="grid">
                <label for="network-binarythresh">
                    Binary Thresh
                    <input type="text" id="network-binarythresh" placeholder="BinaryThresh">
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
            </span>
        </div>
        <div id="network-rnn-fields" class="hide">
            <span class="grid">
                <label for="network-learningrate">
                    Learning Rate
                    <input type="text" id="network-learningrate" placeholder="Learning rate">
                </label>
                <label for="network-decayrate">
                    Decay Rate
                    <input type="text" id="network-decayrate" placeholder="Decay rate">
                </label>
                <label for="network-max-prediction-length">
                    Max Prediction Length
                    <input type="text" id="network-max-prediction-length" placeholder="Max Prediction Length">
                </label>
            </span>
            <span class="grid">
                <label for="network-regc">
                    Regc
                    <input type="text" id="network-regc" placeholder="Regc">
                </label>
                <label for="network-clipval">
                    Clipval
                    <input type="text" id="network-clipval" placeholder="Clipval">
                </label>
                <label for="network-smooth-eps">
                    Smooth Eps
                    <input type="text" id="network-smooth-eps" placeholder="Smooth Eps">
                </label>
            </span>
        </div>
        <button id="network-render-graph">Create & Render Network</button>
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
        <hr/>
        <div id="testing-form-wrapper"></div>
        <div id="testing-result-wrapper">
            <button id="testing-run-btn">Run</button>
            <span id="testing-result"></span> 
        </div>
    </div>
    <div id="panel-export">
        <p id="export-nothing-to-export">
            You need to successfully train a model to be able to export it.
        </p>
        <div id="export-ready-to-export">
            You can export your sucessfully trained brain js model.<br/>
            <div class="grid">
                <input type="text" placeholder="Name your model" id="export-model-name">
                <button id="export-download-model-btn">Download</button>
            </div>    
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
    #radioLoadFrom = "FILE";
    #inputLoaded = false;
    #outputLoaded = false;
    #useOnlyInputData = false;
    #useRawJSON = false;
    #inputDataStructureType = "NONE";
    #outputDataStructureType = "NONE";
    #brainTrainingData;


    #selectedNetwork;
    #selectedNetworkActivation;
    #networkConfig;
    #network;

    #iterations;
    #errorThresh;

    #labels = [];

    #trainedSuccessfully = false;
    

    constructor(shadow) {
        this.#shadow = shadow;

        // Load Danfo data
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.DANFO_OUTPUTDATA = shadow.querySelector("#danfo-outputdata");
        this.DANFO_INPUTDATA = shadow.querySelector("#danfo-inputdata");
        this.FILE_DATASET_INPUT = shadow.querySelector("#file-dataset-input");
        this.FILE_DATASET_OUTPUT = shadow.querySelector("#file-dataset-output");
        this.SELECT_FILETYPE_LOAD = shadow.querySelector("#select-filetype-load");
        this.SELECT_LOCALSTORAGE_LOAD = shadow.querySelector("#select-localstorage-load");
        this.URL_TO_DATASET_INPUT = shadow.querySelector("#url-to-dataset-input");
        this.URL_TO_DATASET_OUTPUT = shadow.querySelector("#url-to-dataset-output");
        this.DELIMITER = shadow.querySelector("#delimiter");
        this.ONLY_INPUT = shadow.querySelector("#load-switch-only-input");
        this.RAW_JSON_WRAPPER = shadow.querySelector("#raw-json-wrapper");
        this.RAW_JSON_SWITCH = shadow.querySelector("#load-switch-raw-json");
        this.RADIO_LOAD_FROM = shadow.querySelectorAll("input[name='radio-load-from']");
        this.FROM_LOCAL_STORAGE = shadow.querySelector("#from-local-storage");
        this.FROM_FILE = shadow.querySelector("#from-file");
        this.FROM_URL = shadow.querySelector("#from-url");
        
        shadow.querySelector("#empty-btn").addEventListener('click', this.empty.bind(this));
        shadow.querySelector("#radio-load-from-local-storage").addEventListener('change', this.radioLoadFromChange.bind(this));
        shadow.querySelector("#radio-load-from-file").addEventListener('change', this.radioLoadFromChange.bind(this));
        shadow.querySelector("#radio-load-from-url").addEventListener('change', this.radioLoadFromChange.bind(this));
        shadow.querySelector("#file-dataset-input").addEventListener('change', this.loadInputFile.bind(this));
        shadow.querySelector("#file-dataset-output").addEventListener('change', this.loadOutputFile.bind(this));
        shadow.querySelector("#select-filetype-load").addEventListener('change', this.selectFiletypeLoadChange.bind(this));
        shadow.querySelector("#load-from-url-input").addEventListener('click', this.loadInputFromURL.bind(this));
        shadow.querySelector("#load-from-url-output").addEventListener('click', this.loadOutputFromURL.bind(this));
        shadow.querySelector("#load-localstorage-input-btn").addEventListener('click', this.loadLocalStorageInput.bind(this));
        shadow.querySelector("#load-localstorage-output-btn").addEventListener('click', this.loadLocalStorageOutput.bind(this));
        shadow.querySelector("#select-localstorage-load").addEventListener('change', this.selectLocalStorageLoadChange.bind(this));
        shadow.querySelector("#load-switch-only-input").addEventListener('change', this.selectOnlyInputChange.bind(this));
        shadow.querySelector("#load-switch-raw-json").addEventListener('change', this.rawJsonChange.bind(this));
        shadow.querySelector("#convert-load-to-brain-btn").addEventListener('click', this.convertToBrainDataFormat.bind(this));
        
        // Network
        this.NETWORK_NN_FIELDS = shadow.querySelector("#network-nn-fields");
        this.NETWORK_RNN_FIELDS = shadow.querySelector("#network-rnn-fields");
        this.SELECTED_NETWORK = shadow.querySelector("#select-network");
        this.NETWORK_SIZE = shadow.querySelector("#network-size");
        this.NETWORK_BINARYTHRESH = shadow.querySelector("#network-binarythresh");
        this.SELECTED_NETWORK_ACTIVATION = shadow.querySelector("#select-activation");
        this.NETWORK_LEAKY_RELU_ALPHA = shadow.querySelector("#network-leaky-relu-alpha");
        this.NETWORK_LEARNING_RATE = shadow.querySelector("#network-learningrate");
        this.NETWORK_DECAY_RATE = shadow.querySelector("#network-decayrate");
        this.NETWORK_MAX_PREDICTION_LENGTH = shadow.querySelector("#network-max-prediction-length");
        this.NETWORK_REGC = shadow.querySelector("#network-regc");
        this.NETWORK_CLIPVAL = shadow.querySelector("#network-clipval");
        this.NETWORK_SMOOTH_EPS = shadow.querySelector("#network-smooth-eps");
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

        //export
        this.EXPORT_NOTHING_TO_EXPORT = shadow.querySelector("#export-nothing-to-export");
        this.EXPORT_READY_TO_EXPORT = shadow.querySelector("#export-ready-to-export");
        this.EXPORT_MODEL_NAME = shadow.querySelector("#export-model-name");

        shadow.querySelector("#export-btn").addEventListener('click', this.initExport.bind(this));
        shadow.querySelector("#export-download-model-btn").addEventListener('click', this.downloadBrainModel.bind(this));
        
        //main init
        this.init();
    }

    init() {
        this.loadDatastoreNames();
        this.hideAllLoadFrom();
        this.FROM_FILE.classList.add("show");
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

    playRawJSON(inputOrOutput) {
        if (inputOrOutput.toLocaleLowerCase() === "input") {
            this.DANFO_INPUTDATA.innerHTML = "<p style='color:black'>" + JSON.stringify(this.#dfInput) + "</p>";
        } else {
            this.DANFO_OUTPUTDATA.innerHTML = "<p style='color:black'>" + JSON.stringify(this.#dfOutput) + "</p>";
        }
    }

    //************** */
    // Load Danfo
    //************** */

    selectFiletypeLoadChange() {
        this.#selectedFiletypeLoad = this.SELECT_FILETYPE_LOAD.options[this.SELECT_FILETYPE_LOAD.selectedIndex].value;
        if(this.#selectedFiletypeLoad === "JSON") {
            this.RAW_JSON_WRAPPER.classList.add("show");
            this.RAW_JSON_WRAPPER.classList.remove("hide");

            this.DELIMITER.classList.remove("show");
            this.DELIMITER.classList.add("hide")
        } else if (this.#selectedFiletypeLoad === "CSV"){
            this.DELIMITER.classList.remove("hide");
            this.DELIMITER.classList.add("show")

            this.RAW_JSON_WRAPPER.classList.add("hide");
            this.RAW_JSON_WRAPPER.classList.remove("show");
        } else {
            this.RAW_JSON_WRAPPER.classList.add("hide");
            this.RAW_JSON_WRAPPER.classList.remove("show");

            this.DELIMITER.classList.remove("show");
            this.DELIMITER.classList.add("hide")
        }
    }

    selectLocalStorageLoadChange() {
        this.#selectedLocalStorageLoad = this.SELECT_LOCALSTORAGE_LOAD.options[this.SELECT_LOCALSTORAGE_LOAD.selectedIndex].value;
    }

    selectOnlyInputChange() {
        this.#useOnlyInputData = this.ONLY_INPUT.checked;
    }

    rawJsonChange() {
        this.#useRawJSON = this.RAW_JSON_SWITCH.checked;
    }

    radioLoadFromChange() {
        for (const radioButton of this.RADIO_LOAD_FROM) {
            if (radioButton.checked) {
                this.#radioLoadFrom = radioButton.value;
                break;
            }
        }

        if (this.#radioLoadFrom === "File") {
            this.hideAllLoadFrom();
            this.FROM_FILE.classList.add("show");
        } else if (this.#radioLoadFrom === "Url") {
            this.hideAllLoadFrom();
            this.FROM_URL.classList.add("show");
        } else {
            this.hideAllLoadFrom();
            this.FROM_LOCAL_STORAGE.classList.add("show");
        }
    }

    hideAllLoadFrom() {
        this.FROM_LOCAL_STORAGE.classList.remove("show");
        this.FROM_LOCAL_STORAGE.classList.add("hide");

        this.FROM_FILE.classList.remove("show");
        this.FROM_FILE.classList.add("hide");

        this.FROM_URL.classList.remove("show");
        this.FROM_URL.classList.add("hide");
    }

    loadInputFile() {
        this.loadFile("input");
    }

    loadOutputFile() {
        this.loadFile("output");
    }

    loadFile(inputOrOutput) {
        try {
            const inputfile = inputOrOutput.toLocaleLowerCase() === "input" ? this.FILE_DATASET_INPUT.files[0] : this.FILE_DATASET_OUTPUT.files[0];
            const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";
            switch (this.#selectedFiletypeLoad) {
                case 'NONE':
                    toastr.error("Please select filetype");
                    break;
                case 'JSON':
                    if (this.#useRawJSON) {
                        let reader = new FileReader();
                        reader.readAsText(inputfile);
                        reader.onload = () => {
                            if (inputOrOutput.toLocaleLowerCase() === "input") {
                                this.#dfInput = JSON.parse(reader.result);
                                this.playRawJSON(inputOrOutput);
                            } else {
                                this.#dfOutput = JSON.parse(reader.result);
                                this.playRawJSON(inputOrOutput);
                            }
                        }
                    } else {
                        dfd.readJSON(inputfile).then((df) => {
                            if (inputOrOutput.toLocaleLowerCase() === "input") {
                                this.#dfInput = df;
                            } else {
                                this.#dfOutput = df;
                            }
                            this.play();
                        });
                    }
                    break;
                case 'EXCEL':
                    dfd.readExcel(inputfile).then((df) => {
                        if (inputOrOutput.toLocaleLowerCase() === "input") {
                            this.#dfInput = df;
                        } else {
                            this.#dfOutput = df;
                        }
                        this.play();
                    })
                    break;
                case 'CSV':
                    dfd.readCSV(inputfile, {delimeter: delimiter}).then((df) => {
                        if (inputOrOutput.toLocaleLowerCase() === "input") {
                            this.#dfInput = df;
                        } else {
                            this.#dfOutput = df;
                        }
                        this.play();
                    });
                    break;
            }
            if (inputOrOutput.toLocaleLowerCase() === "input") {
                this.#inputLoaded = true;
                toastr.success("Input data loaded");
            } else {
                this.#outputLoaded = true;
                toastr.success("Input data loaded");
            }
        } catch {
            toastr.error("Failed to load file");
        }
    }

    loadInputFromURL(){
        this.loadFromURL("input");
    }

    loadOutputFromURL(){
        this.loadFromURL("output");
    }

    loadFromURL(inputOrOutput) {
        try {
            const url = inputOrOutput.toLocaleLowerCase === "input" ? this.URL_TO_DATASET_INPUT.value : this.URL_TO_DATASET_OUTPUT.value;
            const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";

            switch (this.#selectedFiletypeLoad) {
                case 'NONE':
                    toastr.error("Please select filetype");
                    break;
                case 'JSON':
                    dfd.readJSON(url).then((df) => {
                        if (inputOrOutput.toLocaleLowerCase() === "input") {
                            this.#dfInput = df;
                        } else {
                            this.#dfOutput = df;
                        }
                        this.play();
                    });
                    break;
                case 'EXCEL':
                    dfd.readExcel(url).then((df) => {
                        if (inputOrOutput.toLocaleLowerCase() === "input") {
                            this.#dfInput = df;
                        } else {
                            this.#dfOutput = df;
                        }
                        this.play();
                    });
                    break;
                case 'CSV':
                    dfd.readCSV(url, {delimeter: delimiter}).then((df) => {
                        if (inputOrOutput.toLocaleLowerCase() === "input") {
                            this.#dfInput = df;
                        } else {
                            this.#dfOutput = df;
                        }
                        this.play();
                    });
                    break;
            }
            if (inputOrOutput.toLocaleLowerCase() === "input") {
                this.#inputLoaded = true;
                toastr.success("Input data loaded");
            } else {
                this.#outputLoaded = true;
                toastr.success("Input data loaded");
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
        }
    }

    hasOutputLoaded() {
        if (!this.#outputLoaded) {
            this.#outputLoaded = true;
            toastr.success("Output data loaded");
        }
    }

    convertToBrainDataFormat() {
        if (!this.#inputLoaded && !this.#outputLoaded) toastr.error("No input or output data is loaded!");
        if ( (this.#inputLoaded && this.#outputLoaded) && this.#useOnlyInputData === true) toastr.error("Remove output data or switch off Use only input");
        if(this.#inputLoaded && this.#useOnlyInputData) {
            try {
                const inputJson = this.#useRawJSON ? this.#dfInput : dfd.toJSON(this.#dfInput);
                this.checkDataStructureType(inputJson, "input");

                if(this.#inputDataStructureType !== "FAIL") {
                    this.#brainTrainingData = inputJson;
                    toastr.success("Data successfully loaded");
                }
            } catch {
                toastr.error("Data did not load");
            }
        }
        if ( (this.#inputLoaded && this.#outputLoaded) && !this.#useOnlyInputData) {
            const inputJson = this.#useRawJSON ? this.#dfInput : dfd.toJSON(this.#dfInput);
            const outputJson = this.#useRawJSON ? this.#dfOutput : dfd.toJSON(this.#dfOutput);

            this.checkDataStructureType(inputJson, "input");
            this.checkDataStructureType(outputJson, "output");

            // if input and output is not of same type
            if (this.#inputDataStructureType !== this.#outputDataStructureType) {
                toastr.error("Input and output data is not of the same type");
                return;
            }

            let data = [];
            for (let i = 0; i < inputJson.length; i++) {
                if (this.#inputDataStructureType === "ARRAY-OF-OBJECTS") {
                    data.push({input: inputJson[i], output: outputJson[i]})
                } else {
                    data.push({input: [inputJson[i]], output: [outputJson[i]]})
                }
            }
            this.#brainTrainingData = data;
            
            toastr.success("Data has been converted and loaded to Brain");
        }
    }

    checkDataStructureType(data, inputOrOutput) {
        // Check if data is of type array
        if (!Array.isArray(data)) {
            this.setDataStructureType(inputOrOutput, "FAIL");
            toastr.error("Data is not an array");
            return;
        } 
        
        // check if it's a array and not empty, if not, then abort
        if (Array.isArray(data) && data.length === 0) {
            this.setDataStructureType(inputOrOutput, "FAIL");
            toastr.error("Empty array");
            return;
        } 

        // Check what type of array it is.

        // Check if array of arrays
        if (Array.isArray(data[0])) {
            this.setDataStructureType(inputOrOutput, "ARRAY-OF-ARRAYS");
            return;
        }

        // check if array of numbers
        if ((typeof data[0]) === "number") {
            this.setDataStructureType(inputOrOutput, "ARRAY-OF-NUMBERS");
            return;
        }

        // check if array of strings
        if ((typeof data[0]) === "string") {
            this.setDataStructureType(inputOrOutput, "ARRAY-OF-STRINGS");
            return;
        }

        // Check if array of objects
        if (this.isObject(data[0])) {
            this.setDataStructureType(inputOrOutput, "ARRAY-OF-OBJECTS");
            return;
        }

        this.setDataStructureType(inputOrOutput, "FAIL");
        toastr.error("Something whent wrong");
        return;
    }

    isObject(objValue) {
        return objValue && typeof objValue === 'object' && objValue.constructor === Object;
    }

    setDataStructureType(inputOrOutput, type) {
        if (inputOrOutput.toLocaleLowerCase() === "input") {
            this.#inputDataStructureType = type;
        } else {
            this.#outputDataStructureType = type;
        }
    }

    //************** */
    // Network
    //************** */
    selectedNetworkChange(){
        this.#selectedNetwork = this.SELECTED_NETWORK.options[this.SELECTED_NETWORK.selectedIndex].value;

        if (this.#selectedNetwork.startsWith("NEURALNETWORK")) {
            this.initNeuralNetwork();
        } else {
            this.initRecurrentNeuralNetwork();
        }
    }

    selectedNetworkActivationChange(){
        this.#selectedNetworkActivation = this.SELECTED_NETWORK_ACTIVATION.options[this.SELECTED_NETWORK_ACTIVATION.selectedIndex].value;
    }

    //Initialize neural network with default values
    initNeuralNetwork() {
        this.NETWORK_NN_FIELDS.classList.remove("hide");
        this.NETWORK_NN_FIELDS.classList.add("show");
        this.NETWORK_RNN_FIELDS.classList.remove("show");
        this.NETWORK_RNN_FIELDS.classList.add("hide");
        this.calculateNetworkSize();
        this.NETWORK_BINARYTHRESH.value = 0.5;
        this.NETWORK_LEAKY_RELU_ALPHA.value = 0.01;
    }

    initRecurrentNeuralNetwork() {
        this.NETWORK_RNN_FIELDS.classList.remove("hide");
        this.NETWORK_RNN_FIELDS.classList.add("show");
        this.NETWORK_NN_FIELDS.classList.remove("show");
        this.NETWORK_NN_FIELDS.classList.add("hide");
        this.calculateNetworkSize();
        this.NETWORK_LEARNING_RATE.value = 0.01;
        this.NETWORK_DECAY_RATE.value = 0.999;
        this.NETWORK_MAX_PREDICTION_LENGTH.value = 100;
        this.NETWORK_REGC.value = 0.000001;
        this.NETWORK_CLIPVAL.value = 5;
        this.NETWORK_SMOOTH_EPS.value = 1e-8;
    }

    calculateNetworkSize() {
        if (this.NETWORK_SIZE.value !== "") return;

        let s = [];
        if (this.#brainTrainingData[0]?.input?.length) {
            s.push(this.#brainTrainingData[0].input.length);
            s.push(Math.max(3, Math.floor(this.#brainTrainingData[0].input.length / 2)));
            s.push( this.#useOnlyInputData ? 1 : this.#brainTrainingData[0].output.length);
        } else {
            let inputLenght = 0;
            if (this.#brainTrainingData[0]?.input) {
                for (var i in this.#brainTrainingData[0].input) { inputLenght++; }
            } else if (this.#inputDataStructureType === "ARRAY-OF-STRINGS"){
                inputLenght = 1;
            } else {
                for (var i in this.#brainTrainingData[0]) { inputLenght++; }
            }
            
            let outputLenght = 0;
            if (this.#useOnlyInputData) {
                outputLenght = 1;
            } else if (this.#brainTrainingData[0].output) {
                for (var i in this.#brainTrainingData[0].output) { outputLenght++; }
            } else {
                for (var i in this.#brainTrainingData[0]) { outputLenght++; }
            }
            
            
            s.push(inputLenght);
            s.push(Math.max(3, Math.floor(inputLenght / 2)));
            s.push(outputLenght);
        }
        this.NETWORK_SIZE.value = s;
    }

    renderNetworkGraph() {
        if (this.#selectedNetwork.startsWith("NEURALNETWORK")) {
            this.renderNeuralNetwork();
        } else {
            this.renderRecurrentNeuralNetwork();
        }
    }

    renderNeuralNetwork() {
        this.generateNeuralNetworkConfig();
        switch (this.#selectedNetwork) {
            case "NEURALNETWORK": 
                this.#network = new brain.NeuralNetwork(this.#networkConfig);
                this.renderNetwork();
                break;
            case "NEURALNETWORKGPU":
                this.#network = new brain.NeuralNetworkGPU(this.#networkConfig);
                this.renderNetwork();
                break;
            case "NEURALNETWORK-FEED-FORWARD":
                this.#network = new brain.FeedForward(this.#networkConfig);
                this.renderNetwork();
                break;
        }
    }

    renderRecurrentNeuralNetwork() {
        this.generateRecurrentNeuralNetworkConfig();
        switch (this.#selectedNetwork) {
            case "RECURRENTNEURALNETWORK-RNN-TIME-STEP": 
                this.#network = new brain.recurrent.RNNTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM-TIME-STEP":
                this.#network = new brain.recurrent.LSTMTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU-TIME-STEP":
                this.#network = new brain.recurrent.GRUTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-RNN":
                this.#network = new brain.recurrent.RNN(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM":
                this.#network = new brain.recurrent.LSTM(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU":
                this.#network = new brain.recurrent.GRU(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.#network = new brain.Recurrent(this.#networkConfig);
                this.renderNetwork();
                break;
        }
    }

    renderNetwork() {
        const height = this.NETWORK_RENDER.offsetHeight;
        const width = this.NETWORK_RENDER.offsetWidth;
        this.NETWORK_RENDER.innerHTML = brain.utilities.toSVG(this.#network, {height: height, width: width, inputs:{labels: this.getLabels()}});
    }

    getLabels() {
        if (this.#dfInput.columns) {
            if (this.#dfInput.columns[0] === "input" || this.#dfInput.columns[0].input) {
                let labels = [];
                let counter = 0;
                for (let i in this.#dfInput.columns) {labels.push("input-" + counter++)}
                this.#labels = labels;
                return labels;
            } else {
                this.#labels = this.#dfInput.columns; 
                return this.#dfInput.columns;
            }
        } else {
            if (this.#inputDataStructureType === "ARRAY-OF-STRINGS") {
                return ["Text"];
            } else if (this.#inputDataStructureType === "ARRAY-OF-NUMBERS") {
                return ["Value"];
            } else {
                return ["Input"];
            }
        }
    }

    generateNeuralNetworkConfig() {
        try {
            if (this.NETWORK_SIZE.value === "") this.calculateNetworkSize();
            const size = this.NETWORK_SIZE.value.split(',').map((item) => {return parseInt(item, 10)});
            this.#networkConfig = {
                inputSize: size[0],
                inputRange: size[0],
                hiddenLayers: size.slice(1, size.length - 1),
                outputSize: size[size.length - 1],
                leakyReluAlpha: this.NETWORK_LEAKY_RELU_ALPHA.value === "" ? 0.01 : Number(this.NETWORK_LEAKY_RELU_ALPHA.value),
                binaryThresh: this.NETWORK_BINARYTHRESH.value === "" ? 0.5 : Number(this.NETWORK_BINARYTHRESH.value),
                activation: this.#selectedNetworkActivation === undefined ? 'sigmoid' : this.#selectedNetworkActivation
            };
        } catch(err) {
            toastr.error("Config error " + err);
        }
        
    }

    generateRecurrentNeuralNetworkConfig() {
        try {
            if (this.NETWORK_SIZE.value === "") this.calculateNetworkSize();
            const size = this.NETWORK_SIZE.value.split(',').map((item) => {return parseInt(item, 10)});
            this.#networkConfig = {
                inputSize: size[0],
                inputRange: size[0],
                hiddenLayers: size.slice(1, size.length - 1),
                outputSize: size[size.length - 1],
                decayRate: this.NETWORK_DECAY_RATE.value === "" ? 0.999 : Number(this.NETWORK_DECAY_RATE.value),
                smoothEps: Number(this.NETWORK_SMOOTH_EPS.value === "" ? 1e-8 : this.NETWORK_SMOOTH_EPS.value),
                regc: this.NETWORK_REGC.value === "" ? 0.000001 : Number(this.NETWORK_REGC.value),
                clipval: this.NETWORK_CLIPVAL.value === "" ? 5 : Number(this.NETWORK_CLIPVAL.value),
                maxPredictionLength: this.NETWORK_MAX_PREDICTION_LENGTH.value === "" ? 100 : Number(this.NETWORK_MAX_PREDICTION_LENGTH.value),
                learningRate: this.NETWORK_LEARNING_RATE.value === "" ? 0.01 : Number(this.NETWORK_LEARNING_RATE.value)
            };
        } catch(err) {
            toastr.error("Config error " + err);
        }
        
    }

    //************** */
    // Training
    //************** */

    //Initialize the training data
    initTraining() {
        if (this.#selectedNetwork == undefined || this.#selectedNetwork === "") toastr.error("No network type is selected");
        
        if (this.#selectedNetwork.startsWith("NEURALNETWORK")) {
            this.initTrainingNeuralnetwork();
        } else {
            this.initTrainingRecurrentNeuralnetwork();
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
        try {
            if (this.#selectedNetwork.startsWith("NEURALNETWORK")) {
                this.trainNeuralNetwork();
            } else {
                this.trainReccurentNeuralNetwork();
            }
        } catch(err) {
            toastr.error("Training error: " + err);
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
    }

    trainReccurentNeuralNetwork() {
        this.#iterations = Number(this.TRAINING_ITERATIONS.value === "" ? 2000 : this.TRAINING_ITERATIONS.value);
        this.#errorThresh = Number(this.TRAINING_ERROR_THRESH.value === "" ? 0.005 : this.TRAINING_ERROR_THRESH.value);
        const learningRate = Number(this.TRAINING_LEARNING_RATE.value === "" ? 0.1 : this.TRAINING_LEARNING_RATE.value);
        this.TRAINING_PROGRESS.max = this.#iterations;
        const result = this.#network.train(this.#brainTrainingData, {
            iterations: this.#iterations,
            errorThresh: this.#errorThresh,
            learningRate: learningRate,
            log: details => this.trainingLog(details),
            logPeriod: 10,
        });
    }

    trainingLog(details) {
        this.#trainedSuccessfully = false;
        //this.TRAINING_PROGRESS.value = details.iterations;
        console.log(details);
        let output = "";
        if(this.#errorThresh >= details.error) {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem; color:red;'>";
        } else {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem;'>";
        }

        if(this.#iterations -1 <= details.iterations) {
            output = "<div style='text-align: center; padding-top:1rem; padding-bottom: 1rem; color:green;'>";
            this.#trainedSuccessfully = true;
        }

        output += "Error: " + details.error + " Limit: " + this.#errorThresh;
        output += "<br/>";
        output += "Iterations: " + details.iterations + " of " + this.#iterations; 
        output += "</div>";

        this.TRAINING_OUTPUT_LOG.innerHTML = output;
    }

    //************** */
    // Test
    //************** */


    initTesting() {
        this.TESTING_INPUT_COLUMNS.value = this.#labels;
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
        let el = "<label for='testing-input-" + name.toLocaleLowerCase() + "'>" + name
        el += "<input type='text' id='testing-input-" + name.toLocaleLowerCase() + "' placeholder='input value'></label>"
        return el;
    }

    runTest() {
        this.TESTING_RESULT.innerHTML = "";
        this.TESTING_RESULT.innerHTML = JSON.stringify(this.#network.run(this.generateTestInput()));
    }

    generateTestInput() {
        if (this.TESTING_INPUT_COLUMNS.value === "") toastr.error("Missing values to generate testing form");

        const inputTestColumns = this.TESTING_INPUT_COLUMNS.value.split(',');

        let testInputData = {};
        for (const key in inputTestColumns) {
            if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                const element = inputTestColumns[key].toLocaleLowerCase();
                testInputData[element] = this.#shadow.querySelector('#testing-input-' + element).value;
            }
        }
        return testInputData;
    }

    //************ */
    // Export
    //************ */

    initExport() {
        if (this.#trainedSuccessfully) {
            this.EXPORT_READY_TO_EXPORT.classList.remove("hide");
            this.EXPORT_READY_TO_EXPORT.classList.add("show");

            this.EXPORT_NOTHING_TO_EXPORT.classList.add("hide");
            this.EXPORT_NOTHING_TO_EXPORT.classList.remove("show");
        } else {
            this.EXPORT_READY_TO_EXPORT.classList.add("hide");
            this.EXPORT_READY_TO_EXPORT.classList.remove("show");

            this.EXPORT_NOTHING_TO_EXPORT.classList.add("show");
            this.EXPORT_NOTHING_TO_EXPORT.classList.remove("hide");
        }
    }

    downloadBrainModel() {
        const fileName = this.EXPORT_MODEL_NAME.value !== "" ? this.EXPORT_MODEL_NAME.value + ".json" : "brain-model.json";
        let a = document.createElement("a");
        a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.#network.toJSON()));
        a.target = '_blank';
        a.download = fileName;
        a.click();
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

        this.PANEL_EXPORT = shadow.querySelector("#panel-export");

    
        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        shadow.querySelector("#network-btn").addEventListener('click', this.showNetwork.bind(this));
        shadow.querySelector("#training-btn").addEventListener('click', this.showTraining.bind(this));
        shadow.querySelector("#testing-btn").addEventListener('click', this.showTesting.bind(this));
        shadow.querySelector("#export-btn").addEventListener('click', this.showExport.bind(this));
        
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

    showExport() {
        this.hideAll();
        this.PANEL_EXPORT.classList.add("show");
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

        this.PANEL_EXPORT.classList.remove("show");
        this.PANEL_EXPORT.classList.add("hide");
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