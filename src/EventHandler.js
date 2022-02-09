import AudioManager from './audioManager.js';
import Visualization from './visualization.js';

const EventHandler = (function(){

    const VisualizationEvents = (function(){

        let settingsBar;        

        function addOptionsBar(){
            settingsBar = document.createElement("div");
            settingsBar.classList.add("controls-2d");
            document.body.appendChild(settingsBar);  
        }

        function createSizeList(){
            let widthList = document.createElement("ul");
            widthList.classList.add("width-list");
            settingsBar.appendChild(widthList);
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

        function clearSettings(){
            Array.from(settingsBar.children).forEach(el => {settingsBar.removeChild(el)});
        }

        function setHeightmap(){
            clearSettings();
            createSizeList();
            let widthList = settingsBar.firstChild;
            for (let i = 0; i < 4; i++){
                addSizeControllerToList(widthList, `${2**(3+i)} x ${2**(3+i)}`, 2**(3+i), changeSize);
            }
        }

        function setTimeFrequency(){
            clearSettings();
            createSizeList();
            let widthList = settingsBar.firstChild;
            for (let i = 0; i < 4; i++){
                addSizeControllerToList(widthList, `${2**(7+i)}`, 2**(7+i), changeSize);
            }
        }

        function set2DFrequency(){
            clearSettings();
            createSizeList();
            let widthList = settingsBar.firstChild;
            for (let i = 0; i < 6; i++){
                addSizeControllerToList(widthList, `${2**(5+i)}`, 2**(5+i), changeSize);
            }
        }

        function set3DFrequency(){
            clearSettings();
            createSizeList();
            let widthList = settingsBar.firstChild;
            for (let i = 0; i < 4; i++){
                addSizeControllerToList(widthList, `${2**(3+i)} x ${2**(3+i)}`, 2**(3+i), changeSize);
            }
        }

        function setOsciloscope(){
            clearSettings();
            createSizeList();
            let widthList = settingsBar.firstChild;
            for (let i = 0; i < 6; i++){
                addSizeControllerToList(widthList, `${2**(5+i)}`, 2**(5+i), changeSize);
            }
        }

        return {
            set2DFrequency,
            set3DFrequency,
            addOptionsBar,
            setHeightmap,
            setTimeFrequency,
            setOsciloscope
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
        VisualizationEvents.addOptionsBar();
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