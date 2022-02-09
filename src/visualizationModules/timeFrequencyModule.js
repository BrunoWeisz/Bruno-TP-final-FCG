import * as THREE from 'https://cdn.skypack.dev/three';
import datGui from 'https://cdn.skypack.dev/dat.gui';
import { BadgeManager } from './utilities/BadgeManagerModule.js';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';


const timeFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, wid, frecWid;
    let advanced, pace, badgeManager;
    let cameraDistance, cameraXPosition, cameraHeigth, visualizationSettings;

    function draw(analyser, visualization){
        visualizationSettings = visualization;
        analyserNode = analyser;
        let divissions = visualizationSettings.divissions;
        drawTimeFrequencyWithWidth(divissions);
    }

    function setThreeJS(){
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;

        [cameraXPosition, cameraHeigth, cameraDistance] = ThreeUtilities.Distance.cameraDistanceTimeFrequency(visualizationSettings);
        let far = cameraDistance + cameraHeigth;
        // cameraDistance = 150;
        // cameraHeigth = 60;
        // cameraXPosition = frecWid/2;
        
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        camera.position.set(cameraXPosition,cameraHeigth,cameraDistance);
        camera.lookAt(0,0,0);
 
        light = new THREE.DirectionalLight(0xFFFFFF, 1);
        scene.add(light);
        scene.add(light.target);
        light.position.set(cameraXPosition,cameraHeigth,cameraDistance);
        light.target.position.set(cameraXPosition,0,0);        
    }

    function drawTimeFrequencyWithWidth(_wid){
        console.log("started time frequency");

        wid = _wid;
        frecWid = Math.floor(wid/3);

        setThreeJS();
        
        advanced = 0;
        pace = -1;
        
        badgeManager = new BadgeManager(advanced, pace, frecWid, scene);

        analyserNode.fftSize = wid;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        animationFrameId = requestAnimationFrame(render);
    }
    
    function render(time) {
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);
        badgeManager.addRow(dataArray);
        
        light.position.set(cameraXPosition,cameraHeigth,advanced+cameraDistance);
        light.target.position.set(cameraXPosition,0,advanced);

        camera.position.set(cameraXPosition,cameraHeigth,cameraDistance+advanced);
        camera.lookAt(cameraXPosition,10,advanced);

        renderer.render( scene, camera );
        advanced += pace;
        animationFrameId = requestAnimationFrame(render);
        
    };

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };

    

    return {
        draw
    }

})();

export {timeFrequencyDrawer}

