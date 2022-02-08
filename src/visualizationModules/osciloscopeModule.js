import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';


const Osciloscope = (function(){

    let analyserNode, renderer, camera, scene, light, pointCount, osciloscope, dataArray;

    function setThreeJs(){
        console.log("started osciloscope 3d");
        let fov = 100;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        let far = 100;

        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xBBBBBB, 3);
        scene.add(light);
        //light.position.set(3,3,5);
        camera.position.set(0,0,400);
        camera.lookAt(0,0,0);
        
    }

    function setOsciloscope(){

        

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        tube = new THREE.Mesh(geometry, material);  
        tube.position.set(0,0,0);
        scene.add(tube);
    }

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };

    function draw(analyser){
        analyserNode = analyser;
        pointCount = 1024;

        analyserNode.fftSize = 2*pointCount;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        setThreeJs();
        animationFrameId = requestAnimationFrame(render);
    }

   

    function render(){

        adaptSize();
        analyserNode.getByteTimeDomainData(dataArray);
        setTube(dataArray);

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

export {Osciloscope};
    