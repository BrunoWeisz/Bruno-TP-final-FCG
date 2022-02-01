import * as THREE from 'https://cdn.skypack.dev/three'
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js'
const canvas = document.getElementById("visualization");
const canvasCtx = canvas.getContext('2d');

function threee(){

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;
    const scene = new THREE.Scene();
 
    const geometry = new THREE.BoxGeometry();

    /*const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );*/
    const material = new THREE.PointsMaterial({color:'red', size: 0.2});
    const cube = new THREE.Points(geometry, material);

    scene.add( cube );

    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1,2,4);
    scene.add(light);

    function animate() {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    };

    animate();
}
threee();

const Visualization = (function(){

    const visualizations = {
        "frequency-1": drawFrequency,
        "osciloscope-1": drawOsciloscope 
    }

    const visualize = function(aVisualizationName, anAnalizer){
        console.log(visualizations[aVisualizationName])
        visualizations[aVisualizationName](anAnalizer);
    }

    return {
        visualize
    }
})();

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

const EventHandler = (function(){

    const removeLoadFile = function(){
        const loadElement = document.querySelector("#loadfile");
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
    }

    const handleFiles = function(){
        let file = this.files[0];
        let audioUrl = window.URL.createObjectURL(file);
        const audioEl = document.querySelector("audio");
        audioEl.src = audioUrl;

        removeLoadFile();
        addSelector();
    
        AudioManager.setUpAudio(audioEl);
    }

    const setLoadFile = function(){
        document.querySelector("#loadfile").addEventListener("change", handleFiles, false);
    }

    return {
        setLoadFile
    }
})();


EventHandler.setLoadFile();
/*
function drawGrowingCircle(analyser){
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//


    const renderer = new THREE.WebGLRenderer({canvas});
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.DirectionalLight(0xBBBBBB, 1);
    scene.add(light);
    light.position.set(3,3,5);
    camera.position.set(0,0,5);

    const cube = new THREE.BoxGeometry();
    const basicMaterial = new THREE.MeshPhongMaterial({color: 0xBBBBBB});
    const cubeMesh = new THREE.Mesh(cube, basicMaterial);
    //cubeMesh.position.set(0,0,-2);
    scene.add(cubeMesh);

    //renderer.render(scene, camera);

    function render(time) {
        //console.log('rendering');
        adaptSize();
        cubeMesh.rotation.x = 0.001*time;
        cubeMesh.rotation.y = 0.001*time;
        

        renderer.render( scene, camera );
        requestAnimationFrame( render );
    };
    requestAnimationFrame(render);


    function adaptSize(){
        //console.log("resizing");
        if (window.innerHeight != canvas.clientHeight || window.innerWidth != canvas.clientWidth){
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            const pr = window.devicePixelRatio;
            renderer.setSize(canvas.clientWidth * pr | 0, canvas.clientHeight * pr | 0, false);
            camera.updateProjectionMatrix();
        }
    };
}
*/
function drawFrequency(analyser){

    analyser.fftSize = 2048;
    //const canvasCtx = canvas.getContext('2d');
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    requestAnimationFrame(drawFrequency.bind(this, analyser));
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    let barWidth = (canvas.width / bufferLength) * 2;
    let barHeight;
    let x = 0;

    let heightData = [];

    for(let i = 0; i < bufferLength / 2; i++) {

        barHeight = dataArray[i]/2;
        
        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,canvas.height-barHeight/2,barWidth,barHeight);

        x += barWidth + 1;

        heightData.push(dataArray[i]);
        if (dataArray[i] > 150) {console.log("frec = ",i,"height = ", dataArray[i])}
    }
}

function drawOsciloscope(analyser) {

    //const canvasCtx = canvas.getContext('2d');
    analyser.fftSize = 2048;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    requestAnimationFrame(drawOsciloscope.bind(this,analyser));
    analyser.getByteTimeDomainData(dataArray);
  
    canvasCtx.fillStyle = "rgb(255, 255, 255)";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
  
    canvasCtx.beginPath();
  
    var sliceWidth = canvas.width * 1.0 / bufferLength;
    var x = 0;
  
    for (var i = 0; i < bufferLength; i++) {
  
      var v = dataArray[i] / 128.0;
      var y = v * canvas.height / 2;
  
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
  
      x += sliceWidth;
    }
  
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

