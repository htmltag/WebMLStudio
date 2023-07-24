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
            <li><a href="#" role="button" id="missing-btn">Missing Data</a></li>
            <li><a href="#" role="button" id="operations-btn">Operations</a></li>
            <li><a href="#" role="button" id="merge-btn">Merge</a></li>
            <li><a href="#" role="button" id="group-btn">Grouping</a></li>
            <li><a href="#" role="button" id="save-btn">Save</a></li>
            <li><a href="#" role="button" id="play-btn"><i class="fa-solid fa-play"></i></a></li>
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
            </div>
        </div>
    </div>
    <div id="panel-missing">
        <div class="grid">
            <button id="drop-column-btn">Drop column(s) with missing data</button>
            <button id="drop-row-btn">Drop row(s) with missing data</button>
        </div>
        <hr/>
        <div class="grid">
        Fill missing data with: <input type="text" id="value-missing-data"><button id="fill-missing-data-btn">Fill</button>
        </div>
        <hr/>
        <div class="grid">
        Fill missing data in column:<input type="text" id="column-missing-data"> with: <input type="text" id="column-value-missing-data"> <button id="fill-missing-column-data-btn">Fill</button>
        </div>
    </div>
    <div id="panel-operations">Operations</div>
    <div id="panel-merge">Merge</div>
    <div id="panel-grouping">Grouping</div>
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
            <button id="localstorage-input-btn">Input</button>
            <button id="localstorage-output-btn">Output</button>
        </div>
    </div>

    <div id="danfo-output"></div>
</div>
`;

class DanfoEditor {
    #df;
    #selectedFiletypeLoad = "NONE";
    #selectedFiletypeDownload = "NONE";

    constructor(shadow) {
        this.DANFO_OUTPUT_ELEMENT = shadow.querySelector("#danfo-output");
        this.FILE_DATASET = shadow.querySelector("#file-dataset");
        this.SELECT_FILETYPE_LOAD = shadow.querySelector("#select-filetype-load");
        this.URL_TO_DATASET = shadow.querySelector("#url-to-dataset");
        this.DELIMITER = shadow.querySelector("#delimiter");
        this.FILENAME = shadow.querySelector("#filename");
        this.SELECT_FILETYPE_DOWNLOAD = shadow.querySelector("#select-filetype-download");
        this.VALUE_MISSING_DATA = shadow.querySelector("#value-missing-data");
        this.COLUMN_MISSING_DATA = shadow.querySelector("#column-missing-data");
        this.COLUMN_VALUE_MISSING_DATA = shadow.querySelector("#column-value-missing-data");

        shadow.querySelector("#play-btn").addEventListener('click', this.play.bind(this));
        shadow.querySelector("#empty-btn").addEventListener('click', this.empty.bind(this));
        shadow.querySelector("#file-dataset").addEventListener('change', this.loadInputFile.bind(this));
        shadow.querySelector("#select-filetype-load").addEventListener('change', this.selectFiletypeLoadChange.bind(this));
        shadow.querySelector("#select-filetype-download").addEventListener('change', this.selectFiletypeDownloadChange.bind(this));
        shadow.querySelector("#load-from-url").addEventListener('click', this.loadFromURL.bind(this));
        shadow.querySelector("#download-btn").addEventListener('click', this.downloadFile.bind(this));
        shadow.querySelector("#drop-column-btn").addEventListener('click', this.dropColumn.bind(this));
        shadow.querySelector("#drop-row-btn").addEventListener('click', this.dropRow.bind(this));
        shadow.querySelector("#fill-missing-data-btn").addEventListener('click', this.fillMissingData.bind(this));
        shadow.querySelector("#fill-missing-column-data-btn").addEventListener('click', this.fillColumnMissingData.bind(this));
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
            this.DANFO_OUTPUT_ELEMENT.innerHTML = "Ooops! Something whent wrong. \n" + err;
        }
        
    }

    selectFiletypeLoadChange() {
        this.#selectedFiletypeLoad = this.SELECT_FILETYPE_LOAD.options[this.SELECT_FILETYPE_LOAD.selectedIndex].value;
    }

    selectFiletypeDownloadChange() {
        this.#selectedFiletypeDownload = this.SELECT_FILETYPE_DOWNLOAD.options[this.SELECT_FILETYPE_DOWNLOAD.selectedIndex].value;
    }

    loadInputFile() {
        const inputfile = this.FILE_DATASET.files[0];
        const delimiter = this.DELIMITER.value ? this.DELIMITER.value : ",";
        switch (this.#selectedFiletypeLoad) {
            case 'NONE':
                alert("Select filetype");
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
        console.log(url);
        switch (this.#selectedFiletypeLoad) {
            case 'NONE':
                alert("Select filetype");
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

    downloadFile(){
        const filenameToDownload = this.FILENAME.value ? this.FILENAME.value : "web-ml-studio-data";
        switch (this.#selectedFiletypeDownload) {
            case 'NONE':
                alert("Select filetype");
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

    dropColumn(){
        this.#df = this.#df.dropNa({axis: 0});
        this.play();
    }

    dropRow(){
        this.#df = this.#df.dropNa({axis: 1});
        this.play();
    }

    fillMissingData() {
        if (this.VALUE_MISSING_DATA.value === "") alert("fill in a value");
       this.#df = this.#df.fillNa(this.VALUE_MISSING_DATA.value); 
       this.play();
    }

    fillColumnMissingData() {
        console.log("fillColumnMissingData");
        if (this.COLUMN_VALUE_MISSING_DATA.value === "") alert("fill in a value");
        if (this.COLUMN_MISSING_DATA.value === "") alert("fill in a column");
       this.#df = this.#df.fillNa([this.COLUMN_VALUE_MISSING_DATA.value], { columns: [this.COLUMN_MISSING_DATA.value] })
       this.play();
    }
}

class DanfoContentSwitcher {

    constructor(shadow) {
        this.PANEL_LOAD = shadow.querySelector("#panel-load");
        this.PANEL_MISSING = shadow.querySelector("#panel-missing");
        this.PANEL_OPERATIONS = shadow.querySelector("#panel-operations");
        this.PANEL_MERGE = shadow.querySelector("#panel-merge");
        this.PANEL_GROUPING = shadow.querySelector("#panel-grouping");
        this.PANEL_SAVE = shadow.querySelector("#panel-save");

        shadow.querySelector("#load-btn").addEventListener('click', this.showLoad.bind(this));
        shadow.querySelector("#missing-btn").addEventListener('click', this.showMissingData.bind(this));
        shadow.querySelector("#operations-btn").addEventListener('click', this.showOperations.bind(this));
        shadow.querySelector("#merge-btn").addEventListener('click', this.showMerge.bind(this));
        shadow.querySelector("#group-btn").addEventListener('click', this.showGrouping.bind(this));
        shadow.querySelector("#save-btn").addEventListener('click', this.showSave.bind(this));
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    showLoad() {
        this.hideAll();
        this.PANEL_LOAD.classList.add("show");
    }

    showMissingData() {
        this.hideAll();
        this.PANEL_MISSING.classList.add("show");
    }

    showOperations() {
        this.hideAll();
        this.PANEL_OPERATIONS.classList.add("show");
    }

    showMerge() {
        this.hideAll();
        this.PANEL_MERGE.classList.add("show");
    }

    showGrouping() {
        this.hideAll();
        this.PANEL_GROUPING.classList.add("show");
    }

    showSave() {
        this.hideAll();
        this.PANEL_SAVE.classList.add("show");
    }
    
    hideAll(){
        this.PANEL_LOAD.classList.remove("show");
        this.PANEL_LOAD.classList.add("hide");

        this.PANEL_MISSING.classList.remove("show");
        this.PANEL_MISSING.classList.add("hide");

        this.PANEL_OPERATIONS.classList.remove("show");
        this.PANEL_OPERATIONS.classList.add("hide");

        this.PANEL_MERGE.classList.remove("show");
        this.PANEL_MERGE.classList.add("hide");

        this.PANEL_GROUPING.classList.remove("show");
        this.PANEL_GROUPING.classList.add("hide");

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