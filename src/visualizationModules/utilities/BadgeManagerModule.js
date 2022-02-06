import {Badge} from './BadgeModule.js';

function BadgeManager(initialZPosition, pace, frecWid, scene){
    this.pace = pace;
    this.scene = scene;
    this.currentZPosition = initialZPosition;
    this.frecWid = frecWid;

    this.badges = [];
    this.badgeMaxLength = 10;
};

BadgeManager.prototype.addBadge = function(newBadge){
    this.badges.push(newBadge);
    newBadge.addToScene(this.scene);
}

BadgeManager.prototype.beginBadges = function(){
    let newBadge = new Badge(this.frecWid);
    newBadge.addInitialRow(this.currentZPosition - this.pace, new Array(this.frecWid).fill(0));
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
        newBadge.addInitialRow(this.currentZPosition - this.pace, repeatingData);
        newBadge.addRow(heightData, this.currentZPosition);
        this.addBadge(newBadge);
    }
    this.currentZPosition += this.pace;
}  

export {BadgeManager};