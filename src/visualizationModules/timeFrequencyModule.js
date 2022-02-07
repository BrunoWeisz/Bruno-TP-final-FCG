import * as THREE from 'https://cdn.skypack.dev/three';
import { BadgeManager } from './utilities/BadgeManagerModule.js';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';


const timeFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, wid, frecWid;
    let advanced, pace, badgeManager;
    let cameraDistance, cameraXPosition, cameraHeigth;

    function draw(analyser){
        analyserNode = analyser;
        drawTimeFrequencyWithWidth(512);
    }

    function setThreeJS(){
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        let far = 300;
        cameraDistance = 150;
        cameraHeigth = 60;
        cameraXPosition = frecWid/2;
        
        renderer = new THREE.WebGLRenderer({canvas: canvas2});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xFFFFFF, 0xFFFFFF, 1);
        scene.add(light);
        // scene.add(light.target);
        light.position.set(cameraXPosition,cameraHeigth*2,0);
        // light.target.position.set(cameraXPosition,0,0);
        camera.position.set(cameraXPosition,cameraHeigth,cameraDistance);
        camera.lookAt(0,0,0);
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
        // analyserNode.smoothingTimeConstant = 0.8;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        //renderer.render(scene,camera);

        animationFrameId = requestAnimationFrame(render);
    }
    
    function render(time) {
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);
        badgeManager.addRow(dataArray);
    

        //--------------------------------//
        // console.log(badgeManager.currentZPosition);
        // console.log(scene);
        // console.log("camera position: ", camera.position);
        // console.log("looking at: ", camera);
        // console.log("current row position:", advanced);
        //--------------------------------//
        
        
        light.position.set(cameraXPosition,cameraHeigth,advanced);
        // light.target.position.set(cameraXPosition,0,advanced);

        camera.position.set(cameraXPosition,cameraHeigth,cameraDistance+advanced);
        camera.lookAt(cameraXPosition,10,advanced);

        renderer.render( scene, camera );
        advanced += pace;
        animationFrameId = requestAnimationFrame(render);
        
    };

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas2,camera,renderer);
    };

    

    return {
        draw
    }

})();

export {timeFrequencyDrawer}

