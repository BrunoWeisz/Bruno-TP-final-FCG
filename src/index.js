import * as THREE from 'https://cdn.skypack.dev/three'
//import { Object3D } from 'three';
//import Queue from './fixedQueue'
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js'
const canvas = document.getElementById("visualization");
const canvasCtx = canvas.getContext('2d');
let animationFrameId;

const Queue = function(size){
    return{
        _size: size,
        _array: [],
        add: function(el){
            if (this._array < this._size){
                this._array.push(el);
            } else {
                this._array.push(el);
                this._array.shift();
            }
        },
        mean: function(){
            return this._array.reduce((pv,cv) => cv/this._array.length + pv)
        }
    }
}

const Visualization = (function(){

    const visualizations = {
        "frequency-1": drawFrequency,
        "osciloscope-1": drawOsciloscope,
        "growing-circle": drawGrowingCircle,
        "frequency-3d": draw3dFrequency
    }

    const visualize = function(aVisualizationName, anAnalizer){
        //canvasCtx.restore();
        cancelAnimationFrame(animationFrameId);
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

function drawGrowingCircle(analyser){

    console.log("started circle");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//
    
    //const renderer = new THREE.WebGLRenderer({canvas: canvas});
    const renderer = new THREE.WebGLRenderer(); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(renderer.domElement.setAttribute('style', ''));
    document.body.appendChild( renderer.domElement );
    
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.DirectionalLight(0xBBBBBB, .5);
    scene.add(light);
    light.position.set(3,3,5);
    camera.position.set(0,0,5);

    const sphere = new THREE.SphereGeometry();
    const basicMaterial = new THREE.MeshPhongMaterial({color: 0xBBBBBB});
    const sphereMesh = new THREE.Mesh(sphere, basicMaterial);
    sphereMesh.position.set(0,0,-2);
    scene.add(sphereMesh);

    let delayedData = Queue(4);

    function render(time) {
        adaptSize();

        analyser.fftSize = 32;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let scale = computeScale(dataArray);
        delayedData.add(scale);
        let suavizedScale = delayedData.mean();

        const actualScale = suavizedScale;
        
        sphereMesh.scale.set(actualScale,actualScale,actualScale);
        //sphereMesh.material.color.setRGB(suavizedScale,0,0);
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render.bind(this, analyser));
    };
    animationFrameId = requestAnimationFrame(render.bind(this, analyser));

    function computeScale(data){
        return data.reduce((pv,cv) => cv/data.length + pv)/150;
    }

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

function draw3dFrequency(analyser){
    draw3dFrequencyWithSize(analyser, 16, 16);
}

function draw3dFrequencyWithSize(analyser, hor, ver){

    console.log("started 3d frequency");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//
    
    //const renderer = new THREE.WebGLRenderer({canvas: canvas});
    const renderer = new THREE.WebGLRenderer(); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(renderer.domElement.setAttribute('style', ''));
    document.body.appendChild( renderer.domElement );
    
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xAAAAAA, .7);
    scene.add(light);
    //light.position.set(0,10,0);
    //light.target.position.set(0,0,0);
    camera.position.set(0,7,15);
    camera.lookAt(0,0,0);

    //const table = new THREE.Object3D();
    //scene.add(table);

    const bar = new THREE.BoxGeometry(1,1,1);

    const board = new Array(hor);
    for(const i of Array(hor).keys()){
        board[i] = new Array(ver);
    }

    for(let i = -hor/2; i < hor/2; i++ ){
        for(let j = -ver/2; j < ver/2; j++ ){
            const basicMaterial = new THREE.MeshPhongMaterial();
            const barMesh = new THREE.Mesh(bar, basicMaterial);
            barMesh.position.set(i,0,j);
            board[i+hor/2][j+ver/2] = barMesh;
            scene.add(barMesh);
            
            //console.log(`Bar[${i+hor/2}][${j+ver/2}]: ${barMesh.position.x},${barMesh.position.z}`);
        }
    }

    for(let i = 0; i < hor; i++ ){
        for(let j = 0; j < ver; j++ ){
            board[i][j].material.color.setRGB(i/hor,0,j/ver);
            //board[i][j].material.emissive.setRGB(i*256/hor+10,10,j*256/ver+10);
        }
    }
    //console.log(board.flat().map((pad) => pad.material.color));
    //console.log(table);
    
    analyser.fftSize = hor*ver*2;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    function render(time) {
        adaptSize();
        analyser.getByteFrequencyData(dataArray);
        //console.log(dataArray);
        
        for(let i = 0; i < hor; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                board[i][j].scale.set(1, Math.max(dataArray[arrayIndex]/20,1), 1);
                board[i][j].material.color.setRGB(i/hor,dataArray[arrayIndex]/255,j/ver);
            }
        }
        
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render.bind(this, analyser));
    };
    animationFrameId = requestAnimationFrame(render.bind(this, analyser));

    function computeScale(data){
        return data.reduce((pv,cv) => cv/data.length + pv)/150;
    }

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

function drawFrequency(analyser){

    analyser.fftSize = 2048;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    animationFrameId = requestAnimationFrame(drawFrequency.bind(this, analyser));

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

    animationFrameId = requestAnimationFrame(drawOsciloscope.bind(this,analyser));
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

