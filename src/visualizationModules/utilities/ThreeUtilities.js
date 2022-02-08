// import * as THREE from 'https://cdn.skypack.dev/three';

const ThreeUtilities = (function(){

    const Distance = (function(){

        function cameraDistance2dFrequency(settings){
            return settings.divissions/2;
        }

        return {
            cameraDistance2dFrequency
        }
    })();

    const Scale = (function(){

        function scale2dFrequency(data, settings){
            let camDist = Distance.cameraDistance2dFrequency(settings);
            let scale = camDist / 160;
            return data*scale; 
        }

        return {
            scale2dFrequency
        }

    })();

    const Height = (function(){

    })();

    const ColorStyle = (function(){

        function computeFullColorX(data, index, maxIndex){
            return [index/maxIndex,data/255,index/maxIndex];
        }

        function computeFullColorXY(data, xPos, yPos, maxSide){
            return [xPos/maxSide, data/255, yPos/maxSide];
        } 

        function computeYColorX(data, index, maxIndex){

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

        function computeYcolorXY(data, xPos, yPos, maxSide){

        }
    
        return{
            computeFullColorX,
            computeMountainColor,
            computeYColorX,
            computeFullColorXY,
            computeYcolorXY
        }
    })();

    function adaptSize(cv,cam,renderer){
        cv.style.width = "100%";
        cv.style.height = "100%";
        if (cv.width !== cv.clientWidth || cv.height !== cv.clientHeight){

            console.log("Resizing...");

            cv.style.width = "100%";
            cv.style.height = "100%";
            cam.aspect = cv.clientWidth / cv.clientHeight;


            const pr = window.devicePixelRatio || 1;
            cv.width = cv.clientWidth * pr;
            cv.height = cv.clientHeight * pr;

            const width = cv.width / pr;
            const height = cv.height / pr;

            cv.style.width = width + 'px';
            cv.style.heigth = height + 'px';

            renderer.setSize(cv.clientWidth * pr | 0, cv.clientHeight * pr | 0, false);
            cam.updateProjectionMatrix();
        }
    }

    return {
        adaptSize,
        ColorStyle,
        Scale,
        Height,
        Distance
    }

})();

export {ThreeUtilities};