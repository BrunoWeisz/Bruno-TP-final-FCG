import * as THREE from 'https://cdn.skypack.dev/three';

const timeFrequencyDrawer = (function(){

    let camera, renderer, scene, light, analyserNode, dataArray, wid, frecWid;

    let vertices, colors, heightmap, index, advanced, pace, floatVertices, floatColors;

    function draw(analyser){
        analyserNode = analyser;
        drawTimeFrequencyWithWidth(256);
    }

    function setThreeJS(){
        let fov = 75;
        let ratio = canvas.clientWidth / canvas.clientHeight;
        let near = .1;
        let far = 300;
        
        renderer = new THREE.WebGLRenderer({canvas: canvas2});
        camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
        scene = new THREE.Scene();
        light = new THREE.AmbientLight(0xFFFFFF, 1);
        scene.add(light);
        //light.position.set(0,10,0);
        //light.target.position.set(0,0,0);
        camera.position.set(frecWid/2,25,-16);
        camera.lookAt(frecWid/2,0,0);
    }

    function createNewBadge(){
        vertices = [];
        colors = [];
        index = [];

        let verticesInitial = [];
        let colorsInitial = [];
        for (let i = 0; i < frecWid; i++){
            verticesInitial.push([i,0,advanced]);
            colorsInitial.push(computeMountainColor(0));
        }
        vertices.push(verticesInitial);
        colors.push(colorsInitial);
        advanced += pace;

        let verticesInitial2 = [];
        let colorsInitial2 = [];
        for (let i = 0; i < frecWid; i++){
            verticesInitial.push([i,0,advanced]);
            colorsInitial2.push([.1,.1,i/frecWid]);
        }
        vertices.push(verticesInitial2);
        colors.push(colorsInitial2);

        for(let i = 0; i < vertices.length - 1; i++){
            for(let j = 0; j < frecWid-1; j++){
                index.push(i*frecWid+j);
                index.push(i*frecWid+(j+1));
                index.push((i+1)*frecWid+j);

                index.push(i*frecWid+(j+1));
                index.push((i+1)*frecWid+(j+1));
                index.push((i+1)*frecWid+j);
            }
        }

        floatVertices = new Float32Array(vertices.flat(2));
        floatColors = new Float32Array(colors.flat(2));

        let plane = new THREE.BufferGeometry();
        plane.dynamic = true;

        plane.setAttribute('position', new THREE.BufferAttribute(floatVertices, 3));
        plane.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
        plane.setIndex(index);
        plane.computeVertexNormals();

        const phongMaterial = new THREE.MeshBasicMaterial({
            vertexColors: true
        });
        heightmap = new THREE.Mesh(plane, phongMaterial);
        heightmap.material.side = THREE.DoubleSide;

    }

    function drawTimeFrequencyWithWidth(_wid){
        console.log("started time frequency");

        wid = _wid;
        frecWid = wid/2;

        setThreeJS();
        
        advanced = 0;
        pace = 1;
        
        createNewBadge();

        scene.add(heightmap);

        analyserNode.fftSize = wid;
        let bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        //renderer.render(scene,camera);

        animationFrameId = requestAnimationFrame(render);
    }

    

    function adaptSize(){
        //console.log("resizing");
        if (window.innerHeight != canvas.clientHeight || window.innerWidth != canvas.clientWidth){
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            const pr = window.devicePixelRatio;
            renderer.setSize(canvas.clientWidth * pr | 0, canvas.clientHeight * pr | 0, false);
            camera.updateProjectionMatrix();
        }
    };
    
    function render(time) {
        advanced += pace;
        adaptSize();
        analyserNode.getByteFrequencyData(dataArray);
        
        if (advanced % 100 == 0){

        } else {

        }

        let newVertexRow = [];
        let newColorRow = [];

        const currentRow = vertices.length - 1;

        for(let i = 0; i < frecWid; i++ ){
            newVertexRow.push([i,computeHeight(dataArray[i]), advanced]);
            newColorRow.push(computeMountainColor(dataArray[i]));
        }

        for(let i = 0; i < frecWid-1; i++ ){
            index.push(currentRow*frecWid + i);
            index.push(currentRow*frecWid + (i+1));
            index.push((currentRow+1)*frecWid + i);

            index.push(currentRow*frecWid + (i+1));
            index.push((currentRow+1)*frecWid + (i+1));
            index.push((currentRow+1)*frecWid + i);
        }

        vertices.push(newVertexRow);
        colors.push(newColorRow);
        floatVertices = new Float32Array(vertices.flat(2));
        floatColors = new Float32Array(colors.flat(2));

        heightmap.geometry.setAttribute('position', new THREE.BufferAttribute(floatVertices, 3));
        heightmap.geometry.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
        //heightmap.geometry.attributes.position.array[bufferIndex] = computeHeight(dataArray[arrayIndex]);
        //heightmap.geometry.attributes.color.array[bufferIndex] = computeColor(dataArray[arrayIndex]);

        //--------------------------------//
        //console.log(heightmap);
        // console.log("posicion:", camera.position);
        // console.log("mirando a:", camera);
        console.log("posicion de las filas:", advanced);
        //--------------------------------//

        heightmap.geometry.setIndex(index);
        heightmap.geometry.attributes.position.needsUpdate = true;
        heightmap.geometry.attributes.color.needsUpdate = true;
        heightmap.geometry.computeVertexNormals();
        
        camera.position.z = advanced - 16 - 50;
        camera.lookAt(frecWid/2,0,advanced) - 50;

        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
        
    };

    function computeHeight(data){
        return data/5;
    }

    function computeMountainColor(data){
        
        let finalColor = [0,0,0];
        if (data < 30){
            finalColor = [0,10,240];
        } else if (data >= 30 && data < 60){
            finalColor = [71,218,116];
        } else if (data >= 60 && data < 120){
            finalColor = [30,196,100];
        } else if (data >= 120 && data < 150){
            finalColor = [35, 144, 79];
        } else if (data >= 150 && data < 190){
            finalColor = [85,65,36];
        } else if (data >= 190 && data < 210){
            finalColor = [60, 37,21];
        } else if (data >= 210){
            finalColor = [200,200,200];
        }

        return finalColor.map(col => col/255);
        
    }

    return {
        draw
    }

})();

export {timeFrequencyDrawer}

