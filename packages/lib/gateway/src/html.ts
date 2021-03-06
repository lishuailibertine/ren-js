export const RenIFrame = (uniqueID: string, iframeURL: string) => `
<iframe class="_ren_iframe-hidden" id="_ren_iframe-hidden-${uniqueID}" style="display: none"
    src="${iframeURL}"></iframe>
`;

export const RenGatewayContainerHTML = () => `
<div id="_ren_gatewayContainer" id="_ren_gatewayContainer">
    <style>
        #_ren_gatewayContainer {
            all: unset;
        }
    </style>
</div>
`;

const iframeHeight = 288 + 6; // Main div + progress div
const iframeWidth = 452;
const minimizedHeight = 50;
const minimizedWidth = 250;
const minimizedSpacing = 10;

const bellSvg = (id: string) => `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 227.23 262.92"

    id="${id}" height="300px" width="300px" fill="#FFFFFF66"
    style="width: 15px; height: 15px; cursor: pointer;" xml:space="preserve"
>
    <title>Click to enable browser notifications</title>
    <path
        d="M227.23,200.69c-.1,10.46-12.82,19.08-28.52,19.1l-85.09.16-85.1-.16c-15.7,0-28.42-8.64-28.52-19.1-.09-11.06,12.64-16.9,13.36-17.26C35.65,169.15,36,109.62,36,109.62c2-35.94,22.82-65.45,51.65-77.14A27.91,27.91,0,0,1,87.16,28c.15-15,10.78-28,26.46-28s26.31,13,26.45,28a26.83,26.83,0,0,1-.49,4.51c28.84,11.69,49.61,41.2,51.66,77.14,0,0,.34,59.53,22.63,73.81C214.59,183.79,227.33,189.63,227.23,200.69ZM80.34,229.64a33.28,33.28,0,1,0,66.56,0H80.34Z" />
</svg>
`;

const cogSvg = (id: string) => `
<svg
    xmlns:xlink="http://www.w3.org/1999/xlink"
    id="${id}" height="300px" width="300px" fill="#ffffff66" xmlns="http://www.w3.org/2000/svg"
    version="1.1" x="0px" y="0px" viewBox="0 0 100 100"
    style="enable-background:new 0 0 100 100; width: 15px; height: 15px; cursor: pointer;" xml:space="preserve"
>
    <title>Click to show settings</title>
    <path
        d="M93,40h-5c-1.9,0-3.5-1.2-4.2-3c-0.2-0.6-0.5-1.2-0.7-1.7c-0.8-1.7-0.5-3.8,0.9-5.1l3.6-3.6c1.8-1.8,1.8-4.6,0-6.4l-7.8-7.8  c-1.8-1.8-4.6-1.8-6.4,0l-3.6,3.6c-1.3,1.3-3.4,1.7-5.1,0.9c-0.6-0.2-1.1-0.5-1.7-0.7c-1.8-0.7-3-2.3-3-4.2V7c0-2.5-2-4.5-4.5-4.5  h-11C42,2.5,40,4.5,40,7v5.1c0,1.9-1.2,3.6-3,4.2c-0.6,0.2-1.1,0.4-1.7,0.7c-1.7,0.8-3.7,0.4-5.1-0.9l-3.6-3.6  c-1.8-1.8-4.6-1.8-6.4,0l-7.8,7.8c-1.8,1.8-1.8,4.6,0,6.4l3.6,3.6c1.3,1.3,1.7,3.4,0.9,5.1c-0.3,0.6-0.5,1.1-0.7,1.7  c-0.7,1.8-2.3,3-4.2,3H7c-2.5,0-4.5,2-4.5,4.5v11C2.5,58,4.5,60,7,60h4.9c1.9,0,3.6,1.2,4.2,3c0.2,0.6,0.5,1.2,0.7,1.8  c0.8,1.7,0.4,3.7-0.9,5.1l-3.5,3.5c-1.8,1.8-1.8,4.6,0,6.4l7.8,7.8c1.8,1.8,4.6,1.8,6.4,0l3.4-3.4c1.3-1.3,3.3-1.7,5-0.9  c0.7,0.3,1.4,0.6,2,0.9c1.7,0.7,2.9,2.3,2.9,4.2V93c0,2.5,2,4.5,4.5,4.5h11c2.5,0,4.5-2,4.5-4.5v-4.9c0-1.8,1.1-3.5,2.9-4.2  c0.7-0.3,1.4-0.5,2-0.9c1.7-0.8,3.7-0.4,5,0.9l3.4,3.4c1.8,1.8,4.6,1.8,6.4,0l7.8-7.8c1.8-1.8,1.8-4.6,0-6.4L84,69.8  c-1.3-1.3-1.7-3.3-0.9-5.1c0.3-0.6,0.5-1.2,0.7-1.8c0.7-1.8,2.3-3,4.2-3H93c2.5,0,4.5-2,4.5-4.5v-11C97.5,42,95.5,40,93,40z   M50,67.5c-9.7,0-17.5-7.8-17.5-17.5S40.3,32.5,50,32.5S67.5,40.3,67.5,50S59.7,67.5,50,67.5z" />
</svg>
`;

export const RenElementHTML = (
    uniqueID: string,
    frameUrl: string,
    paused?: boolean
) => `
<div class="_ren_gateway ${
    paused ? "_ren_gateway-minified" : ""
}" id="_ren_gateway-${uniqueID}">
    <style>
    ._ren_overlay {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        position: fixed;
        background: rgba(0, 0, 0, 0.7);
        z-index:1000000;
    }

    ._ren_iframeShadow {
        box-shadow: 0 20px 40px 0 rgba(0,0,0,0.5);
        border-radius: 6px;
        background: white;
        position:fixed;
        left: calc(50vw - calc(${iframeWidth}px / 2));
        top: calc(50vh - calc(${iframeHeight}px / 2));
        // transform: translate(-50%, -50%);
        width:${iframeWidth}px;
        height:${iframeHeight}px;
        z-index:1000000;
        transition: all 300ms;
    }

    @media (max-width: ${iframeWidth}px) {
        ._ren_iframeShadow {
            width: calc(100vw - 10px);
            left: 5px;
        }
    }

    ._ren_gateway-minified ._ren_iframeShadow {
        top: ${minimizedSpacing}px;
        // right: 10px;
        left: calc(100% - ${minimizedWidth}px - ${minimizedSpacing}px);
        // transform: translate(0%, 0%);
        width: ${minimizedWidth}px;
        height: ${minimizedHeight}px;
        box-shadow: 0 5px 10px 0 rgba(0,0,0,0.5);
        z-index: 999999;
        position: absolute;
    }

    ._ren_iframe_footer {
        color: white;
        font-size: 12px;
        text-align: center;
        margin-top: 2px;

        display: flex;
        justify-content: space-between;
    }

    ._ren_gateway-minified ._ren_iframe_footer {
        display: none;
    }

    /* TODO: Use single CSS rule */
    ._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 1));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 2));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 3));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 4));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 5));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 6));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 7));
    }
    ._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway+._ren_gateway-minified ._ren_iframeShadow {
        top: calc(${minimizedSpacing}px + calc(${
    minimizedHeight + minimizedSpacing
}px * 8));
    }

    ._ren_gateway-minified ._ren_overlay {
        display: none;
    }

    ._ren_iframe {
        border-radius: 6px;
        height: 100%;
        width: 100%;
        border: none;
    }

    ._ren_notifications-blue {
        fill: #006fe8;
        -webkit-animation: ring 4s .7s ease-in-out infinite;
        -webkit-transform-origin: 50% 4px;
        -moz-animation: ring 4s .7s ease-in-out infinite;
        -moz-transform-origin: 50% 4px;
        animation: ring 4s .7s ease-in-out infinite;
        transform-origin: 50% 4px;
        animation-iteration-count: 1;
    }

    @-webkit-keyframes ring {
        0% { -webkit-transform: rotateZ(0); }
        1% { -webkit-transform: rotateZ(30deg); }
        3% { -webkit-transform: rotateZ(-28deg); }
        5% { -webkit-transform: rotateZ(34deg); }
        7% { -webkit-transform: rotateZ(-32deg); }
        9% { -webkit-transform: rotateZ(30deg); }
        11% { -webkit-transform: rotateZ(-28deg); }
        13% { -webkit-transform: rotateZ(26deg); }
        15% { -webkit-transform: rotateZ(-24deg); }
        17% { -webkit-transform: rotateZ(22deg); }
        19% { -webkit-transform: rotateZ(-20deg); }
        21% { -webkit-transform: rotateZ(18deg); }
        23% { -webkit-transform: rotateZ(-16deg); }
        25% { -webkit-transform: rotateZ(14deg); }
        27% { -webkit-transform: rotateZ(-12deg); }
        29% { -webkit-transform: rotateZ(10deg); }
        31% { -webkit-transform: rotateZ(-8deg); }
        33% { -webkit-transform: rotateZ(6deg); }
        35% { -webkit-transform: rotateZ(-4deg); }
        37% { -webkit-transform: rotateZ(2deg); }
        39% { -webkit-transform: rotateZ(-1deg); }
        41% { -webkit-transform: rotateZ(1deg); }
        43% { -webkit-transform: rotateZ(0); }
        100% { -webkit-transform: rotateZ(0); }
    }

    @-moz-keyframes ring {
        0% { -moz-transform: rotate(0); }
        1% { -moz-transform: rotate(30deg); }
        3% { -moz-transform: rotate(-28deg); }
        5% { -moz-transform: rotate(34deg); }
        7% { -moz-transform: rotate(-32deg); }
        9% { -moz-transform: rotate(30deg); }
        11% { -moz-transform: rotate(-28deg); }
        13% { -moz-transform: rotate(26deg); }
        15% { -moz-transform: rotate(-24deg); }
        17% { -moz-transform: rotate(22deg); }
        19% { -moz-transform: rotate(-20deg); }
        21% { -moz-transform: rotate(18deg); }
        23% { -moz-transform: rotate(-16deg); }
        25% { -moz-transform: rotate(14deg); }
        27% { -moz-transform: rotate(-12deg); }
        29% { -moz-transform: rotate(10deg); }
        31% { -moz-transform: rotate(-8deg); }
        33% { -moz-transform: rotate(6deg); }
        35% { -moz-transform: rotate(-4deg); }
        37% { -moz-transform: rotate(2deg); }
        39% { -moz-transform: rotate(-1deg); }
        41% { -moz-transform: rotate(1deg); }
        43% { -moz-transform: rotate(0); }
        100% { -moz-transform: rotate(0); }
    }

    @keyframes ring {
        0% { transform: rotate(0); }
        1% { transform: rotate(30deg); }
        3% { transform: rotate(-28deg); }
        5% { transform: rotate(34deg); }
        7% { transform: rotate(-32deg); }
        9% { transform: rotate(30deg); }
        11% { transform: rotate(-28deg); }
        13% { transform: rotate(26deg); }
        15% { transform: rotate(-24deg); }
        17% { transform: rotate(22deg); }
        19% { transform: rotate(-20deg); }
        21% { transform: rotate(18deg); }
        23% { transform: rotate(-16deg); }
        25% { transform: rotate(14deg); }
        27% { transform: rotate(-12deg); }
        29% { transform: rotate(10deg); }
        31% { transform: rotate(-8deg); }
        33% { transform: rotate(6deg); }
        35% { transform: rotate(-4deg); }
        37% { transform: rotate(2deg); }
        39% { transform: rotate(-1deg); }
        41% { transform: rotate(1deg); }
        43% { transform: rotate(0); }
        100% { transform: rotate(0); }
    }

    ._ren_notifications-hidden {
        display: none;
    }


    </style>
    <div class="_ren_overlay" id="_ren_overlay-${uniqueID}"></div>
    <div class="_ren_iframeShadow" id="_ren_iframeShadow-${uniqueID}">
        <iframe class="_ren_iframe" id="_ren_iframe-${uniqueID}" ${
    /*style="background-color: transparent" allowtransparency="true"*/ ""
} frameborder="0" src="${frameUrl}" ></iframe>
        <div class="_ren_iframe_footer">
            <div class="_ren_iframe_footer_left" style="width: 15px;"></div>
            <div class="_ren_iframe_footer_center">
                <svg id="Layer_1" x="0px" y="0px" viewBox="0 0 135.2 135.2" style="width: 15px;"
                    xml:space="preserve">
                    <style type="text/css">
                        .st0 {
                            fill: #ffffff;
                        }
                    </style>
                    <g>
                        <polygon class="st0"
                            points="18.6,28.5 28.5,22.8 29.9,25.1 66.6,3.9 63.9,2.3 61.2,0.8 59.9,0 0,34.6 0,36.1 17.2,26.2  ">
                        </polygon>
                        <polygon class="st0"
                            points="18.6,50.3 47.4,33.7 48.7,36 85.5,14.8 82.8,13.2 80.1,11.7 78.8,10.9 0,56.3 0,57.9 17.2,48  ">
                        </polygon>
                        <polygon class="st0"
                            points="18.6,61.2 56.8,39.1 58.1,41.4 94.9,20.2 92.2,18.7 89.5,17.1 88.2,16.3 0,67.2 0,68.8 17.2,58.8  ">
                        </polygon>
                        <polygon class="st0"
                            points="18.6,72 66.5,44.4 67.8,46.7 104.3,25.6 101.6,24.1 98.9,22.5 97.6,21.8 0,78.1 0,79.6 17.2,69.7  ">
                        </polygon>
                        <polygon class="st0"
                            points="18.6,82.9 75.9,49.8 77.2,52.2 113.7,31.1 111,29.5 108.4,28 107,27.2 0,89 0,90.5 17.2,80.6  ">
                        </polygon>
                        <polygon class="st0"
                            points="117.8,33.4 116.4,32.6 0,99.9 0,101.4 17.2,91.5 18.6,93.8 75.9,60.7 77.2,63 119.8,38.5 119.8,35.4    119.8,34.6  ">
                        </polygon>
                        <polygon class="st0"
                            points="7.4,108 17,102.5 18.4,104.8 75.6,71.7 77,74.1 119.8,49.3 119.8,46.2 119.8,43.1 119.8,41.6    6.1,107.2  ">
                        </polygon>
                        <polyline class="st0"
                            points="75.6,82.6 77,85 119.8,60.2 119.8,57.1 119.8,54 119.8,52.5 15.5,112.7 16.8,113.5 26.6,107.8    28,110.1  ">
                        </polyline>
                        <polygon class="st0"
                            points="26.2,118.9 36.1,113.2 37.4,115.6 75.6,93.5 77,95.8 119.8,71.1 119.8,68 119.8,64.9 119.8,63.3    24.9,118.1  ">
                        </polygon>
                        <polygon class="st0"
                            points="35.7,124.3 45.5,118.7 46.8,121 75.6,104.4 77,106.7 119.8,82 119.8,78.9 119.8,75.8 119.8,74.2    34.3,123.6  ">
                        </polygon>
                        <polygon class="st0"
                            points="43.7,129 45.1,129.8 54.9,124.1 56.2,126.5 75.6,115.3 77,117.6 119.8,92.9 119.8,89.8 119.8,86.6    119.8,85.1  ">
                        </polygon>
                        <polygon class="st0"
                            points="54.5,135.2 64.3,129.6 65.7,131.9 75.6,126.1 77,128.5 119.8,103.8 119.8,100.6 119.8,97.5 119.8,96    53.2,134.5  ">
                        </polygon>
                        <polygon class="st0"
                            points="76.1,9.3 73.4,7.8 73.4,7.8 70.7,6.2 69.3,5.4 0,45.5 0,47 17.2,37.1 18.6,39.4 38,28.2 39.3,30.5     ">
                        </polygon>
                    </g>
                </svg>
                Powered by RenVM
            </div>
            <div className="_ren_iframe_footer_right">
                ${bellSvg(`_ren_notifications-${uniqueID}`)}
                ${cogSvg(`_ren_settings-${uniqueID}`)}
            </div>
        </div>
    </div>
</div>
`;
