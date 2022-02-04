import * as THREE from 'https://cdn.skypack.dev/three';

function drawTimeFrequency(analyser){
    drawTimeFrequencyWithWidth(analyser, 256);
}

function drawTimeFrequencyWithWidth(analyser, wid){

    let frecWid = wid/2;

    console.log("started time frequency");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;
    
    const renderer = new THREE.WebGLRenderer({canvas: canvas2});
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(light);
    //light.position.set(0,10,0);
    //light.target.position.set(0,0,0);
    camera.position.set(frecWid/2,25,16);
    camera.lookAt(frecWid/2,0,0);

    //-----------------------------//

    
    let advanced = 0;
    let pace = 1;

    let vertices = [];
    let colors = [];
    let index = [];

    let verticesInitial = [];
    let colorsInitial = [];
    for (let i = 0; i < frecWid; i++){
        verticesInitial.push([i,0,advanced]);
        colorsInitial.push([.1,.1,i/frecWid]);
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

    let floatVertices = new Float32Array(vertices.flat(2));
    let floatColors = new Float32Array(colors.flat(2));

    let plane = new THREE.BufferGeometry();
    plane.dynamic = true;

    plane.setAttribute('position', new THREE.BufferAttribute(floatVertices, 3));
    plane.setAttribute('color', new THREE.BufferAttribute(floatColors, 3));
    plane.setIndex(index);
    plane.computeVertexNormals();

    const phongMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true
    });
    const heightmap = new THREE.Mesh(plane, phongMaterial);
    heightmap.material.side = THREE.DoubleSide;

    scene.add(heightmap);

    analyser.fftSize = wid;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    renderer.render(scene,camera);

    function render(time) {
        advanced += pace;
        adaptSize();
        analyser.getByteFrequencyData(dataArray);
        
        let newVertexRow = [];
        let newColorRow = [];

        const currentRow = vertices.length - 1;

        for(let i = 0; i < frecWid; i++ ){
            newVertexRow.push([i,computeHeight(dataArray[i]), advanced]);
            newColorRow.push([advanced*0.001,computeColor(dataArray[1]),i/frecWid]);
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
        console.log(heightmap);
        // console.log("posicion:", camera.position);
        // console.log("mirando a:", camera);
        // console.log("posicion de las filas:", advanced);
        //--------------------------------//

        heightmap.geometry.setIndex(index);
        heightmap.geometry.attributes.position.needsUpdate = true;
        heightmap.geometry.attributes.color.needsUpdate = true;
        heightmap.geometry.computeVertexNormals();
        
        camera.position.z = advanced + 16;
        camera.lookAt(frecWid/2,0,advanced);

        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
        
    };
    animationFrameId = requestAnimationFrame(render);

    function computeHeight(data){
        return data/20;
    }

    function computeColor(data){
        return data/255;
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
}

export {drawTimeFrequency};