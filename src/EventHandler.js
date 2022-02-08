import AudioManager from './audioManager.js';
import Visualization from './visualization.js';

const EventHandler = (function(){

    const VisualizationEvents = (function(){

        let currentSettingsBar = document.createElement("div");
        document.body.appendChild(currentSettingsBar);

        function createControlPannel(){
            document.body.removeChild(currentSettingsBar);
            let controlsDiv = document.createElement("div");
            controlsDiv.classList.add("controls-2d");
            document.body.appendChild(controlsDiv);
            return controlsDiv;
        }   

        function addSizeControllerToList(aListElement, aTextContent, aValue, aHandler){
            let e = document.createElement("li");
            e.textContent = aTextContent;
            aListElement.appendChild(e);
            e.addEventListener("click", (ev) => {
                aHandler(aValue);
            })
        }

        function changeSize(aValue){
            console.log("changing size to ", aValue);
            Visualization.changeDivission(aValue);
        }

        function set2DFrequency(){
            let div = createControlPannel();
            let widthList = document.createElement("ul");
            widthList.classList.add("width-list");
            div.appendChild(widthList);
            currentSettingsBar = div;
            for (let i = 0; i < 6; i++){
                addSizeControllerToList(widthList, `${2**(5+i)}`, 2**(5+i), changeSize);
            }
        }

        function set3DFrequency(){
            let div = createControlPannel();
            let widthList = document.createElement("ul");
            widthList.classList.add("width-list");
            div.appendChild(widthList);
            currentSettingsBar = div;
            for (let i = 0; i < 4; i++){
                addSizeControllerToList(widthList, `${2**(3+i)} x ${2**(3+i)}`, 2**(3+i), changeSize);
            }
        }

        return {
            set2DFrequency,
            set3DFrequency
        }

    })();

    const removeLoadFile = function(){
        const loadElement = document.querySelector("#loadfile");
        loadElement.parentElement.removeChild(loadElement);
    }

    function addCanvas(){
        document.body.appendChild(canvas);
    }

    const addSelector = function(){
        const selector = document.querySelector("#selector");
        selector.classList.toggle("visible");
        selector.classList.toggle("invisible");
        selector.addEventListener("change", (ev)=>{
            const selectedVisualization = ev.target.value;
            AudioManager.visualize(selectedVisualization);
        });
    }

    const handleFiles = function(){
        let file = this.files[0];
        let audioUrl = window.URL.createObjectURL(file);
        const audioEl = document.querySelector("audio");
        audioEl.src = audioUrl;

        removeLoadFile();
        addSelector();
        // addCanvas();
    
        AudioManager.setUpAudio(audioEl);
    }

    const setLoadFile = function(){
        document.querySelector("#loadfile").addEventListener("change", handleFiles, false);
    }

    return {
        setLoadFile,
        VisualizationEvents
    }
})();

export default EventHandler;