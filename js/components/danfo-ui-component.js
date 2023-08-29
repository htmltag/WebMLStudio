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
            <li><a href="#" role="button" id="view-btn">View</a></li>
            <li><a href="#" role="button" id="missing-btn">Missing Data</a></li>
            <li><a href="#" role="button" id="drop-btn">Drop</a></li>
            <li><a href="#" role="button" id="add-btn">Add</a></li>
            <li><a href="#" role="button" id="replace-btn">Replace</a></li>
            <li><a href="#" role="button" id="scalar-btn">Scalar</a></li>
            <li><a href="#" role="button" id="save-btn">Save</a></li>
            <li><a href="#" role="button" id="play-btn"><i class="fa-solid fa-play"></i></a></li>
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
    <div id="panel-view">
        <div class="grid">
            <button id="scatter-btn">Scatter Plots</button>
            <button id="bar-chart-btn">Bar Chart</button>
            <button id="line-chart-btn">Line Chart</button>
            <button id="ctype-btn">Column types</button>
            <button id="table-view-btn">Table</button>
        </div>
    </div>
    <div id="panel-missing">
        <div class="grid">
            <button id="drop-column-btn">Drop column(s) with missing data</button>
            <button id="drop-row-btn">Drop row(s) with missing data</button>
        </div>
        <hr/>
        <div class="grid">
        <input type="text" placeholder="Fill missing data with" id="value-missing-data"><button id="fill-missing-data-btn">Fill</button>
        </div>
        <hr/>
        <div class="grid">
        <input type="text" placeholder="Column" id="column-missing-data"><input type="text" placeholder="Value" id="column-value-missing-data"> <button id="fill-missing-column-data-btn">Fill</button>
        </div>
    </div>
    <div id="panel-drop">
        <div class="grid">
            <input type="txt" placeholder="Column name" id="drop-column"><button id="drop-column-by-name-btn">Drop</button>
        </div>
    </div>
    <div id="panel-add">
        <div class="grid">
            <input type="txt" placeholder="Column name" id="add-column"><button id="add-column-by-name-btn">Add</button>
        </div>
    </div>
    <div id="panel-replace">
        <div class="grid">
        <input type="txt" placeholder="Column (empty is all)" id="replace-column">
        <input type="txt" placeholder="Old value" id="replace-old-value">
        <input type="txt" placeholder="New value" id="replace-new-value">
        <button id="replace-value-btn">Replace</button>
        </div>
    </div>
    <div id="panel-scalar">
        <div class="grid">
            <select id="select-arithmetic">
                <option value="NONE" disabled selected>Select</option>
                <option value="ADD">Add</option>
                <option value="SUB">Subtract</option>
                <option value="MUL">Multiply</option>
                <option value="DIV">Divide</option>
            </select>
            <input type="txt" id="scalar-column" placeholder="Column">
            <input type="txt" id="scalar-value" placeholder="Value">
            <button id="scalar-apply-btn">Apply</button>
        </div>
    </div>
    <div id="panel-save">
        <div class="grid">
            <input type="txt" id="filename" placeholder="filename">
            <select id="select-filetype-download">
                <option value="NONE" disabled selected>Filetype</option>
                <option value="JSON">JSON</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
            </select>
            <button id="download-btn">Download</button>
        </div>
        <hr/>
        <h2>Local storage</h2>
        <div class="grid">
            <select id="select-localstorage-save">
                <option value="NONE" disabled selected>Dataset to save to</option>
            </select>
            <input type="txt" id="new-dataset-name" placeholder="Or create new">
            <button id="save-localstorage-input-btn">Input</button>
            <button id="save-localstorage-output-btn">Output</button>
        </div>
    </div>

    <div id="danfo-output"></div>
</div>
`;

class DanfoEditor {
    #df;
    #datastores;
    #selectedFiletypeLoad = "NONE";
    #selectedLocalStorageLoad = "NONE";
    #selectedFiletypeDownload = "NONE";
    #selectedLocalStorageSave = "NONE";
    #selectedArithmetic = "NONE";
    

    constructor(shadow) {
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.FILE_DATASET = shadow.querySelector("#file-dataset");
        this.SELECT_FILETYPE_LOAD = shadow.querySelector("#select-filetype-load");
        this.SELECT_LOCALSTORAGE_LOAD = shadow.querySelector("#select-localstorage-load");
        this.SELECT_LOCALSTORAGE_SAVE = shadow.querySelector("#select-localstorage-save");
        this.NEW_DATASET_NAME = shadow.querySelector("#new-dataset-name");
        this.URL_TO_DATASET = shadow.querySelector("#url-to-dataset");
        this.DELIMITER = shadow.querySelector("#delimiter");
        this.FILENAME = shadow.querySelector("#filename");
        this.SELECT_FILETYPE_DOWNLOAD = shadow.querySelector("#select-filetype-download");
        this.VALUE_MISSING_DATA = shadow.querySelector("#value-missing-data");
        this.COLUMN_MISSING_DATA = shadow.querySelector("#column-missing-data");
        this.COLUMN_VALUE_MISSING_DATA = shadow.querySelector("#column-value-missing-data");
        this.DROP_COLUMN = shadow.querySelector("#drop-column");
        this.ADD_COLUMN = shadow.querySelector("#add-column");
        this.REPLACE_COLUMN = shadow.querySelector("#replace-column");
        this.REPLACE_OLD_VALUE = shadow.querySelector("#replace-old-value");
        this.REPLACE_NEW_VALUE = shadow.querySelector("#replace-new-value");
        this.SELECT_ARITHMETIC = shadow.querySelector("#select-arithmetic");
        this.SCALAR_COLUMN = shadow.querySelector("#scalar-column");
        this.SCALAR_VALUE = shadow.querySelector("#scalar-value");

 

        shadow.querySelector("#play-btn").addEventListener('click', this.play.bind(this));
        shadow.querySelector("#scatter-btn").addEventListener('click', this.scatterPlot.bind(this));
        shadow.querySelector("#table-view-btn").addEventListener('click', this.play.bind(this));
        shadow.querySelector("#bar-chart-btn").addEventListener('click', this.barChart.bind(this));
        shadow.querySelector("#line-chart-btn").addEventListener('click', this.lineChart.bind(this));
        shadow.querySelector("#ctype-btn").addEventListener('click', this.ctypeTable.bind(this));
        shadow.querySelector("#empty-btn").addEventListener('click', this.empty.bind(this));
        shadow.querySelector("#file-dataset").addEventListener('change', this.loadInputFile.bind(this));
        shadow.querySelector("#select-filetype-load").addEventListener('change', this.selectFiletypeLoadChange.bind(this));
        shadow.querySelector("#select-filetype-download").addEventListener('change', this.selectFiletypeDownloadChange.bind(this));
        shadow.querySelector("#load-from-url").addEventListener('click', this.loadFromURL.bind(this));
        shadow.querySelector("#download-btn").addEventListener('click', this.downloadFile.bind(this));
        shadow.querySelector("#drop-column-btn").addEventListener('click', this.dropNAColumn.bind(this));
        shadow.querySelector("#drop-row-btn").addEventListener('click', this.dropRow.bind(this));
        shadow.querySelector("#fill-missing-data-btn").addEventListener('click', this.fillMissingData.bind(this));
        shadow.querySelector("#fill-missing-column-data-btn").addEventListener('click', this.fillColumnMissingData.bind(this));
        shadow.querySelector("#drop-column-by-name-btn").addEventListener('click', this.dropColumn.bind(this));
        shadow.querySelector("#add-column-by-name-btn").addEventListener('click', this.addColumn.bind(this));
        shadow.querySelector("#replace-value-btn").addEventListener('click', this.replaceValue.bind(this));
        shadow.querySelector("#load-localstorage-input-btn").addEventListener('click', this.loadLocalStorageInput.bind(this));
        shadow.querySelector("#load-localstorage-output-btn").addEventListener('click', this.loadLocalStorageOutput.bind(this));
        shadow.querySelector("#select-localstorage-load").addEventListener('change', this.selectLocalStorageLoadChange.bind(this));
        shadow.querySelector("#save-localstorage-input-btn").addEventListener('click', this.saveLocalStorageInput.bind(this));
        shadow.querySelector("#save-localstorage-output-btn").addEventListener('click', this.saveLocalStorageOutput.bind(this));
        shadow.querySelector("#select-localstorage-save").addEventListener('change', this.selectLocalStorageSaveChange.bind(this));
        shadow.querySelector("#scalar-apply-btn").addEventListener('click', this.applyScalar.bind(this));
        shadow.querySelector("#select-arithmetic").addEventListener('change', this.selectArithmeticChange.bind(this));
        
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
                this.SELECT_LOCALSTORAGE_SAVE.add(new Option(n, n));
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
            toastr.error("Ooops! Something whent wrong.", err);
        }
        
    }

    scatterPlot(){
        this.#df.plot(this.DANFO_OUTPUT_ELEMENT).scatter();
    }

    barChart() {
        this.#df.plot(this.DANFO_OUTPUT_ELEMENT).bar();
    }

    lineChart() {
        this.#df.plot(this.DANFO_OUTPUT_ELEMENT).line();
    }

    ctypeTable() {
        this.#df.ctypes.plot(this.DANFO_OUTPUT_ELEMENT).table();
    }

    selectFiletypeLoadChange() {
        this.#selectedFiletypeLoad = this.SELECT_FILETYPE_LOAD.options[this.SELECT_FILETYPE_LOAD.selectedIndex].value;
    }

    selectLocalStorageLoadChange() {
        this.#selectedLocalStorageLoad = this.SELECT_LOCALSTORAGE_LOAD.options[this.SELECT_LOCALSTORAGE_LOAD.selectedIndex].value;
    }

    selectFiletypeDownloadChange() {
        this.#selectedFiletypeDownload = this.SELECT_FILETYPE_DOWNLOAD.options[this.SELECT_FILETYPE_DOWNLOAD.selectedIndex].value;
    }

    selectLocalStorageSaveChange() {
        this.#selectedLocalStorageSave = this.SELECT_LOCALSTORAGE_SAVE.options[this.SELECT_LOCALSTORAGE_SAVE.selectedIndex].value;
    }

    selectArithmeticChange() {
        this.#selectedArithmetic = this.SELECT_ARITHMETIC.options[this.SELECT_ARITHMETIC.selectedIndex].value;
    }

    loadInputFile() {
        const inputfile = this.FILE_DATASET.files[0];
        const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";
        switch (this.#selectedFiletypeLoad) {
            case 'NONE':
                toastr.error('Please select filetype');
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
                toastr.error('Please select filetype');
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

    downloadFile(){
        const filenameToDownload = this.FILENAME.value ? this.FILENAME.value : "web-ml-studio-data";
        switch (this.#selectedFiletypeDownload) {
            case 'NONE':
                toastr.error("Please select filetype");
                break;
            case 'JSON':
                dfd.toJSON(this.#df, { fileName: filenameToDownload + ".json", download: true });
                break;
            case 'EXCEL':
                dfd.toExcel(this.#df, { fileName: filenameToDownload + ".xlsx"});
                break;
            case 'CSV':
                dfd.toCSV(this.#df, { fileName: filenameToDownload + ".csv", download: true});
                break;
        }
    }

    saveLocalStorageInput(){
        if(this.#selectedLocalStorageSave === "NONE" && this.NEW_DATASET_NAME.value === "") toastr.error("Select or fill inn dataset to save to local storage");
        if(this.#selectedLocalStorageSave !== "NONE") {
            localDatastore.addInputData(this.#selectedLocalStorageSave, dfd.toJSON(this.#df));
        } else if (this.NEW_DATASET_NAME.value !== "") {
            localDatastore.addInputData(this.NEW_DATASET_NAME.value, dfd.toJSON(this.#df));
        }
        toastr.success("Intput data saved");
    }

    saveLocalStorageOutput(){
        if(this.#selectedLocalStorageSave === "NONE" && this.NEW_DATASET_NAME === "") toastr.error("Select or fill inn dataset to save to local storage");
        if(this.#selectedLocalStorageSave !== "NONE") {
            localDatastore.addOutputData(this.#selectedLocalStorageSave, dfd.toJSON(this.#df));
        } else if (this.NEW_DATASET_NAME.value !== "") {
            localDatastore.addOutputData(this.NEW_DATASET_NAME.value, dfd.toJSON(this.#df));
        }
        toastr.success("Output data saved");
    }

    dropNAColumn(){
        this.#df = this.#df.dropNa({axis: 0});
        this.play();
    }

    dropRow(){
        this.#df = this.#df.dropNa({axis: 1});
        this.play();
    }

    fillMissingData() {
        if (this.VALUE_MISSING_DATA.value === "") toastr.error("Fill in a value");
       this.#df = this.#df.fillNa(this.VALUE_MISSING_DATA.value); 
       this.play();
    }

    fillColumnMissingData() {
        if (this.COLUMN_VALUE_MISSING_DATA.value === "") toastr.error("Fill in a value");
        if (this.COLUMN_MISSING_DATA.value === "") toastr.error("Fill in a column");
       this.#df = this.#df.fillNa([this.COLUMN_VALUE_MISSING_DATA.value], { columns: [this.COLUMN_MISSING_DATA.value] })
       this.play();
    }

    dropColumn() {
        if (this.DROP_COLUMN.value === "") toastr.error("Fill in column name");
        this.#df.drop({ columns: this.DROP_COLUMN.value.split(',').map(item=>item.trim()), inplace: true });
        this.play();
    }

    addColumn() {
        if (this.ADD_COLUMN.value === "") toastr.error("Fill in column name");
        let columnAsArray = this.#df.column(this.#df.columns[0]).values;
        let fillWithNull = [];
        for (let i = 0; i < columnAsArray.length; i++) {
            fillWithNull.push(null);
        }
        this.#df = this.#df.addColumn(this.ADD_COLUMN.value, fillWithNull);
        this.play();
    }

    replaceValue() {
        if (this.REPLACE_OLD_VALUE.value === "") toastr.error("Fill in old value");
        if (this.REPLACE_NEW_VALUE.value === "") toastr.error("Fill in new value");
        const oldValue = isNaN(this.REPLACE_OLD_VALUE.value) ? this.REPLACE_OLD_VALUE.value : Number(this.REPLACE_OLD_VALUE.value);  
        const newValue = isNaN(this.REPLACE_NEW_VALUE.value) ? this.REPLACE_NEW_VALUE.value : Number(this.REPLACE_NEW_VALUE.value);  
        if (this.REPLACE_COLUMN.value === "") {
            this.#df = this.#df.replace(oldValue, newValue);
        } else {
            this.#df = this.#df.replace(oldValue, newValue, {columns: this.REPLACE_COLUMN.value.split(',').map(item=>item.trim())});
        }
        this.play();
    }

    applyScalar(){
        if (this.#selectedArithmetic === "") toastr.error("Select type of arithmetic to use");
        if (this.SCALAR_COLUMN.value === "") toastr.error("Fill in a column");
        if (this.SCALAR_VALUE.value === "") toastr.error("Fill in a value");
        
        const valueToUse = isNaN(this.SCALAR_VALUE.value) ? this.SCALAR_VALUE.value : Number(this.SCALAR_VALUE.value);  
        let columnAsArray = this.#df.column(this.SCALAR_COLUMN.value).values;

        let newValuesArray = [];
        columnAsArray.forEach((val) => {
            switch (this.#selectedArithmetic) {
                case "ADD":
                    newValuesArray.push(val + valueToUse);
                    break;
                case "SUB":
                    newValuesArray.push(val - valueToUse);
                    break;
                case "MUL":
                    newValuesArray.push(val * valueToUse);
                    break;
                case "DIV":
                    newValuesArray.push(val / valueToUse);
                    break;
            }
        })

        this.#df = this.#df.drop({ columns: [this.SCALAR_COLUMN.value] });
        this.#df = this.#df.addColumn(this.SCALAR_COLUMN.value, newValuesArray);
        
        this.play();
    }
}

class DanfoContentSwitcher {

    constructor(shadow) {
        this.PANEL_LOAD = shadow.querySelector("#panel-load");
        this.PANEL_VIEW = shadow.querySelector("#panel-view");
        this.PANEL_MISSING = shadow.querySelector("#panel-missing");
        this.PANEL_DROP = shadow.querySelector("#panel-drop");
        this.PANEL_ADD = shadow.querySelector("#panel-add");
        this.PANEL_REPLACE = shadow.querySelector("#panel-replace");
        this.PANEL_SCALAR = shadow.querySelector("#panel-scalar");
        this.PANEL_SAVE = shadow.querySelector("#panel-save");

        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        shadow.querySelector("#view-btn").addEventListener('click', this.showView.bind(this));
        shadow.querySelector("#missing-btn").addEventListener('click', this.showMissingData.bind(this));
        shadow.querySelector("#drop-btn").addEventListener('click', this.showDrop.bind(this));
        shadow.querySelector("#add-btn").addEventListener('click', this.showAdd.bind(this));
        shadow.querySelector("#replace-btn").addEventListener('click', this.showReplace.bind(this));
        shadow.querySelector("#scalar-btn").addEventListener('click', this.showScalar.bind(this));
        shadow.querySelector("#save-btn").addEventListener('click', this.showSave.bind(this));
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    showLoad() {
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    showView() {
        this.hideAll();
        this.PANEL_VIEW.classList.add("show");
    }

    showMissingData() {
        this.hideAll();
        this.PANEL_MISSING.classList.add("show");
    }

    showDrop() {
        this.hideAll();
        this.PANEL_DROP.classList.add("show");
    }

    showAdd() {
        this.hideAll();
        this.PANEL_ADD.classList.add("show");
    }

    showReplace(){
        this.hideAll();
        this.PANEL_REPLACE.classList.add("show");
    }

    showScalar(){
        this.hideAll();
        this.PANEL_SCALAR.classList.add("show");
    }

    showSave() {
        this.hideAll();
        this.PANEL_SAVE.classList.add("show");
    }
    
    hideAll(){
        this.PANEL_LOAD.classList.remove("show");
        this.PANEL_LOAD.classList.add("hide");

        this.PANEL_VIEW.classList.remove("show");
        this.PANEL_VIEW.classList.add("hide");

        this.PANEL_MISSING.classList.remove("show");
        this.PANEL_MISSING.classList.add("hide");

        this.PANEL_DROP.classList.remove("show");
        this.PANEL_DROP.classList.add("hide");

        this.PANEL_ADD.classList.remove("show");
        this.PANEL_ADD.classList.add("hide");

        this.PANEL_REPLACE.classList.remove("show");
        this.PANEL_REPLACE.classList.add("hide");

        this.PANEL_SCALAR.classList.remove("show");
        this.PANEL_SCALAR.classList.add("hide");

        this.PANEL_SAVE.classList.remove("show");
        this.PANEL_SAVE.classList.add("hide");
    }

}

class DanfoUI extends HTMLElement {

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(templateDanfo.content.cloneNode(true));
        this.dfContentSwitcher = new DanfoContentSwitcher(shadow);
        this.danfoEditor = new DanfoEditor(shadow);
        //this.teachableMachine = new TeachableMachine(shadow);        
    }

    // connect component
    connectedCallback() {
        
    }

}

// register component
customElements.define('danfo-ui', DanfoUI );