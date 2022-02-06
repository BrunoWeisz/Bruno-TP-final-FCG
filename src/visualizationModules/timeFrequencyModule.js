import * as THREE from 'https://cdn.skypack.dev/three';

function Badge(frecWid){
    this.frecWid = frecWid;
    this.historyHeightData = [];
    this.vertices = [];
    this.colors = [];
    this.index = [];
    this.plane = new THREE.BufferGeometry();
    this.plane.dynamic = true;
    this.phongMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true
    });
    this.heightmap = new THREE.Mesh(this.plane, this.phongMaterial);
    this.heightmap.material.side = THREE.DoubleSide;
}

Badge.prototype.length = function(){
    return this.vertices.length;
}

Badge.prototype.toHeightAndColor = function(heightData, currentZPosition){
    //let newVertexRow = heightData.map((height, index) => {return [index, this.computeHeight(height), this.currentZPosition]});
    //let newColorRow = heightData.map(height => {return this.computeMountainColor(height)});
    let newVertexRow = [];
    let newColorRow = [];
    for(let i = 0; i < this.frecWid; i++ ){
        newVertexRow.push([i,this.computeHeight(heightData[i]), currentZPosition]);
        newColorRow.push(this.computeMountainColor(heightData[i]));
    }
    return [newVertexRow, newColorRow];
}

Badge.prototype.addInitialRow = function(currentZPosition, firstHeightData){
    let newVertexRow;
    let newColorRow;
    [newVertexRow, newColorRow] = this.toHeightAndColor(firstHeightData, currentZPosition);
    this.vertices.push(newVertexRow);
    this.colors.push(newColorRow);
    this.historyHeightData.push(firstHeightData);
}

// POSSIBLE SOLUTION: PROBLEM WITH INDEXES //

Badge.prototype.addRow = function(heightData, currentZPosition){
    
    let newVertexRow;
    let newColorRow;
    [newVertexRow, newColorRow] = this.toHeightAndColor(heightData, currentZPosition);
    this.vertices.push(newVertexRow);
    this.colors.push(newColorRow);

    this.floatVertices = new Float32Array(this.vertices.flat(2));
    this.floatColors = new Float32Array(this.colors.flat(2));

    for(let i = 0; i < this.frecWid-1; i++ ){
        this.index.push(currentZPosition*this.frecWid + i);
        this.index.push(currentZPosition*this.frecWid + (i+1));
        this.index.push((currentZPosition+1)*this.frecWid + i);

        this.index.push(currentZPosition*this.frecWid + (i+1));
        this.index.push((currentZPosition+1)*this.frecWid + (i+1));
        this.index.push((currentZPosition+1)*this.frecWid + i);
    }

    //--------
    // console.log(this.floatVertices);
    //--------


    this.heightmap.geometry.setAttribute('position', new THREE.BufferAttribute(this.floatVertices, 3));
    this.heightmap.geometry.setAttribute('color', new THREE.BufferAttribute(this.floatColors, 3));
    this.heightmap.geometry.setIndex(this.index);
    this.heightmap.geometry.attributes.position.needsUpdate = true;
    this.heightmap.geometry.attributes.color.needsUpdate = true;
    this.heightmap.geometry.computeVertexNormals();

    this.historyHeightData.push(heightData);
}

Badge.prototype.lastHeigthData = function(){
    return this.historyHeightData[this.historyHeightData.length - 1];
}

Badge.prototype.addToScene = function(aScene){
    aScene.add(this.heightmap);
}

Badge.prototype.computeHeight = function(data){
    return data/5;
}

Badge.prototype.computeMountainColor = function(data){
    
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

function BadgeManager(initialZPosition, pace, frecWid, scene){
    this.pace = pace;
    this.scene = scene;
    this.currentZPosition = initialZPosition;
    this.frecWid = frecWid;

    this.badges = [];
    this.badgeMaxLength = 1000;
};

BadgeManager.prototype.addBadge = function(newBadge){
    this.badges.push(newBadge);
    newBadge.addToScene(this.scene);
}

BadgeManager.prototype.beginBadges = function(){
    let newBadge = new Badge(this.frecWid);
    newBadge.addInitialRow(this.currentZPosition, new Array(this.frecWid).fill(0));
    this.addBadge(newBadge);    
}

BadgeManager.prototype.addRow = function(heightData){

    if (this.badges.length == 0){
        this.beginBadges();
    }

    let currentBadge = this.badges[this.badges.length-1];
    if (currentBadge.length() < this.badgeMaxLength){
        currentBadge.addRow(heightData, this.currentZPosition);
    } else {
        let repeatingData = currentBadge.lastHeigthData();
        let newBadge = new Badge(this.frecWid);
        newBadge.addInitialRow(this.currentZPosition, repeatingData);
        newBadge.addRow(heightData, this.currentZPosition);
        this.addBadge(newBadge);
    }
    this.currentZPosition += this.pace;
}  

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
        cameraDistance = 40;
        cameraHeigth = 40;
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
         console.log(scene);
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

