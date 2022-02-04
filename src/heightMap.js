import * as THREE from 'https://cdn.skypack.dev/three';

function drawHeightmapFrequency(analyser){
    drawHeightmapFrequencyWithSize(analyser, 32, 32);
}

function drawHeightmapFrequencyWithSize(analyser, hor, ver){

    console.log("started heightmap frequency");
    let fov = 75;
    let ratio = canvas.clientWidth / canvas.clientHeight;
    let near = .1;
    let far = 100;

    //-----------------------------//
    
    const renderer = new THREE.WebGLRenderer({canvas: canvas2});
    const camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xAAAAAA, .7);
    scene.add(light);
    //light.position.set(0,10,0);
    //light.target.position.set(0,0,0);
    camera.position.set(0,15,30);
    camera.lookAt(0,0,0);

    //const table = new THREE.Object3D();
    //scene.add(table);

    let vertices = [];
    let colors = [];
    let index = [];

    for(let i = -hor/2; i < hor/2; i++ ){
        for(let j = -ver/2; j < ver/2; j++ ){
            vertices.push([i,0,j]);
            colors.push([i/hor, 0, j/ver]);
            
        }
    }
    for(let i = 0; i < hor - 1; i++ ){
        for(let j = 0; j < ver - 1; j++ ){
            index.push(i*ver+j);
            index.push(i*ver+(j+1));
            index.push((i+1)*ver+j);

            index.push(i*ver+(j+1));
            index.push((i+1)*ver+j);
            index.push((i+1)*ver+(j+1));
        }
    }

    let plane = new THREE.BufferGeometry();
    plane.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
    plane.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors.flat()), 3));
    plane.setIndex(index);
    plane.computeVertexNormals();

    const basicMaterial = new THREE.MeshBasicMaterial();
    const heightmap = new THREE.Mesh(plane, basicMaterial);

    scene.add(heightmap);
    console.log(index);
    

    analyser.fftSize = hor*ver*2;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    renderer.render(scene,camera);
    function render(time) {
        adaptSize();
        analyser.getByteFrequencyData(dataArray);

        for(let i = 0; i < hor; i++ ){
            for(let j = 0; j < ver; j++ ){
                const arrayIndex = i*ver+j;
                vertices[(i*ver+j)][1] = computeHeight(dataArray[arrayIndex]);
                colors[(i*ver+j)][1] = computeColor(dataArray[arrayIndex]);
                heightmap.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3));
                heightmap.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors.flat()), 3));
                heightmap.geometry.computeVertexNormals();
            }
        }
        //console.log(colors.flat());
        
        renderer.render( scene, camera );
        animationFrameId = requestAnimationFrame(render.bind(this, analyser));
    };
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

export {drawHeightmapFrequency};