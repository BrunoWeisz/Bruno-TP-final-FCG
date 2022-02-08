import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';

const DrawFrequency2D = (function(){

    let analyserNode, renderer, camera, scene, light, barCount, bars, dataArray, visualizationSettings;

    function setThreeJs(){
        console.log("started frequency 2d");
        let fov = 100;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        

        let cameraDistance = ThreeUtilities.Distance.cameraDistance2dFrequency(visualizationSettings);
        let far = cameraDistance + 20;
        
        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xBBBBBB, 3);
        scene.add(light);
        //light.position.set(3,3,5);
        camera.position.set(0,0,cameraDistance);
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
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };

    function draw(analyser, vSettings = {divissions: 1024}){
        analyserNode = analyser;
        visualizationSettings = vSettings;
        barCount = visualizationSettings.divissions;

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
            bars[i].scale.set(1, Math.max(computeScale(dataArray[i]),.01), 1);
            bars[i].material.color.fromArray(computeColor(dataArray[i], i, barCount));
        }

        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    }

    function computeScale(data){
        return ThreeUtilities.Scale.scale2dFrequency(data, visualizationSettings);
    }

    function computeColor(data, ind, maxIndex){
        return ThreeUtilities.ColorStyle.computeFullColorX(data,ind,barCount);
    }

    return {
        draw
    }

})();

export {DrawFrequency2D};
    