const maincontentSwitcher = {
    //config 
    contentList: ["greeting-mainconent", "project-selector-mainconent", "mobilenet-training-maincontent", "danfo-placeholder"],
    sessionStorageKey: "currentMaincontent",

    init() {
        this.hideAll();
        const contentToDisplay = this.maincontentFromSessonStorage;
        this.displayContent(contentToDisplay);
      },

    get maincontentFromSessonStorage() {
        if (typeof window.sessionStorage !== "undefined") {
          if (window.sessionStorage.getItem(this.sessionStorageKey) !== null) {
            return window.sessionStorage.getItem(this.sessionStorageKey);
          }
        }
        return "greeting-mainconent";
    },

    maincontentToSessionStorage(contentName) {
        if (typeof window.sessionStorage !== "undefined") {
          window.sessionStorage.setItem(this.sessionStorageKey, contentName);
        }
      },

    hideAll(){
        for(content of this.contentList) {
            let element = document.getElementById(content);
            element.style.display = "none";
        }
    },

    displayContent(contentName) {
        let element = document.getElementById(contentName);
        element.style.display = "block";
    },

    toGreeting() {
        this.hideAll();
        this.displayContent("greeting-mainconent");
        this.maincontentToSessionStorage("greeting-mainconent");
    },

    toProjectSelector() {
        this.hideAll();
        this.displayContent("project-selector-mainconent");
        this.maincontentToSessionStorage("project-selector-mainconent");
    },

    toMobilenetTraining() {
      this.hideAll();
      this.displayContent("mobilenet-training-maincontent");
      this.maincontentToSessionStorage("mobilenet-training-maincontent");
    },

    toDanfo() {
      this.hideAll();
      this.displayContent("danfo-placeholder");
      this.maincontentToSessionStorage("danfo-placeholder");
    },
    
};

maincontentSwitcher.init();