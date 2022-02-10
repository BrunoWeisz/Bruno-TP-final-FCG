import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './utilities/ThreeUtilities.js';

const heightMapFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, hor, ver;
    let visualizationSettings;

    let vertices, colors, heightmap, index;
    
    function draw(analyser, settings){
        visualizationSettings = settings;
        analyserNode = analyser;
        let divissionsPerSide = visualizationSettings.divissions;
        drawHeightmapFrequencyWithSize(divissionsPerSide, divissionsPerSide);
    }

    function drawHeightmapFrequencyWithSize(_hor, _ver){

        hor = _hor;
        ver = _ver;

        console.log("started heightmap frequency");
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;

        let cameraY, cameraZ;
        [cameraY, cameraZ] = ThreeUtilities.Distance.cameraDistanceHeightmap(visualizationSettings);
        let far = cameraZ+50;

    
        //-----------------------------//
        
        renderer = new THREE.WebGLRenderer({canvas: canvas});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.DirectionalLight(0xFFFFFF, 2);

        scene.add(light);
        light.position.set(0,cameraY,cameraZ);
        light.target.position.set(0,0,0);
        camera.position.set(0,cameraY,cameraZ);
        camera.lookAt(0,0,0);
    
        vertices = [];
        colors = [];
        index = [];
    
        for(let i = -hor/2; i < hor/2; i++ ){
            for(let j = -ver/2; j < ver/2; j++ ){
                vertices.push([i,0,j]);
                colors.push([0.2 + i/(hor*0.8), 0, 0.2 + j/(ver*0.8)]);
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
        // return data/20;
        return ThreeUtilities.Scale.scaleHeightmap(data, visualizationSettings);
    }

    function computeColor(x,y,z,maxXZ){
        return ThreeUtilities.ColorStyle.computeFullColorXY(x,y,z,maxXZ,visualizationSettings);
    }

    function render(time) {
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);

        for(let i = 0; i < hor; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                const bufferIndex = (i*ver+j)*3+1; 
                
                heightmap.geometry.attributes.position.array[bufferIndex] = computeHeight(dataArray[arrayIndex]);

                let color = computeColor(i,dataArray[arrayIndex],j,hor);
                let oldColor = heightmap.geometry.attributes.color.array;
                oldColor[bufferIndex-1] = color.r;
                oldColor[bufferIndex] = color.g;
                oldColor[bufferIndex+1] = color.b;
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