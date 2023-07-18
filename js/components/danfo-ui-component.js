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
    min-height: 200px;
}
</style>
<div class="wrapper">
    <nav>
        <ul>
            <li><a href="#" role="button" id="loadsave-btn">Load/Save</a></li>
            <li><a href="#" role="button" id="view-btn">View</a></li>
            <li><a href="#" role="button" id="select-btn">Selection</a></li>
            <li><a href="#" role="button" id="missing-btn">Missing Data</a></li>
            <li><a href="#" role="button" id="operations-btn">Operations</a></li>
            <li><a href="#" role="button" id="merge-btn">Merge</a></li>
            <li><a href="#" role="button" id="group-btn">Grouping</a></li>
        </ul>
    </nav>
    <div id="panel-load-save">Load/save</div>
    <div id="panel-view">View</div>
    <div id="panel-selection">Selection</div>
    <div id="panel-missing">Missing Data</div>
    <div id="panel-operations">Operations</div>
    <div id="panel-merge">Merge</div>
    <div id="panel-grouping">Grouping</div>

    <div id="danfo-output">Danfo output</div>
</div>
`;

class DanfoContentSwitcher {

    constructor(shadow) {
        this.PANEL_LOAD_SAVE = shadow.querySelector("#panel-load-save");
        this.PANEL_VIEW = shadow.querySelector("#panel-view");
        this.PANEL_SELECTION = shadow.querySelector("#panel-selection");
        this.PANEL_MISSING = shadow.querySelector("#panel-missing");
        this.PANEL_OPERATIONS = shadow.querySelector("#panel-operations");
        this.PANEL_MERGE = shadow.querySelector("#panel-merge");
        this.PANEL_GROUPING = shadow.querySelector("#panel-grouping");

        shadow.querySelector("#loadsave-btn").addEventListener('click', this.showLoadSave.bind(this));
        shadow.querySelector("#view-btn").addEventListener('click', this.showView.bind(this));
        shadow.querySelector("#select-btn").addEventListener('click', this.showSelection.bind(this));
        shadow.querySelector("#missing-btn").addEventListener('click', this.showMissingData.bind(this));
        shadow.querySelector("#operations-btn").addEventListener('click', this.showOperations.bind(this));
        shadow.querySelector("#merge-btn").addEventListener('click', this.showMerge.bind(this));
        shadow.querySelector("#group-btn").addEventListener('click', this.showGrouping.bind(this));
        this.hideAll();
        this.PANEL_LOAD_SAVE.classList.add("show");
    }

    showLoadSave() {
        this.hideAll();
        this.PANEL_LOAD_SAVE.classList.add("show");
    }

    showView() {
        this.hideAll();
        this.PANEL_VIEW.classList.add("show");
    }

    showSelection() {
        this.hideAll();
        this.PANEL_SELECTION.classList.add("show");
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
    
    hideAll(){
        this.PANEL_LOAD_SAVE.classList.remove("show");
        this.PANEL_LOAD_SAVE.classList.add("hide");

        this.PANEL_VIEW.classList.remove("show");
        this.PANEL_VIEW.classList.add("hide");

        this.PANEL_SELECTION.classList.remove("show");
        this.PANEL_SELECTION.classList.add("hide");

        this.PANEL_MISSING.classList.remove("show");
        this.PANEL_MISSING.classList.add("hide");

        this.PANEL_OPERATIONS.classList.remove("show");
        this.PANEL_OPERATIONS.classList.add("hide");

        this.PANEL_MERGE.classList.remove("show");
        this.PANEL_MERGE.classList.add("hide");

        this.PANEL_GROUPING.classList.remove("show");
        this.PANEL_GROUPING.classList.add("hide");
    }
}

class DanfoUI extends HTMLElement {

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(templateDanfo.content.cloneNode(true));
        this.dfContentSwitcher = new DanfoContentSwitcher(shadow);
        //this.teachableMachine = new TeachableMachine(shadow);        
    }

    // connect component
    connectedCallback() {
        
    }

}

// register component
customElements.define( 'danfo-ui', DanfoUI );