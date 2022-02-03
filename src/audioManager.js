import Visualization from './visualization.js'

const AudioManager = (function(){

    let analyser;

    const visualize = function(aVisualizationName){
        Visualization.visualize(aVisualizationName, analyser);
    }

    const setUpAudio = function(audioElement){
        /* Web Audio API*/
        let audioContext = new AudioContext();
        const track = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();
        track.connect(analyser);
        analyser.connect(audioContext.destination);  
        
        visualize("frequency-1");
    }

    return {
        setUpAudio,
        visualize
    };

})();

export default AudioManager;