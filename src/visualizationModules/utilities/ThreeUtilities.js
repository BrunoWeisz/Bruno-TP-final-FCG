import * as THREE from 'https://cdn.skypack.dev/three';

const ThreeUtilities = (function(){

    const Distance = (function(){

        function cameraDistance2dFrequency(settings){
            return settings.divissions/3;
        }

        function cameraDistance3dFrequency(settings){
            let div = settings.divissions;
            return [div/2+8,div+5];
        }

        function cameraDistanceHeightmap(settings){
            return cameraDistance3dFrequency(settings);
        }

        function heigthForTimeFrequency(divissions) {
            switch (divissions){
                case 32: return 10;
                case 64: return 20;
                case 128: return 30;
                case 256: return 110;
                case 512: return 150;
                case 1024: return 300;
            }
        }

        function cameraDistanceTimeFrequency(settings){
            let div = settings.divissions;
            let cameraDistance = div/3.2 + 20;
            let cameraHeigth = div * 0.15 + 20;
            let cameraXPosition = div/6;
            return [cameraXPosition, cameraHeigth, cameraDistance];
        }

        return {
            cameraDistance2dFrequency,
            cameraDistance3dFrequency,
            cameraDistanceHeightmap,
            cameraDistanceTimeFrequency,
            heigthForTimeFrequency
        }
    })();

    const Scale = (function(){

        function scaleOsciloscope(settings){
            let camDist = Distance.cameraDistance2dFrequency(settings);
            let scale = camDist / 160;
            return scale; 
        }

        function scaleFor3d(div, data){
            switch(div){
                case 8: return data*4/130;
                case 16: return data*8/130;
                case 32: return data*12/130;
                case 64: return data*16/130;
            }
        }

        function scaleHeightmap(data, settings){
            let div = settings.divissions;
            return scaleFor3d(div, data);
        }

        function scale2dFrequency(data, settings){
            let camDist = Distance.cameraDistance2dFrequency(settings);
            let scale = camDist / 160;
            return data*scale; 
        }

        function scale3dFrequency(data, settings){ 
            let camDist = Distance.cameraDistance3dFrequency(settings)[0];
            //let scale = Math.log2((data*2000 + 1) / 256);  
            let scale = data/(130/camDist);
            return Math.max(scale,.01)
        }

        function scaleTimeFrequency(data, settings){
            let div = settings.divissions;
            return data / 255 * Distance.cameraDistanceTimeFrequency(settings)[1];
            return data/5;
        }

        return {
            scale2dFrequency,
            scale3dFrequency,
            scaleHeightmap,
            scaleTimeFrequency,
            scaleOsciloscope
        }

    })();

    const Height = (function(){

    })();

    const ColorStyle = (function(){

        function rgbColor(r,g,b){
            return new THREE.Color(`rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`);
        }

        function mountain(y){
    
            let col = [0,0,0];
            if (y < 30){
                col = [0,10,240];
            } else if (y >= 30 && y < 60){
                col = [71,218,116];
            } else if (y >= 60 && y < 120){
                col = [30,196,100];
            } else if (y >= 120 && y < 150){
                col = [35, 144, 79];
            } else if (y >= 150 && y < 190){
                col = [85,65,36];
            } else if (y >= 190 && y < 210){
                col = [60, 37,21];
            } else if (y >= 210){
                col = [200,200,200];
            }
            
            return rgbColor(col[0],col[1],col[2]);
        }

        function rainbow2d(x,y,maxX){ // x = [0,maxX-1] y = [0,255]
            let r = x*255/((maxX-1));
            let g = y;
            let b = 255-r;
            return rgbColor(r,g,b);
        }

        function rainbow3d(x,y,z,maxXZ){ // x,z = [0,maxXZ-1] y = [0,255]
            let r = x*255/((maxXZ-1));
            let g = y;
            let b = z*255/(maxXZ-1);
            return rgbColor(r,g,b);
        }

        function computeFullColorX(x, y, maxX, vs){
            if (vs.style == "Rainbow"){return rainbow2d(x,y,maxX)}
            else if (vs.style == "Mountain"){return mountain(y)}
            else {
                console.log("error con el color");
                return rgbColor(255,255,255);
            } 
        }

        function computeFullColorXY(x,y,z,maxXZ,vs){
            if (vs.style == "Rainbow"){return rainbow3d(x,y,z,maxXZ)}
            else if (vs.style == "Mountain"){return mountain(y)}
            else {
                console.log("error con el color");
                return rgbColor(255,255,255);
            }
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