import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';

const frequency3DDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, hor, ver, board, visualizationSettings;

    function draw(analyser, vSettings){
        visualizationSettings = vSettings;
        analyserNode = analyser;
        let divissionsPerSide = visualizationSettings.divissions;
        draw3dFrequencyWithSize(divissionsPerSide, divissionsPerSide);
    }

    function draw3dFrequencyWithSize(_hor, _ver){

        hor = _hor;
        ver = _ver;

        console.log("started 3d frequency");
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        
        console.log("vs:", visualizationSettings);
        let cameraY, cameraZ;
        [cameraY,cameraZ] = ThreeUtilities.Distance.cameraDistance3dFrequency(visualizationSettings);
        let far = cameraZ+50;

        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.DirectionalLight(0xFFFFFF, .5);
        scene.add(light);
        scene.add(light.target);
        light.position.set(0,cameraY,cameraZ);
        light.target.position.set(0,0,0);
        camera.position.set(0,cameraY,cameraZ);
        camera.lookAt(0,0,0);
    
        //const table = new THREE.Object3D();
        //scene.add(table);
    
        const bar = new THREE.BoxGeometry(1,1,1);
    
        board = new Array(hor);
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
    
        analyserNode.fftSize = hor*ver*2*2;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    
        
        animationFrameId = requestAnimationFrame(render);
    }

    function render(time) {
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);
        
        for(let i = 0; i < hor; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                board[i][j].scale.set(1, computeScale(dataArray[arrayIndex]), 1);
                let color = computeColor(i, dataArray[arrayIndex], j, hor);
                board[i][j].material.color = color;
                board[i][j].material.emissive = color;
            }
        }
        
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    };

    function computeScale(data){
        return ThreeUtilities.Scale.scale3dFrequency(data, visualizationSettings);
    }

    function computeColor(x,y,z,maxXZ){
        return ThreeUtilities.ColorStyle.computeFullColorXY(x,y,z,maxXZ,visualizationSettings);
    }

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };

    return {
        draw
    }

})();

export {frequency3DDrawer};


