const template = document.createElement("template");
template.innerHTML = `
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

video {
    clear: both;
    display: block;
    margin: 10px auto;
    background: #000000;
    width: 640px;
    height: 480px;
  }
  
.removed {
display: none;
}

.wrapper {
text-align: center;
}

#status {
font-size:1.2rem;
}
</style>
<div class="wrapper">
    <details>
        <summary role="button">Teachable Machine <i class="fa-solid fa-circle-info"></i></summary>
        <h1>Make your own "Teachable Machine" using Transfer Learning with MobileNet v3 in TensorFlow.js using saved graph model from TFHub.</h1>
        <h2>This example is a copy from Google TensorFlow.js codelabs. <a target="_blank" href="https://codelabs.developers.google.com/tensorflowjs-transfer-learning-teachable-machine">source <i class="fa-solid fa-up-right-from-square"></i></a></h2>
        <p>
        <article>
        <header>How does this work?</header>
            <ol class="auto-margin" style="width:75%">
                <li>Enable webcamera</li>
                <li>Click on "Record object 1" to gather data about a object you have (hand, bottle etc.), then click again to stop. You should have about 50 samples</li>
                <li>Do the same for object 2</li>
                <li>Click on "Train and Predict" and see if the machine can recognice the objects</li>
                <li>Click "Reset" to clean up and try again</li>
            </ol>
        </article>
        <p>
    </details>

    <p id="status">Awaiting TF.js load</p>

    <video id="webcam" autoplay muted></video>

    <div class="grid">
        <button id="enableCam">Enable Webcam</button>
        <button id="class1" class="dataCollector" data-1hot="0" data-name="Object 1">Record object 1</button>
        <button id="class2" class="dataCollector" data-1hot="1" data-name="Object 2">Record object 2</button>
        <button id="train">Train &amp; Predict!</button>
        <button id="reset">Reset</button>
    </div>
</div>
`;

class TeachableMachine {

    constructor(shadow) {
        this.STATUS = shadow.querySelector("#status");
        this.VIDEO = shadow.querySelector("#webcam");
        this.ENABLE_CAM_BUTTON = shadow.querySelector("#enableCam");
        this.RESET_BUTTON = shadow.querySelector("#reset");
        this.TRAIN_BUTTON = shadow.querySelector("#train");
        this.MOBILE_NET_INPUT_WIDTH = 224;
        this.MOBILE_NET_INPUT_HEIGHT = 224;
        this.STOP_DATA_GATHER = -1;
        this.CLASS_NAMES = [];
        this.mobilenet = undefined;
        this.videoPlaying = false;
        this.trainingDataInputs = [];
        this.trainingDataOutputs = [];
        this.examplesCount = [];
        this.predict = false;
        this.gatherDataState = this.STOP_DATA_GATHER;

        //Add event listeneres
        this.dataCollectorButtons = shadow.querySelectorAll('button.dataCollector');
        
        for (let i = 0; i < this.dataCollectorButtons.length; i++) {
            // Populate the human readable names for classes.
            this.CLASS_NAMES.push(this.dataCollectorButtons[i].getAttribute('data-name'));
        }

        // hack for event for class 1/2 buttons for now.
        shadow.querySelector("#class1").addEventListener('click', this.gatherDataForClassOne.bind(this));
        shadow.querySelector("#class2").addEventListener('click', this.gatherDataForClassTwo.bind(this));

        shadow.querySelector("#enableCam").addEventListener('click', this.enableCam.bind(this));
        shadow.querySelector("#train").addEventListener('click', this.trainAndPredict.bind(this));
        shadow.querySelector("#reset").addEventListener('click', this.reset.bind(this));

        this.loadMobileNetFeatureModel(this);

        this.model = tf.sequential();
        this.model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
        this.model.add(tf.layers.dense({units: this.CLASS_NAMES.length, activation: 'softmax'}));

        this.model.summary();

        // Compile the model with the defined optimizer and specify a loss function to use.
        this.model.compile({
            // Adam changes the learning rate over time which is useful.
            optimizer: 'adam',
            // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
            // Else categoricalCrossentropy is used if more than 2 classes.
            loss: (this.CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy', 
        // As this is a classification problem you can record accuracy in the logs too!
            metrics: ['accuracy']  
        });        
    }

    /**
    * Enable the webcam with video constraints applied.
    **/
    async enableCam() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // getUsermedia parameters.
            const constraints = {
              video: true,
              width: 640, 
              height: 480 
            };

            let stream = null;

            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                this.VIDEO.srcObject = stream;
                this.videoPlaying = true;
                this.ENABLE_CAM_BUTTON.classList.add('removed');
              } catch (err) {
                console.log(err);
              }
          } else {
            console.warn('getUserMedia() is not supported by your browser');
          }
    }

    gatherDataForClassOne() {
        let classNumber = parseInt(0);
        this.gatherDataState = (this.gatherDataState === this.STOP_DATA_GATHER) ? classNumber : this.STOP_DATA_GATHER;;
        this.dataGatherLoop();
    }

    gatherDataForClassTwo() {
        let classNumber = parseInt(1);
        this.gatherDataState = (this.gatherDataState === this.STOP_DATA_GATHER) ? classNumber : this.STOP_DATA_GATHER;;
        this.dataGatherLoop();
    }

    calculateFeaturesOnCurrentFrame() {
        return tf.tidy(() => {
          // Grab pixels from current VIDEO frame.
          let videoFrameAsTensor = tf.browser.fromPixels(this.VIDEO);
          // Resize video frame tensor to be 224 x 224 pixels which is needed by MobileNet for input.
          let resizedTensorFrame = tf.image.resizeBilinear(
              videoFrameAsTensor, 
              [this.MOBILE_NET_INPUT_HEIGHT, this.MOBILE_NET_INPUT_WIDTH],
              true
          );
      
          let normalizedTensorFrame = resizedTensorFrame.div(255);
      
          return this.mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
        });
    }
      
      
    /**
     * When a button used to gather data is pressed, record feature vectors along with class type to arrays.
     **/
    dataGatherLoop() {
        // Only gather data if webcam is on and a relevent button is pressed.
        if (this.videoPlaying && this.gatherDataState !== this.STOP_DATA_GATHER) {
            // Ensure tensors are cleaned up.
            let imageFeatures = this.calculateFeaturesOnCurrentFrame();
        
            this.trainingDataInputs.push(imageFeatures);
            this.trainingDataOutputs.push(this.gatherDataState);
            
            // Intialize array index element if currently undefined.
            if (this.examplesCount[this.gatherDataState] === undefined) {
                this.examplesCount[this.gatherDataState] = 0;
            }
            // Increment counts of examples for user interface to show.
            this.examplesCount[this.gatherDataState]++;
        
            this.STATUS.innerText = '';
            for (let n = 0; n < this.CLASS_NAMES.length; n++) {
                this.STATUS.innerText += this.CLASS_NAMES[n] + ' data count: ' + this.examplesCount[n] + '. ';
            }
        
            // Bind to this so this is not lost.
            window.requestAnimationFrame(this.dataGatherLoop.bind(this));
        }
    }

    /**
    * Once data collected actually perform the transfer learning.
    **/
    async trainAndPredict() {
        this.predict = false;
        tf.util.shuffleCombo(this.trainingDataInputs, this.trainingDataOutputs);

        let outputsAsTensor = tf.tensor1d(this.trainingDataOutputs, 'int32');
        let oneHotOutputs = tf.oneHot(outputsAsTensor, this.CLASS_NAMES.length);
        let inputsAsTensor = tf.stack(this.trainingDataInputs);
        
        let results = await this.model.fit(inputsAsTensor, oneHotOutputs, {
            shuffle: true,
            batchSize: 5,
            epochs: 10,
            callbacks: {onEpochEnd: this.logProgress}
        });
        
        outputsAsTensor.dispose();
        oneHotOutputs.dispose();
        inputsAsTensor.dispose();
        
        this.predict = true;
        this.predictLoop();
    }

    /**
    * Log training progress.
    **/
    logProgress(epoch, logs) {
        console.log('Data for epoch ' + epoch, logs);
    }
  
  
  /**
   *  Make live predictions from webcam once trained.
   **/
    predictLoop() {
        if (this.predict) {
        tf.tidy(() => {
            let imageFeatures = this.calculateFeaturesOnCurrentFrame();
            let prediction = this.model.predict(imageFeatures.expandDims()).squeeze();
            let highestIndex = prediction.argMax().arraySync();
            let predictionArray = prediction.arraySync();
            this.STATUS.innerText = 'Prediction: ' + this.CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
        });
    
        window.requestAnimationFrame(this.predictLoop.bind(this));
        }
    }

    /**
     * Purge data and start over. Note this does not dispose of the loaded 
     * MobileNet model and MLP head tensors as you will need to reuse 
     * them to train a new model.
     **/
    reset() {
        this.predict = false;
        this.examplesCount.splice(0);
        for (let i = 0; i < this.trainingDataInputs.length; i++) {
            this.trainingDataInputs[i].dispose();
        }
        this.trainingDataInputs.splice(0);
        this.trainingDataOutputs.splice(0);
        this.STATUS.innerText = 'No data collected';
        
        console.log('Tensors in memory: ' + tf.memory().numTensors);
    }

    /**
    * Loads the MobileNet model and warms it up so ready for use.
    **/
    async loadMobileNetFeatureModel(element) {
        const URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    
        element.mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
        //this.mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
        element.STATUS.innerText = 'MobileNet v3 loaded successfully!';
    
        // Warm up the model by passing zeros through it once.
        tf.tidy(function () {
            let answer = element.mobilenet.predict(tf.zeros([1, element.MOBILE_NET_INPUT_HEIGHT, element.MOBILE_NET_INPUT_WIDTH, 3]));
            console.log(answer.shape);
        });
    }
    
}

class MobileNetTraining extends HTMLElement {

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        shadow.append(template.content.cloneNode(true));
        this.teachableMachine = new TeachableMachine(shadow);        
    }

    // connect component
    connectedCallback() {}

}

// register component
customElements.define( 'mobilenet-training', MobileNetTraining );