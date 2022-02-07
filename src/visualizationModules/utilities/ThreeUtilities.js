// import * as THREE from 'https://cdn.skypack.dev/three';

const ThreeUtilities = (function(){

    function adaptSize(cv,cam,renderer){
        cv.style.width = "100%";
        cv.style.height = "100%";
        // console.log("---------------");
        // console.log(cv.width);
        // console.log(cv.clientWidth);
        // console.log(cv.height);
        // console.log(cv.clientHeight);
        // console.log("---------------");
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
        adaptSize
    }

})();

export {ThreeUtilities};