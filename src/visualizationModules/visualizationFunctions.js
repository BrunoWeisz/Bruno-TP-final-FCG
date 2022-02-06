import * as THREE from 'https://cdn.skypack.dev/three'
import Queue from '../fixedQueue.js'

function drawGrowingCircle(analyser){

    console.log("started circle");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//
    
    const renderer = new THREE.WebGLRenderer({canvas: canvas2});
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.DirectionalLight(/*0xBBBBBB, .5*/);
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

        const actualScale = scale;
        console.log(actualScale)
        sphereMesh.scale.set(actualScale,actualScale,actualScale);
        sphereMesh.material.color.setRGB(actualScale/3,.8,.07);
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render.bind(this, analyser));

    function computeScale(data){
        return data.reduce((pv,cv) => cv/data.length + pv)/150;
    }

    function adaptSize(){
        console.log("resizing");
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
        
        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ','+ (barHeight+100)+',50)';
        canvasCtx.fillRect(x,canvas.height-barHeight/2,barWidth,barHeight);

        x += barWidth + 1;

        heightData.push(dataArray[i]);
        //if (dataArray[i] > 150) {console.log("frec = ",i,"height = ", dataArray[i])}
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

export {drawOsciloscope, drawFrequency, drawGrowingCircle}