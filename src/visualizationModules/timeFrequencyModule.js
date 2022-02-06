import * as THREE from 'https://cdn.skypack.dev/three';
import { BadgeManager } from './utilities/BadgeManagerModule.js';


const timeFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, wid, frecWid;
    let advanced, pace, badgeManager;
    let cameraDistance, cameraXPosition, cameraHeigth;

    function draw(analyser){
        analyserNode = analyser;
        drawTimeFrequencyWithWidth(256);
    }

    function setThreeJS(){
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        let far = 300;
        cameraDistance = 70;
        cameraHeigth = 50;
        cameraXPosition = frecWid / 2;
        
        renderer = new THREE.WebGLRenderer({canvas: canvas2});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xFFFFFF, 1);
        scene.add(light);
        //light.position.set(0,10,0);
        //light.target.position.set(0,0,0);
        camera.position.set(cameraXPosition,cameraHeigth,cameraDistance);
        camera.lookAt(cameraXPosition,0,0);
    }

    function drawTimeFrequencyWithWidth(_wid){
        console.log("started time frequency");

        wid = _wid;
        frecWid = wid/2;

        setThreeJS();
        
        advanced = 0;
        pace = -1;
        
        badgeManager = new BadgeManager(advanced, pace, frecWid, scene);

        analyserNode.fftSize = wid;
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
        // console.log(scene);
        // console.log("camera position: ", camera.position);
        // console.log("looking at: ", camera);
        // console.log("current row position:", advanced);
        //--------------------------------//
        
        camera.position.z = advanced + cameraDistance;
        camera.lookAt(cameraXPosition,0,advanced);

        renderer.render( scene, camera );
        advanced += pace;
        animationFrameId = requestAnimationFrame(render);
        
    };

    function adaptSize(){
        //console.log("resizing");
        if (window.innerHeight != canvas.clientHeight || window.innerWidth != canvas.clientWidth){
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            const pr = window.devicePixelRatio;
            renderer.setSize(canvas.clientWidth * pr | 0, canvas.clientHeight * pr | 0, false);
            camera.updateProjectionMatrix();
        }
    };

    

    return {
        draw
    }

})();

export {timeFrequencyDrawer}

