import * as THREE from 'https://cdn.skypack.dev/three'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js'

function threee(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    };

    animate();
}
threee();

const cv1 = document.getElementById("frequency-bar");
const ctx1 = cv1.getContext('2d');
const cv2 = document.getElementById("osciloscope");
const ctx2 = cv2.getContext('2d');

document.querySelector("input").addEventListener("change", handleFiles, false);

function handleFiles(){
    console.log(this);
    let file = this.files[0];
    let audioUrl = window.URL.createObjectURL(file);
    const audioEl = document.querySelector("audio");
    audioEl.src = audioUrl;

    setUpAudio(audioEl);
}

function setUpAudio(audioElement){
    /* Web Audio API*/
    let audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    let analyser = audioContext.createAnalyser();
    track.connect(analyser);
    analyser.connect(audioContext.destination);
    
    /*Analyser*/    
    analyser.fftSize = 2048;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    let dataArray2 = new Uint8Array(bufferLength);

    console.log(ctx1);
    drawFrequency(cv1, ctx1, analyser, dataArray);
    drawOsciloscope(cv2, ctx2, analyser, dataArray);
}

function drawFrequency(canvas, canvasCtx, analyser, dataArray){
    
    let bufferLength = analyser.frequencyBinCount;
    let drawVisual = requestAnimationFrame(drawFrequency.bind(this, canvas, canvasCtx, analyser, dataArray));
    analyser.getByteFrequencyData(dataArray);
    //console.log("data array = ", dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    let barWidth = (canvas.width / bufferLength) * 2;
    //console.log("bar width = ", barWidth);
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

    //console.log("height data =", heightData);
}

function drawOsciloscope(canvas, canvasCtx, analyser, dataArray) {
    requestAnimationFrame(drawOsciloscope.bind(this, canvas, canvasCtx, analyser, dataArray));
    let bufferLength = analyser.frequencyBinCount;

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

//export default loadAudio;
