import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';

const heightMapFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, hor, ver;

    let vertices, colors, heightmap, index;
    
    function draw(analyser){
        analyserNode = analyser;
        drawHeightmapFrequencyWithSize(64, 64);
    }

    function drawHeightmapFrequencyWithSize(_hor, _ver){

        hor = _hor;
        ver = _ver;

        console.log("started heightmap frequency");
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        let far = 100;
    
        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.DirectionalLight(0xFFFFFF, 1);

        scene.add(light);
        light.position.set(0,10,0);
        light.target.position.set(0,0,0);
        camera.position.set(0,20,45);
        camera.lookAt(0,0,0);
    
        vertices = [];
        colors = [];
        index = [];
    
        for(let i = -hor/2; i < hor/2; i++ ){
            for(let j = -ver/2; j < ver/2; j++ ){
                vertices.push([i,0,j]);
                colors.push([0.2 + i/(hor*0.8), 0, 0.2 + j/(ver*0.8)]);
                // colors.push([1,1,1]);
            }
        }
        for(let i = 0; i < hor - 1; i++ ){
            for(let j = 0; j < ver - 1; j++ ){
                index.push(i*ver+j);
                index.push(i*ver+(j+1));
                index.push((i+1)*ver+j);
    
                index.push(i*ver+(j+1));
                index.push((i+1)*ver+(j+1));
                index.push((i+1)*ver+j);
    
            }
        }
    
        vertices = vertices.flat();
        colors = colors.flat();
    
        let floatVertices = new Float32Array(vertices);
        let floatColors = new Float32Array(colors);
    
        let plane = new THREE.BufferGeometry();
        plane.dynamic = true;
    
        plane.setAttribute('position', new THREE.BufferAttribute(floatVertices, 3));
        plane.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
        plane.setIndex(index);
        //plane.computeVertexNormals();
    
        const basicMaterial = new THREE.MeshPhongMaterial({
            vertexColors: true,
        });
        heightmap = new THREE.Mesh(plane, basicMaterial);
        heightmap.material.side = THREE.DoubleSide;
        scene.add(heightmap);
        
        analyserNode.fftSize = hor*ver*2*2;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        animationFrameId = requestAnimationFrame(render);     
    }

    function adaptSize(){
        ThreeUtilities.adaptSize(canvas,camera,renderer);
    };

    function computeHeight(data){
        return data/20;
    }

    function computeYColor(data){
        return data/255;
    }

    function render(time) {
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);

        for(let i = 0; i < hor; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                const bufferIndex = (i*ver+j)*3+1; 
                vertices[bufferIndex] = computeHeight(dataArray[arrayIndex]);
                colors[bufferIndex] = computeYColor(dataArray[arrayIndex]);
                heightmap.geometry.attributes.position.array[bufferIndex] = computeHeight(dataArray[arrayIndex]);
                heightmap.geometry.attributes.color.array[bufferIndex] = computeYColor(dataArray[arrayIndex]);
            }
        }
        heightmap.geometry.attributes.position.needsUpdate = true;
        heightmap.geometry.attributes.color.needsUpdate = true;
        heightmap.geometry.computeVertexNormals();
        //console.log(colors.flat());
        //heightmap.rotation.y = time*0.0005;
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    };

    return {
        draw
    }
})();





export {heightMapFrequencyDrawer};