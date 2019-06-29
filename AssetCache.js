// Copyright (c) 2019 BlueMagnificent

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


//NOTE: async_series function gotten from https://stackoverflow.com/questions/13600573/what-is-a-simple-implementation-of-async-series

function AssetCache() {

    this.DEFAULT_CATEGORY = 'general';

    this.cache = {};
    this.loadStaging = [];

    this.cache[this.DEFAULT_CATEGORY] = {};

}

/**
 * This adds an Asset and its respective loader into the staging to be loaded later
 * 
 * @param {Function} loader  Function to load the asset (required)
 * @param {String} url  URL of the asset (required)
 * @param {String} name unique name of asset (required)
 * @param {String} category  Asset category (optional)
 * @returns {Bool}
 * 
 * @memberof AssetCache
 */
AssetCache.prototype.stageForLoading = function( loader, url, name, category ) {

    if( !loader || !url || !name ) return false;

    if( typeof loader !== 'function' ) return false;
    if( typeof url !== 'string' && !Array.isArray( url ) ) return false;
    if( typeof name !== 'string' ) return false;

    category = ( !category || typeof category !== 'string' ) ? this.DEFAULT_CATEGORY : category.toLowerCase();

    //if asset url is a string check for uniqueness
    if( typeof url === 'string' ) {

        let urlIndex = this.loadStaging.findIndex( obj =>obj.url === url );
    
        //if the url already exists then throw an error
        if ( urlIndex !== -1 ) throw Error( `Asset URL "${url}" already exists` );

    }

    //equally check for unique asset names in the same category;
    name = name.toLowerCase();
    let nameIndex = this.loadStaging.findIndex( obj => obj.name === name && obj.category === category );
    
    //if the name already exits throw an error
    if( nameIndex !== -1 ) throw Error( `Asset name "${name}" already exists in categroy {${category}}` );



    this.loadStaging.push( { loader, url, name, category } );


    return true;

}

/**
 * Load the assets that have been staged
 * 
 * @param {Function} onCompleted callback function to be called when loading has been completed (requried)
 * @param {Function} onProgress callback function to be called showing progress of the loading (optional)
 * 
 * @memberof AssetCache
 */
AssetCache.prototype.loadAssets = function( onCompleted, onProgress ) {

    let assetCount = this.loadStaging.length;
    let totalAssetProgress = 0;
    let progressAccumulator = 0;
    let progressAccumulatorStep = 100;
    
    //if the onProgress callback is null then create one
    if( !onProgress ) {
        onProgress = ( currentAssetProgress, totalAssetProgress, currentAssetUrl )=>{
            console.log( `${totalAssetProgress}% completed: Loading ${currentAssetUrl} at ${currentAssetProgress}%` );
        }
    }


    //create wrapper function to be passed to async_series
    let functs = this.loadStaging.map( obj => {

            return ( cb ) => {

                obj.loader( 
                        obj.url, 
                        ( ...args ) => {

                            if( this.cache[ obj.category ] === undefined ) this.cache[ obj.category ] = {};

                            //since we do not know the number of parameters that will be passed we simply stores all the
                            //passed arguments as an array. But when the asset is to be retrieved by name the first element of
                            //the array is returned;
                            this.cache[ obj.category ] [ obj.name ] = [ ...args ];
                            
                            //Update the load progress accumulator
                            progressAccumulator += progressAccumulatorStep;

                            console.log( progressAccumulator );

                            cb( null );

                        }, 
                        ( xhr ) => {
                            
                            //Get the current asset loading progress in percentage
                            let currentAssetProgress = xhr.loaded / xhr.total * 100;

                            //Get the total asset loading progress in percentage
                            totalAssetProgress = ( progressAccumulator + currentAssetProgress ) / assetCount;

                            onProgress( currentAssetProgress, totalAssetProgress, obj.url );

                        },
                        ( err )=>{

                            console.log( `ERROR: Failed to load "${obj.name}" of category "${obj.category}"` );
                            console.log( `ERROR: URL "${obj.url}"` );
                            cb( err );

                        }
                )
            }
        }
    );

    //execute the created wrapper functions serially
    async_series( functs, ( err ) => {

        this.loadStaging = [];
        onCompleted( err );
        
    })

}

/**
 * Retrieves the asset from the cache based on the supplied name
 * 
 * @param {String} name the name of the asset to retrieve (required)
 * @param {String} category the name of the asset category of the interested asset  (optional)
 * @returns {Bool}
 * 
 * @memberof AssetCache
 */
AssetCache.prototype.getAsset = function( name, category ) {

    if( typeof name !== 'string' ) return null
    name = name.toLowerCase();

    category = ( !category || typeof category !== 'string' ) ? this.DEFAULT_CATEGORY : category.toLowerCase();
    
    return this.cache[ category ] [ name ] [ 0 ];

}

/**
 * Retrieves the asset from the cache by indexing the asset array of the supplied name
 * 
 * @param {String} name Name of the asset to be retrieved (required)
 * @param {String} index Index of the asset to be retrieved (required)
 * @param {String} category Category of asset if any. Defaults to "general"
 * @returns {Asset}
 * 
 * @memberof AssetCache
 */
AssetCache.prototype.getAssetByIndex = function( name, index, category ){

    if( typeof name !== 'string' ) return null;
    if( typeof index !== 'number' ) return null;

    category = ( !category || typeof category !== 'string' ) ? this.DEFAULT_CATEGORY : category.toLowerCase();

    name = name.toLowerCase();

    return this.cache[ category ] [ name ] [ index ];
}


function async_series ( fn_list, final_callback ) {
    if ( fn_list.length ) {
        var fn = fn_list.shift();

        var callback = function ( err ) {
            if ( err ) final_callback( err );
            else async_series( fn_list,final_callback );
        };

        fn( callback );
    }
    else final_callback( null );
}

var AC = new AssetCache();

if ( typeof exports === 'object' && typeof module === 'object' )
    module.exports = AC;