import {draw3dFrequency, drawOsciloscope, drawFrequency, drawGrowingCircle} from './visualizationFunctions.js';
import {drawHeightmapFrequency} from './heightMap.js';

const Visualization = (function(){

    const visualizations = {
        "frequency-1": drawFrequency,
        "osciloscope-1": drawOsciloscope,
        "growing-circle": drawGrowingCircle,
        "frequency-3d": draw3dFrequency,
        "frequency-heightmap": drawHeightmapFrequency
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
        "frequency-heightmap": toThree
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