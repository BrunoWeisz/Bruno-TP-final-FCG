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
            e.classList.add("size-not-selected");
            aListElement.appendChild(e);
            e.addEventListener("click", (ev) => {
                aHandler(aValue);
                clearSizeButtonBackgrounds();
                showSelectedButton(ev.target);
            })
        }

        function showSelectedButton(anElement){
            anElement.classList.add("size-selected");
            anElement.classList.remove("size-not-selected");
        }

        function clearSizeButtonBackgrounds(){
            Array.from(document.querySelectorAll(".width-list li")).forEach(el => {
                el.classList.add("size-not-selected");
                el.classList.remove("size-selected");
            })
        }

        function changeStyle(aStyleString){
            console.log("changing style to ", aStyleString);
            Visualization.changeStyle(aStyleString);
        }

        function changeSize(aValue){
            console.log("changing size to ", aValue);
            Visualization.changeDivission(aValue);
        }

        function clearSettings(){
            Array.from(settingsBar.children).forEach(el => {settingsBar.removeChild(el)});
        }

        function addPersonalizedSizes(base, to, format){
            clearSettings();
            createSizeList();
            let stringToShow = '';
            
            let widthList = document.querySelector(".width-list");
            for (let i = 0; i < to; i++){
                if (format == '1d') stringToShow = `${2**(base+i)}`;
                else stringToShow = `${2**(base+i)} x ${2**(base+i)}`
                addSizeControllerToList(widthList, stringToShow, 2**(base+i), changeSize);
            }
        }


        function addStyles(){
            
            let styleList = createStyleList();
            
            let rainbowButton = document.createElement("li");
            rainbowButton.textContent = "Rainbow";
            styleList.appendChild(rainbowButton);
            rainbowButton.addEventListener("click", (ev)=>{
                changeStyle(rainbowButton.textContent);
            })

            
            let mountainButton = document.createElement("li");
            mountainButton.textContent = "Mountain";
            styleList.appendChild(mountainButton);
            mountainButton.addEventListener("click", (ev)=>{
                changeStyle(mountainButton.textContent);
            })
        }

        function createStyleList(){
            let styleList = document.createElement("ul");
            styleList.classList.add("style-list");
            settingsBar.appendChild(styleList);
            return styleList;
        }


        function setHeightmap(){
            addPersonalizedSizes(3,4,'2d');
            addStyles();
        }

        function setTimeFrequency(){
            addPersonalizedSizes(7,4,'1d');
            addStyles();
        }

        function set2DFrequency(){
            addPersonalizedSizes(5,6,'1d');
            addStyles();
        }

        function set3DFrequency(){
            addPersonalizedSizes(3,4,'2d');
            addStyles();
        }

        function setOsciloscope(){
            addPersonalizedSizes(7,4,'1d');
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