import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';

const DrawFrequency2D = (function(){

    let analyserNode, renderer, camera, scene, light, barCount, bars, dataArray;

    function setThreeJs(){
        console.log("started frequency 2d");
        let fov = 100;
        let ratio = canvas2.clientWidth / canvas2.clientHeight;
        let near = .1;
        let far = 500;

        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas2});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xBBBBBB, 3);
        scene.add(light);
        //light.position.set(3,3,5);
        camera.position.set(0,0,450);
        camera.lookAt(0,0,0);
        
    }

    function setBars(){
        bars = [];
        for (let i = 0; i < barCount; i++){
            let planeGeo = new THREE.PlaneGeometry(1,1);
            let material = new THREE.MeshBasicMaterial();
            let barMesh = new THREE.Mesh(planeGeo, material);
            barMesh.position.set(i-barCount/2,0,0);
            barMesh.material.side = THREE.DoubleSide;
            scene.add(barMesh);
            bars.push(barMesh);
        }
    }

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas2,camera,renderer);
    };

    function draw(analyser){
        analyserNode = analyser;
        barCount = 1024;

        analyserNode.fftSize = 2*barCount;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        setThreeJs();
        setBars();
        // testBar();
        animationFrameId = requestAnimationFrame(render);
    }

   

    function render(){

        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);

        for (let i = 0; i < barCount; i++){
            // bars[i].geometry.height = computeHeight(dataArray[i]);
            // bars[i].updateMatrix();
            bars[i].scale.set(1, Math.max(computeHeight(dataArray[i]),.01), 1);
            bars[i].material.color.fromArray(computeColor(dataArray[i], i));
        }

        // console.log(dataArray);
        // console.log(bars[barCount/2]);

        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    }

    function computeHeight(data){
        return data*5;
    }

    function computeColor(data, ind){
        return [ind/255,data/255,ind/255];
    }

    return {
        draw
    }

})();

export {DrawFrequency2D};
    
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