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
    return this.vertices.length -1;
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

    // console.log("initial row:", currentZPosition);

    let newVertexRow;
    let newColorRow;
    [newVertexRow, newColorRow] = this.toHeightAndColor(firstHeightData, currentZPosition);
    this.vertices.push(newVertexRow);
    this.colors.push(newColorRow);
    this.historyHeightData.push(firstHeightData);
}

// POSSIBLE SOLUTION: PROBLEM WITH INDEXES //

Badge.prototype.addRow = function(heightData, currentZPosition){
    
    // console.log("adding row:", currentZPosition);

    let newVertexRow;
    let newColorRow;
    [newVertexRow, newColorRow] = this.toHeightAndColor(heightData, currentZPosition);
    this.vertices.push(newVertexRow);
    this.colors.push(newColorRow);

    let currentIndex = this.vertices.length-2;

    this.floatVertices = new Float32Array(this.vertices.flat(2));
    this.floatColors = new Float32Array(this.colors.flat(2));

    for(let i = 0; i < this.frecWid-1; i++ ){
        this.index.push(currentIndex*this.frecWid + i);
        this.index.push(currentIndex*this.frecWid + (i+1));
        this.index.push((currentIndex+1)*this.frecWid + i);

        this.index.push(currentIndex*this.frecWid + (i+1));
        this.index.push((currentIndex+1)*this.frecWid + (i+1));
        this.index.push((currentIndex+1)*this.frecWid + i);
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

Badge.prototype.lastHeigthData = function(n){
    return this.historyHeightData[this.historyHeightData.length - n];
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

Badge.prototype.delete = function(){

}

export {Badge};