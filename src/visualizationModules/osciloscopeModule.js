import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';


const Osciloscope = (function(){

    let analyserNode, renderer, camera, scene, light, pointCount, mesh, dataArray;
    let visualizationSettings;
    let vertex, colors,index;

    function setThreeJs(){
        console.log("started osciloscope 3d");
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
        camera.position.set(0,128,cameraDistance);
        camera.lookAt(0,0,0);
        
        
    }

    function draw(analyser, settings){
        visualizationSettings = settings;
        analyserNode = analyser;
        pointCount = visualizationSettings.divissions;
        

        analyserNode.fftSize = pointCount*2;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        setThreeJs();
        setOsciloscope();
        animationFrameId = requestAnimationFrame(render);
    }

    function render(){
        adaptSize();
        analyserNode.getByteTimeDomainData(dataArray);
        updateOsciloscope(dataArray);
        // renderer.clear();
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    }

    function setOsciloscope(){
        vertex = [];
        colors = [];
        index = [];
        console.log(`pointCount: ${pointCount}`)
        for(let i = -pointCount/2; i < pointCount/2; i++){
            vertex.push([i, 0, 0]);
            vertex.push([i,1,0]);
            //-----------//
            colors.push([1,1,1]);
            colors.push([1,1,1]);
        }
        for(let i = 0; i < (pointCount-1)*2; i+=2){
            index.push([i,i+1,i+2]);
            index.push([i+1,i+2,i+3]);
        }


        let floatVertices = new Float32Array(vertex.flat());
        let floatColors = new Float32Array(colors.flat());
        let realIndex = index.flat();

        const geometry = new THREE.BufferGeometry();
        geometry.dynamic = true;

        geometry.setAttribute('position', new THREE.BufferAttribute(floatVertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
        geometry.setIndex(realIndex);

        const basicMaterial = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });
        mesh = new THREE.Mesh(geometry, basicMaterial);
        mesh.material.side = THREE.DoubleSide;
        scene.add(mesh);
        mesh.position.set(0,0,0);

        // console.log(mesh.geometry.attributes.position.array.map((el,ind)=>{
        //     if (ind % 3 == 0) return el 
        //     else return null
        // }));
    }

    function updateOsciloscope(dataArray){
        
        for(let j = 0; j < pointCount; j++){
            let bufferIndex = (j*2)*3 + 1;
            let bufferIndex2 = (j*2+1)*3 + 1; 
            let arrayIndex = j;
            let height = computeScale()*dataArray[arrayIndex];
            mesh.geometry.attributes.position.array[bufferIndex] = height;
            mesh.geometry.attributes.position.array[bufferIndex2] = height+1;
            // mesh.geometry.attributes.color.array[bufferIndex] = computeYColor(dataArray[arrayIndex]);
            // mesh.geometry.attributes.color.array[bufferIndex2] = computeYColor(dataArray[arrayIndex]);
        }
        console.log(computeScale());
        

        mesh.geometry.attributes.position.needsUpdate = true;
        // mesh.geometry.attributes.color.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
    }

    function computeScale(){
        return ThreeUtilities.Scale.scaleOsciloscope(visualizationSettings);
    }

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };


    function computeColor(data, ind){
        return [ind/255,data/255,ind/255];
    }

    return {
        draw
    }

})();

export {Osciloscope};
    