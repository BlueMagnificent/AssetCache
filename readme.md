# AssetCache
An asset cache/manager developed primarily for use with [Three.js](https://threejs.org/) asset loaders. AssetCache helps you load all your assets at once, cache them, and then retrieve them individually when needed. Inspired by [Urho3D](https://github.com/urho3d/Urho3D) `ResourceCache` class


## Installation

Simply copy `AssetCache.js` to your project folder (or might be inside a `js` or `libs` folder). Include it into your project either through script tag ( where it introduces `AC` as a variable in the context )
```html
<script src="./libs/AssetCache.js"></script>
```

or through es6 module import
```js
import AC from './libs/AssetCache';
```

## Usage
The [example folder](/example) contains a sample threejs project that uses AssetCache to load a skybox and a texture.

### Staging Assets

To use AccessCache first stage the assets that are to be loaded. This is done by calling AssetCache's `stageForLoading` method passing a loading function, the asset url, the asset identifier name and an optional cache category to it. Let's say we want to load an image texture, we first stage it as shown below. You can stage as many assets as you need for your application. NOTE: cache category has been intentionally omitted.
```js
//Get the three.js texture loader
let textureLoader = new THREE.TextureLoader();

//stage the asset to be loaded. 
//The first parameter is the load function of three.js TextureLoader
AC.stageForLoading(textureLoader.load.bind(textureLoader), "assets/texture/tex.png", "tex");
```


### Loading Assets

When all needed assets have been staged `loadAssets` is called. This method returns a promise which resolves when all assets have successfully loaded, an error is thrown if otherwise. An optional callback parameter can be passed to handle loading progress.
```js
await AC.loadAssets( function onProgress( currentAssetProgress, totalAssetProgress, assetUrl ) {
    //do anything you want with the progress info like log to the console or
    //update a loading UI
});
```



### Using Loaded Assets
```js
//get asset based on the identifier name. Asset category intentionally omitted
let texture = AC.getAsset("tex");
```


## API

### stageForLoading( loader, url, name, category )
##### loader
Loading function for the type of asset being staged. This function would be called against its respective asset url when all staged assets are to be loaded. It should have the below signature as is the case with most three.js loaders:
```js
function ( url, onCompleted, onProgress, onError )
```
##### url
The url of the asset. For cube textures this can be an array (see sample in the example folder)
##### name
Identifier name for the asset. This name is used when there is need to retrieve the asset and should be unique within a category.
##### category (optional)
Asset category used to logically group assets. Defaults to `"general"`



### loadAssets( onProgress ) : Promise
Call to load the staged assets. Returns a promise that resolves when all assets have been loaded.


##### onProgress (optional)
Callback to handle loading progress. Should have signature of:
```js
function ( currentAssetProgress, totalAssetProgress, currentAssetUrl )
```
  
  

### getAsset( name, category )
##### name
The identifier name of the asset to retrieve
##### category (optional)
Category of the asset to retrieve. Defaults to `"general"`


### getAssetByIndex( name, index, category )
Sometimes the result of a loading operation by an asset loader function is not just a single value but multiple values passed to the `onCompleted` callback of the loaded. For this case such values can be retrieve by index
##### name
The identifier name of the asset to retrieve
##### index
Index of the value returned by the loader that is to be retrieved
##### category (optional)
Category of the asset to retrieve. Defaults to `"general"`



## CREDITS
 - Sky box created by Hazel Whorley
 - Box texture by [Nobiax](nobiax.deviantart.com)
