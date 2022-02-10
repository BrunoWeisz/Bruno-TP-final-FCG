import * as THREE from 'https://cdn.skypack.dev/three';
import { ThreeUtilities } from './ThreeUtilities.js';

function Badge(settings){
    this.settings = settings;
    this.frecWid = Math.floor(settings.divissions/3);
    this.historyHeightData = [];
    this.vertices = [];
    this.colors = [];
    this.index = [];
    this.plane = new THREE.BufferGeometry();
    this.plane.dynamic = true;
    this.phongMaterial = new THREE.MeshPhongMaterial({
        vertexColors: true
    });
    this.heightmap = new THREE.Mesh(this.plane, this.phongMaterial);
    this.heightmap.material.side = THREE.DoubleSide;
}

Badge.prototype.removeFromScene = function(aScene){
    aScene.remove(this.heightmap);
}

Badge.prototype.length = function(){
    return this.vertices.length -1;
}

Badge.prototype.toHeightAndColor = function(heightData, currentZPosition){
    let newVertexRow = [];
    let newColorRow = [];
    for(let i = 0; i < this.frecWid; i++ ){
        newVertexRow.push([i,this.computeHeight(heightData[i]), currentZPosition]);
        // newColorRow.push(this.computeMountainColor(heightData[i]));
        let color = this.computeColor(i,heightData[i], this.frecWid);
        newColorRow.push([color.r,color.g,color.b]);
    }
    return [newVertexRow, newColorRow];
}

Badge.prototype.computeColor = function(x,y,maxX){
    return ThreeUtilities.ColorStyle.computeFullColorX(x,y,maxX,this.settings);
}

Badge.prototype.addRowToPositionAndColor = function(heightData, currentZPosition){
    let newVertexRow;
    let newColorRow;
    [newVertexRow, newColorRow] = this.toHeightAndColor(heightData, currentZPosition);
    this.vertices.push(newVertexRow);
    this.colors.push(newColorRow);
}

Badge.prototype.addInitialRow = function(currentZPosition, firstHeightData){

    this.addRowToPositionAndColor(firstHeightData,currentZPosition);
    this.historyHeightData.push(firstHeightData);
}

Badge.prototype.addRow = function(heightData, currentZPosition){
    
    this.addRowToPositionAndColor(heightData,currentZPosition);

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
    this.heightmap.geometry.deleteAttribute('normal');
    this.heightmap.geometry.computeVertexNormals();
    this.heightmap.geometry.normalizeNormals();

    this.historyHeightData.push(heightData);
}

Badge.prototype.lastHeigthData = function(n){
    return this.historyHeightData[this.historyHeightData.length - n];
}

Badge.prototype.addToScene = function(aScene){
    aScene.add(this.heightmap);
}

Badge.prototype.computeHeight = function(data){
    return ThreeUtilities.Scale.scaleTimeFrequency(data, {divissions: this.frecWid});
    // return data/5;
}



Badge.prototype.delete = function(){

}

export {Badge};