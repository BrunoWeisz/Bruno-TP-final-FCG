import * as THREE from 'https://cdn.skypack.dev/three';

function drawTimeFrequency(analyser){
    drawTimeFrequencyWithWidth(analyser, 64);
}

function drawTimeFrequencyWithWidth(analyser, wid){

    console.log("started time frequency");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//
    
    const renderer = new THREE.WebGLRenderer({canvas: canvas2});
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    scene.add(light);
    light.position.set(0,10,0);
    light.target.position.set(0,0,0);
    camera.position.set(0,20,10);
    camera.lookAt(0,0,0);

    let advanced = 0;
    let pace = 0.1;

    let vertices = [];
    let colors = [];
    let index = [];

    let verticesInitial = [];
    let colorsInitial = [];
    for (let i = 0; i < wid; i++){
        verticesInitial.push([i,0,advanced]);
        colorsInitial.push([.1,.1,i/wid]);
    }
    vertices.push(verticesInitial);
    colors.push(colorsInitial);
    advanced += pace;

    let verticesInitial2 = [];
    let colorsInitial2 = [];
    for (let i = 0; i < wid; i++){
        verticesInitial.push([i,0,advanced]);
        colorsInitial2.push([.1,.1,i/wid]);
    }
    vertices.push(verticesInitial2);
    colors.push(colorsInitial2);

    for(let i = 0; i < vertices.length - 1; i++){
        for(let j = 0; j < hor-1; j++){
            index.push(i*hor+j);
            index.push(i*hor+(j+1));
            index.push((i+1)*hor+j);

            index.push(i*hor+(j+1));
            index.push((i+1)*hor+(j+1));
            index.push((i+1)*hor+j);
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

    const phongMaterial = new THREE.MeshPhongMaterial({
        vertexColors: true,
    });
    const heightmap = new THREE.Mesh(plane, phongMaterial);
    heightmap.material.side = THREE.DoubleSide;

    scene.add(heightmap);
    // console.log(index);

    analyser.fftSize = wid*2;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    renderer.render(scene,camera);
    /*function render(time) {
        adaptSize();
        analyser.getByteFrequencyData(dataArray);

        for(let i = 0; i < hor/2; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                const bufferIndex = (i*ver+j)*3+1; 
                vertices[bufferIndex] = computeHeight(dataArray[arrayIndex]);
                colors[bufferIndex] = computeColor(dataArray[arrayIndex]);
                //heightmap.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
                //heightmap.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors.flat()), 3));
                heightmap.geometry.attributes.position.array[bufferIndex] = computeHeight(dataArray[arrayIndex]);
                heightmap.geometry.attributes.color.array[bufferIndex] = computeColor(dataArray[arrayIndex]);
            }
        }
        heightmap.geometry.attributes.position.needsUpdate = true;
        heightmap.geometry.attributes.color.needsUpdate = true;
        heightmap.geometry.computeVertexNormals();
        //console.log(colors.flat());
        //heightmap.rotation.y = time*0.0005;
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render);
    };*/
    animationFrameId = requestAnimationFrame(render.bind(this, analyser));

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