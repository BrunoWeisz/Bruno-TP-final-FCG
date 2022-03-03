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
            let divWidthList = document.createElement("div");
            let widthList = document.createElement("ul");
            let p = document.createElement("p");

            divWidthList.classList.add("div-width-list");
            widthList.classList.add("width-list");
            p.classList.add("tag");
            p.textContent = "Resolution:";

            divWidthList.appendChild(p);
            divWidthList.appendChild(widthList);
            settingsBar.appendChild(divWidthList);
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
            let divStyleList = document.createElement("div");
            let styleList = document.createElement("ul");
            let p = document.createElement("p");

            divStyleList.classList.add("div-style-list");
            styleList.classList.add("style-list");
            p.classList.add("tag");
            p.textContent = 'Styles:';
            
            divStyleList.appendChild(p);
            divStyleList.appendChild(styleList);
            settingsBar.appendChild(divStyleList);
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

    const removePresentation = function(){
        const loadElement = document.querySelector("#presentation");
        loadElement.parentElement.removeChild(loadElement);
    }

    const addSelector = function(){
        const selector = document.querySelector("#selector");
        selector.classList.toggle("visible");
        selector.classList.toggle("invisible");
        selector.addEventListener("change", (ev)=>{
            const selectedVisualization = ev.target.value;
            AudioManager.visualize(selectedVisualization);
        });

        const audio = document.querySelector("audio");
        audio.classList.toggle("invisible");
        audio.classList.toggle("visible");
    }

    const startVisualization = function(audioEl){
        removePresentation();
        addSelector();
        VisualizationEvents.addOptionsBar();
        AudioManager.setUpAudio(audioEl);
    }

    const handleFiles = function(){
        let file = this.files[0];
        console.log('file:', file);
        let audioUrl = window.URL.createObjectURL(file);
        const audioEl = document.querySelector("audio");
        audioEl.src = audioUrl;
        console.log('url: ',audioUrl);
        startVisualization(audioEl);
    }

    const setLoadFile = function(){
        document.querySelector("#loadfile").addEventListener("change", handleFiles, false);
    }

   

    const setFiles = function(){
        setLoadFile();
    }

    return {
        setFiles,
        setLoadFile,
        VisualizationEvents
    }
})();

export default EventHandler;