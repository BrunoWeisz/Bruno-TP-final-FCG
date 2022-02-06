import {drawOsciloscope, drawFrequency, drawGrowingCircle} from './visualizationFunctions.js';
import { timeFrequencyDrawer } from './timeFrequencyModule.js';
import {heightMapFrequencyDrawer} from './heightMapModule.js';
import {frequency3DDrawer} from './3dFrequencyModule.js';


const Visualization = (function(){

    const visualizations = {
        "frequency-1": drawFrequency,
        "osciloscope-1": drawOsciloscope,
        "growing-circle": drawGrowingCircle,
        "frequency-3d": frequency3DDrawer.draw,
        "frequency-heightmap": heightMapFrequencyDrawer.draw,
        "time-frequency": timeFrequencyDrawer.draw
    }

    function toThree(){
        canvas.classList.remove("visible");
        canvas.classList.add("invisible");
        canvas2.classList.remove("invisible");
        canvas2.classList.add("visible");
        
    }

    function outOfThree(){
        canvas2.classList.remove("visible");
        canvas2.classList.add("invisible");
        canvas.classList.remove("invisible");
        canvas.classList.add("visible");      
    }

    const canvasOperation = {
        "frequency-1": outOfThree,
        "osciloscope-1": outOfThree,
        "growing-circle": toThree,
        "frequency-3d": toThree,
        "frequency-heightmap": toThree,
        "time-frequency": toThree
    }


    const visualize = function(aVisualizationName, anAnalizer){
        cancelAnimationFrame(animationFrameId);
        canvasOperation[aVisualizationName]();
        visualizations[aVisualizationName](anAnalizer);
    }

    return {
        visualize
    }
})();

export default Visualization;