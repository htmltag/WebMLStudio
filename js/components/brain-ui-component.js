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
    <hr/>
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
            <select id="select-network">
                <option value="NONE" disabled selected>Select network type</option>
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
            <span class="grid">
                <button id="network-try-calculate-btn">Try calculate network <i class="fa-solid fa-calculator"></i></button>
                <button id="network-clear-fields-btn">Clear fields <i class="fa-solid fa-trash-can"></i></button>
            </span>
        </div>
        <div class="grid">
            <label for="network-input-layer">
                Input Layer
                <input type="text" id="network-input-layer" placeholder="A number">
            </label>
            <label for="network-hidden-layer">
                Hidden Layer
                <input type="text" id="network-hidden-layer" placeholder="Array of ints">
            </label>
            <label for="network-output-layer">
                Output Layer
                <input type="text" id="network-output-layer" placeholder="A number">
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
        <div class="grid">
            <button id="network-render-graph">Create & Render Network</button>
            <button id="network-create-no-config">Create & Render Network with default config</button>
        </div>
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
            <span class="grid">
                <label for="training-learning-rate">
                    Learning rate
                    <input type="text" id="training-learning-rate" placeholder="Learning rate">
                </label>
                <button id="training-clear-fields-btn">Clear fields <i class="fa-solid fa-trash-can"></i></button>
            </span>
        </div>
        <button aria-busy="false" id="start-training-btn">Start training</button>
    </div>
    <div id="panel-testing">
        <div class="grid">
            <input type="text" id="testing-columns" placeholder="Array of input columns"/>
            <button id="testing-generate-form-btn">Generate form</button>
        </div>
        <hr/>
        <div id="testing-form-wrapper"></div>
        <div id="testing-result-wrapper">
            <div class="grid">
                <select id="select-testing-input-format">
                    <option value="NONE" disabled selected>Select input format</option>
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="ARRAY-OF-STRINGS">Text Array []</option>
                    <option value="ARRAY-OF-NUMBERS">Number Array []</option>
                    <option value="OBJECT">Object {}</option>
                </select>
                <button id="testing-run-btn">Run</button>
                <span class="grid" id="testing-forcast-wrapper">
                    <input type="number" id="testing-forcast-counter">
                    <button id="testing-forcast-btn">Forcast</button>
                </span>
            </div>
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


    #selectedNetwork = "NONE";
    #networkNoConfig = false;
    #selectedNetworkActivation;
    #networkConfig;
    #network;
    #labels = [];

    #logPeriod = 10;
    #trainedSuccessfully = false;

    #testingInputFormat = "NONE";
    

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
        this.NETWORK_INPUT_LAYER = shadow.querySelector("#network-input-layer");
        this.NETWORK_HIDDEN_LAYER = shadow.querySelector("#network-hidden-layer");
        this.NETWORK_OUTPUT_LAYER = shadow.querySelector("#network-output-layer");
        this.NETWORK_BINARYTHRESH = shadow.querySelector("#network-binarythresh");
        this.SELECTED_NETWORK_ACTIVATION = shadow.querySelector("#select-activation");
        this.NETWORK_LEAKY_RELU_ALPHA = shadow.querySelector("#network-leaky-relu-alpha");
        this.NETWORK_DECAY_RATE = shadow.querySelector("#network-decayrate");
        this.NETWORK_MAX_PREDICTION_LENGTH = shadow.querySelector("#network-max-prediction-length");
        this.NETWORK_REGC = shadow.querySelector("#network-regc");
        this.NETWORK_CLIPVAL = shadow.querySelector("#network-clipval");
        this.NETWORK_SMOOTH_EPS = shadow.querySelector("#network-smooth-eps");
        this.NETWORK_RENDER = shadow.querySelector("#network-render");

        shadow.querySelector("#network-btn").addEventListener('click', this.initNetwork.bind(this));
        shadow.querySelector("#select-network").addEventListener('change', this.selectedNetworkChange.bind(this));
        shadow.querySelector("#network-try-calculate-btn").addEventListener('click', this.calculateNetworkSize.bind(this));
        shadow.querySelector("#network-clear-fields-btn").addEventListener('click', this.clearNetworkFields.bind(this));
        shadow.querySelector("#select-activation").addEventListener('change', this.selectedNetworkActivationChange.bind(this));
        shadow.querySelector("#network-render-graph").addEventListener('click', this.renderNetworkGraphWithConfig.bind(this));
        shadow.querySelector("#network-create-no-config").addEventListener('click', this.renderNetworkGraphNoConfig.bind(this));

        // Training
        this.TRAINING_ITERATIONS = shadow.querySelector("#training-iterations");
        this.TRAINING_ERROR_THRESH = shadow.querySelector("#training-error-thresh");
        this.TRAINING_LEARNING_RATE = shadow.querySelector("#training-learning-rate");
        this.TRAINING_OUTPUT_LOG = shadow.querySelector("#training-output-log");
        this.TRAINING_PROGRESS = shadow.querySelector("#training-progress");
        this.TRAINING_START_BTN = shadow.querySelector("#start-training-btn");

        shadow.querySelector("#training-btn").addEventListener('click', this.initTraining.bind(this));
        shadow.querySelector("#start-training-btn").addEventListener('click', this.startTraining.bind(this));
        shadow.querySelector("#training-clear-fields-btn").addEventListener('click', this.clearTrainingFields.bind(this));

        // Testing
        this.TESTING_INPUT_COLUMNS = shadow.querySelector("#testing-columns");
        this.TESTING_FORM = shadow.querySelector("#testing-form-wrapper");
        this.TESTING_RESULT = shadow.querySelector("#testing-result");
        this.TESTING_SELECT_INPUT_FORMAT = shadow.querySelector("#select-testing-input-format");
        this.TESTING_FORCAST_COUNTER = shadow.querySelector("#testing-forcast-counter");
        this.TESTING_FORCAST_WRAPPER = shadow.querySelector("#testing-forcast-wrapper");

        shadow.querySelector("#testing-btn").addEventListener('click', this.initTesting.bind(this));
        shadow.querySelector("#testing-generate-form-btn").addEventListener('click', this.generateTestingForm.bind(this));
        shadow.querySelector("#testing-run-btn").addEventListener('click', this.runTest.bind(this));
        shadow.querySelector("#select-testing-input-format").addEventListener('change', this.selectedTestingInputFormatChange.bind(this));
        shadow.querySelector("#testing-forcast-btn").addEventListener('click', this.forcast.bind(this));

        // Export
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
    initNetwork() {
        this.NETWORK_RENDER.innerHTML = "";
    }

    selectedNetworkChange(){
        this.#selectedNetwork = this.SELECTED_NETWORK.options[this.SELECTED_NETWORK.selectedIndex].value;

        switch (this.#selectedNetwork) {
            case "NEURALNETWORK": 
                this.#network = new brain.NeuralNetwork();
                this.mapDefaultNetworkConfigToInputFields();
                this.initNeuralNetwork();
                break;
            case "NEURALNETWORKGPU":
                this.#network = new brain.NeuralNetworkGPU();
                this.mapDefaultNetworkConfigToInputFields();
                this.initNeuralNetwork();
                break;
            case "NEURALNETWORK-FEED-FORWARD":
                this.#network = new brain.FeedForward();
                this.mapDefaultNetworkConfigToInputFields();
                this.initNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-RNN-TIME-STEP": 
                this.#network = new brain.recurrent.RNNTimeStep();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM-TIME-STEP":
                this.#network = new brain.recurrent.LSTMTimeStep();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU-TIME-STEP":
                this.#network = new brain.recurrent.GRUTimeStep();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-RNN":
                this.#network = new brain.recurrent.RNN();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM":
                this.#network = new brain.recurrent.LSTM();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU":
                this.#network = new brain.recurrent.GRU();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.#network = new brain.Recurrent();
                this.mapDefaultNetworkConfigToInputFields();
                this.initRecurrentNeuralNetwork();
                break;
        }
    }

    selectedNetworkActivationChange(){
        const selectedActivationOption = this.SELECTED_NETWORK_ACTIVATION.options[this.SELECTED_NETWORK_ACTIVATION.selectedIndex].value;

        if (selectedActivationOption === "NONE" || selectedActivationOption === "SIGMOID") this.#selectedNetworkActivation = "sigmoid";
        if (selectedActivationOption === "RELU") this.#selectedNetworkActivation = "relu"
        if (selectedActivationOption === "LEAKYRELU") this.#selectedNetworkActivation = "leaky-relu"
        if (selectedActivationOption === "TANH") this.#selectedNetworkActivation = "tanh"
    }

    mapDefaultNetworkConfigToInputFields() {
        this.NETWORK_INPUT_LAYER.value = this.getValueForNetworkInputField("inputSize");
        this.NETWORK_HIDDEN_LAYER.value = this.getValueForNetworkInputField("hiddenLayers");
        this.NETWORK_OUTPUT_LAYER.value = this.getValueForNetworkInputField("outputSize");
        this.NETWORK_LEAKY_RELU_ALPHA.value = this.getValueForNetworkInputField("leakyReluAlpha");
        this.NETWORK_BINARYTHRESH.value = this.getValueForNetworkInputField("binaryThresh");
        this.NETWORK_DECAY_RATE.value = this.getValueForNetworkInputField("decayRate");
        this.NETWORK_SMOOTH_EPS.value = this.getValueForNetworkInputField("smoothEps");
        this.NETWORK_REGC.value = this.getValueForNetworkInputField("regc");
        this.NETWORK_CLIPVAL.value = this.getValueForNetworkInputField("clipval");
        this.NETWORK_MAX_PREDICTION_LENGTH.value = this.getValueForNetworkInputField("maxPredictionLength");
    }

    getValueForNetworkInputField(networkProperty) {
        const val = this.getPropertyValueFromObject(networkProperty, this.#network);
        if (val === null) {
            return "";
        } else {
            if ((typeof val === 'number') || Array.isArray(val)) {
                return val;
            } else {
                return "";
            }
        }
    }

    getPropertyValueFromObject(propertyToFind, objectToFindIn) {
        for (const [key, value] of Object.entries(objectToFindIn)) {
            if((typeof value === 'string') || (typeof value === 'number') || Array.isArray(value)) {
                if (key === propertyToFind) return value;
            } else if (this.isObject(value)){
                for (const [k, v] of Object.entries(value)) {
                    if((typeof v === 'string') || (typeof v === 'number') || Array.isArray(v)) {
                        if (k === propertyToFind) return v;
                    }
                }
            }
        }
        return null;
    }

    //Initialize neural network with default values
    initNeuralNetwork() {
        this.NETWORK_NN_FIELDS.classList.remove("hide");
        this.NETWORK_NN_FIELDS.classList.add("show");
        this.NETWORK_RNN_FIELDS.classList.remove("show");
        this.NETWORK_RNN_FIELDS.classList.add("hide");
    }

    initRecurrentNeuralNetwork() {
        this.NETWORK_RNN_FIELDS.classList.remove("hide");
        this.NETWORK_RNN_FIELDS.classList.add("show");
        this.NETWORK_NN_FIELDS.classList.remove("show");
        this.NETWORK_NN_FIELDS.classList.add("hide");
    }

    clearNetworkFields() {
        this.NETWORK_INPUT_LAYER.value = "";
        this.NETWORK_HIDDEN_LAYER.value = "";
        this.NETWORK_OUTPUT_LAYER.value = "";
        this.NETWORK_LEAKY_RELU_ALPHA.value = "";
        this.NETWORK_BINARYTHRESH.value = "";
        this.NETWORK_DECAY_RATE.value = "";
        this.NETWORK_SMOOTH_EPS.value = "";
        this.NETWORK_REGC.value = "";
        this.NETWORK_CLIPVAL.value = "";
        this.NETWORK_MAX_PREDICTION_LENGTH.value = "";
        this.NETWORK_LEARNING_RATE.value = "";
    }

    calculateNetworkSize() {
        if (this.#brainTrainingData[0]?.input?.length) {
            this.NETWORK_INPUT_LAYER.value = this.#brainTrainingData[0].input.length;
            this.NETWORK_HIDDEN_LAYER.value = Math.max(3, Math.floor(this.#brainTrainingData[0].input.length / 2));
            this.NETWORK_OUTPUT_LAYER.value = this.#brainTrainingData[0].output.length;
        } else {
            let inputLenght = 0;
            if (this.#brainTrainingData[0]?.input) {
                for (var i in this.#brainTrainingData[0].input) { inputLenght++; }
            } else {
                for (var i in this.#brainTrainingData[0]) { inputLenght++; }
            }

            let outputLenght = 0;
            if (this.#brainTrainingData[0].output) {
                for (var i in this.#brainTrainingData[0].output) { outputLenght++; }
            } else {
                for (var i in this.#brainTrainingData[0]) { outputLenght++; }
            }

            this.NETWORK_INPUT_LAYER.value = inputLenght;
            this.NETWORK_HIDDEN_LAYER.value = Math.max(3, Math.floor(inputLenght / 2));
            this.NETWORK_OUTPUT_LAYER.value = outputLenght;
        }
    }

    renderNetworkGraphNoConfig() {
        this.#networkNoConfig = true;
        this.renderNetworkGraph();
    }

    renderNetworkGraphWithConfig() {
        this.#networkNoConfig = false;
        this.renderNetworkGraph();
    }

    renderNetworkGraph() {
        if (this.#selectedNetwork === "NONE") toastr.error("Must select network type")
        if (this.#selectedNetwork.startsWith("NEURALNETWORK")) {
            this.renderNeuralNetwork();
        } else {
            this.renderRecurrentNeuralNetwork();
        }
    }

    renderNeuralNetwork() {
        if(this.#networkNoConfig === false) this.generateNeuralNetworkConfig();
        switch (this.#selectedNetwork) {
            case "NEURALNETWORK": 
                this.#network = this.#networkNoConfig ? new brain.NeuralNetwork() : new brain.NeuralNetwork(this.#networkConfig);
                this.renderNetwork();
                break;
            case "NEURALNETWORKGPU":
                this.#network = this.#networkNoConfig ? new brain.NeuralNetworkGPU() : new brain.NeuralNetworkGPU(this.#networkConfig);
                this.renderNetwork();
                break;
            case "NEURALNETWORK-FEED-FORWARD":
                this.#network = this.#networkNoConfig ? new brain.FeedForward() : new brain.FeedForward(this.#networkConfig);
                this.renderNetwork();
                break;
        }
    }

    renderRecurrentNeuralNetwork() {
        if(this.#networkNoConfig === false) this.generateRecurrentNeuralNetworkConfig();
        switch (this.#selectedNetwork) {
            case "RECURRENTNEURALNETWORK-RNN-TIME-STEP": 
                this.#network = this.#networkNoConfig ? new brain.recurrent.RNNTimeStep() : new brain.recurrent.RNNTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM-TIME-STEP":
                this.#network = this.#networkNoConfig ? new brain.recurrent.LSTMTimeStep() : new brain.recurrent.LSTMTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU-TIME-STEP":
                this.#network = this.#networkNoConfig ? new brain.recurrent.GRUTimeStep() : new brain.recurrent.GRUTimeStep(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-RNN":
                this.#network = this.#networkNoConfig ? new brain.recurrent.RNN() : new brain.recurrent.RNN(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-LSTM":
                this.#network = this.#networkNoConfig ? new brain.recurrent.LSTM() : new brain.recurrent.LSTM(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK-GRU":
                this.#network = this.#networkNoConfig ? new brain.recurrent.GRU() : new brain.recurrent.GRU(this.#networkConfig);
                this.renderNetwork();
                break;
            case "RECURRENTNEURALNETWORK":
                this.#network = this.#networkNoConfig ? new brain.Recurrent() : new brain.Recurrent(this.#networkConfig);
                this.renderNetwork();
                break;
        }
    }

    renderNetwork() {
        const height = this.NETWORK_RENDER.offsetHeight;
        const width = this.NETWORK_RENDER.offsetWidth;
        if (this.#networkNoConfig) {
            this.NETWORK_RENDER.innerHTML = brain.utilities.toSVG(this.#network, {height: height, width: width});
        } else {
            this.NETWORK_RENDER.innerHTML = brain.utilities.toSVG(this.#network, {height: height, width: width, inputs:{labels: this.getLabels()}});
        }
        
    }

    getLabels() {
        if (this.#dfInput.columns && (this.#dfInput.columns.length === this.#networkConfig.inputRange)) {
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
            let labels = [];
                for (let i = 0; i < this.#networkConfig.inputRange; i++) {labels.push("input-" + i)}
                this.#labels = labels;
                return labels;
        }
    }

    generateNeuralNetworkConfig() {
        try {
            let config = {};

            if (this.NETWORK_INPUT_LAYER.value !== "") {
                config["inputSize"] = Number(this.NETWORK_INPUT_LAYER.value);
                config["inputRange"] = Number(this.NETWORK_INPUT_LAYER.value);
            }

            if (this.NETWORK_HIDDEN_LAYER.value !== "") {
                config["hiddenLayers"] = this.NETWORK_HIDDEN_LAYER.value.split(",");
            }

            if (this.NETWORK_OUTPUT_LAYER.value !== "") {
                config["outputSize"] = Number(this.NETWORK_OUTPUT_LAYER.value);
            }

            if (this.NETWORK_LEAKY_RELU_ALPHA.value !== "") {
                config["leakyReluAlpha"] = Number(this.NETWORK_LEAKY_RELU_ALPHA.value);
            }

            if (this.NETWORK_BINARYTHRESH.value !== "") {
                config["binaryThresh"] = Number(this.NETWORK_BINARYTHRESH.value);
            }

            if (this.#selectedNetworkActivation !== undefined) {
                config["activation"] = this.#selectedNetworkActivation;
            }

            this.#networkConfig = config;
        } catch(err) {
            toastr.error("Config error " + err);
        }
        
    }

    generateRecurrentNeuralNetworkConfig() {
        try {
            let config = {};

            if (this.NETWORK_INPUT_LAYER.value !== "") {
                config["inputSize"] = Number(this.NETWORK_INPUT_LAYER.value);
                config["inputRange"] = Number(this.NETWORK_INPUT_LAYER.value);
            }

            if (this.NETWORK_HIDDEN_LAYER.value !== "") {
                config["hiddenLayers"] = this.NETWORK_HIDDEN_LAYER.value.split(",");
            }

            if (this.NETWORK_OUTPUT_LAYER.value !== "") {
                config["outputSize"] = Number(this.NETWORK_OUTPUT_LAYER.value);
            }

            if (this.NETWORK_DECAY_RATE.value !== "") {
                config["decayRate"] = Number(this.NETWORK_DECAY_RATE.value);
            }

            if (this.NETWORK_SMOOTH_EPS.value !== "") {
                config["smoothEps"] = Number(this.NETWORK_SMOOTH_EPS.value);
            }

            if (this.NETWORK_REGC.value !== "") {
                config["regc"] = Number(this.NETWORK_REGC.value);
            }

            if (this.NETWORK_CLIPVAL.value !== "") {
                config["clipval"] = Number(this.NETWORK_CLIPVAL.value);
            }

            if (this.NETWORK_MAX_PREDICTION_LENGTH.value !== "") {
                config["maxPredictionLength"] = Number(this.NETWORK_MAX_PREDICTION_LENGTH.value);
            }

            this.#networkConfig = config;
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
        this.TRAINING_OUTPUT_LOG.innerHTML = "";
        this.initTrainingNetwork();
    }

    initTrainingNetwork() {
        this.TRAINING_ITERATIONS.value = this.getValueForNetworkInputField("iterations");
        this.TRAINING_ERROR_THRESH.value = this.getValueForNetworkInputField("errorThresh");
        this.TRAINING_LEARNING_RATE.value = this.getValueForNetworkInputField("learningRate");
    }

    clearTrainingFields() {
        this.TRAINING_ITERATIONS.value = "";
        this.TRAINING_ERROR_THRESH.value = "";
        this.TRAINING_LEARNING_RATE.value = "";
    }

    startTraining() {
        this.TRAINING_START_BTN.setAttribute("aria-busy", true);
        this.TRAINING_START_BTN.innerHTML = "Training..."

        // Set a timeout so UI can update before long running process of training starts.
        setTimeout(() => {
            try {
                this.trainNetwork();
            } catch(err) {
                this.TRAINING_START_BTN.setAttribute("aria-busy", false);
                console.log(err);
                toastr.error("Training error: " + err);
                this.TRAINING_OUTPUT_LOG.innerHTML += "<div style='text-align: center; color:red'>Error: " + err + "</div>";
            }
        }, 20);  
    }

    trainNetwork() {
        this.TRAINING_OUTPUT_LOG.innerHTML = "";

        let trainingConfig = {
            log: details => console.log(details),
            logPeriod: this.#logPeriod,
        }

        if (this.TRAINING_ITERATIONS.value !== "") {
            trainingConfig["iterations"] = Number(this.TRAINING_ITERATIONS.value);
        }

        if (this.TRAINING_ERROR_THRESH.value !== "") {
            trainingConfig["errorThresh"] = Number(this.TRAINING_ERROR_THRESH.value);
        }

        if (this.TRAINING_LEARNING_RATE.value !== "") {
            trainingConfig["learningRate"] = Number(this.TRAINING_LEARNING_RATE.value);
        }

        const result = this.#network.train(this.#brainTrainingData, trainingConfig);

        if (result) {
            this.TRAINING_START_BTN.setAttribute("aria-busy", false);
            this.TRAINING_START_BTN.innerHTML = "Start training"
            this.#trainedSuccessfully = true;
            this.TRAINING_OUTPUT_LOG.innerHTML += "<div style='text-align: center;color:green'>Result error: " + result.error + " iterations: " + result.iterations + "</div>";
        }
    }

    //************** */
    // Test
    //************** */


    initTesting() {
        this.TESTING_INPUT_COLUMNS.value = this.#labels;
        this.TESTING_RESULT.innerHTML = "";
        this.TESTING_FORM.innerHTML = "";

        this.TESTING_FORCAST_WRAPPER.classList.add("hide");
        if (this.#selectedNetwork === "RECURRENTNEURALNETWORK-RNN-TIME-STEP" ||
        this.#selectedNetwork === "RECURRENTNEURALNETWORK-LSTM-TIME-STEP" ||
        this.#selectedNetwork === "RECURRENTNEURALNETWORK-GRU-TIME-STEP") {
            this.TESTING_FORCAST_WRAPPER.classList.remove("hide");
            this.TESTING_FORCAST_WRAPPER.classList.add("show");
            this.TESTING_FORCAST_WRAPPER.classList.add("flex-grid");
        }
    }

    selectedTestingInputFormatChange() {
        this.#testingInputFormat = this.TESTING_SELECT_INPUT_FORMAT.options[this.TESTING_SELECT_INPUT_FORMAT.selectedIndex].value;
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
        try {
            this.TESTING_RESULT.innerHTML = "";
            this.TESTING_RESULT.innerHTML = JSON.stringify(this.#network.run(this.generateTestInput()));
            toastr.success("Run complete");
        } catch(err) {
            toastr.error("Network run failed. " + err);
        }
        

    }

    forcast() {
        if (this.TESTING_FORCAST_COUNTER.value == undefined) toastr.error("Add number to the forcast counter");
        this.TESTING_RESULT.innerHTML = "";
        this.TESTING_RESULT.innerHTML = JSON.stringify(this.#network.forcast(this.generateTestInput(), this.TESTING_FORCAST_COUNTER.value));
    }

    generateTestInput() {
        if (this.TESTING_INPUT_COLUMNS.value === "") toastr.error("Missing values to generate testing form");

        const inputTestColumns = this.TESTING_INPUT_COLUMNS.value.split(',');

        if (this.#testingInputFormat === "NONE") {
            toastr.error("Select a input format");
            return;
        }

        if (this.#testingInputFormat === "TEXT") {
            let testInputData = "";
            for (const key in inputTestColumns) {
                if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                    const element = inputTestColumns[key].toLocaleLowerCase();
                    testInputData+= this.#shadow.querySelector('#testing-input-' + element).value;
                }
            }
            return testInputData;
        }

        if (this.#testingInputFormat === "NUMBER") {
            let testInputData;
            for (const key in inputTestColumns) {
                if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                    const element = inputTestColumns[key].toLocaleLowerCase();
                    testInputData = this.performeArithmeticOnTestInput(this.#shadow.querySelector('#testing-input-' + element).value);
                }
            }
            return testInputData;
        }

        if (this.#testingInputFormat === "ARRAY-OF-STRINGS") {
            let testInputData = [];
            for (const key in inputTestColumns) {
                if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                    const element = inputTestColumns[key].toLocaleLowerCase();
                    testInputData.push(this.#shadow.querySelector('#testing-input-' + element).value);
                }
            }
            return testInputData;
        }

        if (this.#testingInputFormat === "ARRAY-OF-NUMBERS") {
            let testInputData = [];
            for (const key in inputTestColumns) {
                if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                    const element = inputTestColumns[key].toLocaleLowerCase();
                    testInputData.push(this.performeArithmeticOnTestInput(this.#shadow.querySelector('#testing-input-' + element).value));
                }
            }
            return testInputData;
        }


        if (this.#testingInputFormat === "OBJECT") {
            let testInputData = {};
            for (const key in inputTestColumns) {
                if (Object.hasOwnProperty.call(inputTestColumns, key)) {
                    const element = inputTestColumns[key].toLocaleLowerCase();
                    testInputData[element] = this.performeArithmeticOnTestInput(this.#shadow.querySelector('#testing-input-' + element).value);
                }
            }
            return testInputData;
        }
        
    }

    performeArithmeticOnTestInput(inputValue) {
        if (typeof inputValue === "string") {
            if (inputValue.includes("/")) {
                const v = inputValue.split("/");
                const v0 = Number(v[0].trim());
                const v1 = Number(v[1].trim());
                return Number(v0 / v1);
            }

            if (inputValue.includes("*")) {
                const v = inputValue.split("*");
                const v0 = Number(v[0].trim());
                const v1 = Number(v[1].trim());
                return Number(v0 * v1);
            }

            if (inputValue.includes("+")) {
                const v = inputValue.split("+");
                const v0 = Number(v[0].trim());
                const v1 = Number(v[1].trim());
                return Number(v0 + v1);
            }

            if (inputValue.includes("-")) {
                const v = inputValue.split("-");
                const v0 = Number(v[0].trim());
                const v1 = Number(v[1].trim());
                return Number(v0 - v1);
            }
        }
        return inputValue;
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