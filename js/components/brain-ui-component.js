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

#danfo-output {
    background-color: #fff;
    min-height: 400px;
    padding-left: .6rem;
}
</style>
<div>
    <nav>
        <ul>
            <li><a href="#" role="button" id="load-btn">Load</a></li>
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
    
    <div id="danfo-output"></div>
</div>
`;

class BrainUIEditor {
    #df;
    #datastores;
    #selectedFiletypeLoad = "NONE";
    #selectedLocalStorageLoad = "NONE";
    

    constructor(shadow) {
        // Load Danfo data
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
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
        
        // 
        
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
        this.#df.print();
        try {
            this.#df.plot(this.DANFO_OUTPUT_ELEMENT).table();
        } catch(err) {
            console.log(err);
            toastr.error("Ooops! Something whent wrong.", err)
        }
        
    }

    selectFiletypeLoadChange() {
        this.#selectedFiletypeLoad = this.SELECT_FILETYPE_LOAD.options[this.SELECT_FILETYPE_LOAD.selectedIndex].value;
    }

    selectLocalStorageLoadChange() {
        this.#selectedLocalStorageLoad = this.SELECT_LOCALSTORAGE_LOAD.options[this.SELECT_LOCALSTORAGE_LOAD.selectedIndex].value;
    }

    loadInputFile() {
        const inputfile = this.FILE_DATASET.files[0];
        const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";
        switch (this.#selectedFiletypeLoad) {
            case 'NONE':
                toastr.error("Please select filetype");
                break;
            case 'JSON':
                dfd.readJSON(inputfile).then((df) => {
                    this.#df = df;
                    this.play();
                });
                break;
            case 'EXCEL':
                dfd.readExcel(inputfile).then((df) => {
                    this.#df = df;
                    this.play();
                })
                break;
            case 'CSV':
                dfd.readCSV(inputfile, {delimeter: delimiter}).then((df) => {
                    this.#df = df;
                    this.play();
                });
                break;
        }
    }

    loadFromURL() {
        const url = this.URL_TO_DATASET.value;
        const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";

        switch (this.#selectedFiletypeLoad) {
            case 'NONE':
                toastr.error("Please select filetype");
                break;
            case 'JSON':
                dfd.readJSON(url).then((df) => {
                    this.#df = df;
                    this.play();
                });
                break;
            case 'EXCEL':
                dfd.readExcel(url).then((df) => {
                    this.#df = df;
                    this.play();
                });
                break;
            case 'CSV':
                dfd.readCSV(url, {delimeter: delimiter}).then((df) => {
                    this.#df = df;
                    this.play();
                });
                break;
        }
    }

    loadLocalStorageInput(){
        if(this.#selectedLocalStorageLoad === "NONE") toastr.error("Select or fill inn dataset to save to local storage");
        this.#df = new dfd.DataFrame(JSON.parse(this.#datastores.find((data) => data.getName() === this.#selectedLocalStorageLoad).getInput()));
        this.play();
    }

    loadLocalStorageOutput(){
        if(this.#selectedLocalStorageLoad === "NONE") toastr.error("Select data to load from local storage");
        this.#df = new dfd.DataFrame(JSON.parse(this.#datastores.find((data) => data.getName() === this.#selectedLocalStorageLoad).getOutput()));
        this.play();
    }
}

class BrainUIContentSwitcher {

    constructor(shadow) {
        this.PANEL_LOAD = shadow.querySelector("#panel-load");
        

        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    showLoad() {
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    hideAll(){
        this.PANEL_LOAD.classList.remove("show");
        this.PANEL_LOAD.classList.add("hide");
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