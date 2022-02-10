import EventHandler from './EventHandler.js';
// import {drawOsciloscope, drawGrowingCircle} from './visualizationModules/visualizationFunctions.js';
import { timeFrequencyDrawer } from './visualizationModules/timeFrequencyModule.js';
import {heightMapFrequencyDrawer} from './visualizationModules/heightMapModule.js';
import {frequency3DDrawer} from './visualizationModules/3dFrequencyModule.js';
import { DrawFrequency2D } from './visualizationModules/2dFrequencyModule.js';
import { Osciloscope } from './visualizationModules/osciloscopeModule.js';


const Visualization = (function(){

    let currentVisualizationName;
    let currentAnalyser;

    const visualizations = {
        "frequency-1": DrawFrequency2D.draw,
        "osciloscope-1": Osciloscope.draw,
        // "growing-circle": drawGrowingCircle,
        "frequency-3d": frequency3DDrawer.draw,
        "frequency-heightmap": heightMapFrequencyDrawer.draw,
        "time-frequency": timeFrequencyDrawer.draw
    }

    function toThree(){
        
    }

    function to2DFrequency(){
        EventHandler.VisualizationEvents.set2DFrequency();
    }
    function to3DFrequency(){
        EventHandler.VisualizationEvents.set3DFrequency();
    }
    function toHeightmap(){
        EventHandler.VisualizationEvents.setHeightmap();
    }
    function toTimeFrequency(){
        EventHandler.VisualizationEvents.setTimeFrequency();
    }
    function toOsciloscope(){
        EventHandler.VisualizationEvents.setOsciloscope();
    }

    const visualizationSetup = {
        "frequency-1": to2DFrequency,
        "osciloscope-1": toOsciloscope,
        "growing-circle": toThree,
        "frequency-3d": to3DFrequency,
        "frequency-heightmap": toHeightmap,
        "time-frequency": toTimeFrequency
    }

    const defaultVisualizationSettings = {
        "frequency-1": {
            divissions: 1024,
            style: "Rainbow"
        },
        "frequency-3d": {
            divissions: 32,
            style: "Rainbow"
        },
        "frequency-heightmap": {
            divissions: 64,
            style: "Rainbow"
        },
        "time-frequency": {
            divissions: 512,
            style: "Mountain"
        },
        "osciloscope-1": {
            divissions: 512,
            style: "Rainbow"
        }
    }

    let currentVisualizationSettings = Object.assign({}, defaultVisualizationSettings);

    const visualize = function(aVisualizationName, anAnalizer){
        cancelAnimationFrame(animationFrameId);
        currentVisualizationName = aVisualizationName;
        currentAnalyser = anAnalizer;
        visualizationSetup[aVisualizationName]();
        let settings = currentVisualizationSettings[aVisualizationName];
        visualizations[aVisualizationName](anAnalizer, settings);
    }

    function changeDivission(aNewDivission){
        currentVisualizationSettings[currentVisualizationName].divissions = aNewDivission;
        visualize(currentVisualizationName, currentAnalyser);
    }

    function changeStyle(aNewStyleString){
        let oldStyle = currentVisualizationSettings[currentVisualizationName].style;
        console.log(`changing old ${oldStyle} for ${aNewStyleString}`);
        currentVisualizationSettings[currentVisualizationName].style = aNewStyleString;
        visualize(currentVisualizationName, currentAnalyser);
    }

    return {
        visualize,
        changeDivission,
        changeStyle
    }
})();

export default Visualization;