import * as THREE from 'three';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


export function exportGLTF( input, name, params, opts ) {

    const gltfExporter = new GLTFExporter();

    const options = {
        trs: params.trs,
        onlyVisible: params.onlyVisible,
        binary: params.binary,
        maxTextureSize: params.maxTextureSize,
        ...opts
    };
    gltfExporter.parse(
        input,
        function ( result ) {

            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer( result, name + '.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                console.log( output );
                saveString( output, name + '.gltf' );

            }

        },
        function ( error ) {

            console.log( 'An error happened during parsing', error );

        },
        options
    );

}

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}
