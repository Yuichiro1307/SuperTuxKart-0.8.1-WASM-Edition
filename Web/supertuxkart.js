var Module = typeof Module != "undefined" ? Module : {};

Module.preRun = Module.preRun || [];

Module.preRun.push(function() {
 var mountPath = "/home/web_user";
 var fs = FS;
 var syncing = false;
 var syncAgain = false;
 fs.mkdirTree(mountPath);
 fs.mount(IDBFS, {}, mountPath);
 function sync(saveConfig) {
  if (saveConfig && typeof Module._stkSaveConfig === "function") Module._stkSaveConfig();
  if (syncing) {
   syncAgain = true;
   return;
  }
  syncing = true;
  fs.syncfs(false, function(error) {
   syncing = false;
   if (error) {
    console.error("Could not persist SuperTuxKart save data:", error);
    Module.setStatus("Save storage error: " + error.message);
   }
   if (syncAgain) {
    syncAgain = false;
    sync(false);
   }
  });
 }
 var dependency = "stk-idbfs-ready";
 addRunDependency(dependency);
 fs.syncfs(true, function(error) {
  if (error) {
   console.error("Could not load SuperTuxKart save data:", error);
   Module.setStatus("IndexedDB error: " + error.message + ". Startup is blocked because persistent saves are required.");
   return;
  }
  removeRunDependency(dependency);
 });
 window.setInterval(function() {
  sync(true);
 }, 15e3);
 window.addEventListener("pagehide", function() {
  sync(true);
 });
 document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "hidden") sync(true);
 });
});

var Module = typeof Module !== "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
 var loadPackage = function(metadata) {
  var PACKAGE_PATH = "";
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof process === "undefined" && typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  }
  var PACKAGE_NAME = "/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-01.data";
  var REMOTE_PACKAGE_BASE = "supertuxkart-assets-01.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
  var PACKAGE_UUID = metadata["package_uuid"];
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    require("fs").readFile(packageName, function(err, contents) {
     if (err) {
      errback(err);
     } else {
      callback(contents.buffer);
     }
    });
    return;
   }
   var xhr = new XMLHttpRequest();
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + new Error().stack;
   }
   Module["FS_createPath"]("/", "data", true, true);
   Module["FS_createPath"]("/data", "karts", true, true);
   Module["FS_createPath"]("/data/karts", "konqi", true, true);
   Module["FS_createPath"]("/data/karts", "sara", true, true);
   Module["FS_createPath"]("/data", "tracks", true, true);
   Module["FS_createPath"]("/data/tracks", "zengarden", true, true);
   Module["FS_createPath"]("/data/tracks", "mines", true, true);
   Module["FS_createPath"]("/data/tracks", "startrack", true, true);
   Module["FS_createPath"]("/data", "music", true, true);
   Module["FS_createPath"]("/data/tracks", "farm", true, true);
   Module["FS_createPath"]("/data/tracks", "city", true, true);
   Module["FS_createPath"]("/data/tracks", "subsea", true, true);
   function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    }
   };
   var files = metadata["files"];
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
   }
   function processPackageData(arrayBuffer) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    DataRequest.prototype.byteArray = byteArray;
    var files = metadata["files"];
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-01.data");
   }
   Module["addRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-01.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "filename": "/data/karts/konqi/konqi.b3d",
   "start": 0,
   "end": 19743320
  }, {
   "filename": "/data/karts/sara/princess sara.b3d",
   "start": 19743320,
   "end": 27717844
  }, {
   "filename": "/data/karts/sara/sara.b3d",
   "start": 27717844,
   "end": 35690599
  }, {
   "filename": "/data/tracks/zengarden/lightmap_caves.png",
   "start": 35690599,
   "end": 40773933
  }, {
   "filename": "/data/tracks/mines/mines_track.b3d",
   "start": 40773933,
   "end": 45129033
  }, {
   "filename": "/data/tracks/startrack/spaceship_track.b3d",
   "start": 45129033,
   "end": 49118094
  }, {
   "filename": "/data/tracks/zengarden/lightmap_pagoda.png",
   "start": 49118094,
   "end": 52989289
  }, {
   "filename": "/data/music/valley.ogg",
   "start": 52989289,
   "end": 56845458,
   "audio": 1
  }, {
   "filename": "/data/tracks/zengarden/lightmap_mountain.png",
   "start": 56845458,
   "end": 60149907
  }, {
   "filename": "/data/tracks/zengarden/lightmap_track.png",
   "start": 60149907,
   "end": 63368698
  }, {
   "filename": "/data/music/SkyVibe-HighFrequency.ogg",
   "start": 63368698,
   "end": 66440249,
   "audio": 1
  }, {
   "filename": "/data/music/garden.ogg",
   "start": 66440249,
   "end": 69461001,
   "audio": 1
  }, {
   "filename": "/data/music/overworld.ogg",
   "start": 69461001,
   "end": 72445803,
   "audio": 1
  }, {
   "filename": "/data/music/subsea.ogg",
   "start": 72445803,
   "end": 75370100,
   "audio": 1
  }, {
   "filename": "/data/tracks/farm/skybox.jpg",
   "start": 75370100,
   "end": 78291267
  }, {
   "filename": "/data/music/Lava.ogg",
   "start": 78291267,
   "end": 81205546,
   "audio": 1
  }, {
   "filename": "/data/tracks/startrack/xeon6.ogg",
   "start": 81205546,
   "end": 84061748,
   "audio": 1
  }, {
   "filename": "/data/music/OnTheRiver.ogg",
   "start": 84061748,
   "end": 86861727,
   "audio": 1
  }, {
   "filename": "/data/tracks/city/city_track.b3d",
   "start": 86861727,
   "end": 89536803
  }, {
   "filename": "/data/tracks/mines/light_storage_section.png",
   "start": 89536803,
   "end": 89993797
  }, {
   "filename": "/data/tracks/subsea/Transparent-Broken-2-subsea.png",
   "start": 89993797,
   "end": 89999970
  } ],
  "remote_package_size": 89999970,
  "package_uuid": "8e335579-75e0-405e-9b40-39e7be1451cb"
 });
})();

var Module = typeof Module !== "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
 var loadPackage = function(metadata) {
  var PACKAGE_PATH = "";
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof process === "undefined" && typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  }
  var PACKAGE_NAME = "/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-02.data";
  var REMOTE_PACKAGE_BASE = "supertuxkart-assets-02.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
  var PACKAGE_UUID = metadata["package_uuid"];
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    require("fs").readFile(packageName, function(err, contents) {
     if (err) {
      errback(err);
     } else {
      callback(contents.buffer);
     }
    });
    return;
   }
   var xhr = new XMLHttpRequest();
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + new Error().stack;
   }
   Module["FS_createPath"]("/", "data", true, true);
   Module["FS_createPath"]("/data", "tracks", true, true);
   Module["FS_createPath"]("/data/tracks", "lighthouse", true, true);
   Module["FS_createPath"]("/data", "music", true, true);
   Module["FS_createPath"]("/data/tracks", "jungle", true, true);
   Module["FS_createPath"]("/data/tracks", "hacienda", true, true);
   Module["FS_createPath"]("/data/tracks", "scotland", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene", true, true);
   Module["FS_createPath"]("/data/tracks", "islandtrack", true, true);
   Module["FS_createPath"]("/data/tracks", "mines", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene2", true, true);
   Module["FS_createPath"]("/data/tracks", "xr591", true, true);
   Module["FS_createPath"]("/data/tracks", "greenvalley", true, true);
   Module["FS_createPath"]("/data/tracks", "zengarden", true, true);
   Module["FS_createPath"]("/data/tracks", "subsea", true, true);
   Module["FS_createPath"]("/data/tracks", "overworld", true, true);
   Module["FS_createPath"]("/data", "karts", true, true);
   Module["FS_createPath"]("/data/karts", "xfcemouse", true, true);
   Module["FS_createPath"]("/data/tracks", "sandtrack", true, true);
   Module["FS_createPath"]("/data/tracks", "olivermath", true, true);
   Module["FS_createPath"]("/data/tracks", "endcutscene", true, true);
   Module["FS_createPath"]("/data", "models", true, true);
   Module["FS_createPath"]("/data/tracks", "farm", true, true);
   Module["FS_createPath"]("/data/tracks", "fortmagma", true, true);
   Module["FS_createPath"]("/data/tracks", "snowmountain", true, true);
   Module["FS_createPath"]("/data/tracks", "mansion", true, true);
   Module["FS_createPath"]("/data/tracks", "minigolf", true, true);
   Module["FS_createPath"]("/data/karts", "emule", true, true);
   Module["FS_createPath"]("/data/tracks", "stadium", true, true);
   Module["FS_createPath"]("/data", "textures", true, true);
   Module["FS_createPath"]("/data/tracks", "startrack", true, true);
   Module["FS_createPath"]("/data/tracks", "tutorial", true, true);
   function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    }
   };
   var files = metadata["files"];
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
   }
   function processPackageData(arrayBuffer) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    DataRequest.prototype.byteArray = byteArray;
    var files = metadata["files"];
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-02.data");
   }
   Module["addRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-02.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "filename": "/data/tracks/lighthouse/lighthouse_track.b3d",
   "start": 0,
   "end": 2517517
  }, {
   "filename": "/data/music/dance_cleopatra.ogg",
   "start": 2517517,
   "end": 4875264,
   "audio": 1
  }, {
   "filename": "/data/music/demonhill.ogg",
   "start": 4875264,
   "end": 7180552,
   "audio": 1
  }, {
   "filename": "/data/tracks/jungle/amazon_jungle.ogg",
   "start": 7180552,
   "end": 9410425,
   "audio": 1
  }, {
   "filename": "/data/music/win_theme.ogg",
   "start": 9410425,
   "end": 11622384,
   "audio": 1
  }, {
   "filename": "/data/music/menutheme.ogg",
   "start": 11622384,
   "end": 13776864,
   "audio": 1
  }, {
   "filename": "/data/tracks/hacienda/hacienda_track.b3d",
   "start": 13776864,
   "end": 15919685
  }, {
   "filename": "/data/music/kart_grand_prix.ogg",
   "start": 15919685,
   "end": 18009592,
   "audio": 1
  }, {
   "filename": "/data/music/Penguin_Party.ogg",
   "start": 18009592,
   "end": 19974757,
   "audio": 1
  }, {
   "filename": "/data/music/hacienda.ogg",
   "start": 19974757,
   "end": 21838203,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/scotland_track.b3d",
   "start": 21838203,
   "end": 23613389
  }, {
   "filename": "/data/tracks/jungle/jungle_track.b3d",
   "start": 23613389,
   "end": 25355421
  }, {
   "filename": "/data/tracks/introcutscene/Nolok.b3d",
   "start": 25355421,
   "end": 27096268
  }, {
   "filename": "/data/tracks/islandtrack/islandtrack_track.b3d",
   "start": 27096268,
   "end": 28701825
  }, {
   "filename": "/data/tracks/mines/West.ogg",
   "start": 28701825,
   "end": 30240197,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene2/Nolok.b3d",
   "start": 30240197,
   "end": 31763637
  }, {
   "filename": "/data/tracks/introcutscene2/intro2.ogg",
   "start": 31763637,
   "end": 33243301,
   "audio": 1
  }, {
   "filename": "/data/tracks/xr591/big.b3d",
   "start": 33243301,
   "end": 34694536
  }, {
   "filename": "/data/tracks/greenvalley/Woodpile.png",
   "start": 34694536,
   "end": 36139160
  }, {
   "filename": "/data/tracks/lighthouse/Woodpile.png",
   "start": 36139160,
   "end": 37583784
  }, {
   "filename": "/data/tracks/zengarden/zenGarden_track.b3d",
   "start": 37583784,
   "end": 39010460
  }, {
   "filename": "/data/music/TheDeadRocks-EasyJob.ogg",
   "start": 39010460,
   "end": 40396700,
   "audio": 1
  }, {
   "filename": "/data/tracks/mines/light_trainstation_section.png",
   "start": 40396700,
   "end": 41751112
  }, {
   "filename": "/data/tracks/zengarden/dynamic_clouds.png",
   "start": 41751112,
   "end": 43103994
  }, {
   "filename": "/data/music/Origin.ogg",
   "start": 43103994,
   "end": 44447254,
   "audio": 1
  }, {
   "filename": "/data/tracks/xr591/xr591_track.b3d",
   "start": 44447254,
   "end": 45737776
  }, {
   "filename": "/data/tracks/introcutscene/Gnu.b3d",
   "start": 45737776,
   "end": 47026947
  }, {
   "filename": "/data/tracks/subsea/subsea_track.b3d",
   "start": 47026947,
   "end": 48289234
  }, {
   "filename": "/data/tracks/overworld/overworld_track.b3d",
   "start": 48289234,
   "end": 49513907
  }, {
   "filename": "/data/karts/xfcemouse/xue.b3d",
   "start": 49513907,
   "end": 50705249
  }, {
   "filename": "/data/tracks/sandtrack/sandtrack_track.b3d",
   "start": 50705249,
   "end": 51887068
  }, {
   "filename": "/data/tracks/olivermath/olivermath_track.b3d",
   "start": 51887068,
   "end": 53060606
  }, {
   "filename": "/data/tracks/lighthouse/dynamic_clouds.png",
   "start": 53060606,
   "end": 54193123
  }, {
   "filename": "/data/tracks/endcutscene/Tux.b3d",
   "start": 54193123,
   "end": 55317444
  }, {
   "filename": "/data/models/thunderbird.b3d",
   "start": 55317444,
   "end": 56438114
  }, {
   "filename": "/data/tracks/farm/farm_track.b3d",
   "start": 56438114,
   "end": 57500133
  }, {
   "filename": "/data/tracks/fortmagma/FortMagma_track.b3d",
   "start": 57500133,
   "end": 58551232
  }, {
   "filename": "/data/tracks/snowmountain/snowmountain_track.b3d",
   "start": 58551232,
   "end": 59553790
  }, {
   "filename": "/data/music/Snowy.ogg",
   "start": 59553790,
   "end": 60481997,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene2/TuxIntro.b3d",
   "start": 60481997,
   "end": 61379003
  }, {
   "filename": "/data/music/TheDeadRocks-GreenSecretFromAmazonia.ogg",
   "start": 61379003,
   "end": 62249336,
   "audio": 1
  }, {
   "filename": "/data/tracks/fortmagma/carpet.png",
   "start": 62249336,
   "end": 63112308
  }, {
   "filename": "/data/tracks/mansion/carpet.png",
   "start": 63112308,
   "end": 63975280
  }, {
   "filename": "/data/tracks/mansion/mansion_track.b3d",
   "start": 63975280,
   "end": 64827029
  }, {
   "filename": "/data/tracks/greenvalley/waterfall3.ogg",
   "start": 64827029,
   "end": 65642374,
   "audio": 1
  }, {
   "filename": "/data/tracks/minigolf/_particle_sand.png",
   "start": 65642374,
   "end": 66431563
  }, {
   "filename": "/data/tracks/endcutscene/Rope.b3d",
   "start": 66431563,
   "end": 67190470
  }, {
   "filename": "/data/tracks/endcutscene/Gnu.b3d",
   "start": 67190470,
   "end": 67929979
  }, {
   "filename": "/data/music/Boom_boom_boom.ogg",
   "start": 67929979,
   "end": 68629046,
   "audio": 1
  }, {
   "filename": "/data/tracks/lighthouse/trail_diff.png",
   "start": 68629046,
   "end": 69295668
  }, {
   "filename": "/data/tracks/lighthouse/racetrack_blend.png",
   "start": 69295668,
   "end": 69953317
  }, {
   "filename": "/data/karts/emule/emule.b3dz",
   "start": 69953317,
   "end": 70604083
  }, {
   "filename": "/data/models/gplose.b3d",
   "start": 70604083,
   "end": 71240901
  }, {
   "filename": "/data/tracks/minigolf/minigolf_track.b3d",
   "start": 71240901,
   "end": 71858154
  }, {
   "filename": "/data/tracks/greenvalley/w_sky_4.jpg",
   "start": 71858154,
   "end": 72470744
  }, {
   "filename": "/data/tracks/mines/light_mining_section.png",
   "start": 72470744,
   "end": 73081955
  }, {
   "filename": "/data/models/easter_egg_3.png",
   "start": 73081955,
   "end": 73687722
  }, {
   "filename": "/data/tracks/stadium/arena_tr1_track.b3d",
   "start": 73687722,
   "end": 74293169
  }, {
   "filename": "/data/tracks/fortmagma/Painting2.png",
   "start": 74293169,
   "end": 74890409
  }, {
   "filename": "/data/textures/astro_turf.jpg",
   "start": 74890409,
   "end": 75481782
  }, {
   "filename": "/data/tracks/xr591/SKY0002.png",
   "start": 75481782,
   "end": 76069235
  }, {
   "filename": "/data/tracks/xr591/SKY0005.png",
   "start": 76069235,
   "end": 76649948
  }, {
   "filename": "/data/tracks/startrack/star-back.png",
   "start": 76649948,
   "end": 77220569
  }, {
   "filename": "/data/tracks/zengarden/star-back.png",
   "start": 77220569,
   "end": 77791190
  }, {
   "filename": "/data/tracks/greenvalley/Plane.003.b3d",
   "start": 77791190,
   "end": 78359268
  }, {
   "filename": "/data/tracks/greenvalley/w_sky_1.jpg",
   "start": 78359268,
   "end": 78926716
  }, {
   "filename": "/data/tracks/xr591/SKY0004.png",
   "start": 78926716,
   "end": 79485825
  }, {
   "filename": "/data/tracks/xr591/groundLM.png",
   "start": 79485825,
   "end": 80038043
  }, {
   "filename": "/data/tracks/xr591/SKY0003.png",
   "start": 80038043,
   "end": 80582686
  }, {
   "filename": "/data/tracks/greenvalley/anim_sheep2.b3d",
   "start": 80582686,
   "end": 81112115
  }, {
   "filename": "/data/tracks/greenvalley/sheep_55.b3d",
   "start": 81112115,
   "end": 81641544
  }, {
   "filename": "/data/tracks/mansion/plants.png",
   "start": 81641544,
   "end": 82169343
  }, {
   "filename": "/data/music/race_summary.ogg",
   "start": 82169343,
   "end": 82692864,
   "audio": 1
  }, {
   "filename": "/data/tracks/greenvalley/w_sky_2.jpg",
   "start": 82692864,
   "end": 83214323
  }, {
   "filename": "/data/tracks/mines/light_shaft2_section.png",
   "start": 83214323,
   "end": 83734443
  }, {
   "filename": "/data/tracks/tutorial/tutorial_track.b3d",
   "start": 83734443,
   "end": 84254069
  }, {
   "filename": "/data/tracks/startrack/thing.png",
   "start": 84254069,
   "end": 84769372
  }, {
   "filename": "/data/tracks/fortmagma/sky.jpg",
   "start": 84769372,
   "end": 85278271
  }, {
   "filename": "/data/tracks/jungle/roof.png",
   "start": 85278271,
   "end": 85776627
  }, {
   "filename": "/data/tracks/mansion/roof-straw.png",
   "start": 85776627,
   "end": 86274983
  }, {
   "filename": "/data/tracks/hacienda/grass.jpg_track.b3d",
   "start": 86274983,
   "end": 86763957
  }, {
   "filename": "/data/tracks/mines/cavrern-rock.png",
   "start": 86763957,
   "end": 87246073
  }, {
   "filename": "/data/tracks/sandtrack/palmtree3.png",
   "start": 87246073,
   "end": 87728104
  }, {
   "filename": "/data/tracks/greenvalley/w_sky_3.jpg",
   "start": 87728104,
   "end": 88210114
  }, {
   "filename": "/data/tracks/lighthouse/sky.jpg",
   "start": 88210114,
   "end": 88690073
  }, {
   "filename": "/data/tracks/lighthouse/sky-m.jpg",
   "start": 88690073,
   "end": 89169915
  }, {
   "filename": "/data/tracks/mines/light_naturalpart2_section.png",
   "start": 89169915,
   "end": 89648409
  }, {
   "filename": "/data/textures/canyon_water.png",
   "start": 89648409,
   "end": 89998912
  }, {
   "filename": "/data/tracks/mansion/Circle.009.b3d",
   "start": 89998912,
   "end": 89999992
  } ],
  "remote_package_size": 89999992,
  "package_uuid": "ffe6e84b-14f9-4443-9eb5-8f500ee7b82b"
 });
})();

var Module = typeof Module !== "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
 var loadPackage = function(metadata) {
  var PACKAGE_PATH = "";
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof process === "undefined" && typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  }
  var PACKAGE_NAME = "/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-03.data";
  var REMOTE_PACKAGE_BASE = "supertuxkart-assets-03.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
  var PACKAGE_UUID = metadata["package_uuid"];
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    require("fs").readFile(packageName, function(err, contents) {
     if (err) {
      errback(err);
     } else {
      callback(contents.buffer);
     }
    });
    return;
   }
   var xhr = new XMLHttpRequest();
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + new Error().stack;
   }
   Module["FS_createPath"]("/", "data", true, true);
   Module["FS_createPath"]("/data", "tracks", true, true);
   Module["FS_createPath"]("/data/tracks", "mines", true, true);
   Module["FS_createPath"]("/data/tracks", "greenvalley", true, true);
   Module["FS_createPath"]("/data/tracks", "startrack", true, true);
   Module["FS_createPath"]("/data/tracks", "fortmagma", true, true);
   Module["FS_createPath"]("/data/tracks", "mansion", true, true);
   Module["FS_createPath"]("/data/tracks", "lighthouse", true, true);
   Module["FS_createPath"]("/data/tracks", "cave", true, true);
   Module["FS_createPath"]("/data", "models", true, true);
   Module["FS_createPath"]("/data", "sfx", true, true);
   Module["FS_createPath"]("/data", "karts", true, true);
   Module["FS_createPath"]("/data/karts", "wilber", true, true);
   Module["FS_createPath"]("/data/tracks", "overworld", true, true);
   Module["FS_createPath"]("/data/tracks", "zengarden", true, true);
   Module["FS_createPath"]("/data/tracks", "xr591", true, true);
   Module["FS_createPath"]("/data/karts", "puffy", true, true);
   Module["FS_createPath"]("/data/tracks", "soccer_field", true, true);
   Module["FS_createPath"]("/data/tracks", "sandtrack", true, true);
   Module["FS_createPath"]("/data/tracks", "minigolf", true, true);
   Module["FS_createPath"]("/data/tracks", "hacienda", true, true);
   Module["FS_createPath"]("/data/tracks", "snowtuxpeak", true, true);
   Module["FS_createPath"]("/data/karts", "nolok", true, true);
   Module["FS_createPath"]("/data/karts", "sara", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene2", true, true);
   Module["FS_createPath"]("/data/tracks", "farm", true, true);
   Module["FS_createPath"]("/data/karts", "konqi", true, true);
   Module["FS_createPath"]("/data", "music", true, true);
   Module["FS_createPath"]("/data", "textures", true, true);
   Module["FS_createPath"]("/data/tracks", "tutorial", true, true);
   Module["FS_createPath"]("/data/karts", "tux", true, true);
   Module["FS_createPath"]("/data/tracks", "battleisland", true, true);
   Module["FS_createPath"]("/data/tracks", "endcutscene", true, true);
   Module["FS_createPath"]("/data/tracks", "scotland", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene", true, true);
   Module["FS_createPath"]("/data/karts", "adiumy", true, true);
   Module["FS_createPath"]("/data/tracks", "jungle", true, true);
   Module["FS_createPath"]("/data/tracks", "subsea", true, true);
   Module["FS_createPath"]("/data/karts", "beastie", true, true);
   Module["FS_createPath"]("/data/karts", "beagle", true, true);
   Module["FS_createPath"]("/data/tracks", "olivermath", true, true);
   Module["FS_createPath"]("/data/karts", "suzanne", true, true);
   Module["FS_createPath"]("/data", "fonts", true, true);
   Module["FS_createPath"]("/data/karts", "pidgin", true, true);
   Module["FS_createPath"]("/data/tracks", "stadium", true, true);
   Module["FS_createPath"]("/data", "gui", true, true);
   Module["FS_createPath"]("/data/karts", "xfcemouse", true, true);
   Module["FS_createPath"]("/data/karts", "elephpant", true, true);
   Module["FS_createPath"]("/data/tracks", "city", true, true);
   Module["FS_createPath"]("/data/karts", "hexley", true, true);
   Module["FS_createPath"]("/data/karts", "gnu", true, true);
   Module["FS_createPath"]("/data/textures", "deprecated", true, true);
   Module["FS_createPath"]("/data/tracks", "snowmountain", true, true);
   Module["FS_createPath"]("/data/tracks", "islandtrack", true, true);
   Module["FS_createPath"]("/data", "po", true, true);
   Module["FS_createPath"]("/data/gui", "skins", true, true);
   Module["FS_createPath"]("/data/gui/skins", "ocean", true, true);
   Module["FS_createPath"]("/data/gui/skins", "peach", true, true);
   function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    }
   };
   var files = metadata["files"];
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
   }
   function processPackageData(arrayBuffer) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    DataRequest.prototype.byteArray = byteArray;
    var files = metadata["files"];
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-03.data");
   }
   Module["addRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-03.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "filename": "/data/tracks/mines/light_traincrossroad_section.png",
   "start": 0,
   "end": 478054
  }, {
   "filename": "/data/tracks/greenvalley/grass-border.png",
   "start": 478054,
   "end": 951316
  }, {
   "filename": "/data/tracks/startrack/sky.jpg",
   "start": 951316,
   "end": 1423876
  }, {
   "filename": "/data/tracks/fortmagma/painting1.png",
   "start": 1423876,
   "end": 1894541
  }, {
   "filename": "/data/tracks/mines/light_naturalpart1_section.png",
   "start": 1894541,
   "end": 2358985
  }, {
   "filename": "/data/tracks/mines/light_bridge_section.png",
   "start": 2358985,
   "end": 2822752
  }, {
   "filename": "/data/tracks/mansion/grass_dark.png",
   "start": 2822752,
   "end": 3277986
  }, {
   "filename": "/data/tracks/mines/mine_rock.jpg",
   "start": 3277986,
   "end": 3732828
  }, {
   "filename": "/data/tracks/lighthouse/earth.png",
   "start": 3732828,
   "end": 4184611
  }, {
   "filename": "/data/tracks/lighthouse/trunk_bark.png",
   "start": 4184611,
   "end": 4633048
  }, {
   "filename": "/data/tracks/lighthouse/plants.png",
   "start": 4633048,
   "end": 5080421
  }, {
   "filename": "/data/tracks/mines/plants.png",
   "start": 5080421,
   "end": 5527794
  }, {
   "filename": "/data/tracks/cave/cave_track.b3d",
   "start": 5527794,
   "end": 5974658
  }, {
   "filename": "/data/models/village.b3d",
   "start": 5974658,
   "end": 6417842
  }, {
   "filename": "/data/sfx/gnu_flute.ogg",
   "start": 6417842,
   "end": 6857206,
   "audio": 1
  }, {
   "filename": "/data/tracks/lighthouse/lighthouseWall_diff.png",
   "start": 6857206,
   "end": 7287936
  }, {
   "filename": "/data/karts/wilber/wilber.b3dz",
   "start": 7287936,
   "end": 7713098
  }, {
   "filename": "/data/tracks/startrack/ceil1_outer.png",
   "start": 7713098,
   "end": 8135633
  }, {
   "filename": "/data/tracks/overworld/terrain1.b3d",
   "start": 8135633,
   "end": 8552138
  }, {
   "filename": "/data/tracks/zengarden/pagoda_bridge.b3d",
   "start": 8552138,
   "end": 8963810
  }, {
   "filename": "/data/tracks/mines/light_generator_section.png",
   "start": 8963810,
   "end": 9375002
  }, {
   "filename": "/data/tracks/xr591/trail.png",
   "start": 9375002,
   "end": 9779780
  }, {
   "filename": "/data/karts/puffy/puffy.png",
   "start": 9779780,
   "end": 10182431
  }, {
   "filename": "/data/tracks/mines/mine_road.jpg",
   "start": 10182431,
   "end": 10581168
  }, {
   "filename": "/data/tracks/soccer_field/soccer_field_screenshot.png",
   "start": 10581168,
   "end": 10976058
  }, {
   "filename": "/data/tracks/overworld/terrain2_splat.b3d",
   "start": 10976058,
   "end": 11370233
  }, {
   "filename": "/data/tracks/mines/mine_rock2.jpg",
   "start": 11370233,
   "end": 11758403
  }, {
   "filename": "/data/tracks/xr591/stars.png",
   "start": 11758403,
   "end": 12144655
  }, {
   "filename": "/data/tracks/greenvalley/greenvalley_track.b3d",
   "start": 12144655,
   "end": 12517494
  }, {
   "filename": "/data/tracks/sandtrack/sphinx.png",
   "start": 12517494,
   "end": 12883663
  }, {
   "filename": "/data/tracks/xr591/aliens_hi.b3d",
   "start": 12883663,
   "end": 13243142
  }, {
   "filename": "/data/tracks/minigolf/water.png",
   "start": 13243142,
   "end": 13600060
  }, {
   "filename": "/data/tracks/hacienda/crate_msg.png",
   "start": 13600060,
   "end": 13951857
  }, {
   "filename": "/data/tracks/snowtuxpeak/snowtuxpeak_track.b3d",
   "start": 13951857,
   "end": 14299273
  }, {
   "filename": "/data/karts/nolok/nolok.b3dz",
   "start": 14299273,
   "end": 14643832
  }, {
   "filename": "/data/tracks/mines/light_miningTrack_section.png",
   "start": 14643832,
   "end": 14983218
  }, {
   "filename": "/data/tracks/overworld/envmap3.png",
   "start": 14983218,
   "end": 15317027
  }, {
   "filename": "/data/karts/sara/licence_plate.png",
   "start": 15317027,
   "end": 15650743
  }, {
   "filename": "/data/tracks/xr591/trail-metal.png",
   "start": 15650743,
   "end": 15982513
  }, {
   "filename": "/data/tracks/introcutscene2/nolok_speech.ogg",
   "start": 15982513,
   "end": 16313619,
   "audio": 1
  }, {
   "filename": "/data/tracks/overworld/envmap2.png",
   "start": 16313619,
   "end": 16642165
  }, {
   "filename": "/data/tracks/introcutscene2/introcutscene2_track.b3d",
   "start": 16642165,
   "end": 16966528
  }, {
   "filename": "/data/tracks/introcutscene2/vegetation.b3d",
   "start": 16966528,
   "end": 17278271
  }, {
   "filename": "/data/tracks/overworld/envmap.png",
   "start": 17278271,
   "end": 17588367
  }, {
   "filename": "/data/tracks/farm/well.O.jpg",
   "start": 17588367,
   "end": 17898203
  }, {
   "filename": "/data/tracks/greenvalley/trees_far.b3d",
   "start": 17898203,
   "end": 18207302
  }, {
   "filename": "/data/tracks/zengarden/lightmap_stoneLantern.png",
   "start": 18207302,
   "end": 18512918
  }, {
   "filename": "/data/tracks/mansion/groundLightMap.png",
   "start": 18512918,
   "end": 18814663
  }, {
   "filename": "/data/tracks/hacienda/crate.png",
   "start": 18814663,
   "end": 19115063
  }, {
   "filename": "/data/karts/konqi/colormap_konqi.jpg",
   "start": 19115063,
   "end": 19415279
  }, {
   "filename": "/data/models/stk_mod_nitroBarrel.png",
   "start": 19415279,
   "end": 19709520
  }, {
   "filename": "/data/tracks/startrack/bild.png",
   "start": 19709520,
   "end": 20002664
  }, {
   "filename": "/data/tracks/startrack/metaloverlap.png",
   "start": 20002664,
   "end": 20295187
  }, {
   "filename": "/data/tracks/xr591/metaloverlap.png",
   "start": 20295187,
   "end": 20587710
  }, {
   "filename": "/data/music/lose_theme.ogg",
   "start": 20587710,
   "end": 20877500,
   "audio": 1
  }, {
   "filename": "/data/tracks/greenvalley/water1.b3d",
   "start": 20877500,
   "end": 21158118
  }, {
   "filename": "/data/tracks/fortmagma/castelwall.png",
   "start": 21158118,
   "end": 21437903
  }, {
   "filename": "/data/tracks/overworld/teleporter_metal.png",
   "start": 21437903,
   "end": 21716278
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_5b.png",
   "start": 21716278,
   "end": 21992653
  }, {
   "filename": "/data/textures/city_asphalt_1.jpg",
   "start": 21992653,
   "end": 22267210
  }, {
   "filename": "/data/tracks/tutorial/city_asphalt_1.jpg",
   "start": 22267210,
   "end": 22541767
  }, {
   "filename": "/data/tracks/startrack/window.png",
   "start": 22541767,
   "end": 22815505
  }, {
   "filename": "/data/tracks/lighthouse/rock_grey.png",
   "start": 22815505,
   "end": 23088673
  }, {
   "filename": "/data/karts/sara/new_panties.png",
   "start": 23088673,
   "end": 23360712
  }, {
   "filename": "/data/textures/GrassTall.png",
   "start": 23360712,
   "end": 23631931
  }, {
   "filename": "/data/tracks/greenvalley/GrassTall.png",
   "start": 23631931,
   "end": 23903150
  }, {
   "filename": "/data/tracks/overworld/window.png",
   "start": 23903150,
   "end": 24172762
  }, {
   "filename": "/data/karts/tux/tux.b3dz",
   "start": 24172762,
   "end": 24442081
  }, {
   "filename": "/data/tracks/battleisland/leaves_dry1.png",
   "start": 24442081,
   "end": 24710092
  }, {
   "filename": "/data/tracks/startrack/lightmap_no_room_edges.png",
   "start": 24710092,
   "end": 24977524
  }, {
   "filename": "/data/tracks/endcutscene/carpet.jpg",
   "start": 24977524,
   "end": 25243567
  }, {
   "filename": "/data/tracks/fortmagma/carpet.jpg",
   "start": 25243567,
   "end": 25509610
  }, {
   "filename": "/data/tracks/introcutscene2/house.jpg",
   "start": 25509610,
   "end": 25773024
  }, {
   "filename": "/data/tracks/overworld/house.jpg",
   "start": 25773024,
   "end": 26036438
  }, {
   "filename": "/data/tracks/fortmagma/Battle_for_Wesnoth.png",
   "start": 26036438,
   "end": 26299438
  }, {
   "filename": "/data/tracks/greenvalley/sheep.ogg",
   "start": 26299438,
   "end": 26561570,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/sheep.ogg",
   "start": 26561570,
   "end": 26823702,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene/shintoB.jpg",
   "start": 26823702,
   "end": 27084826
  }, {
   "filename": "/data/tracks/zengarden/shintoB.jpg",
   "start": 27084826,
   "end": 27345950
  }, {
   "filename": "/data/tracks/cave/edges.png",
   "start": 27345950,
   "end": 27606876
  }, {
   "filename": "/data/tracks/overworld/envmap4.png",
   "start": 27606876,
   "end": 27863535
  }, {
   "filename": "/data/tracks/startrack/metal_rusted.jpg",
   "start": 27863535,
   "end": 28119920
  }, {
   "filename": "/data/tracks/fortmagma/wood_planks1.jpg",
   "start": 28119920,
   "end": 28373875
  }, {
   "filename": "/data/sfx/spaceship.ogg",
   "start": 28373875,
   "end": 28615813,
   "audio": 1
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_2b.png",
   "start": 28615813,
   "end": 28856360
  }, {
   "filename": "/data/tracks/startrack/img_0572.jpg",
   "start": 28856360,
   "end": 29095394
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_5a.png",
   "start": 29095394,
   "end": 29333866
  }, {
   "filename": "/data/tracks/startrack/cromwatertower2.jpg",
   "start": 29333866,
   "end": 29568729
  }, {
   "filename": "/data/tracks/farm/horse_LOD100.b3d",
   "start": 29568729,
   "end": 29799534
  }, {
   "filename": "/data/tracks/farm/horse.b3d",
   "start": 29799534,
   "end": 30030251
  }, {
   "filename": "/data/tracks/minigolf/sand.jpg",
   "start": 30030251,
   "end": 30257762
  }, {
   "filename": "/data/tracks/startrack/lightmap_no_room.png",
   "start": 30257762,
   "end": 30485112
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_3a.png",
   "start": 30485112,
   "end": 30707437
  }, {
   "filename": "/data/karts/adiumy/adiumy.b3dz",
   "start": 30707437,
   "end": 30929581
  }, {
   "filename": "/data/textures/wood_planks1_alpha.png",
   "start": 30929581,
   "end": 31150748
  }, {
   "filename": "/data/textures/palm_tree_leaf.png",
   "start": 31150748,
   "end": 31371347
  }, {
   "filename": "/data/karts/nolok/nolok_kart.png",
   "start": 31371347,
   "end": 31590860
  }, {
   "filename": "/data/tracks/jungle/wall.png",
   "start": 31590860,
   "end": 31810330
  }, {
   "filename": "/data/tracks/mansion/wall.png",
   "start": 31810330,
   "end": 32029800
  }, {
   "filename": "/data/tracks/overworld/wall.png",
   "start": 32029800,
   "end": 32249270
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_3c.png",
   "start": 32249270,
   "end": 32466572
  }, {
   "filename": "/data/models/reset-button.png",
   "start": 32466572,
   "end": 32681432
  }, {
   "filename": "/data/tracks/soccer_field/soccer_ball.jpg",
   "start": 32681432,
   "end": 32895828
  }, {
   "filename": "/data/tracks/startrack/lightmap_start.png",
   "start": 32895828,
   "end": 33110223
  }, {
   "filename": "/data/tracks/battleisland/battleisland_track.b3d",
   "start": 33110223,
   "end": 33324613
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_4.png",
   "start": 33324613,
   "end": 33536388
  }, {
   "filename": "/data/tracks/lighthouse/pine_tree_lod_hight.b3d",
   "start": 33536388,
   "end": 33747733
  }, {
   "filename": "/data/tracks/subsea/Grate-subsea.png",
   "start": 33747733,
   "end": 33955575
  }, {
   "filename": "/data/tracks/zengarden/grass_detail2.png",
   "start": 33955575,
   "end": 34160267
  }, {
   "filename": "/data/karts/beastie/beastie_texture.png",
   "start": 34160267,
   "end": 34362715
  }, {
   "filename": "/data/tracks/xr591/trailtometal.png",
   "start": 34362715,
   "end": 34562427
  }, {
   "filename": "/data/tracks/startrack/lightmap_other2.png",
   "start": 34562427,
   "end": 34761260
  }, {
   "filename": "/data/tracks/mansion/tracks.b3d",
   "start": 34761260,
   "end": 34957908
  }, {
   "filename": "/data/karts/beagle/dog.png",
   "start": 34957908,
   "end": 35154310
  }, {
   "filename": "/data/tracks/minigolf/golfball_baked_normal.png",
   "start": 35154310,
   "end": 35350558
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_2d.png",
   "start": 35350558,
   "end": 35546562
  }, {
   "filename": "/data/sfx/goal_scored.ogg",
   "start": 35546562,
   "end": 35742187,
   "audio": 1
  }, {
   "filename": "/data/karts/beagle/kart.png",
   "start": 35742187,
   "end": 35937216
  }, {
   "filename": "/data/tracks/hacienda/cactus.png",
   "start": 35937216,
   "end": 36130913
  }, {
   "filename": "/data/tracks/tutorial/cactus.png",
   "start": 36130913,
   "end": 36324610
  }, {
   "filename": "/data/tracks/subsea/Mouette.002.b3d",
   "start": 36324610,
   "end": 36516899
  }, {
   "filename": "/data/tracks/mansion/SKY0005.png",
   "start": 36516899,
   "end": 36708905
  }, {
   "filename": "/data/tracks/xr591/metal_ground.png",
   "start": 36708905,
   "end": 36900892
  }, {
   "filename": "/data/textures/bow_tile.jpg",
   "start": 36900892,
   "end": 37092856
  }, {
   "filename": "/data/tracks/startrack/lightmap_other3.png",
   "start": 37092856,
   "end": 37284372
  }, {
   "filename": "/data/tracks/mansion/SKY0002.png",
   "start": 37284372,
   "end": 37474539
  }, {
   "filename": "/data/tracks/zengarden/sky_color.png",
   "start": 37474539,
   "end": 37662482
  }, {
   "filename": "/data/tracks/olivermath/ruler.png",
   "start": 37662482,
   "end": 37849047
  }, {
   "filename": "/data/tracks/mansion/SKY0004.png",
   "start": 37849047,
   "end": 38034143
  }, {
   "filename": "/data/tracks/introcutscene/vegetation.b3d",
   "start": 38034143,
   "end": 38218943
  }, {
   "filename": "/data/tracks/mines/dark-wall-wood.jpg",
   "start": 38218943,
   "end": 38403557
  }, {
   "filename": "/data/tracks/minigolf/grass_trim.png",
   "start": 38403557,
   "end": 38587932
  }, {
   "filename": "/data/textures/city_fern.png",
   "start": 38587932,
   "end": 38772244
  }, {
   "filename": "/data/tracks/zengarden/skyLantern_gpr1.b3d",
   "start": 38772244,
   "end": 38956023
  }, {
   "filename": "/data/tracks/zengarden/skyLantern_gpr2.b3d",
   "start": 38956023,
   "end": 39139802
  }, {
   "filename": "/data/tracks/zengarden/skyLantern_gpr3.b3d",
   "start": 39139802,
   "end": 39323581
  }, {
   "filename": "/data/tracks/xr591/SKY0006.png",
   "start": 39323581,
   "end": 39506717
  }, {
   "filename": "/data/tracks/startrack/pipez1a.jpg",
   "start": 39506717,
   "end": 39689810
  }, {
   "filename": "/data/tracks/hacienda/hacienda_roof.jpg",
   "start": 39689810,
   "end": 39872142
  }, {
   "filename": "/data/tracks/mansion/hacienda_roof.jpg",
   "start": 39872142,
   "end": 40054474
  }, {
   "filename": "/data/tracks/tutorial/hacienda_roof.jpg",
   "start": 40054474,
   "end": 40236806
  }, {
   "filename": "/data/tracks/mansion/SKY0003.png",
   "start": 40236806,
   "end": 40419062
  }, {
   "filename": "/data/tracks/fortmagma/wallpaper_mansion.png",
   "start": 40419062,
   "end": 40600753
  }, {
   "filename": "/data/tracks/mansion/wallpaper_mansion.png",
   "start": 40600753,
   "end": 40782444
  }, {
   "filename": "/data/tracks/startrack/lightmap_other1.png",
   "start": 40782444,
   "end": 40963210
  }, {
   "filename": "/data/tracks/olivermath/mathclasswest.png",
   "start": 40963210,
   "end": 41143747
  }, {
   "filename": "/data/karts/suzanne/kart.diffuse.jpg",
   "start": 41143747,
   "end": 41323891
  }, {
   "filename": "/data/tracks/mansion/SKY0001.png",
   "start": 41323891,
   "end": 41504002
  }, {
   "filename": "/data/tracks/subsea/brick-moss-subsea.jpg",
   "start": 41504002,
   "end": 41683927
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_3b.png",
   "start": 41683927,
   "end": 41863573
  }, {
   "filename": "/data/fonts/title_font.png",
   "start": 41863573,
   "end": 42042019
  }, {
   "filename": "/data/karts/suzanne/suzanne.diffuse.jpg",
   "start": 42042019,
   "end": 42220459
  }, {
   "filename": "/data/tracks/zengarden/grassroad.jpg",
   "start": 42220459,
   "end": 42396989
  }, {
   "filename": "/data/karts/pidgin/pidgin-kart.png",
   "start": 42396989,
   "end": 42572648
  }, {
   "filename": "/data/tracks/stadium/racetrack_crowd.png",
   "start": 42572648,
   "end": 42746518
  }, {
   "filename": "/data/tracks/mines/mine_water_alpha.png",
   "start": 42746518,
   "end": 42920027
  }, {
   "filename": "/data/tracks/mines/mine_water_reset.png",
   "start": 42920027,
   "end": 43093536
  }, {
   "filename": "/data/models/anchor.png",
   "start": 43093536,
   "end": 43266545
  }, {
   "filename": "/data/tracks/mansion/SKY0006.png",
   "start": 43266545,
   "end": 43439249
  }, {
   "filename": "/data/tracks/mansion/tree_1Low.png",
   "start": 43439249,
   "end": 43611869
  }, {
   "filename": "/data/karts/sara/saraFace.png",
   "start": 43611869,
   "end": 43784428
  }, {
   "filename": "/data/tracks/scotland/rock_grey.png",
   "start": 43784428,
   "end": 43955803
  }, {
   "filename": "/data/tracks/jungle/pot.jpg",
   "start": 43955803,
   "end": 44123770
  }, {
   "filename": "/data/karts/pidgin/pidgin.b3dz",
   "start": 44123770,
   "end": 44289767
  }, {
   "filename": "/data/tracks/startrack/lightmap_other5.png",
   "start": 44289767,
   "end": 44455453
  }, {
   "filename": "/data/tracks/olivermath/mathclasssouth.png",
   "start": 44455453,
   "end": 44621082
  }, {
   "filename": "/data/gui/bar.png",
   "start": 44621082,
   "end": 44786324
  }, {
   "filename": "/data/karts/suzanne/suzanne.b3dz",
   "start": 44786324,
   "end": 44951345
  }, {
   "filename": "/data/textures/tarmac.jpg",
   "start": 44951345,
   "end": 45115647
  }, {
   "filename": "/data/textures/TiZeta_barkM.png",
   "start": 45115647,
   "end": 45279697
  }, {
   "filename": "/data/tracks/scotland/Mossy_wall.png",
   "start": 45279697,
   "end": 45443201
  }, {
   "filename": "/data/tracks/startrack/lightmap_other4.png",
   "start": 45443201,
   "end": 45606469
  }, {
   "filename": "/data/textures/racetrack_asphalt.jpg",
   "start": 45606469,
   "end": 45769552
  }, {
   "filename": "/data/tracks/zengarden/sunset.png",
   "start": 45769552,
   "end": 45932259
  }, {
   "filename": "/data/tracks/zengarden/ToblackRoad.jpg",
   "start": 45932259,
   "end": 46094905
  }, {
   "filename": "/data/textures/nolok_character.png",
   "start": 46094905,
   "end": 46257145
  }, {
   "filename": "/data/tracks/lighthouse/yellow_dirt.jpg",
   "start": 46257145,
   "end": 46419008
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_2a.png",
   "start": 46419008,
   "end": 46580548
  }, {
   "filename": "/data/tracks/overworld/metaldoor.jpg",
   "start": 46580548,
   "end": 46741388
  }, {
   "filename": "/data/tracks/startrack/ceil1_inner.png",
   "start": 46741388,
   "end": 46901406
  }, {
   "filename": "/data/textures/TiZeta_ivy.png",
   "start": 46901406,
   "end": 47061170
  }, {
   "filename": "/data/textures/wood_planks1.jpg",
   "start": 47061170,
   "end": 47220678
  }, {
   "filename": "/data/tracks/mansion/wood_planks1.jpg",
   "start": 47220678,
   "end": 47380186
  }, {
   "filename": "/data/tracks/zengarden/wood_planks1.jpg",
   "start": 47380186,
   "end": 47539694
  }, {
   "filename": "/data/tracks/mansion/woodPost.png",
   "start": 47539694,
   "end": 47698858
  }, {
   "filename": "/data/textures/gnu.png",
   "start": 47698858,
   "end": 47856829
  }, {
   "filename": "/data/tracks/subsea/brick-subsea.jpg",
   "start": 47856829,
   "end": 48013849
  }, {
   "filename": "/data/karts/pidgin/pidgin.png",
   "start": 48013849,
   "end": 48170604
  }, {
   "filename": "/data/tracks/farm/wheat.png",
   "start": 48170604,
   "end": 48327249
  }, {
   "filename": "/data/karts/xfcemouse/hc_body.png",
   "start": 48327249,
   "end": 48483655
  }, {
   "filename": "/data/tracks/snowtuxpeak/tree_1Low.png",
   "start": 48483655,
   "end": 48639752
  }, {
   "filename": "/data/tracks/zengarden/blackRoad.jpg",
   "start": 48639752,
   "end": 48795803
  }, {
   "filename": "/data/textures/tiles.png",
   "start": 48795803,
   "end": 48951835
  }, {
   "filename": "/data/tracks/mansion/tiles.png",
   "start": 48951835,
   "end": 49107864
  }, {
   "filename": "/data/textures/plungerface.png",
   "start": 49107864,
   "end": 49263756
  }, {
   "filename": "/data/textures/logs.png",
   "start": 49263756,
   "end": 49419100
  }, {
   "filename": "/data/tracks/soccer_field/soccer_field_track.b3d",
   "start": 49419100,
   "end": 49573923
  }, {
   "filename": "/data/models/parachute.png",
   "start": 49573923,
   "end": 49727318
  }, {
   "filename": "/data/textures/city_asphalt_2.jpg",
   "start": 49727318,
   "end": 49880631
  }, {
   "filename": "/data/textures/HortonRockWall2.jpg",
   "start": 49880631,
   "end": 50033397
  }, {
   "filename": "/data/tracks/zengarden/sun.png",
   "start": 50033397,
   "end": 50184561
  }, {
   "filename": "/data/karts/elephpant/elephpant-neu.png",
   "start": 50184561,
   "end": 50335700
  }, {
   "filename": "/data/tracks/mines/light_shaft_section.png",
   "start": 50335700,
   "end": 50486432
  }, {
   "filename": "/data/textures/woodPost.png",
   "start": 50486432,
   "end": 50636833
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_5c.png",
   "start": 50636833,
   "end": 50786936
  }, {
   "filename": "/data/tracks/zengarden/tree_1Low.png",
   "start": 50786936,
   "end": 50936140
  }, {
   "filename": "/data/tracks/olivermath/mathclasseast.png",
   "start": 50936140,
   "end": 51085185
  }, {
   "filename": "/data/fonts/title_font_2.png",
   "start": 51085185,
   "end": 51233955
  }, {
   "filename": "/data/textures/concrete2.png",
   "start": 51233955,
   "end": 51382245
  }, {
   "filename": "/data/tracks/mansion/clouds.png",
   "start": 51382245,
   "end": 51530325
  }, {
   "filename": "/data/textures/roof.png",
   "start": 51530325,
   "end": 51677511
  }, {
   "filename": "/data/tracks/scotland/Tileroof.png",
   "start": 51677511,
   "end": 51824697
  }, {
   "filename": "/data/tracks/mansion/dead_tree.png",
   "start": 51824697,
   "end": 51971733
  }, {
   "filename": "/data/textures/rock_grey.jpg",
   "start": 51971733,
   "end": 52118210
  }, {
   "filename": "/data/tracks/olivermath/backpack.png",
   "start": 52118210,
   "end": 52264643
  }, {
   "filename": "/data/textures/Tizeta_grey1.png",
   "start": 52264643,
   "end": 52411023
  }, {
   "filename": "/data/textures/cracked-earth-texture.jpg",
   "start": 52411023,
   "end": 52557121
  }, {
   "filename": "/data/tracks/city/tree_2_LOD50.b3d",
   "start": 52557121,
   "end": 52703219
  }, {
   "filename": "/data/tracks/overworld/tree_2_LOD50.b3d",
   "start": 52703219,
   "end": 52849317
  }, {
   "filename": "/data/tracks/city/city_building_1.png",
   "start": 52849317,
   "end": 52994860
  }, {
   "filename": "/data/tracks/introcutscene/scene.xml",
   "start": 52994860,
   "end": 53139788
  }, {
   "filename": "/data/karts/hexley/hexley2.png",
   "start": 53139788,
   "end": 53284614
  }, {
   "filename": "/data/karts/sara/blueTextile_corset.png",
   "start": 53284614,
   "end": 53429205
  }, {
   "filename": "/data/tracks/greenvalley/tree.jpg",
   "start": 53429205,
   "end": 53573663
  }, {
   "filename": "/data/textures/mossy_stone.png",
   "start": 53573663,
   "end": 53718066
  }, {
   "filename": "/data/tracks/sandtrack/egypt2.jpg",
   "start": 53718066,
   "end": 53861468
  }, {
   "filename": "/data/karts/gnu/gnu.b3dz",
   "start": 53861468,
   "end": 54004629
  }, {
   "filename": "/data/karts/sara/blueTextile.png",
   "start": 54004629,
   "end": 54147712
  }, {
   "filename": "/data/tracks/overworld/hut_roof.jpg",
   "start": 54147712,
   "end": 54290755
  }, {
   "filename": "/data/models/chest.jpg",
   "start": 54290755,
   "end": 54432576
  }, {
   "filename": "/data/tracks/overworld/nolok_ao.png",
   "start": 54432576,
   "end": 54574029
  }, {
   "filename": "/data/textures/ribbed_steel.jpg",
   "start": 54574029,
   "end": 54715432
  }, {
   "filename": "/data/tracks/snowtuxpeak/oldmetal.png",
   "start": 54715432,
   "end": 54856628
  }, {
   "filename": "/data/tracks/greenvalley/waterfall_particle.png",
   "start": 54856628,
   "end": 54997808
  }, {
   "filename": "/data/tracks/scotland/leaves2.png",
   "start": 54997808,
   "end": 55138154
  }, {
   "filename": "/data/textures/HortonRockWall.jpg",
   "start": 55138154,
   "end": 55278278
  }, {
   "filename": "/data/tracks/greenvalley/rock_gray.jpg",
   "start": 55278278,
   "end": 55418112
  }, {
   "filename": "/data/tracks/lighthouse/rock_gray.jpg",
   "start": 55418112,
   "end": 55557946
  }, {
   "filename": "/data/karts/hexley/hexley.b3dz",
   "start": 55557946,
   "end": 55697035
  }, {
   "filename": "/data/tracks/zengarden/black_rockMountain.jpg",
   "start": 55697035,
   "end": 55835809
  }, {
   "filename": "/data/karts/tux/tuxkart.png",
   "start": 55835809,
   "end": 55974232
  }, {
   "filename": "/data/tracks/endcutscene/tuxkart.png",
   "start": 55974232,
   "end": 56112648
  }, {
   "filename": "/data/karts/beastie/beastie.b3dz",
   "start": 56112648,
   "end": 56250761
  }, {
   "filename": "/data/karts/puffy/puffy.b3dz",
   "start": 56250761,
   "end": 56388623
  }, {
   "filename": "/data/tracks/hacienda/palmacacia_alpha.jpg",
   "start": 56388623,
   "end": 56526435
  }, {
   "filename": "/data/tracks/tutorial/palmacacia_alpha.jpg",
   "start": 56526435,
   "end": 56664247
  }, {
   "filename": "/data/tracks/mines/emerald.png",
   "start": 56664247,
   "end": 56802042
  }, {
   "filename": "/data/tracks/snowtuxpeak/blueZipper_effect.png",
   "start": 56802042,
   "end": 56939576
  }, {
   "filename": "/data/textures/lava.png",
   "start": 56939576,
   "end": 57075981
  }, {
   "filename": "/data/textures/racetrack_grass.jpg",
   "start": 57075981,
   "end": 57211829
  }, {
   "filename": "/data/tracks/lighthouse/racetrack_grass.jpg",
   "start": 57211829,
   "end": 57347677
  }, {
   "filename": "/data/tracks/soccer_field/racetrack_grass.jpg",
   "start": 57347677,
   "end": 57483525
  }, {
   "filename": "/data/karts/sara/lightBlueSeam.png",
   "start": 57483525,
   "end": 57618761
  }, {
   "filename": "/data/tracks/hacienda/windmill_palm_detail.png",
   "start": 57618761,
   "end": 57753589
  }, {
   "filename": "/data/tracks/tutorial/windmill_palm_detail.png",
   "start": 57753589,
   "end": 57888417
  }, {
   "filename": "/data/textures/city_bricks.png",
   "start": 57888417,
   "end": 58022846
  }, {
   "filename": "/data/textures/deprecated/stonewall.png",
   "start": 58022846,
   "end": 58157228
  }, {
   "filename": "/data/textures/plants.jpg",
   "start": 58157228,
   "end": 58291415
  }, {
   "filename": "/data/tracks/overworld/tree_1Low.png",
   "start": 58291415,
   "end": 58425167
  }, {
   "filename": "/data/textures/deprecated/grass4.png",
   "start": 58425167,
   "end": 58558195
  }, {
   "filename": "/data/sfx/race_finish.ogg",
   "start": 58558195,
   "end": 58690773,
   "audio": 1
  }, {
   "filename": "/data/fonts/StkChineseFont.xml",
   "start": 58690773,
   "end": 58823295
  }, {
   "filename": "/data/textures/palmtree.png",
   "start": 58823295,
   "end": 58955370
  }, {
   "filename": "/data/textures/snowyroad.png",
   "start": 58955370,
   "end": 59087374
  }, {
   "filename": "/data/tracks/hacienda/traildust.jpg",
   "start": 59087374,
   "end": 59219336
  }, {
   "filename": "/data/tracks/tutorial/traildust.jpg",
   "start": 59219336,
   "end": 59351298
  }, {
   "filename": "/data/tracks/xr591/traildust.jpg",
   "start": 59351298,
   "end": 59483260
  }, {
   "filename": "/data/tracks/city/tree_1_LOD50.b3d",
   "start": 59483260,
   "end": 59614814
  }, {
   "filename": "/data/tracks/sandtrack/waterfall.png",
   "start": 59614814,
   "end": 59746075
  }, {
   "filename": "/data/tracks/introcutscene/tree_1Low.png",
   "start": 59746075,
   "end": 59877243
  }, {
   "filename": "/data/tracks/startrack/metal_plates.png",
   "start": 59877243,
   "end": 60006848
  }, {
   "filename": "/data/textures/black_rockMountain.jpg",
   "start": 60006848,
   "end": 60136041
  }, {
   "filename": "/data/tracks/mines/wood_beam2.png",
   "start": 60136041,
   "end": 60264723
  }, {
   "filename": "/data/textures/city_tree_leaves_alpha.jpg",
   "start": 60264723,
   "end": 60392921
  }, {
   "filename": "/data/tracks/introcutscene2/terrain.b3d",
   "start": 60392921,
   "end": 60520582
  }, {
   "filename": "/data/tracks/introcutscene/terrain.b3d",
   "start": 60520582,
   "end": 60648037
  }, {
   "filename": "/data/textures/clouds.png",
   "start": 60648037,
   "end": 60775235
  }, {
   "filename": "/data/tracks/xr591/basic-wall.png",
   "start": 60775235,
   "end": 60902164
  }, {
   "filename": "/data/tracks/hacienda/metal_transfo.png",
   "start": 60902164,
   "end": 61028867
  }, {
   "filename": "/data/tracks/mines/metal_transfo.png",
   "start": 61028867,
   "end": 61155570
  }, {
   "filename": "/data/tracks/tutorial/metal_transfo.png",
   "start": 61155570,
   "end": 61282273
  }, {
   "filename": "/data/tracks/zengarden/clouds.b3d",
   "start": 61282273,
   "end": 61408761
  }, {
   "filename": "/data/tracks/introcutscene2/Ship.b3d",
   "start": 61408761,
   "end": 61535027
  }, {
   "filename": "/data/tracks/mansion/ghost.png",
   "start": 61535027,
   "end": 61661286
  }, {
   "filename": "/data/textures/grass2dirt.png",
   "start": 61661286,
   "end": 61787405
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_2c.png",
   "start": 61787405,
   "end": 61913352
  }, {
   "filename": "/data/tracks/startrack/lightmap_core.png",
   "start": 61913352,
   "end": 62038752
  }, {
   "filename": "/data/tracks/hacienda/trailrock.jpg",
   "start": 62038752,
   "end": 62163720
  }, {
   "filename": "/data/tracks/tutorial/trailrock.jpg",
   "start": 62163720,
   "end": 62288688
  }, {
   "filename": "/data/tracks/hacienda/palmacacia.jpg",
   "start": 62288688,
   "end": 62413546
  }, {
   "filename": "/data/tracks/tutorial/palmacacia.jpg",
   "start": 62413546,
   "end": 62538404
  }, {
   "filename": "/data/tracks/jungle/skybox1.jpg",
   "start": 62538404,
   "end": 62662750
  }, {
   "filename": "/data/textures/canyon_boards.png",
   "start": 62662750,
   "end": 62786932
  }, {
   "filename": "/data/textures/sand2.jpg",
   "start": 62786932,
   "end": 62911006
  }, {
   "filename": "/data/textures/earth.png",
   "start": 62911006,
   "end": 63034877
  }, {
   "filename": "/data/tracks/greenvalley/water_light3.png",
   "start": 63034877,
   "end": 63157966
  }, {
   "filename": "/data/tracks/sandtrack/monkey_col.png",
   "start": 63157966,
   "end": 63281035
  }, {
   "filename": "/data/tracks/mines/wood_beam3.png",
   "start": 63281035,
   "end": 63404084
  }, {
   "filename": "/data/tracks/olivermath/mathclassnorth.png",
   "start": 63404084,
   "end": 63527080
  }, {
   "filename": "/data/tracks/mansion/grass_dark.jpg",
   "start": 63527080,
   "end": 63649854
  }, {
   "filename": "/data/textures/dirt.jpg",
   "start": 63649854,
   "end": 63772601
  }, {
   "filename": "/data/textures/dirt2sand.png",
   "start": 63772601,
   "end": 63895236
  }, {
   "filename": "/data/tracks/fortmagma/lava_sky.png",
   "start": 63895236,
   "end": 64017812
  }, {
   "filename": "/data/textures/water_light.png",
   "start": 64017812,
   "end": 64140257
  }, {
   "filename": "/data/tracks/fortmagma/lava.png",
   "start": 64140257,
   "end": 64262550
  }, {
   "filename": "/data/textures/sand.png",
   "start": 64262550,
   "end": 64384746
  }, {
   "filename": "/data/tracks/mines/wood_beam.png",
   "start": 64384746,
   "end": 64506591
  }, {
   "filename": "/data/karts/sara/greenTextile.png",
   "start": 64506591,
   "end": 64627964
  }, {
   "filename": "/data/tracks/lighthouse/lighthousWindows_diff.png",
   "start": 64627964,
   "end": 64749297
  }, {
   "filename": "/data/tracks/zengarden/water_light3.png",
   "start": 64749297,
   "end": 64870164
  }, {
   "filename": "/data/gui/logo.png",
   "start": 64870164,
   "end": 64990854
  }, {
   "filename": "/data/textures/sandgrass.png",
   "start": 64990854,
   "end": 65111503
  }, {
   "filename": "/data/tracks/startrack/ab_crate_a.png",
   "start": 65111503,
   "end": 65232067
  }, {
   "filename": "/data/tracks/zengarden/koiFish.png",
   "start": 65232067,
   "end": 65351732
  }, {
   "filename": "/data/tracks/mansion/grave.png",
   "start": 65351732,
   "end": 65470530
  }, {
   "filename": "/data/tracks/zengarden/rockTograss.jpg",
   "start": 65470530,
   "end": 65589270
  }, {
   "filename": "/data/karts/wilber/wilber2neu.png",
   "start": 65589270,
   "end": 65707525
  }, {
   "filename": "/data/tracks/sandtrack/skybox3.jpg",
   "start": 65707525,
   "end": 65825497
  }, {
   "filename": "/data/textures/metal_plates.png",
   "start": 65825497,
   "end": 65943420
  }, {
   "filename": "/data/tracks/fortmagma/metal_plates.png",
   "start": 65943420,
   "end": 66061343
  }, {
   "filename": "/data/tracks/zengarden/landscapeMountFudji.jpg",
   "start": 66061343,
   "end": 66179075
  }, {
   "filename": "/data/tracks/overworld/terrain1_splat.b3d",
   "start": 66179075,
   "end": 66296756
  }, {
   "filename": "/data/gui/logo_slim.png",
   "start": 66296756,
   "end": 66414235
  }, {
   "filename": "/data/tracks/zengarden/to_black_rockMountain.jpg",
   "start": 66414235,
   "end": 66531675
  }, {
   "filename": "/data/textures/grass_dark.jpg",
   "start": 66531675,
   "end": 66648688
  }, {
   "filename": "/data/tracks/snowmountain/stonesgray.png",
   "start": 66648688,
   "end": 66765699
  }, {
   "filename": "/data/tracks/mines/candle.png",
   "start": 66765699,
   "end": 66882504
  }, {
   "filename": "/data/karts/gnu/Carpet.b3d",
   "start": 66882504,
   "end": 66999172
  }, {
   "filename": "/data/textures/summersky_b.jpg",
   "start": 66999172,
   "end": 67114969
  }, {
   "filename": "/data/tracks/scotland/tree_1.png",
   "start": 67114969,
   "end": 67230677
  }, {
   "filename": "/data/tracks/jungle/skybox2.jpg",
   "start": 67230677,
   "end": 67346383
  }, {
   "filename": "/data/tracks/hacienda/wallDark.jpg",
   "start": 67346383,
   "end": 67462007
  }, {
   "filename": "/data/tracks/tutorial/wallDark.jpg",
   "start": 67462007,
   "end": 67577631
  }, {
   "filename": "/data/tracks/overworld/shipthing2.png",
   "start": 67577631,
   "end": 67693190
  }, {
   "filename": "/data/tracks/introcutscene/nolokship.png",
   "start": 67693190,
   "end": 67808741
  }, {
   "filename": "/data/tracks/introcutscene2/nolokship.png",
   "start": 67808741,
   "end": 67924292
  }, {
   "filename": "/data/tracks/startrack/pipe1a-core.png",
   "start": 67924292,
   "end": 68039720
  }, {
   "filename": "/data/tracks/zengarden/tree_1.png",
   "start": 68039720,
   "end": 68155093
  }, {
   "filename": "/data/tracks/minigolf/windmill_arm.jpg",
   "start": 68155093,
   "end": 68270363
  }, {
   "filename": "/data/tracks/snowtuxpeak/tree_1.png",
   "start": 68270363,
   "end": 68385620
  }, {
   "filename": "/data/tracks/zengarden/rockMountain.jpg",
   "start": 68385620,
   "end": 68500651
  }, {
   "filename": "/data/tracks/subsea/DragonsBed-subsea.png",
   "start": 68500651,
   "end": 68615543
  }, {
   "filename": "/data/textures/rock_mountain.jpg",
   "start": 68615543,
   "end": 68730366
  }, {
   "filename": "/data/tracks/fortmagma/cannonBall.jpg",
   "start": 68730366,
   "end": 68845189
  }, {
   "filename": "/data/tracks/snowtuxpeak/rock_mountain.jpg",
   "start": 68845189,
   "end": 68960012
  }, {
   "filename": "/data/textures/rock_brown.jpg",
   "start": 68960012,
   "end": 69074652
  }, {
   "filename": "/data/models/tnt-bomb.png",
   "start": 69074652,
   "end": 69188917
  }, {
   "filename": "/data/tracks/mines/tnt-bomb.png",
   "start": 69188917,
   "end": 69303182
  }, {
   "filename": "/data/sfx/tractor_beam.ogg",
   "start": 69303182,
   "end": 69417422,
   "audio": 1
  }, {
   "filename": "/data/models/door.png",
   "start": 69417422,
   "end": 69531127
  }, {
   "filename": "/data/textures/rockTograss.jpg",
   "start": 69531127,
   "end": 69643820
  }, {
   "filename": "/data/models/chest.b3d",
   "start": 69643820,
   "end": 69756295
  }, {
   "filename": "/data/textures/rockwaterfall.jpg",
   "start": 69756295,
   "end": 69868758
  }, {
   "filename": "/data/tracks/snowtuxpeak/wooden.png",
   "start": 69868758,
   "end": 69981178
  }, {
   "filename": "/data/tracks/zengarden/wooden.png",
   "start": 69981178,
   "end": 70093598
  }, {
   "filename": "/data/textures/to_black_rockMountain.jpg",
   "start": 70093598,
   "end": 70205418
  }, {
   "filename": "/data/tracks/overworld/terrain2.b3d",
   "start": 70205418,
   "end": 70316954
  }, {
   "filename": "/data/textures/oldWood.png",
   "start": 70316954,
   "end": 70428391
  }, {
   "filename": "/data/tracks/zengarden/grass_detail1.png",
   "start": 70428391,
   "end": 70539717
  }, {
   "filename": "/data/tracks/startrack/trak2_holes1a.png",
   "start": 70539717,
   "end": 70650486
  }, {
   "filename": "/data/tracks/scotland/water_dark.png",
   "start": 70650486,
   "end": 70760943
  }, {
   "filename": "/data/tracks/sandtrack/sand.png",
   "start": 70760943,
   "end": 70871325
  }, {
   "filename": "/data/tracks/zengarden/rockMountainWater.jpg",
   "start": 70871325,
   "end": 70981134
  }, {
   "filename": "/data/tracks/soccer_field/city_concrete.png",
   "start": 70981134,
   "end": 71090791
  }, {
   "filename": "/data/tracks/startrack/trak3_plate1.png",
   "start": 71090791,
   "end": 71200060
  }, {
   "filename": "/data/tracks/jungle/wood.png",
   "start": 71200060,
   "end": 71309321
  }, {
   "filename": "/data/sfx/dark.ogg",
   "start": 71309321,
   "end": 71418510,
   "audio": 1
  }, {
   "filename": "/data/tracks/overworld/sign_sea.jpg",
   "start": 71418510,
   "end": 71527689
  }, {
   "filename": "/data/tracks/minigolf/windmill_wall.jpg",
   "start": 71527689,
   "end": 71636646
  }, {
   "filename": "/data/textures/rockMountain.jpg",
   "start": 71636646,
   "end": 71745584
  }, {
   "filename": "/data/tracks/lighthouse/metaldirt_diff.png",
   "start": 71745584,
   "end": 71854207
  }, {
   "filename": "/data/models/swatter_anim2.b3d",
   "start": 71854207,
   "end": 71962554
  }, {
   "filename": "/data/tracks/lighthouse/lighthouseRoof_diff.png",
   "start": 71962554,
   "end": 72070690
  }, {
   "filename": "/data/tracks/scotland/nessy.b3d",
   "start": 72070690,
   "end": 72178515
  }, {
   "filename": "/data/tracks/overworld/sign_tropical.jpg",
   "start": 72178515,
   "end": 72286267
  }, {
   "filename": "/data/textures/rock.jpg",
   "start": 72286267,
   "end": 72393820
  }, {
   "filename": "/data/tracks/zengarden/grass.jpg",
   "start": 72393820,
   "end": 72501364
  }, {
   "filename": "/data/models/swatter_nolok.b3d",
   "start": 72501364,
   "end": 72608852
  }, {
   "filename": "/data/tracks/minigolf/flag.jpg",
   "start": 72608852,
   "end": 72716289
  }, {
   "filename": "/data/tracks/overworld/sign_techno.jpg",
   "start": 72716289,
   "end": 72823725
  }, {
   "filename": "/data/tracks/farm/leave3.png",
   "start": 72823725,
   "end": 72930845
  }, {
   "filename": "/data/tracks/city/tree_2_LOD150.b3d",
   "start": 72930845,
   "end": 73037823
  }, {
   "filename": "/data/tracks/overworld/tree_2_LOD150.b3d",
   "start": 73037823,
   "end": 73144801
  }, {
   "filename": "/data/tracks/jungle/sshot-jungle.jpg",
   "start": 73144801,
   "end": 73251686
  }, {
   "filename": "/data/tracks/introcutscene2/sign_backside.jpg",
   "start": 73251686,
   "end": 73358143
  }, {
   "filename": "/data/tracks/lighthouse/sign_backside.jpg",
   "start": 73358143,
   "end": 73464600
  }, {
   "filename": "/data/tracks/mines/sign_backside.jpg",
   "start": 73464600,
   "end": 73571057
  }, {
   "filename": "/data/tracks/overworld/sign_backside.jpg",
   "start": 73571057,
   "end": 73677514
  }, {
   "filename": "/data/tracks/mansion/img_0576.jpg",
   "start": 73677514,
   "end": 73783933
  }, {
   "filename": "/data/tracks/hacienda/wall.jpg",
   "start": 73783933,
   "end": 73890215
  }, {
   "filename": "/data/tracks/overworld/wall.jpg",
   "start": 73890215,
   "end": 73996497
  }, {
   "filename": "/data/tracks/tutorial/wall.jpg",
   "start": 73996497,
   "end": 74102779
  }, {
   "filename": "/data/tracks/greenvalley/sshot.jpg",
   "start": 74102779,
   "end": 74209048
  }, {
   "filename": "/data/tracks/overworld/sign_mountain.jpg",
   "start": 74209048,
   "end": 74314132
  }, {
   "filename": "/data/tracks/mansion/road_dirt.jpg",
   "start": 74314132,
   "end": 74418986
  }, {
   "filename": "/data/textures/bumpy_surface.png",
   "start": 74418986,
   "end": 74523734
  }, {
   "filename": "/data/textures/grass3.jpg",
   "start": 74523734,
   "end": 74628185
  }, {
   "filename": "/data/tracks/mansion/road_cave.jpg",
   "start": 74628185,
   "end": 74732126
  }, {
   "filename": "/data/tracks/lighthouse/buoy.b3d",
   "start": 74732126,
   "end": 74835812
  }, {
   "filename": "/data/textures/dirtbrick.png",
   "start": 74835812,
   "end": 74939095
  }, {
   "filename": "/data/tracks/stadium/racetrack_screenshot.png",
   "start": 74939095,
   "end": 75042275
  }, {
   "filename": "/data/tracks/jungle/skybox4.jpg",
   "start": 75042275,
   "end": 75144690
  }, {
   "filename": "/data/tracks/minigolf/Water.b3d",
   "start": 75144690,
   "end": 75247e3
  }, {
   "filename": "/data/tracks/introcutscene/grass.jpg",
   "start": 75247e3,
   "end": 75349203
  }, {
   "filename": "/data/tracks/snowtuxpeak/Balloon.b3d",
   "start": 75349203,
   "end": 75451344
  }, {
   "filename": "/data/textures/Paving_stones_2.jpg",
   "start": 75451344,
   "end": 75553324
  }, {
   "filename": "/data/tracks/overworld/sign_greenland.jpg",
   "start": 75553324,
   "end": 75655303
  }, {
   "filename": "/data/tracks/startrack/trak3_base1-2.png",
   "start": 75655303,
   "end": 75756815
  }, {
   "filename": "/data/textures/snowrock.jpg",
   "start": 75756815,
   "end": 75858257
  }, {
   "filename": "/data/tracks/snowtuxpeak/snowrock.jpg",
   "start": 75858257,
   "end": 75959699
  }, {
   "filename": "/data/textures/tree_1.png",
   "start": 75959699,
   "end": 76060613
  }, {
   "filename": "/data/tracks/lighthouse/tree_1.png",
   "start": 76060613,
   "end": 76161527
  }, {
   "filename": "/data/tracks/lighthouse/tree_noanim.png",
   "start": 76161527,
   "end": 76262441
  }, {
   "filename": "/data/tracks/sandtrack/skybox2.jpg",
   "start": 76262441,
   "end": 76363221
  }, {
   "filename": "/data/tracks/startrack/vert_vending_panel.png",
   "start": 76363221,
   "end": 76463951
  }, {
   "filename": "/data/sfx/metal_clang.ogg",
   "start": 76463951,
   "end": 76564470,
   "audio": 1
  }, {
   "filename": "/data/tracks/xr591/aliens_lo.b3d",
   "start": 76564470,
   "end": 76664907
  }, {
   "filename": "/data/karts/beagle/beagle.b3dz",
   "start": 76664907,
   "end": 76765333
  }, {
   "filename": "/data/textures/city_rock.jpg",
   "start": 76765333,
   "end": 76865601
  }, {
   "filename": "/data/tracks/zengarden/pagoda1_LOD50.b3d",
   "start": 76865601,
   "end": 76965844
  }, {
   "filename": "/data/tracks/zengarden/pagoda_noLod.b3d",
   "start": 76965844,
   "end": 77066087
  }, {
   "filename": "/data/tracks/introcutscene/pagoda.b3d",
   "start": 77066087,
   "end": 77166276
  }, {
   "filename": "/data/tracks/minigolf/golfball.png",
   "start": 77166276,
   "end": 77266024
  }, {
   "filename": "/data/tracks/jungle/skybox3.jpg",
   "start": 77266024,
   "end": 77365255
  }, {
   "filename": "/data/tracks/mansion/l_lampstruct0.png",
   "start": 77365255,
   "end": 77464347
  }, {
   "filename": "/data/tracks/greenvalley/water_light2.png",
   "start": 77464347,
   "end": 77563343
  }, {
   "filename": "/data/textures/stonetex.jpg",
   "start": 77563343,
   "end": 77662133
  }, {
   "filename": "/data/tracks/zengarden/plants.jpg",
   "start": 77662133,
   "end": 77760692
  }, {
   "filename": "/data/tracks/hacienda/trailrock2dust.jpg",
   "start": 77760692,
   "end": 77859159
  }, {
   "filename": "/data/tracks/tutorial/trailrock2dust.jpg",
   "start": 77859159,
   "end": 77957626
  }, {
   "filename": "/data/tracks/overworld/rocket_hi.b3d",
   "start": 77957626,
   "end": 78055679
  }, {
   "filename": "/data/tracks/minigolf/minigolf.jpg",
   "start": 78055679,
   "end": 78153666
  }, {
   "filename": "/data/textures/grass2.jpg",
   "start": 78153666,
   "end": 78251585
  }, {
   "filename": "/data/models/swatter.b3d",
   "start": 78251585,
   "end": 78349308
  }, {
   "filename": "/data/tracks/xr591/columnred.png",
   "start": 78349308,
   "end": 78446784
  }, {
   "filename": "/data/tracks/subsea/submarine_hi.b3d",
   "start": 78446784,
   "end": 78544186
  }, {
   "filename": "/data/textures/city_concrete.png",
   "start": 78544186,
   "end": 78641492
  }, {
   "filename": "/data/tracks/xr591/robot_high.b3d",
   "start": 78641492,
   "end": 78738657
  }, {
   "filename": "/data/tracks/olivermath/homework.png",
   "start": 78738657,
   "end": 78835755
  }, {
   "filename": "/data/textures/road_dirt.jpg",
   "start": 78835755,
   "end": 78932734
  }, {
   "filename": "/data/tracks/introcutscene/Ship.b3d",
   "start": 78932734,
   "end": 79029624
  }, {
   "filename": "/data/textures/crate2_diffuse.jpg",
   "start": 79029624,
   "end": 79126479
  }, {
   "filename": "/data/tracks/mines/crate2_diffuse.jpg",
   "start": 79126479,
   "end": 79223334
  }, {
   "filename": "/data/tracks/snowtuxpeak/blueZipper.png",
   "start": 79223334,
   "end": 79319421
  }, {
   "filename": "/data/tracks/startrack/blueZipper.png",
   "start": 79319421,
   "end": 79415508
  }, {
   "filename": "/data/tracks/xr591/columngreen.png",
   "start": 79415508,
   "end": 79511570
  }, {
   "filename": "/data/tracks/olivermath/mathclassfloor.jpg",
   "start": 79511570,
   "end": 79607184
  }, {
   "filename": "/data/tracks/overworld/column_diffuse.jpg",
   "start": 79607184,
   "end": 79702725
  }, {
   "filename": "/data/tracks/minigolf/seabed.jpg",
   "start": 79702725,
   "end": 79798051
  }, {
   "filename": "/data/tracks/mines/l_lampstruct0.png",
   "start": 79798051,
   "end": 79893208
  }, {
   "filename": "/data/tracks/zengarden/directionLantern_LOD25.b3d",
   "start": 79893208,
   "end": 79988173
  }, {
   "filename": "/data/textures/crate1_diffuse.jpg",
   "start": 79988173,
   "end": 80082789
  }, {
   "filename": "/data/tracks/lighthouse/crate1_diffuse.jpg",
   "start": 80082789,
   "end": 80177405
  }, {
   "filename": "/data/tracks/mines/crate1_diffuse.jpg",
   "start": 80177405,
   "end": 80272021
  }, {
   "filename": "/data/tracks/mansion/mansion-wall.jpg",
   "start": 80272021,
   "end": 80366366
  }, {
   "filename": "/data/textures/summersky_w.jpg",
   "start": 80366366,
   "end": 80460664
  }, {
   "filename": "/data/tracks/greenvalley/stk_road_dirt.jpg",
   "start": 80460664,
   "end": 80554943
  }, {
   "filename": "/data/models/rubber_ball.b3d",
   "start": 80554943,
   "end": 80649196
  }, {
   "filename": "/data/karts/sara/blueLeather.png",
   "start": 80649196,
   "end": 80742804
  }, {
   "filename": "/data/tracks/mines/wall_wood1.jpg",
   "start": 80742804,
   "end": 80836289
  }, {
   "filename": "/data/tracks/overworld/wall_wood1.jpg",
   "start": 80836289,
   "end": 80929774
  }, {
   "filename": "/data/textures/cottage_wall1.jpg",
   "start": 80929774,
   "end": 81023216
  }, {
   "filename": "/data/textures/summersky_n.jpg",
   "start": 81023216,
   "end": 81116597
  }, {
   "filename": "/data/tracks/cave/sshot-cave.png",
   "start": 81116597,
   "end": 81208762
  }, {
   "filename": "/data/textures/wooden.png",
   "start": 81208762,
   "end": 81300912
  }, {
   "filename": "/data/tracks/xr591/acid_lake.jpg",
   "start": 81300912,
   "end": 81392961
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_5.jpg",
   "start": 81392961,
   "end": 81484936
  }, {
   "filename": "/data/tracks/startrack/trak3_corrug1a.png",
   "start": 81484936,
   "end": 81576868
  }, {
   "filename": "/data/tracks/farm/cow.b3d",
   "start": 81576868,
   "end": 81668060
  }, {
   "filename": "/data/tracks/farm/cow_LOD120.b3d",
   "start": 81668060,
   "end": 81759248
  }, {
   "filename": "/data/tracks/zengarden/sakura_leaves.jpg",
   "start": 81759248,
   "end": 81850419
  }, {
   "filename": "/data/textures/blackrock.jpg",
   "start": 81850419,
   "end": 81941517
  }, {
   "filename": "/data/tracks/zengarden/japanRedWood.png",
   "start": 81941517,
   "end": 82032148
  }, {
   "filename": "/data/karts/elephpant/elephpant.b3dz",
   "start": 82032148,
   "end": 82122510
  }, {
   "filename": "/data/tracks/farm/wind_mill.png",
   "start": 82122510,
   "end": 82212708
  }, {
   "filename": "/data/tracks/hacienda/wind_mill.png",
   "start": 82212708,
   "end": 82302906
  }, {
   "filename": "/data/tracks/tutorial/wind_mill.png",
   "start": 82302906,
   "end": 82393104
  }, {
   "filename": "/data/textures/coniferous_tree.jpg",
   "start": 82393104,
   "end": 82483257
  }, {
   "filename": "/data/textures/roadway.png",
   "start": 82483257,
   "end": 82573221
  }, {
   "filename": "/data/karts/xfcemouse/skirt.png",
   "start": 82573221,
   "end": 82663142
  }, {
   "filename": "/data/textures/rockwall.jpg",
   "start": 82663142,
   "end": 82752976
  }, {
   "filename": "/data/tracks/snowtuxpeak/rockwall.jpg",
   "start": 82752976,
   "end": 82842810
  }, {
   "filename": "/data/tracks/startrack/lightmap_room_1.png",
   "start": 82842810,
   "end": 82932575
  }, {
   "filename": "/data/textures/deprecated/redwhite.png",
   "start": 82932575,
   "end": 83022221
  }, {
   "filename": "/data/gui/menu_addons_focus.png",
   "start": 83022221,
   "end": 83111329
  }, {
   "filename": "/data/tracks/snowtuxpeak/snowroad.jpg",
   "start": 83111329,
   "end": 83200230
  }, {
   "filename": "/data/textures/crate1_diffuseBIS.jpg",
   "start": 83200230,
   "end": 83289037
  }, {
   "filename": "/data/tracks/mines/crate1_diffuseBIS.jpg",
   "start": 83289037,
   "end": 83377844
  }, {
   "filename": "/data/tracks/islandtrack/road_sand_side.jpg",
   "start": 83377844,
   "end": 83466590
  }, {
   "filename": "/data/tracks/scotland/Factory4b.png",
   "start": 83466590,
   "end": 83554468
  }, {
   "filename": "/data/models/jump-bomb.jpg",
   "start": 83554468,
   "end": 83642316
  }, {
   "filename": "/data/tracks/fortmagma/zipper.png",
   "start": 83642316,
   "end": 83729762
  }, {
   "filename": "/data/tracks/lighthouse/rope.png",
   "start": 83729762,
   "end": 83817208
  }, {
   "filename": "/data/tracks/mines/rope.png",
   "start": 83817208,
   "end": 83904654
  }, {
   "filename": "/data/tracks/farm/scene.xml",
   "start": 83904654,
   "end": 83991993
  }, {
   "filename": "/data/sfx/clock.ogg",
   "start": 83991993,
   "end": 84079324,
   "audio": 1
  }, {
   "filename": "/data/tracks/fortmagma/blackrock_lava.jpg",
   "start": 84079324,
   "end": 84166596
  }, {
   "filename": "/data/textures/coniferous_tree_alpha.jpg",
   "start": 84166596,
   "end": 84253799
  }, {
   "filename": "/data/tracks/hacienda/grass.png",
   "start": 84253799,
   "end": 84340912
  }, {
   "filename": "/data/tracks/tutorial/grass.png",
   "start": 84340912,
   "end": 84428025
  }, {
   "filename": "/data/gui/menu_addons.png",
   "start": 84428025,
   "end": 84515072
  }, {
   "filename": "/data/tracks/mansion/grass2.jpg",
   "start": 84515072,
   "end": 84601909
  }, {
   "filename": "/data/tracks/mansion/road_mansion.jpg",
   "start": 84601909,
   "end": 84688552
  }, {
   "filename": "/data/tracks/subsea/meat1.jpg",
   "start": 84688552,
   "end": 84775183
  }, {
   "filename": "/data/tracks/snowmountain/rockmountain.png",
   "start": 84775183,
   "end": 84861785
  }, {
   "filename": "/data/karts/adiumy/egg.jpg",
   "start": 84861785,
   "end": 84948323
  }, {
   "filename": "/data/tracks/hacienda/zipper.png",
   "start": 84948323,
   "end": 85034705
  }, {
   "filename": "/data/tracks/tutorial/zipper.png",
   "start": 85034705,
   "end": 85121087
  }, {
   "filename": "/data/po/el.po",
   "start": 85121087,
   "end": 85207430
  }, {
   "filename": "/data/po/ru.po",
   "start": 85207430,
   "end": 85293598
  }, {
   "filename": "/data/tracks/greenvalley/Flower5.png",
   "start": 85293598,
   "end": 85379691
  }, {
   "filename": "/data/textures/city_tree_leaves.jpg",
   "start": 85379691,
   "end": 85465617
  }, {
   "filename": "/data/models/trophy_bronze.b3d",
   "start": 85465617,
   "end": 85551460
  }, {
   "filename": "/data/models/trophy_silver.b3d",
   "start": 85551460,
   "end": 85637303
  }, {
   "filename": "/data/models/trophy_gold.b3d",
   "start": 85637303,
   "end": 85723144
  }, {
   "filename": "/data/tracks/startrack/trak3_base1.png",
   "start": 85723144,
   "end": 85808940
  }, {
   "filename": "/data/tracks/overworld/bubble.png",
   "start": 85808940,
   "end": 85894694
  }, {
   "filename": "/data/textures/yellow_dirt.jpg",
   "start": 85894694,
   "end": 85979997
  }, {
   "filename": "/data/gui/skins/ocean/background.jpg",
   "start": 85979997,
   "end": 86065286
  }, {
   "filename": "/data/gui/skins/peach/background.jpg",
   "start": 86065286,
   "end": 86150575
  }, {
   "filename": "/data/textures/pino.png",
   "start": 86150575,
   "end": 86235719
  }, {
   "filename": "/data/textures/oakleaf_fall.png",
   "start": 86235719,
   "end": 86320670
  }, {
   "filename": "/data/karts/adiumy/adiumy.jpg",
   "start": 86320670,
   "end": 86405559
  }, {
   "filename": "/data/textures/sakura_leaves.jpg",
   "start": 86405559,
   "end": 86489829
  }, {
   "filename": "/data/textures/racetrack_tire.png",
   "start": 86489829,
   "end": 86574051
  }, {
   "filename": "/data/tracks/sandtrack/sshot-sandtrack.jpg",
   "start": 86574051,
   "end": 86658189
  }, {
   "filename": "/data/textures/rock1.jpg",
   "start": 86658189,
   "end": 86742255
  }, {
   "filename": "/data/textures/deprecated/concrete.png",
   "start": 86742255,
   "end": 86826193
  }, {
   "filename": "/data/textures/pino2.png",
   "start": 86826193,
   "end": 86910061
  }, {
   "filename": "/data/tracks/jungle/zipper_jungle.png",
   "start": 86910061,
   "end": 86993828
  }, {
   "filename": "/data/tracks/subsea/zipper-inverted-subsea.png",
   "start": 86993828,
   "end": 87077595
  }, {
   "filename": "/data/gui/menu_multi.png",
   "start": 87077595,
   "end": 87161178
  }, {
   "filename": "/data/po/sr.po",
   "start": 87161178,
   "end": 87244564
  }, {
   "filename": "/data/fonts/wqyMicroHei3.png",
   "start": 87244564,
   "end": 87327748
  }, {
   "filename": "/data/karts/sara/faceAO.png",
   "start": 87327748,
   "end": 87410922
  }, {
   "filename": "/data/textures/city_building_3.png",
   "start": 87410922,
   "end": 87494055
  }, {
   "filename": "/data/tracks/overworld/metaloverlap.png",
   "start": 87494055,
   "end": 87576981
  }, {
   "filename": "/data/po/bn.po",
   "start": 87576981,
   "end": 87659902
  }, {
   "filename": "/data/tracks/subsea/Poisson_Plane_1-subsea.jpg",
   "start": 87659902,
   "end": 87742629
  }, {
   "filename": "/data/tracks/scotland/brick1.png",
   "start": 87742629,
   "end": 87825154
  }, {
   "filename": "/data/textures/japanRedWood.png",
   "start": 87825154,
   "end": 87907442
  }, {
   "filename": "/data/tracks/fortmagma/Painting2.jpg",
   "start": 87907442,
   "end": 87989697
  }, {
   "filename": "/data/karts/sara/hairAO.png",
   "start": 87989697,
   "end": 88071925
  }, {
   "filename": "/data/tracks/mansion/pumpkin.png",
   "start": 88071925,
   "end": 88154103
  }, {
   "filename": "/data/tracks/lighthouse/roadRoundBrick.jpg",
   "start": 88154103,
   "end": 88235976
  }, {
   "filename": "/data/models/cake.png",
   "start": 88235976,
   "end": 88317707
  }, {
   "filename": "/data/tracks/zengarden/sunset_color.png",
   "start": 88317707,
   "end": 88399437
  }, {
   "filename": "/data/textures/tapis.png",
   "start": 88399437,
   "end": 88481147
  }, {
   "filename": "/data/textures/HortonStone6.jpg",
   "start": 88481147,
   "end": 88562444
  }, {
   "filename": "/data/fonts/wqyMicroHei2.png",
   "start": 88562444,
   "end": 88643582
  }, {
   "filename": "/data/sfx/break.ogg",
   "start": 88643582,
   "end": 88724693,
   "audio": 1
  }, {
   "filename": "/data/textures/purplenebula.jpg",
   "start": 88724693,
   "end": 88805616
  }, {
   "filename": "/data/sfx/track_intro.ogg",
   "start": 88805616,
   "end": 88886323,
   "audio": 1
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_1.jpg",
   "start": 88886323,
   "end": 88967020
  }, {
   "filename": "/data/textures/sakura_leaves_alpha.jpg",
   "start": 88967020,
   "end": 89047509
  }, {
   "filename": "/data/textures/oakbark.jpg",
   "start": 89047509,
   "end": 89127917
  }, {
   "filename": "/data/tracks/sandtrack/road.jpg",
   "start": 89127917,
   "end": 89207992
  }, {
   "filename": "/data/textures/palmtree3.jpg",
   "start": 89207992,
   "end": 89287801
  }, {
   "filename": "/data/gui/menu_race_focus.png",
   "start": 89287801,
   "end": 89366690
  }, {
   "filename": "/data/tracks/subsea/subsea-sshot.jpg",
   "start": 89366690,
   "end": 89445528
  }, {
   "filename": "/data/tracks/mines/mine_rail.jpg",
   "start": 89445528,
   "end": 89524085
  }, {
   "filename": "/data/po/uk.po",
   "start": 89524085,
   "end": 89602500
  }, {
   "filename": "/data/po/gd.po",
   "start": 89602500,
   "end": 89680755
  }, {
   "filename": "/data/textures/summersky_e.jpg",
   "start": 89680755,
   "end": 89758888
  }, {
   "filename": "/data/tracks/mansion/ghost.b3d",
   "start": 89758888,
   "end": 89836880
  }, {
   "filename": "/data/po/fr.po",
   "start": 89836880,
   "end": 89914829
  }, {
   "filename": "/data/po/es.po",
   "start": 89914829,
   "end": 89992720
  }, {
   "filename": "/data/tracks/snowtuxpeak/pillard_LOD70.b3d",
   "start": 89992720,
   "end": 89999980
  } ],
  "remote_package_size": 89999980,
  "package_uuid": "38e43625-ec82-4364-9673-7d45fa94d122"
 });
})();

var Module = typeof Module !== "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 if (Module["ENVIRONMENT_IS_PTHREAD"]) return;
 var loadPackage = function(metadata) {
  var PACKAGE_PATH = "";
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof process === "undefined" && typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  }
  var PACKAGE_NAME = "/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-04.data";
  var REMOTE_PACKAGE_BASE = "supertuxkart-assets-04.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
  var PACKAGE_UUID = metadata["package_uuid"];
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
    require("fs").readFile(packageName, function(err, contents) {
     if (err) {
      errback(err);
     } else {
      callback(contents.buffer);
     }
    });
    return;
   }
   var xhr = new XMLHttpRequest();
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + new Error().stack;
   }
   Module["FS_createPath"]("/", "data", true, true);
   Module["FS_createPath"]("/data", "gui", true, true);
   Module["FS_createPath"]("/data", "tracks", true, true);
   Module["FS_createPath"]("/data/tracks", "greenvalley", true, true);
   Module["FS_createPath"]("/data", "po", true, true);
   Module["FS_createPath"]("/data/tracks", "startrack", true, true);
   Module["FS_createPath"]("/data/tracks", "cave", true, true);
   Module["FS_createPath"]("/data/tracks", "city", true, true);
   Module["FS_createPath"]("/data/tracks", "snowmountain", true, true);
   Module["FS_createPath"]("/data/tracks", "mines", true, true);
   Module["FS_createPath"]("/data/tracks", "hacienda", true, true);
   Module["FS_createPath"]("/data/tracks", "tutorial", true, true);
   Module["FS_createPath"]("/data", "textures", true, true);
   Module["FS_createPath"]("/data/tracks", "xr591", true, true);
   Module["FS_createPath"]("/data", "karts", true, true);
   Module["FS_createPath"]("/data/karts", "sara", true, true);
   Module["FS_createPath"]("/data", "models", true, true);
   Module["FS_createPath"]("/data", "fonts", true, true);
   Module["FS_createPath"]("/data/tracks", "zengarden", true, true);
   Module["FS_createPath"]("/data/tracks", "lighthouse", true, true);
   Module["FS_createPath"]("/data/tracks", "farm", true, true);
   Module["FS_createPath"]("/data/tracks", "mansion", true, true);
   Module["FS_createPath"]("/data/textures", "deprecated", true, true);
   Module["FS_createPath"]("/data/tracks", "overworld", true, true);
   Module["FS_createPath"]("/data/tracks", "islandtrack", true, true);
   Module["FS_createPath"]("/data/tracks", "scotland", true, true);
   Module["FS_createPath"]("/data/tracks", "subsea", true, true);
   Module["FS_createPath"]("/data/tracks", "minigolf", true, true);
   Module["FS_createPath"]("/data/tracks", "fortmagma", true, true);
   Module["FS_createPath"]("/data", "sfx", true, true);
   Module["FS_createPath"]("/data/gui", "skins", true, true);
   Module["FS_createPath"]("/data/gui/skins", "ocean", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene", true, true);
   Module["FS_createPath"]("/data/tracks", "snowtuxpeak", true, true);
   Module["FS_createPath"]("/data/tracks", "olivermath", true, true);
   Module["FS_createPath"]("/data/tracks", "introcutscene2", true, true);
   Module["FS_createPath"]("/data/karts", "emule", true, true);
   Module["FS_createPath"]("/data/tracks", "endcutscene", true, true);
   Module["FS_createPath"]("/data/tracks", "sandtrack", true, true);
   Module["FS_createPath"]("/data/tracks", "soccer_field", true, true);
   Module["FS_createPath"]("/data/tracks", "stadium", true, true);
   Module["FS_createPath"]("/data/karts", "xfcemouse", true, true);
   Module["FS_createPath"]("/data/karts", "beastie", true, true);
   Module["FS_createPath"]("/data/gui/skins", "peach", true, true);
   Module["FS_createPath"]("/data/karts", "konqi", true, true);
   Module["FS_createPath"]("/data/tracks", "jungle", true, true);
   Module["FS_createPath"]("/data/karts", "suzanne", true, true);
   Module["FS_createPath"]("/data/karts", "tux", true, true);
   Module["FS_createPath"]("/data/karts", "pidgin", true, true);
   Module["FS_createPath"]("/data/tracks", "battleisland", true, true);
   Module["FS_createPath"]("/data/karts", "nolok", true, true);
   Module["FS_createPath"]("/data/karts", "beagle", true, true);
   Module["FS_createPath"]("/data/karts", "elephpant", true, true);
   Module["FS_createPath"]("/data/karts", "adiumy", true, true);
   Module["FS_createPath"]("/data/karts", "puffy", true, true);
   Module["FS_createPath"]("/data/karts", "hexley", true, true);
   Module["FS_createPath"]("/data/karts", "gnu", true, true);
   Module["FS_createPath"]("/data/karts", "wilber", true, true);
   Module["FS_createPath"]("/data", "shaders", true, true);
   Module["FS_createPath"]("/data", "music", true, true);
   Module["FS_createPath"]("/data", "gfx", true, true);
   Module["FS_createPath"]("/data", "challenges", true, true);
   Module["FS_createPath"]("/data", "grandprix", true, true);
   function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    }
   };
   var files = metadata["files"];
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i]["start"], files[i]["end"], files[i]["audio"] || 0).open("GET", files[i]["filename"]);
   }
   function processPackageData(arrayBuffer) {
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    DataRequest.prototype.byteArray = byteArray;
    var files = metadata["files"];
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-04.data");
   }
   Module["addRunDependency"]("datafile_/workspaces/SuperTuxKart-0.8.1-WASM-Edition/Web/supertuxkart-assets-04.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "filename": "/data/gui/menu_race.png",
   "start": 0,
   "end": 77858
  }, {
   "filename": "/data/tracks/greenvalley/Fern-6.png",
   "start": 77858,
   "end": 155649
  }, {
   "filename": "/data/po/de.po",
   "start": 155649,
   "end": 233324
  }, {
   "filename": "/data/tracks/startrack/planet_earth1.jpg",
   "start": 233324,
   "end": 310918
  }, {
   "filename": "/data/tracks/cave/cavex_rock.jpg",
   "start": 310918,
   "end": 388419
  }, {
   "filename": "/data/tracks/city/tree_1_LOD150.b3d",
   "start": 388419,
   "end": 465733
  }, {
   "filename": "/data/po/vi.po",
   "start": 465733,
   "end": 542888
  }, {
   "filename": "/data/tracks/snowmountain/roadway2.png",
   "start": 542888,
   "end": 619850
  }, {
   "filename": "/data/po/gl.po",
   "start": 619850,
   "end": 696777
  }, {
   "filename": "/data/tracks/mines/crate_explose.jpg",
   "start": 696777,
   "end": 773646
  }, {
   "filename": "/data/tracks/hacienda/sageBrush.jpg",
   "start": 773646,
   "end": 850477
  }, {
   "filename": "/data/tracks/tutorial/sageBrush.jpg",
   "start": 850477,
   "end": 927308
  }, {
   "filename": "/data/po/ja.po",
   "start": 927308,
   "end": 1003780
  }, {
   "filename": "/data/textures/pyramidwall.jpg",
   "start": 1003780,
   "end": 1079986
  }, {
   "filename": "/data/tracks/hacienda/sageBrush_alpha.jpg",
   "start": 1079986,
   "end": 1156134
  }, {
   "filename": "/data/tracks/tutorial/sageBrush_alpha.jpg",
   "start": 1156134,
   "end": 1232282
  }, {
   "filename": "/data/tracks/xr591/red_dirt.jpg",
   "start": 1232282,
   "end": 1308335
  }, {
   "filename": "/data/po/it.po",
   "start": 1308335,
   "end": 1384384
  }, {
   "filename": "/data/po/ca.po",
   "start": 1384384,
   "end": 1460361
  }, {
   "filename": "/data/karts/sara/bodyAO.png",
   "start": 1460361,
   "end": 1536330
  }, {
   "filename": "/data/models/balldimpleddark.jpg",
   "start": 1536330,
   "end": 1612292
  }, {
   "filename": "/data/fonts/wqyMicroHei4.png",
   "start": 1612292,
   "end": 1688215
  }, {
   "filename": "/data/tracks/city/city_asphalt_blend.jpg",
   "start": 1688215,
   "end": 1764047
  }, {
   "filename": "/data/po/br.po",
   "start": 1764047,
   "end": 1839843
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_4.jpg",
   "start": 1839843,
   "end": 1915438
  }, {
   "filename": "/data/tracks/cave/ground.jpg",
   "start": 1915438,
   "end": 1990998
  }, {
   "filename": "/data/models/stk_mod_nitroBottle.png",
   "start": 1990998,
   "end": 2066529
  }, {
   "filename": "/data/tracks/xr591/tube 1.b3d",
   "start": 2066529,
   "end": 2142009
  }, {
   "filename": "/data/tracks/xr591/tube 2.b3d",
   "start": 2142009,
   "end": 2217489
  }, {
   "filename": "/data/tracks/startrack/concrete_plain.png",
   "start": 2217489,
   "end": 2292871
  }, {
   "filename": "/data/po/nl.po",
   "start": 2292871,
   "end": 2368158
  }, {
   "filename": "/data/tracks/zengarden/skybox_sunset.b3d",
   "start": 2368158,
   "end": 2443388
  }, {
   "filename": "/data/tracks/zengarden/skybox_1.b3d",
   "start": 2443388,
   "end": 2518611
  }, {
   "filename": "/data/po/pl.po",
   "start": 2518611,
   "end": 2593766
  }, {
   "filename": "/data/po/sl.po",
   "start": 2593766,
   "end": 2668875
  }, {
   "filename": "/data/po/tr.po",
   "start": 2668875,
   "end": 2743892
  }, {
   "filename": "/data/textures/summersky_s.jpg",
   "start": 2743892,
   "end": 2818909
  }, {
   "filename": "/data/tracks/lighthouse/grass-anim_death.png",
   "start": 2818909,
   "end": 2893921
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_2.jpg",
   "start": 2893921,
   "end": 2968766
  }, {
   "filename": "/data/po/ar.po",
   "start": 2968766,
   "end": 3043398
  }, {
   "filename": "/data/textures/canyon.jpg",
   "start": 3043398,
   "end": 3117960
  }, {
   "filename": "/data/tracks/farm/earth.jpg",
   "start": 3117960,
   "end": 3192420
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_3.jpg",
   "start": 3192420,
   "end": 3266879
  }, {
   "filename": "/data/tracks/lighthouse/bigTerrainChunk.b3d",
   "start": 3266879,
   "end": 3341331
  }, {
   "filename": "/data/tracks/mansion/well.O.jpg",
   "start": 3341331,
   "end": 3415770
  }, {
   "filename": "/data/gui/menu_multi_focus.png",
   "start": 3415770,
   "end": 3490176
  }, {
   "filename": "/data/textures/deprecated/dirt.png",
   "start": 3490176,
   "end": 3564547
  }, {
   "filename": "/data/tracks/hacienda/zipper-effect.png",
   "start": 3564547,
   "end": 3638904
  }, {
   "filename": "/data/tracks/tutorial/zipper-effect.png",
   "start": 3638904,
   "end": 3713261
  }, {
   "filename": "/data/po/fi.po",
   "start": 3713261,
   "end": 3787564
  }, {
   "filename": "/data/karts/sara/darkblueMetal.png",
   "start": 3787564,
   "end": 3861770
  }, {
   "filename": "/data/po/eu.po",
   "start": 3861770,
   "end": 3935891
  }, {
   "filename": "/data/po/pt.po",
   "start": 3935891,
   "end": 4010012
  }, {
   "filename": "/data/po/zh_CN.po",
   "start": 4010012,
   "end": 4083879
  }, {
   "filename": "/data/po/hu.po",
   "start": 4083879,
   "end": 4157723
  }, {
   "filename": "/data/textures/sky2.jpg",
   "start": 4157723,
   "end": 4231502
  }, {
   "filename": "/data/po/id.po",
   "start": 4231502,
   "end": 4305268
  }, {
   "filename": "/data/po/cs.po",
   "start": 4305268,
   "end": 4378945
  }, {
   "filename": "/data/po/he.po",
   "start": 4378945,
   "end": 4452573
  }, {
   "filename": "/data/textures/sea2.jpg",
   "start": 4452573,
   "end": 4526179
  }, {
   "filename": "/data/tracks/overworld/sea.jpg",
   "start": 4526179,
   "end": 4599785
  }, {
   "filename": "/data/tracks/islandtrack/rock4.jpg",
   "start": 4599785,
   "end": 4673380
  }, {
   "filename": "/data/models/gift-box.png",
   "start": 4673380,
   "end": 4746972
  }, {
   "filename": "/data/tracks/scotland/HortonStone7.jpg",
   "start": 4746972,
   "end": 4820535
  }, {
   "filename": "/data/models/thunderbird.png",
   "start": 4820535,
   "end": 4894082
  }, {
   "filename": "/data/tracks/farm/hay.jpg",
   "start": 4894082,
   "end": 4967604
  }, {
   "filename": "/data/po/pt_BR.po",
   "start": 4967604,
   "end": 5041093
  }, {
   "filename": "/data/fonts/wqyMicroHei1.png",
   "start": 5041093,
   "end": 5114543
  }, {
   "filename": "/data/tracks/subsea/Segment4.b3d",
   "start": 5114543,
   "end": 5187915
  }, {
   "filename": "/data/tracks/minigolf/foliage.png",
   "start": 5187915,
   "end": 5261232
  }, {
   "filename": "/data/tracks/startrack/grate1a.jpg",
   "start": 5261232,
   "end": 5334539
  }, {
   "filename": "/data/tracks/fortmagma/lava_1.jpg",
   "start": 5334539,
   "end": 5407782
  }, {
   "filename": "/data/tracks/snowmountain/snow2.png",
   "start": 5407782,
   "end": 5481020
  }, {
   "filename": "/data/tracks/cave/bison.png",
   "start": 5481020,
   "end": 5554247
  }, {
   "filename": "/data/tracks/subsea/chest_mound_hi.b3d",
   "start": 5554247,
   "end": 5627347
  }, {
   "filename": "/data/po/lt.po",
   "start": 5627347,
   "end": 5700356
  }, {
   "filename": "/data/tracks/hacienda/well.O.jpg",
   "start": 5700356,
   "end": 5773325
  }, {
   "filename": "/data/tracks/tutorial/well.O.jpg",
   "start": 5773325,
   "end": 5846294
  }, {
   "filename": "/data/po/nn.po",
   "start": 5846294,
   "end": 5919050
  }, {
   "filename": "/data/tracks/overworld/column_normal_map.png",
   "start": 5919050,
   "end": 5991737
  }, {
   "filename": "/data/po/zh_TW.po",
   "start": 5991737,
   "end": 6064415
  }, {
   "filename": "/data/tracks/startrack/concrete_plain_dark.png",
   "start": 6064415,
   "end": 6136812
  }, {
   "filename": "/data/tracks/fortmagma/mansion_windows.png",
   "start": 6136812,
   "end": 6209089
  }, {
   "filename": "/data/tracks/mansion/mansion_windows.png",
   "start": 6209089,
   "end": 6281366
  }, {
   "filename": "/data/tracks/xr591/stars.jpg",
   "start": 6281366,
   "end": 6352901
  }, {
   "filename": "/data/sfx/last_lap_fanfare.ogg",
   "start": 6352901,
   "end": 6424300,
   "audio": 1
  }, {
   "filename": "/data/gui/skins/ocean/bubble.png",
   "start": 6424300,
   "end": 6495463
  }, {
   "filename": "/data/textures/canyon_dirt_road.jpg",
   "start": 6495463,
   "end": 6566608
  }, {
   "filename": "/data/po/sv.po",
   "start": 6566608,
   "end": 6637530
  }, {
   "filename": "/data/po/nb.po",
   "start": 6637530,
   "end": 6708001
  }, {
   "filename": "/data/tracks/zengarden/lanternsupport.jpg",
   "start": 6708001,
   "end": 6777553
  }, {
   "filename": "/data/textures/cottage_wall2.jpg",
   "start": 6777553,
   "end": 6847030
  }, {
   "filename": "/data/tracks/introcutscene/roadRoundBrick.jpg",
   "start": 6847030,
   "end": 6916341
  }, {
   "filename": "/data/tracks/zengarden/roadRoundBrick.jpg",
   "start": 6916341,
   "end": 6985652
  }, {
   "filename": "/data/po/ky.po",
   "start": 6985652,
   "end": 7054816
  }, {
   "filename": "/data/tracks/startrack/base1c.jpg",
   "start": 7054816,
   "end": 7123975
  }, {
   "filename": "/data/sfx/gp_end.ogg",
   "start": 7123975,
   "end": 7193129,
   "audio": 1
  }, {
   "filename": "/data/tracks/fortmagma/painting1.jpg",
   "start": 7193129,
   "end": 7261989
  }, {
   "filename": "/data/po/hr.po",
   "start": 7261989,
   "end": 7330692
  }, {
   "filename": "/data/gui/menu_story_focus.png",
   "start": 7330692,
   "end": 7399327
  }, {
   "filename": "/data/tracks/startrack/pipe1a.jpg",
   "start": 7399327,
   "end": 7467811
  }, {
   "filename": "/data/po/sk.po",
   "start": 7467811,
   "end": 7536208
  }, {
   "filename": "/data/tracks/greenvalley/Bush.png",
   "start": 7536208,
   "end": 7604429
  }, {
   "filename": "/data/tracks/subsea/meat2.jpg",
   "start": 7604429,
   "end": 7672513
  }, {
   "filename": "/data/textures/sky3.jpg",
   "start": 7672513,
   "end": 7740543
  }, {
   "filename": "/data/textures/wall_rock.png",
   "start": 7740543,
   "end": 7808568
  }, {
   "filename": "/data/tracks/zengarden/screenshot.jpg",
   "start": 7808568,
   "end": 7876328
  }, {
   "filename": "/data/tracks/snowmountain/Balloon.b3d",
   "start": 7876328,
   "end": 7944026
  }, {
   "filename": "/data/tracks/lighthouse/pine_tree_lod_medium.b3d",
   "start": 7944026,
   "end": 8011623
  }, {
   "filename": "/data/tracks/city/city_reflection.png",
   "start": 8011623,
   "end": 8079073
  }, {
   "filename": "/data/textures/city_ground.jpg",
   "start": 8079073,
   "end": 8145962
  }, {
   "filename": "/data/tracks/greenvalley/BlackEyedSusan.png",
   "start": 8145962,
   "end": 8212681
  }, {
   "filename": "/data/tracks/overworld/Mushroom 2 side.png",
   "start": 8212681,
   "end": 8278625
  }, {
   "filename": "/data/models/bubblegum-icon.png",
   "start": 8278625,
   "end": 8344562
  }, {
   "filename": "/data/models/shield-icon.png",
   "start": 8344562,
   "end": 8410499
  }, {
   "filename": "/data/tracks/snowtuxpeak/sshot-snowtuxpeak.jpg",
   "start": 8410499,
   "end": 8476093
  }, {
   "filename": "/data/po/ga.po",
   "start": 8476093,
   "end": 8541584
  }, {
   "filename": "/data/tracks/introcutscene/lanternsupport.jpg",
   "start": 8541584,
   "end": 8607014
  }, {
   "filename": "/data/tracks/overworld/Mint.png",
   "start": 8607014,
   "end": 8672290
  }, {
   "filename": "/data/tracks/olivermath/mathclassceiling.png",
   "start": 8672290,
   "end": 8737542
  }, {
   "filename": "/data/gui/menu_story.png",
   "start": 8737542,
   "end": 8802540
  }, {
   "filename": "/data/po/bg.po",
   "start": 8802540,
   "end": 8867328
  }, {
   "filename": "/data/textures/concrete_plain.png",
   "start": 8867328,
   "end": 8931757
  }, {
   "filename": "/data/textures/purplenebula2.png",
   "start": 8931757,
   "end": 8996143
  }, {
   "filename": "/data/tracks/city/city_conveyor.png",
   "start": 8996143,
   "end": 9060389
  }, {
   "filename": "/data/fonts/wqyMicroHei0.png",
   "start": 9060389,
   "end": 9124172
  }, {
   "filename": "/data/tracks/mansion/screenshot.jpg",
   "start": 9124172,
   "end": 9187865
  }, {
   "filename": "/data/textures/city_grass.png",
   "start": 9187865,
   "end": 9251539
  }, {
   "filename": "/data/tracks/zengarden/pagoda1_LOD200.b3d",
   "start": 9251539,
   "end": 9315149
  }, {
   "filename": "/data/tracks/fortmagma/blackrock.jpg",
   "start": 9315149,
   "end": 9378511
  }, {
   "filename": "/data/tracks/overworld/blackrock.jpg",
   "start": 9378511,
   "end": 9441873
  }, {
   "filename": "/data/models/shroom_color_a.png",
   "start": 9441873,
   "end": 9505057
  }, {
   "filename": "/data/tracks/mansion/shroom_color_a.png",
   "start": 9505057,
   "end": 9568241
  }, {
   "filename": "/data/textures/woodBridge.jpg",
   "start": 9568241,
   "end": 9631358
  }, {
   "filename": "/data/tracks/fortmagma/woodBridge-subsea.jpg",
   "start": 9631358,
   "end": 9694475
  }, {
   "filename": "/data/tracks/mansion/woodBridge-subsea.jpg",
   "start": 9694475,
   "end": 9757592
  }, {
   "filename": "/data/tracks/subsea/woodBridge-subsea.jpg",
   "start": 9757592,
   "end": 9820709
  }, {
   "filename": "/data/po/en_GB.po",
   "start": 9820709,
   "end": 9883785
  }, {
   "filename": "/data/tracks/greenvalley/BurdockLeaf.png",
   "start": 9883785,
   "end": 9946526
  }, {
   "filename": "/data/tracks/overworld/BurdockLeaf.png",
   "start": 9946526,
   "end": 10009267
  }, {
   "filename": "/data/tracks/fortmagma/iron-fence.png",
   "start": 10009267,
   "end": 10071709
  }, {
   "filename": "/data/tracks/mansion/iron-fence.png",
   "start": 10071709,
   "end": 10134151
  }, {
   "filename": "/data/po/en_AU.po",
   "start": 10134151,
   "end": 10196219
  }, {
   "filename": "/data/tracks/mansion/hacienda_ground.jpg",
   "start": 10196219,
   "end": 10258271
  }, {
   "filename": "/data/po/fr_CA.po",
   "start": 10258271,
   "end": 10320240
  }, {
   "filename": "/data/tracks/startrack/tile3b.jpg",
   "start": 10320240,
   "end": 10382112
  }, {
   "filename": "/data/tracks/introcutscene/spaceship_engine.ogg",
   "start": 10382112,
   "end": 10443782,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene2/spaceship.ogg",
   "start": 10443782,
   "end": 10505452,
   "audio": 1
  }, {
   "filename": "/data/po/supertuxkart.pot",
   "start": 10505452,
   "end": 10566876
  }, {
   "filename": "/data/karts/emule/emule_kart.jpg",
   "start": 10566876,
   "end": 10628220
  }, {
   "filename": "/data/textures/ice.png",
   "start": 10628220,
   "end": 10689564
  }, {
   "filename": "/data/textures/sky.jpg",
   "start": 10689564,
   "end": 10750445
  }, {
   "filename": "/data/tracks/snowtuxpeak/sky.jpg",
   "start": 10750445,
   "end": 10811326
  }, {
   "filename": "/data/tracks/subsea/sky-subsea.jpg",
   "start": 10811326,
   "end": 10872207
  }, {
   "filename": "/data/textures/hacienda_ground.jpg",
   "start": 10872207,
   "end": 10933016
  }, {
   "filename": "/data/tracks/farm/horse.jpg",
   "start": 10933016,
   "end": 10993620
  }, {
   "filename": "/data/tracks/mines/metal_rusted_lamp.jpg",
   "start": 10993620,
   "end": 11054084
  }, {
   "filename": "/data/models/shroom_color2.png",
   "start": 11054084,
   "end": 11114439
  }, {
   "filename": "/data/tracks/overworld/bubble_desert2.b3d",
   "start": 11114439,
   "end": 11174789
  }, {
   "filename": "/data/tracks/zengarden/roadBoard.png",
   "start": 11174789,
   "end": 11235091
  }, {
   "filename": "/data/tracks/xr591/canyon-red.jpg",
   "start": 11235091,
   "end": 11295344
  }, {
   "filename": "/data/tracks/endcutscene/endcutscene_track.b3d",
   "start": 11295344,
   "end": 11355459
  }, {
   "filename": "/data/tracks/xr591/window.png",
   "start": 11355459,
   "end": 11415514
  }, {
   "filename": "/data/tracks/farm/trail.jpg",
   "start": 11415514,
   "end": 11475439
  }, {
   "filename": "/data/tracks/zengarden/skylantern_group.b3d",
   "start": 11475439,
   "end": 11535281
  }, {
   "filename": "/data/textures/cottage_wall3.jpg",
   "start": 11535281,
   "end": 11595038
  }, {
   "filename": "/data/textures/racetrack_wall.jpg",
   "start": 11595038,
   "end": 11654650
  }, {
   "filename": "/data/tracks/greenvalley/Flower3.png",
   "start": 11654650,
   "end": 11714217
  }, {
   "filename": "/data/tracks/farm/farm.jpg",
   "start": 11714217,
   "end": 11773726
  }, {
   "filename": "/data/tracks/fortmagma/zipper_effect.png",
   "start": 11773726,
   "end": 11833231
  }, {
   "filename": "/data/karts/sara/shoesAO.png",
   "start": 11833231,
   "end": 11892631
  }, {
   "filename": "/data/tracks/xr591/redrock.jpg",
   "start": 11892631,
   "end": 11951829
  }, {
   "filename": "/data/tracks/sandtrack/texture_egypte.jpg",
   "start": 11951829,
   "end": 12010906
  }, {
   "filename": "/data/tracks/overworld/LeftDoorOpen.b3d",
   "start": 12010906,
   "end": 12069875
  }, {
   "filename": "/data/tracks/overworld/RightDoorOpen.b3d",
   "start": 12069875,
   "end": 12128844
  }, {
   "filename": "/data/tracks/overworld/LeftDoorClosed.b3d",
   "start": 12128844,
   "end": 12187809
  }, {
   "filename": "/data/tracks/overworld/RightDoorClosed.b3d",
   "start": 12187809,
   "end": 12246774
  }, {
   "filename": "/data/tracks/introcutscene/light.png",
   "start": 12246774,
   "end": 12305710
  }, {
   "filename": "/data/tracks/overworld/light.png",
   "start": 12305710,
   "end": 12364573
  }, {
   "filename": "/data/textures/castelwall.jpg",
   "start": 12364573,
   "end": 12423146
  }, {
   "filename": "/data/tracks/fortmagma/castelwall.jpg",
   "start": 12423146,
   "end": 12481719
  }, {
   "filename": "/data/tracks/hacienda/hacienda_ground_dark.jpg",
   "start": 12481719,
   "end": 12540292
  }, {
   "filename": "/data/tracks/tutorial/hacienda_ground_dark.jpg",
   "start": 12540292,
   "end": 12598865
  }, {
   "filename": "/data/tracks/xr591/glass.png",
   "start": 12598865,
   "end": 12656824
  }, {
   "filename": "/data/tracks/soccer_field/racetrack_stadium.jpg",
   "start": 12656824,
   "end": 12714704
  }, {
   "filename": "/data/tracks/stadium/racetrack_stadium.jpg",
   "start": 12714704,
   "end": 12772584
  }, {
   "filename": "/data/tracks/overworld/FieldPlant2.png",
   "start": 12772584,
   "end": 12830242
  }, {
   "filename": "/data/tracks/islandtrack/sshot-islandtrack.jpg",
   "start": 12830242,
   "end": 12887857
  }, {
   "filename": "/data/tracks/stadium/racetrack_board.png",
   "start": 12887857,
   "end": 12945051
  }, {
   "filename": "/data/textures/palmtree3_alpha.jpg",
   "start": 12945051,
   "end": 13002236
  }, {
   "filename": "/data/tracks/snowtuxpeak/snowoodbridge.jpg",
   "start": 13002236,
   "end": 13059418
  }, {
   "filename": "/data/tracks/introcutscene2/scene.xml",
   "start": 13059418,
   "end": 13116373
  }, {
   "filename": "/data/tracks/lighthouse/light-1.png",
   "start": 13116373,
   "end": 13173163
  }, {
   "filename": "/data/tracks/xr591/light-1.png",
   "start": 13173163,
   "end": 13229953
  }, {
   "filename": "/data/tracks/introcutscene/lamps.b3d",
   "start": 13229953,
   "end": 13286518
  }, {
   "filename": "/data/tracks/farm/aoMapGoatv3.jpg",
   "start": 13286518,
   "end": 13342703
  }, {
   "filename": "/data/tracks/overworld/aoMapGoatv3.jpg",
   "start": 13342703,
   "end": 13398888
  }, {
   "filename": "/data/tracks/city/quads.xml",
   "start": 13398888,
   "end": 13455066
  }, {
   "filename": "/data/tracks/lighthouse/screenshot.jpg",
   "start": 13455066,
   "end": 13511152
  }, {
   "filename": "/data/textures/slipstream.png",
   "start": 13511152,
   "end": 13567207
  }, {
   "filename": "/data/tracks/mines/scene.xml",
   "start": 13567207,
   "end": 13623202
  }, {
   "filename": "/data/tracks/subsea/Segment9.b3d",
   "start": 13623202,
   "end": 13679067
  }, {
   "filename": "/data/karts/sara/blueMetal.png",
   "start": 13679067,
   "end": 13734475
  }, {
   "filename": "/data/textures/track.png",
   "start": 13734475,
   "end": 13789686
  }, {
   "filename": "/data/tracks/zengarden/JapanwoodBridge.jpg",
   "start": 13789686,
   "end": 13843918
  }, {
   "filename": "/data/tracks/startrack/wall1b.jpg",
   "start": 13843918,
   "end": 13898119
  }, {
   "filename": "/data/tracks/mines/Circle.036_Circle.000.b3d",
   "start": 13898119,
   "end": 13952161
  }, {
   "filename": "/data/tracks/startrack/wall3b.jpg",
   "start": 13952161,
   "end": 14006041
  }, {
   "filename": "/data/tracks/lighthouse/grass-anim.png",
   "start": 14006041,
   "end": 14059627
  }, {
   "filename": "/data/tracks/overworld/crystal_ball.b3d",
   "start": 14059627,
   "end": 14113120
  }, {
   "filename": "/data/tracks/overworld/crystal_ball_tuto.b3d",
   "start": 14113120,
   "end": 14166613
  }, {
   "filename": "/data/tracks/startrack/ribs1a.jpg",
   "start": 14166613,
   "end": 14220063
  }, {
   "filename": "/data/sfx/car_revup.ogg",
   "start": 14220063,
   "end": 14273435,
   "audio": 1
  }, {
   "filename": "/data/tracks/stadium/racetrack_curbs.jpg",
   "start": 14273435,
   "end": 14326466
  }, {
   "filename": "/data/fonts/StkFont.xml",
   "start": 14326466,
   "end": 14379470
  }, {
   "filename": "/data/tracks/farm/tail.png",
   "start": 14379470,
   "end": 14432334
  }, {
   "filename": "/data/karts/xfcemouse/mouse_texture.png",
   "start": 14432334,
   "end": 14485137
  }, {
   "filename": "/data/tracks/greenvalley/waterfall.png",
   "start": 14485137,
   "end": 14537871
  }, {
   "filename": "/data/textures/palm.png",
   "start": 14537871,
   "end": 14590409
  }, {
   "filename": "/data/tracks/mansion/road_cave_to_grass.jpg",
   "start": 14590409,
   "end": 14642713
  }, {
   "filename": "/data/tracks/snowmountain/sshot-mountain.jpg",
   "start": 14642713,
   "end": 14694960
  }, {
   "filename": "/data/models/parachute.b3d",
   "start": 14694960,
   "end": 14747005
  }, {
   "filename": "/data/textures/palm_b.png",
   "start": 14747005,
   "end": 14799040
  }, {
   "filename": "/data/tracks/overworld/palm_b.png",
   "start": 14799040,
   "end": 14851075
  }, {
   "filename": "/data/models/gold.png",
   "start": 14851075,
   "end": 14902946
  }, {
   "filename": "/data/tracks/mines/crossbirdge.b3d",
   "start": 14902946,
   "end": 14954575
  }, {
   "filename": "/data/tracks/zengarden/tree_zen.jpg",
   "start": 14954575,
   "end": 15006096
  }, {
   "filename": "/data/tracks/zengarden/stoneLantern.b3d",
   "start": 15006096,
   "end": 15057410
  }, {
   "filename": "/data/models/Hammer.jpg",
   "start": 15057410,
   "end": 15107970
  }, {
   "filename": "/data/textures/tree_zen.jpg",
   "start": 15107970,
   "end": 15158298
  }, {
   "filename": "/data/tracks/lighthouse/tree_zen.jpg",
   "start": 15158298,
   "end": 15208626
  }, {
   "filename": "/data/tracks/mansion/tree_zen.jpg",
   "start": 15208626,
   "end": 15258954
  }, {
   "filename": "/data/textures/vegetation_1.png",
   "start": 15258954,
   "end": 15309209
  }, {
   "filename": "/data/tracks/zengarden/vegetation_1.png",
   "start": 15309209,
   "end": 15359464
  }, {
   "filename": "/data/tracks/fortmagma/canonBall.b3d",
   "start": 15359464,
   "end": 15409603
  }, {
   "filename": "/data/tracks/soccer_field/racetrack_sky.jpg",
   "start": 15409603,
   "end": 15459701
  }, {
   "filename": "/data/tracks/stadium/racetrack_sky.jpg",
   "start": 15459701,
   "end": 15509799
  }, {
   "filename": "/data/textures/city_tree.jpg",
   "start": 15509799,
   "end": 15559687
  }, {
   "filename": "/data/tracks/lighthouse/metal_rusted_circle.jpg",
   "start": 15559687,
   "end": 15609561
  }, {
   "filename": "/data/tracks/mines/metal_rusted_circle.jpg",
   "start": 15609561,
   "end": 15659435
  }, {
   "filename": "/data/tracks/overworld/metal_rusted_circle.jpg",
   "start": 15659435,
   "end": 15709309
  }, {
   "filename": "/data/tracks/farm/millstructure.png",
   "start": 15709309,
   "end": 15759075
  }, {
   "filename": "/data/tracks/hacienda/millstructure.png",
   "start": 15759075,
   "end": 15808841
  }, {
   "filename": "/data/tracks/tutorial/millstructure.png",
   "start": 15808841,
   "end": 15858607
  }, {
   "filename": "/data/karts/beastie/kart.png",
   "start": 15858607,
   "end": 15908201
  }, {
   "filename": "/data/textures/JapanwoodBridge.jpg",
   "start": 15908201,
   "end": 15957499
  }, {
   "filename": "/data/tracks/greenvalley/quads.xml",
   "start": 15957499,
   "end": 16006619
  }, {
   "filename": "/data/tracks/olivermath/mathclass.jpg",
   "start": 16006619,
   "end": 16055663
  }, {
   "filename": "/data/tracks/mansion/hacienda_ground_dark.jpg",
   "start": 16055663,
   "end": 16104671
  }, {
   "filename": "/data/tracks/overworld/door.JPG",
   "start": 16104671,
   "end": 16153608
  }, {
   "filename": "/data/tracks/cave/sky.jpg",
   "start": 16153608,
   "end": 16202532
  }, {
   "filename": "/data/tracks/farm/mill.png",
   "start": 16202532,
   "end": 16251212
  }, {
   "filename": "/data/tracks/hacienda/mill.png",
   "start": 16251212,
   "end": 16299892
  }, {
   "filename": "/data/tracks/tutorial/mill.png",
   "start": 16299892,
   "end": 16348572
  }, {
   "filename": "/data/tracks/endcutscene/scene.xml",
   "start": 16348572,
   "end": 16397231
  }, {
   "filename": "/data/tracks/mansion/Circle.026.b3d",
   "start": 16397231,
   "end": 16445871
  }, {
   "filename": "/data/tracks/subsea/treasure_map2-subsea.png",
   "start": 16445871,
   "end": 16494493
  }, {
   "filename": "/data/tracks/fortmagma/metal_rusted.jpg",
   "start": 16494493,
   "end": 16543007
  }, {
   "filename": "/data/tracks/mansion/metal_rusted.jpg",
   "start": 16543007,
   "end": 16591521
  }, {
   "filename": "/data/tracks/mines/metal_rusted.jpg",
   "start": 16591521,
   "end": 16640035
  }, {
   "filename": "/data/tracks/overworld/metal_rusted.jpg",
   "start": 16640035,
   "end": 16688549
  }, {
   "filename": "/data/textures/beige_bricks.jpg",
   "start": 16688549,
   "end": 16736877
  }, {
   "filename": "/data/fonts/Mplus2p_JP0.png",
   "start": 16736877,
   "end": 16784747
  }, {
   "filename": "/data/tracks/hacienda/tail.png",
   "start": 16784747,
   "end": 16832597
  }, {
   "filename": "/data/tracks/tutorial/tail.png",
   "start": 16832597,
   "end": 16880447
  }, {
   "filename": "/data/models/plunger.png",
   "start": 16880447,
   "end": 16928123
  }, {
   "filename": "/data/gui/skins/peach/bubble.png",
   "start": 16928123,
   "end": 16975789
  }, {
   "filename": "/data/tracks/greenvalley/Catail.png",
   "start": 16975789,
   "end": 17023364
  }, {
   "filename": "/data/fonts/AR_PL_SungtiL_GB0.png",
   "start": 17023364,
   "end": 17070919
  }, {
   "filename": "/data/tracks/mansion/jackolantern.png",
   "start": 17070919,
   "end": 17118406
  }, {
   "filename": "/data/tracks/overworld/pedestral_hi.b3d",
   "start": 17118406,
   "end": 17165653
  }, {
   "filename": "/data/tracks/scotland/sshot-scotland.jpg",
   "start": 17165653,
   "end": 17212808
  }, {
   "filename": "/data/tracks/xr591/mars_eye2.jpg",
   "start": 17212808,
   "end": 17259750
  }, {
   "filename": "/data/tracks/overworld/WhiteFlowerSkin.png",
   "start": 17259750,
   "end": 17306449
  }, {
   "filename": "/data/tracks/sandtrack/camel_col.jpg",
   "start": 17306449,
   "end": 17352587
  }, {
   "filename": "/data/karts/konqi/konqiV2 wheel texture.png",
   "start": 17352587,
   "end": 17398244
  }, {
   "filename": "/data/textures/palmBark.jpg",
   "start": 17398244,
   "end": 17443897
  }, {
   "filename": "/data/models/bubblegum-nolok.b3d",
   "start": 17443897,
   "end": 17489091
  }, {
   "filename": "/data/tracks/zengarden/Catail.png",
   "start": 17489091,
   "end": 17533917
  }, {
   "filename": "/data/tracks/mines/sshot-mines.jpg",
   "start": 17533917,
   "end": 17578272
  }, {
   "filename": "/data/tracks/hacienda/l_lampstruct0.png",
   "start": 17578272,
   "end": 17622491
  }, {
   "filename": "/data/tracks/tutorial/l_lampstruct0.png",
   "start": 17622491,
   "end": 17666710
  }, {
   "filename": "/data/tracks/introcutscene/Catail.png",
   "start": 17666710,
   "end": 17710852
  }, {
   "filename": "/data/models/reset-button.b3d",
   "start": 17710852,
   "end": 17754886
  }, {
   "filename": "/data/tracks/zengarden/tree_zenRed.jpg",
   "start": 17754886,
   "end": 17798827
  }, {
   "filename": "/data/gui/skins/peach/glass_iconhighlight_focus.png",
   "start": 17798827,
   "end": 17842577
  }, {
   "filename": "/data/fonts/LayneHansom0.png",
   "start": 17842577,
   "end": 17886227
  }, {
   "filename": "/data/tracks/farm/cow.ogg",
   "start": 17886227,
   "end": 17929864,
   "audio": 1
  }, {
   "filename": "/data/tracks/startrack/scene.xml",
   "start": 17929864,
   "end": 17973384
  }, {
   "filename": "/data/models/ball.jpg",
   "start": 17973384,
   "end": 18016844
  }, {
   "filename": "/data/tracks/overworld/rocket_lo.b3d",
   "start": 18016844,
   "end": 18060135
  }, {
   "filename": "/data/tracks/introcutscene/tree_zenRed.jpg",
   "start": 18060135,
   "end": 18103102
  }, {
   "filename": "/data/tracks/city/city_building_2.png",
   "start": 18103102,
   "end": 18146035
  }, {
   "filename": "/data/textures/tree_cut.jpg",
   "start": 18146035,
   "end": 18188861
  }, {
   "filename": "/data/tracks/xr591/sshot-marstrack.jpg",
   "start": 18188861,
   "end": 18231466
  }, {
   "filename": "/data/tracks/xr591/robot1_low.b3d",
   "start": 18231466,
   "end": 18274055
  }, {
   "filename": "/data/tracks/greenvalley/scene.xml",
   "start": 18274055,
   "end": 18316630
  }, {
   "filename": "/data/gui/skins/ocean/glass_iconhighlight_focus.png",
   "start": 18316630,
   "end": 18359161
  }, {
   "filename": "/data/tracks/zengarden/lightmap_fujii.png",
   "start": 18359161,
   "end": 18401597
  }, {
   "filename": "/data/tracks/overworld/Metal-plate.png",
   "start": 18401597,
   "end": 18443973
  }, {
   "filename": "/data/tracks/city/building_2.b3d",
   "start": 18443973,
   "end": 18486167
  }, {
   "filename": "/data/tracks/mansion/halo.png",
   "start": 18486167,
   "end": 18528339
  }, {
   "filename": "/data/tracks/xr591/halo.png",
   "start": 18528339,
   "end": 18570511
  }, {
   "filename": "/data/models/bubblegum.png",
   "start": 18570511,
   "end": 18612668
  }, {
   "filename": "/data/textures/toll_roof.png",
   "start": 18612668,
   "end": 18654676
  }, {
   "filename": "/data/tracks/city/city_screenshot.jpg",
   "start": 18654676,
   "end": 18696582
  }, {
   "filename": "/data/tracks/mines/woodbridge.b3d",
   "start": 18696582,
   "end": 18738447
  }, {
   "filename": "/data/tracks/xr591/curiosity.b3d",
   "start": 18738447,
   "end": 18780312
  }, {
   "filename": "/data/sfx/splash.ogg",
   "start": 18780312,
   "end": 18822041,
   "audio": 1
  }, {
   "filename": "/data/tracks/islandtrack/road_sand.jpg",
   "start": 18822041,
   "end": 18863659
  }, {
   "filename": "/data/tracks/stadium/quads.xml",
   "start": 18863659,
   "end": 18904966
  }, {
   "filename": "/data/tracks/fortmagma/scene.xml",
   "start": 18904966,
   "end": 18946102
  }, {
   "filename": "/data/models/banana.png",
   "start": 18946102,
   "end": 18987233
  }, {
   "filename": "/data/tracks/minigolf/arrow.png",
   "start": 18987233,
   "end": 19028274
  }, {
   "filename": "/data/tracks/jungle/bush.png",
   "start": 19028274,
   "end": 19069254
  }, {
   "filename": "/data/karts/sara/dressAO.png",
   "start": 19069254,
   "end": 19110176
  }, {
   "filename": "/data/textures/snow.png",
   "start": 19110176,
   "end": 19151062
  }, {
   "filename": "/data/tracks/subsea/treasuremap-subsea.png",
   "start": 19151062,
   "end": 19191924
  }, {
   "filename": "/data/tracks/farm/skull.b3d",
   "start": 19191924,
   "end": 19232540
  }, {
   "filename": "/data/tracks/farm/skull_LOD120.b3d",
   "start": 19232540,
   "end": 19273152
  }, {
   "filename": "/data/textures/marble.jpg",
   "start": 19273152,
   "end": 19313756
  }, {
   "filename": "/data/models/anchor.b3d",
   "start": 19313756,
   "end": 19354233
  }, {
   "filename": "/data/tracks/lighthouse/fence_chain.png",
   "start": 19354233,
   "end": 19394649
  }, {
   "filename": "/data/tracks/mines/fence_chain.png",
   "start": 19394649,
   "end": 19435065
  }, {
   "filename": "/data/tracks/fortmagma/castel.b3d",
   "start": 19435065,
   "end": 19475459
  }, {
   "filename": "/data/textures/plants_alpha.jpg",
   "start": 19475459,
   "end": 19515757
  }, {
   "filename": "/data/tracks/farm/corn.png",
   "start": 19515757,
   "end": 19555936
  }, {
   "filename": "/data/tracks/zengarden/fog.png",
   "start": 19555936,
   "end": 19596096
  }, {
   "filename": "/data/textures/deprecated/egypt.png",
   "start": 19596096,
   "end": 19636205
  }, {
   "filename": "/data/tracks/zengarden/sakuraPine.b3d",
   "start": 19636205,
   "end": 19676251
  }, {
   "filename": "/data/tracks/zengarden/sakuraPine_LOD45.b3d",
   "start": 19676251,
   "end": 19716297
  }, {
   "filename": "/data/tracks/overworld/bubble_sea2.b3d",
   "start": 19716297,
   "end": 19756167
  }, {
   "filename": "/data/models/swatter.png",
   "start": 19756167,
   "end": 19795984
  }, {
   "filename": "/data/models/bronze.png",
   "start": 19795984,
   "end": 19835581
  }, {
   "filename": "/data/tracks/subsea/Flower-subsea.png",
   "start": 19835581,
   "end": 19875048
  }, {
   "filename": "/data/karts/suzanne/Wheel.diffuse.jpg",
   "start": 19875048,
   "end": 19914406
  }, {
   "filename": "/data/tracks/subsea/submarine_lo.b3d",
   "start": 19914406,
   "end": 19953712
  }, {
   "filename": "/data/tracks/farm/barn_wall.jpg",
   "start": 19953712,
   "end": 19992964
  }, {
   "filename": "/data/sfx/skid.ogg",
   "start": 19992964,
   "end": 20032210,
   "audio": 1
  }, {
   "filename": "/data/textures/deprecated/lscales.png",
   "start": 20032210,
   "end": 20071423
  }, {
   "filename": "/data/models/christmas_hat.b3d",
   "start": 20071423,
   "end": 20110560
  }, {
   "filename": "/data/tracks/mansion/Plane.b3d",
   "start": 20110560,
   "end": 20149689
  }, {
   "filename": "/data/models/bubblegum_shield_nolok.b3d",
   "start": 20149689,
   "end": 20188729
  }, {
   "filename": "/data/tracks/zengarden/scene.xml",
   "start": 20188729,
   "end": 20227744
  }, {
   "filename": "/data/tracks/jungle/lighthouse_sky.png",
   "start": 20227744,
   "end": 20266693
  }, {
   "filename": "/data/tracks/introcutscene/introcutscene_track.b3d",
   "start": 20266693,
   "end": 20305543
  }, {
   "filename": "/data/tracks/subsea/quads.xml",
   "start": 20305543,
   "end": 20344206
  }, {
   "filename": "/data/tracks/zengarden/pagoda_wall.png",
   "start": 20344206,
   "end": 20382588
  }, {
   "filename": "/data/textures/greenice.png",
   "start": 20382588,
   "end": 20420866
  }, {
   "filename": "/data/tracks/zengarden/directionLantern_LOD75.b3d",
   "start": 20420866,
   "end": 20458887
  }, {
   "filename": "/data/tracks/zengarden/bridge_LOD50.b3d",
   "start": 20458887,
   "end": 20496852
  }, {
   "filename": "/data/tracks/farm/well60.b3d",
   "start": 20496852,
   "end": 20534746
  }, {
   "filename": "/data/tracks/farm/well_LOD75.b3d",
   "start": 20534746,
   "end": 20572636
  }, {
   "filename": "/data/tracks/xr591/electri.b3d",
   "start": 20572636,
   "end": 20610512
  }, {
   "filename": "/data/tracks/sandtrack/palm1.b3d",
   "start": 20610512,
   "end": 20648384
  }, {
   "filename": "/data/tracks/sandtrack/palm2.b3d",
   "start": 20648384,
   "end": 20686256
  }, {
   "filename": "/data/gui/karts.png",
   "start": 20686256,
   "end": 20723906
  }, {
   "filename": "/data/karts/sara/shoeHeel.png",
   "start": 20723906,
   "end": 20761316
  }, {
   "filename": "/data/tracks/overworld/bubble_sea1.b3d",
   "start": 20761316,
   "end": 20798714
  }, {
   "filename": "/data/tracks/subsea/chest_mound_lo.b3d",
   "start": 20798714,
   "end": 20836074
  }, {
   "filename": "/data/tracks/mansion/moon.png",
   "start": 20836074,
   "end": 20873432
  }, {
   "filename": "/data/tracks/mines/cart_2.b3d",
   "start": 20873432,
   "end": 20910675
  }, {
   "filename": "/data/tracks/city/tree_2_LOD500.b3d",
   "start": 20910675,
   "end": 20947669
  }, {
   "filename": "/data/tracks/overworld/tree_2_LOD500.b3d",
   "start": 20947669,
   "end": 20984663
  }, {
   "filename": "/data/models/nitrotank-big.b3d",
   "start": 20984663,
   "end": 21021628
  }, {
   "filename": "/data/sfx/engine_large.ogg",
   "start": 21021628,
   "end": 21058509,
   "audio": 1
  }, {
   "filename": "/data/tracks/overworld/skull.b3d",
   "start": 21058509,
   "end": 21095233
  }, {
   "filename": "/data/textures/brick.png",
   "start": 21095233,
   "end": 21131706
  }, {
   "filename": "/data/tracks/greenvalley/Flower5F.png",
   "start": 21131706,
   "end": 21168099
  }, {
   "filename": "/data/textures/waternormals2.jpg",
   "start": 21168099,
   "end": 21204369
  }, {
   "filename": "/data/tracks/startrack/stone.jpg",
   "start": 21204369,
   "end": 21240314
  }, {
   "filename": "/data/tracks/overworld/bubble_desert3.b3d",
   "start": 21240314,
   "end": 21276192
  }, {
   "filename": "/data/tracks/mansion/jackolanternLight.png",
   "start": 21276192,
   "end": 21312041
  }, {
   "filename": "/data/karts/konqi/KonqiV1-kartequipmenttexture.png",
   "start": 21312041,
   "end": 21347875
  }, {
   "filename": "/data/sfx/strike.ogg",
   "start": 21347875,
   "end": 21383363,
   "audio": 1
  }, {
   "filename": "/data/tracks/islandtrack/Water.b3d",
   "start": 21383363,
   "end": 21418644
  }, {
   "filename": "/data/tracks/scotland/Puffy_bar.png",
   "start": 21418644,
   "end": 21453910
  }, {
   "filename": "/data/models/cake.b3d",
   "start": 21453910,
   "end": 21489111
  }, {
   "filename": "/data/tracks/overworld/scene.xml",
   "start": 21489111,
   "end": 21524093
  }, {
   "filename": "/data/tracks/lighthouse/sea.png",
   "start": 21524093,
   "end": 21559026
  }, {
   "filename": "/data/tracks/subsea/organic_out-subsea.png",
   "start": 21559026,
   "end": 21593917
  }, {
   "filename": "/data/tracks/minigolf/Golfball.b3d",
   "start": 21593917,
   "end": 21628704
  }, {
   "filename": "/data/models/bowling.b3d",
   "start": 21628704,
   "end": 21663483
  }, {
   "filename": "/data/tracks/tutorial/metal_transfo.jpg",
   "start": 21663483,
   "end": 21698232
  }, {
   "filename": "/data/tracks/endcutscene/torch.png",
   "start": 21698232,
   "end": 21732926
  }, {
   "filename": "/data/tracks/fortmagma/torch.png",
   "start": 21732926,
   "end": 21767620
  }, {
   "filename": "/data/tracks/mansion/torch.png",
   "start": 21767620,
   "end": 21802314
  }, {
   "filename": "/data/supertuxkart.icns",
   "start": 21802314,
   "end": 21836947
  }, {
   "filename": "/data/tracks/subsea/Cube.012.b3d",
   "start": 21836947,
   "end": 21871537
  }, {
   "filename": "/data/tracks/city/seabed.jpg",
   "start": 21871537,
   "end": 21906080
  }, {
   "filename": "/data/tracks/fortmagma/lavaspike.001.b3d",
   "start": 21906080,
   "end": 21940507
  }, {
   "filename": "/data/tracks/endcutscene/metal.jpg",
   "start": 21940507,
   "end": 21974784
  }, {
   "filename": "/data/tracks/mansion/Circle.023.b3d",
   "start": 21974784,
   "end": 22008961
  }, {
   "filename": "/data/tracks/farm/barn_wall2.jpg",
   "start": 22008961,
   "end": 22043110
  }, {
   "filename": "/data/tracks/endcutscene/chain2.png",
   "start": 22043110,
   "end": 22077212
  }, {
   "filename": "/data/tracks/introcutscene/pagoda_wall.png",
   "start": 22077212,
   "end": 22111267
  }, {
   "filename": "/data/tracks/fortmagma/cannonAnim.b3d",
   "start": 22111267,
   "end": 22145233
  }, {
   "filename": "/data/models/bubblegum.b3d",
   "start": 22145233,
   "end": 22178932
  }, {
   "filename": "/data/tracks/zengarden/flower2.png",
   "start": 22178932,
   "end": 22212576
  }, {
   "filename": "/data/karts/emule/emule_wheels.jpg",
   "start": 22212576,
   "end": 22246103
  }, {
   "filename": "/data/tracks/mines/Rails.b3d",
   "start": 22246103,
   "end": 22279532
  }, {
   "filename": "/data/tracks/startrack/modern_mine_beam.png",
   "start": 22279532,
   "end": 22312947
  }, {
   "filename": "/data/textures/chrome2.png",
   "start": 22312947,
   "end": 22346346
  }, {
   "filename": "/data/tracks/overworld/frontTrees.b3d",
   "start": 22346346,
   "end": 22379536
  }, {
   "filename": "/data/sfx/locked.ogg",
   "start": 22379536,
   "end": 22412541,
   "audio": 1
  }, {
   "filename": "/data/tracks/jungle/jungle_wall.jpg",
   "start": 22412541,
   "end": 22445463
  }, {
   "filename": "/data/tracks/subsea/Requin-marteau-subsea.jpg",
   "start": 22445463,
   "end": 22478263
  }, {
   "filename": "/data/tracks/subsea/snowyrock-subsea.jpg",
   "start": 22478263,
   "end": 22510608
  }, {
   "filename": "/data/textures/nitro-particle.png",
   "start": 22510608,
   "end": 22542930
  }, {
   "filename": "/data/tracks/xr591/hot.ogg",
   "start": 22542930,
   "end": 22575179,
   "audio": 1
  }, {
   "filename": "/data/tracks/snowmountain/winter_sky_6.jpg",
   "start": 22575179,
   "end": 22607274
  }, {
   "filename": "/data/tracks/startrack/vertpanel2b.jpg",
   "start": 22607274,
   "end": 22639276
  }, {
   "filename": "/data/tracks/farm/trail2grass.jpg",
   "start": 22639276,
   "end": 22671231
  }, {
   "filename": "/data/sfx/thunder.ogg",
   "start": 22671231,
   "end": 22703132,
   "audio": 1
  }, {
   "filename": "/data/models/nitrotank-small.b3d",
   "start": 22703132,
   "end": 22734929
  }, {
   "filename": "/data/karts/konqi/konqi vehicle texture up1.png",
   "start": 22734929,
   "end": 22766713
  }, {
   "filename": "/data/models/bomb.b3d",
   "start": 22766713,
   "end": 22798474
  }, {
   "filename": "/data/tracks/startrack/babel-trim11c.jpg",
   "start": 22798474,
   "end": 22829912
  }, {
   "filename": "/data/tracks/zengarden/sakuraPine_LOD70.b3d",
   "start": 22829912,
   "end": 22861086
  }, {
   "filename": "/data/tracks/mansion/Mesh.012.b3d",
   "start": 22861086,
   "end": 22892254
  }, {
   "filename": "/data/textures/city_checker.png",
   "start": 22892254,
   "end": 22923406
  }, {
   "filename": "/data/tracks/mansion/star-sky.png",
   "start": 22923406,
   "end": 22954523
  }, {
   "filename": "/data/gui/gauge_full_bright.png",
   "start": 22954523,
   "end": 22985582
  }, {
   "filename": "/data/textures/summersky_t.jpg",
   "start": 22985582,
   "end": 23016436
  }, {
   "filename": "/data/tracks/hacienda/wood_i.png",
   "start": 23016436,
   "end": 23047199
  }, {
   "filename": "/data/tracks/tutorial/wood_i.png",
   "start": 23047199,
   "end": 23077962
  }, {
   "filename": "/data/karts/konqi/konqiV1-steertexture.png",
   "start": 23077962,
   "end": 23108666
  }, {
   "filename": "/data/tracks/endcutscene/WallPart.b3d",
   "start": 23108666,
   "end": 23139369
  }, {
   "filename": "/data/textures/bush2.png",
   "start": 23139369,
   "end": 23169943
  }, {
   "filename": "/data/tracks/subsea/Segment1.b3d",
   "start": 23169943,
   "end": 23200510
  }, {
   "filename": "/data/textures/deprecated/skyscraper2.png",
   "start": 23200510,
   "end": 23230993
  }, {
   "filename": "/data/tracks/introcutscene/spaceship_engine_short.ogg",
   "start": 23230993,
   "end": 23261425,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene2/spaceship_engine_short.ogg",
   "start": 23261425,
   "end": 23291857,
   "audio": 1
  }, {
   "filename": "/data/tracks/city/tree_1_LOD550.b3d",
   "start": 23291857,
   "end": 23322287
  }, {
   "filename": "/data/textures/nitro-metal.png",
   "start": 23322287,
   "end": 23352703
  }, {
   "filename": "/data/tracks/hacienda/wood_l.png",
   "start": 23352703,
   "end": 23383060
  }, {
   "filename": "/data/tracks/tutorial/wood_l.png",
   "start": 23383060,
   "end": 23413417
  }, {
   "filename": "/data/models/easter_egg-icon.png",
   "start": 23413417,
   "end": 23443763
  }, {
   "filename": "/data/tracks/overworld/crystal_ball_halo.png",
   "start": 23443763,
   "end": 23474076
  }, {
   "filename": "/data/sfx/energy_bar_full.ogg",
   "start": 23474076,
   "end": 23504279,
   "audio": 1
  }, {
   "filename": "/data/tracks/hacienda/hacienda_groundTodark.jpg",
   "start": 23504279,
   "end": 23534408
  }, {
   "filename": "/data/tracks/tutorial/hacienda_groundTodark.jpg",
   "start": 23534408,
   "end": 23564537
  }, {
   "filename": "/data/tracks/zengarden/waterlily.png",
   "start": 23564537,
   "end": 23594412
  }, {
   "filename": "/data/tracks/startrack/supp1k.png",
   "start": 23594412,
   "end": 23624252
  }, {
   "filename": "/data/tracks/farm/trail2earth.jpg",
   "start": 23624252,
   "end": 23654053
  }, {
   "filename": "/data/tracks/overworld/bubble_village2.b3d",
   "start": 23654053,
   "end": 23683850
  }, {
   "filename": "/data/tracks/subsea/fish-filet-subsea.png",
   "start": 23683850,
   "end": 23713611
  }, {
   "filename": "/data/tracks/overworld/Mushroom 1.png",
   "start": 23713611,
   "end": 23743237
  }, {
   "filename": "/data/sfx/bowling_roll.ogg",
   "start": 23743237,
   "end": 23772770,
   "audio": 1
  }, {
   "filename": "/data/sfx/car_accel.ogg",
   "start": 23772770,
   "end": 23802233,
   "audio": 1
  }, {
   "filename": "/data/stk_config.xml",
   "start": 23802233,
   "end": 23831426
  }, {
   "filename": "/data/textures/rain.png",
   "start": 23831426,
   "end": 23860563
  }, {
   "filename": "/data/tracks/scotland/NessyGreen.png",
   "start": 23860563,
   "end": 23889679
  }, {
   "filename": "/data/tracks/soccer_field/city_metal.png",
   "start": 23889679,
   "end": 23918728
  }, {
   "filename": "/data/tracks/stadium/city_metal.png",
   "start": 23918728,
   "end": 23947777
  }, {
   "filename": "/data/tracks/mines/modern_mine_beam.png",
   "start": 23947777,
   "end": 23976821
  }, {
   "filename": "/data/tracks/overworld/modern_mine_beam.png",
   "start": 23976821,
   "end": 24005865
  }, {
   "filename": "/data/sfx/start_race.ogg",
   "start": 24005865,
   "end": 24034889,
   "audio": 1
  }, {
   "filename": "/data/tracks/jungle/mossy_stone2.png",
   "start": 24034889,
   "end": 24063830
  }, {
   "filename": "/data/tracks/mines/crystal_halo.png",
   "start": 24063830,
   "end": 24092758
  }, {
   "filename": "/data/tracks/startrack/planet_shadow.png",
   "start": 24092758,
   "end": 24121672
  }, {
   "filename": "/data/textures/smoke.png",
   "start": 24121672,
   "end": 24150580
  }, {
   "filename": "/data/tracks/overworld/bubble_village3.b3d",
   "start": 24150580,
   "end": 24179465
  }, {
   "filename": "/data/tracks/minigolf/golfball_baked.jpg",
   "start": 24179465,
   "end": 24208228
  }, {
   "filename": "/data/tracks/scotland/bush3.png",
   "start": 24208228,
   "end": 24236875
  }, {
   "filename": "/data/textures/lantern.jpg",
   "start": 24236875,
   "end": 24265408
  }, {
   "filename": "/data/tracks/subsea/sand-subsea.jpg",
   "start": 24265408,
   "end": 24293925
  }, {
   "filename": "/data/tracks/lighthouse/scene.xml",
   "start": 24293925,
   "end": 24322369
  }, {
   "filename": "/data/tracks/overworld/cactus.b3d",
   "start": 24322369,
   "end": 24350720
  }, {
   "filename": "/data/karts/tux/explode.ogg",
   "start": 24350720,
   "end": 24379041,
   "audio": 1
  }, {
   "filename": "/data/tracks/sandtrack/quads.xml",
   "start": 24379041,
   "end": 24407359
  }, {
   "filename": "/data/textures/deprecated/skyscraper3.png",
   "start": 24407359,
   "end": 24435625
  }, {
   "filename": "/data/tracks/jungle/obelisk.png",
   "start": 24435625,
   "end": 24463852
  }, {
   "filename": "/data/tracks/subsea/Paving_stones_2-subsea.jpg",
   "start": 24463852,
   "end": 24492013
  }, {
   "filename": "/data/tracks/startrack/vertpanel1b.jpg",
   "start": 24492013,
   "end": 24520173
  }, {
   "filename": "/data/tracks/overworld/wood_planks3.png",
   "start": 24520173,
   "end": 24548331
  }, {
   "filename": "/data/tracks/scotland/wood_planks3.png",
   "start": 24548331,
   "end": 24576489
  }, {
   "filename": "/data/tracks/farm/traill.png",
   "start": 24576489,
   "end": 24604552
  }, {
   "filename": "/data/textures/smoke_brown.png",
   "start": 24604552,
   "end": 24632597
  }, {
   "filename": "/data/tracks/introcutscene/flute.png",
   "start": 24632597,
   "end": 24660598
  }, {
   "filename": "/data/tracks/overworld/bubble_desert1.b3d",
   "start": 24660598,
   "end": 24688582
  }, {
   "filename": "/data/models/swap-icon.png",
   "start": 24688582,
   "end": 24716515
  }, {
   "filename": "/data/tracks/overworld/Mushroom 2.png",
   "start": 24716515,
   "end": 24744355
  }, {
   "filename": "/data/tracks/overworld/bubble_village1.b3d",
   "start": 24744355,
   "end": 24772187
  }, {
   "filename": "/data/textures/track2.jpg",
   "start": 24772187,
   "end": 24799927
  }, {
   "filename": "/data/tracks/subsea/Segment7.b3d",
   "start": 24799927,
   "end": 24827619
  }, {
   "filename": "/data/tracks/subsea/scene.xml",
   "start": 24827619,
   "end": 24855245
  }, {
   "filename": "/data/tracks/subsea/light3-subsea.png",
   "start": 24855245,
   "end": 24882691
  }, {
   "filename": "/data/tracks/lighthouse/pine_tree_lod_low.b3d",
   "start": 24882691,
   "end": 24909825
  }, {
   "filename": "/data/tracks/overworld/mountainTrees.b3d",
   "start": 24909825,
   "end": 24936873
  }, {
   "filename": "/data/tracks/zengarden/paperlantern.png",
   "start": 24936873,
   "end": 24963874
  }, {
   "filename": "/data/textures/smoke_yellow.png",
   "start": 24963874,
   "end": 24990853
  }, {
   "filename": "/data/textures/deprecated/railing.png",
   "start": 24990853,
   "end": 25017799
  }, {
   "filename": "/data/tracks/lighthouse/dynamicSky.b3d",
   "start": 25017799,
   "end": 25044710
  }, {
   "filename": "/data/tracks/xr591/monster1.b3d",
   "start": 25044710,
   "end": 25071617
  }, {
   "filename": "/data/tracks/xr591/monster2.b3d",
   "start": 25071617,
   "end": 25098524
  }, {
   "filename": "/data/tracks/overworld/bubble_tuto.b3d",
   "start": 25098524,
   "end": 25125428
  }, {
   "filename": "/data/tracks/lighthouse/fishing_buoy.b3d",
   "start": 25125428,
   "end": 25152327
  }, {
   "filename": "/data/tracks/minigolf/golfbal_face.jpg",
   "start": 25152327,
   "end": 25179180
  }, {
   "filename": "/data/tracks/hacienda/sshot-hacienda.jpg",
   "start": 25179180,
   "end": 25205932
  }, {
   "filename": "/data/tracks/tutorial/sshot-hacienda.jpg",
   "start": 25205932,
   "end": 25232684
  }, {
   "filename": "/data/tracks/startrack/trak3_screen.png",
   "start": 25232684,
   "end": 25259376
  }, {
   "filename": "/data/tracks/overworld/mountainTrees3.b3d",
   "start": 25259376,
   "end": 25286024
  }, {
   "filename": "/data/tracks/lighthouse/natural_rope.jpg",
   "start": 25286024,
   "end": 25312516
  }, {
   "filename": "/data/models/warning.png",
   "start": 25312516,
   "end": 25338784
  }, {
   "filename": "/data/tracks/scotland/wood_planks2.png",
   "start": 25338784,
   "end": 25365029
  }, {
   "filename": "/data/tracks/lighthouse/sky_top.jpg",
   "start": 25365029,
   "end": 25391231
  }, {
   "filename": "/data/models/banana.b3d",
   "start": 25391231,
   "end": 25417404
  }, {
   "filename": "/data/tracks/overworld/cogwheel2.b3d",
   "start": 25417404,
   "end": 25443510
  }, {
   "filename": "/data/tracks/overworld/cogwheel3.b3d",
   "start": 25443510,
   "end": 25469616
  }, {
   "filename": "/data/tracks/overworld/cogwheel4.b3d",
   "start": 25469616,
   "end": 25495722
  }, {
   "filename": "/data/textures/zipper-particle.png",
   "start": 25495722,
   "end": 25521714
  }, {
   "filename": "/data/sfx/machine_sound.ogg",
   "start": 25521714,
   "end": 25547633,
   "audio": 1
  }, {
   "filename": "/data/tracks/jungle/statue.JPG",
   "start": 25547633,
   "end": 25573418
  }, {
   "filename": "/data/tracks/subsea/Segment2.b3d",
   "start": 25573418,
   "end": 25599187
  }, {
   "filename": "/data/karts/sara/caterpillar.b3d",
   "start": 25599187,
   "end": 25624949
  }, {
   "filename": "/data/tracks/fortmagma/roof.jpg",
   "start": 25624949,
   "end": 25650680
  }, {
   "filename": "/data/tracks/overworld/roof.jpg",
   "start": 25650680,
   "end": 25676411
  }, {
   "filename": "/data/tracks/zengarden/directionLanLite_LOD25.b3d",
   "start": 25676411,
   "end": 25702064
  }, {
   "filename": "/data/gui/gift.png",
   "start": 25702064,
   "end": 25727634
  }, {
   "filename": "/data/tracks/zengarden/directionLantern_LOD100.b3d",
   "start": 25727634,
   "end": 25753191
  }, {
   "filename": "/data/tracks/zengarden/directionLantern_LOD200.b3d",
   "start": 25753191,
   "end": 25778748
  }, {
   "filename": "/data/tracks/minigolf/quads.xml",
   "start": 25778748,
   "end": 25804222
  }, {
   "filename": "/data/tracks/startrack/quads.xml",
   "start": 25804222,
   "end": 25829527
  }, {
   "filename": "/data/sfx/pre_start_race.ogg",
   "start": 25829527,
   "end": 25854481,
   "audio": 1
  }, {
   "filename": "/data/tracks/lighthouse/buoy_lantern.b3d",
   "start": 25854481,
   "end": 25879399
  }, {
   "filename": "/data/models/tire.b3d",
   "start": 25879399,
   "end": 25904274
  }, {
   "filename": "/data/tracks/city/city_crate.png",
   "start": 25904274,
   "end": 25928933
  }, {
   "filename": "/data/tracks/zengarden/lanternDirection.png",
   "start": 25928933,
   "end": 25953592
  }, {
   "filename": "/data/textures/smoke_red.png",
   "start": 25953592,
   "end": 25978198
  }, {
   "filename": "/data/tracks/fortmagma/books.png",
   "start": 25978198,
   "end": 26002738
  }, {
   "filename": "/data/tracks/mansion/books.png",
   "start": 26002738,
   "end": 26027278
  }, {
   "filename": "/data/models/bubblegum_shield.b3d",
   "start": 26027278,
   "end": 26051804
  }, {
   "filename": "/data/tracks/startrack/arc1.png",
   "start": 26051804,
   "end": 26076322
  }, {
   "filename": "/data/tracks/snowtuxpeak/tux_body.png",
   "start": 26076322,
   "end": 26100794
  }, {
   "filename": "/data/tracks/mines/roller.png",
   "start": 26100794,
   "end": 26125258
  }, {
   "filename": "/data/tracks/overworld/Mushroom 3.png",
   "start": 26125258,
   "end": 26149686
  }, {
   "filename": "/data/tracks/subsea/flaque-subsea.png",
   "start": 26149686,
   "end": 26174073
  }, {
   "filename": "/data/textures/obelisk.png",
   "start": 26174073,
   "end": 26198419
  }, {
   "filename": "/data/tracks/xr591/arc1.png",
   "start": 26198419,
   "end": 26222761
  }, {
   "filename": "/data/tracks/mansion/scene.xml",
   "start": 26222761,
   "end": 26246993
  }, {
   "filename": "/data/karts/konqi/konqi eye.png",
   "start": 26246993,
   "end": 26271187
  }, {
   "filename": "/data/tracks/zengarden/stone_lantern.png",
   "start": 26271187,
   "end": 26295289
  }, {
   "filename": "/data/models/rubber_ball-icon.png",
   "start": 26295289,
   "end": 26319343
  }, {
   "filename": "/data/tracks/overworld/Mushroom 7.png",
   "start": 26319343,
   "end": 26343353
  }, {
   "filename": "/data/tracks/farm/trail2dust.jpg",
   "start": 26343353,
   "end": 26367269
  }, {
   "filename": "/data/tracks/endcutscene/rope.jpg",
   "start": 26367269,
   "end": 26390981
  }, {
   "filename": "/data/tracks/scotland/gnu_bar.png",
   "start": 26390981,
   "end": 26414639
  }, {
   "filename": "/data/sfx/boing.ogg",
   "start": 26414639,
   "end": 26438224,
   "audio": 1
  }, {
   "filename": "/data/tracks/stadium/racetrack_roof.jpg",
   "start": 26438224,
   "end": 26461793
  }, {
   "filename": "/data/models/plunger.b3d",
   "start": 26461793,
   "end": 26485335
  }, {
   "filename": "/data/models/bubblegum_shield_nolok.png",
   "start": 26485335,
   "end": 26508791
  }, {
   "filename": "/data/tracks/overworld/frontTrees2.b3d",
   "start": 26508791,
   "end": 26532200
  }, {
   "filename": "/data/gui/mode_easter.png",
   "start": 26532200,
   "end": 26555586
  }, {
   "filename": "/data/models/gift-loop.png",
   "start": 26555586,
   "end": 26578840
  }, {
   "filename": "/data/tracks/subsea/Paving_stones_3-subsea.jpg",
   "start": 26578840,
   "end": 26602041
  }, {
   "filename": "/data/tracks/subsea/water_dark-transp-subsea.png",
   "start": 26602041,
   "end": 26625194
  }, {
   "filename": "/data/tracks/subsea/pillar2_high.b3d",
   "start": 26625194,
   "end": 26648318
  }, {
   "filename": "/data/tracks/subsea/pillar_high.b3d",
   "start": 26648318,
   "end": 26671442
  }, {
   "filename": "/data/models/bubblegum_shield.png",
   "start": 26671442,
   "end": 26694537
  }, {
   "filename": "/data/tracks/lighthouse/fishing_buoy2.b3d",
   "start": 26694537,
   "end": 26717572
  }, {
   "filename": "/data/tracks/subsea/Segment3.b3d",
   "start": 26717572,
   "end": 26740605
  }, {
   "filename": "/data/tracks/greenvalley/StreamPlant.png",
   "start": 26740605,
   "end": 26763536
  }, {
   "filename": "/data/tracks/overworld/StreamPlant.png",
   "start": 26763536,
   "end": 26786467
  }, {
   "filename": "/data/tracks/zengarden/bridge_LOD150.b3d",
   "start": 26786467,
   "end": 26809384
  }, {
   "filename": "/data/models/gift-box.b3d",
   "start": 26809384,
   "end": 26832276
  }, {
   "filename": "/data/textures/city_metal.png",
   "start": 26832276,
   "end": 26855158
  }, {
   "filename": "/data/tracks/startrack/trak3_panel3d.png",
   "start": 26855158,
   "end": 26878039
  }, {
   "filename": "/data/tracks/mines/water.b3d",
   "start": 26878039,
   "end": 26900908
  }, {
   "filename": "/data/textures/ceramic.jpg",
   "start": 26900908,
   "end": 26923655
  }, {
   "filename": "/data/tracks/zengarden/monumentWater3.png",
   "start": 26923655,
   "end": 26946353
  }, {
   "filename": "/data/textures/smoke_black.png",
   "start": 26946353,
   "end": 26968992
  }, {
   "filename": "/data/textures/snowyrock.png",
   "start": 26968992,
   "end": 26991624
  }, {
   "filename": "/data/karts/sara/saraSkin.png",
   "start": 26991624,
   "end": 27014209
  }, {
   "filename": "/data/tracks/mansion/waterPond.b3d",
   "start": 27014209,
   "end": 27036770
  }, {
   "filename": "/data/tracks/mansion/Mesh.002.b3d",
   "start": 27036770,
   "end": 27059274
  }, {
   "filename": "/data/sfx/swap.ogg",
   "start": 27059274,
   "end": 27081667,
   "audio": 1
  }, {
   "filename": "/data/tracks/endcutscene/tux_body.png",
   "start": 27081667,
   "end": 27103783
  }, {
   "filename": "/data/tracks/introcutscene2/tux_body.png",
   "start": 27103783,
   "end": 27125899
  }, {
   "filename": "/data/textures/waternormals.jpg",
   "start": 27125899,
   "end": 27148008
  }, {
   "filename": "/data/karts/tux/tux_body.png",
   "start": 27148008,
   "end": 27170113
  }, {
   "filename": "/data/tracks/snowmountain/tux_body.png",
   "start": 27170113,
   "end": 27192218
  }, {
   "filename": "/data/tracks/lighthouse/oceanBed.b3d",
   "start": 27192218,
   "end": 27214318
  }, {
   "filename": "/data/gui/speedback.png",
   "start": 27214318,
   "end": 27236260
  }, {
   "filename": "/data/tracks/lighthouse/light.png",
   "start": 27236260,
   "end": 27258136
  }, {
   "filename": "/data/tracks/xr591/light.png",
   "start": 27258136,
   "end": 27280012
  }, {
   "filename": "/data/tracks/hacienda/electroPost.png",
   "start": 27280012,
   "end": 27301855
  }, {
   "filename": "/data/tracks/tutorial/electroPost.png",
   "start": 27301855,
   "end": 27323698
  }, {
   "filename": "/data/tracks/introcutscene/tree.b3d",
   "start": 27323698,
   "end": 27345498
  }, {
   "filename": "/data/tracks/scotland/mozillas_pub.png",
   "start": 27345498,
   "end": 27367096
  }, {
   "filename": "/data/karts/sara/redTextile.png",
   "start": 27367096,
   "end": 27388588
  }, {
   "filename": "/data/textures/smoke_nitro.png",
   "start": 27388588,
   "end": 27410032
  }, {
   "filename": "/data/tracks/startrack/earthHalo.png",
   "start": 27410032,
   "end": 27431346
  }, {
   "filename": "/data/gui/skins/peach/glassbutton.png",
   "start": 27431346,
   "end": 27452628
  }, {
   "filename": "/data/karts/xfcemouse/hc.propeller.b3d",
   "start": 27452628,
   "end": 27473908
  }, {
   "filename": "/data/tracks/subsea/Segment10.b3d",
   "start": 27473908,
   "end": 27495117
  }, {
   "filename": "/data/tracks/subsea/Segment8.b3d",
   "start": 27495117,
   "end": 27516326
  }, {
   "filename": "/data/tracks/zengarden/explode.png",
   "start": 27516326,
   "end": 27537533
  }, {
   "filename": "/data/tracks/greenvalley/water_road_splash_layer.b3d",
   "start": 27537533,
   "end": 27558727
  }, {
   "filename": "/data/tracks/greenvalley/water_road.b3d",
   "start": 27558727,
   "end": 27579920
  }, {
   "filename": "/data/tracks/xr591/metal_ground.jpg",
   "start": 27579920,
   "end": 27601016
  }, {
   "filename": "/data/tracks/xr591/arrows.png",
   "start": 27601016,
   "end": 27622011
  }, {
   "filename": "/data/karts/sara/pidginwheel.png",
   "start": 27622011,
   "end": 27642942
  }, {
   "filename": "/data/tracks/mines/cogwheel2.b3d",
   "start": 27642942,
   "end": 27663856
  }, {
   "filename": "/data/tracks/mines/cogwheel3.b3d",
   "start": 27663856,
   "end": 27684770
  }, {
   "filename": "/data/tracks/mines/cogwheel4.b3d",
   "start": 27684770,
   "end": 27705684
  }, {
   "filename": "/data/tracks/mines/cogwheel1.b3d",
   "start": 27705684,
   "end": 27726594
  }, {
   "filename": "/data/fonts/rasheeq.xml",
   "start": 27726594,
   "end": 27747486
  }, {
   "filename": "/data/tracks/mines/crate_wood_colored.jpg",
   "start": 27747486,
   "end": 27768331
  }, {
   "filename": "/data/karts/tux/yeah.ogg",
   "start": 27768331,
   "end": 27789149,
   "audio": 1
  }, {
   "filename": "/data/models/silver.png",
   "start": 27789149,
   "end": 27809928
  }, {
   "filename": "/data/gui/options_input.png",
   "start": 27809928,
   "end": 27830679
  }, {
   "filename": "/data/tracks/mines/SomeModel.b3d",
   "start": 27830679,
   "end": 27851399
  }, {
   "filename": "/data/textures/deprecated/skyscraper1.png",
   "start": 27851399,
   "end": 27872108
  }, {
   "filename": "/data/models/bubblegum-nolok-low.b3d",
   "start": 27872108,
   "end": 27892788
  }, {
   "filename": "/data/fonts/StkJapaneseFont.xml",
   "start": 27892788,
   "end": 27913456
  }, {
   "filename": "/data/tracks/overworld/WhiteFlowerLeaves.png",
   "start": 27913456,
   "end": 27934079
  }, {
   "filename": "/data/tracks/mansion/swamp.b3d",
   "start": 27934079,
   "end": 27954661
  }, {
   "filename": "/data/tracks/overworld/wires.png",
   "start": 27954661,
   "end": 27975230
  }, {
   "filename": "/data/tracks/xr591/smoke_acid.png",
   "start": 27975230,
   "end": 27995780
  }, {
   "filename": "/data/tracks/zengarden/rock_grey.png",
   "start": 27995780,
   "end": 28016326
  }, {
   "filename": "/data/tracks/endcutscene/cell_shadow.png",
   "start": 28016326,
   "end": 28036774
  }, {
   "filename": "/data/tracks/zengarden/sakuraPine_LOD100.b3d",
   "start": 28036774,
   "end": 28057084
  }, {
   "filename": "/data/tracks/mansion/Mesh.015.b3d",
   "start": 28057084,
   "end": 28077388
  }, {
   "filename": "/data/tracks/subsea/Segment5.b3d",
   "start": 28077388,
   "end": 28097685
  }, {
   "filename": "/data/models/cake-icon.png",
   "start": 28097685,
   "end": 28117942
  }, {
   "filename": "/data/fonts/wqyMicroHei5.png",
   "start": 28117942,
   "end": 28138106
  }, {
   "filename": "/data/tracks/overworld/wood_planks4.png",
   "start": 28138106,
   "end": 28158270
  }, {
   "filename": "/data/gui/difficulty_best.png",
   "start": 28158270,
   "end": 28178393
  }, {
   "filename": "/data/tracks/mines/crate_wood_nitro.jpg",
   "start": 28178393,
   "end": 28198292
  }, {
   "filename": "/data/tracks/subsea/trumpet_diffuse-subsea.jpg",
   "start": 28198292,
   "end": 28218180
  }, {
   "filename": "/data/gui/speedfore.png",
   "start": 28218180,
   "end": 28238056
  }, {
   "filename": "/data/tracks/scotland/Window6.png",
   "start": 28238056,
   "end": 28257909
  }, {
   "filename": "/data/tracks/fortmagma/track_01.jpg",
   "start": 28257909,
   "end": 28277749
  }, {
   "filename": "/data/tracks/scotland/wood_planks4.png",
   "start": 28277749,
   "end": 28297563
  }, {
   "filename": "/data/tracks/startrack/trim8b.jpg",
   "start": 28297563,
   "end": 28317356
  }, {
   "filename": "/data/karts/sara/pidginwheel_alt.png",
   "start": 28317356,
   "end": 28337141
  }, {
   "filename": "/data/tracks/xr591/rockred.jpg",
   "start": 28337141,
   "end": 28356857
  }, {
   "filename": "/data/karts/pidgin/pidginwheel.png",
   "start": 28356857,
   "end": 28376481
  }, {
   "filename": "/data/tracks/greenvalley/roof.jpg",
   "start": 28376481,
   "end": 28396064
  }, {
   "filename": "/data/tracks/mines/cogwheel5.b3d",
   "start": 28396064,
   "end": 28415558
  }, {
   "filename": "/data/tracks/zengarden/lantern_alone.b3d",
   "start": 28415558,
   "end": 28435030
  }, {
   "filename": "/data/tracks/startrack/bomber_metal1b.jpg",
   "start": 28435030,
   "end": 28454415
  }, {
   "filename": "/data/tracks/subsea/Segment6.b3d",
   "start": 28454415,
   "end": 28473800
  }, {
   "filename": "/data/tracks/mines/crate_wood.jpg",
   "start": 28473800,
   "end": 28493145
  }, {
   "filename": "/data/tracks/mines/stop_sign.png",
   "start": 28493145,
   "end": 28512485
  }, {
   "filename": "/data/karts/tux/crash.ogg",
   "start": 28512485,
   "end": 28531814,
   "audio": 1
  }, {
   "filename": "/data/gui/skins/peach/glassspinner_focus.png",
   "start": 28531814,
   "end": 28551138
  }, {
   "filename": "/data/tracks/battleisland/battleisland_screenshot.jpg",
   "start": 28551138,
   "end": 28570448
  }, {
   "filename": "/data/tracks/zengarden/dynamiclight.png",
   "start": 28570448,
   "end": 28589701
  }, {
   "filename": "/data/tracks/overworld/bubble_forest.b3d",
   "start": 28589701,
   "end": 28608669
  }, {
   "filename": "/data/tracks/overworld/bubble_forest2.b3d",
   "start": 28608669,
   "end": 28627637
  }, {
   "filename": "/data/tracks/overworld/bubble_forest3.b3d",
   "start": 28627637,
   "end": 28646605
  }, {
   "filename": "/data/tracks/overworld/bubble_fortmagma.b3d",
   "start": 28646605,
   "end": 28665573
  }, {
   "filename": "/data/tracks/overworld/bubble_gp1.b3d",
   "start": 28665573,
   "end": 28684541
  }, {
   "filename": "/data/tracks/overworld/bubble_gp2.b3d",
   "start": 28684541,
   "end": 28703509
  }, {
   "filename": "/data/tracks/overworld/bubble_gp3.b3d",
   "start": 28703509,
   "end": 28722477
  }, {
   "filename": "/data/tracks/overworld/bubble_gp4.b3d",
   "start": 28722477,
   "end": 28741445
  }, {
   "filename": "/data/tracks/overworld/bubble_rocket.b3d",
   "start": 28741445,
   "end": 28760413
  }, {
   "filename": "/data/tracks/overworld/bubble_sea3.b3d",
   "start": 28760413,
   "end": 28779381
  }, {
   "filename": "/data/tracks/overworld/bubble_sea4.b3d",
   "start": 28779381,
   "end": 28798349
  }, {
   "filename": "/data/tracks/overworld/lighthouse.jpg",
   "start": 28798349,
   "end": 28817290
  }, {
   "filename": "/data/tracks/islandtrack/quads.xml",
   "start": 28817290,
   "end": 28836198
  }, {
   "filename": "/data/karts/sara/icon-sara.png",
   "start": 28836198,
   "end": 28855073
  }, {
   "filename": "/data/tracks/subsea/waterparticles0-subsea.png",
   "start": 28855073,
   "end": 28873939
  }, {
   "filename": "/data/tracks/startrack/arc2.png",
   "start": 28873939,
   "end": 28892697
  }, {
   "filename": "/data/tracks/xr591/arc2.png",
   "start": 28892697,
   "end": 28911331
  }, {
   "filename": "/data/tracks/subsea/snowyrock2sand-subsea.jpg",
   "start": 28911331,
   "end": 28929962
  }, {
   "filename": "/data/models/traffic_light_yellow.jpg",
   "start": 28929962,
   "end": 28948481
  }, {
   "filename": "/data/tracks/subsea/Segment11.b3d",
   "start": 28948481,
   "end": 28966954
  }, {
   "filename": "/data/gui/green_check.png",
   "start": 28966954,
   "end": 28985411
  }, {
   "filename": "/data/tracks/xr591/quads.xml",
   "start": 28985411,
   "end": 29003849
  }, {
   "filename": "/data/karts/tux/uh-oh.ogg",
   "start": 29003849,
   "end": 29022283,
   "audio": 1
  }, {
   "filename": "/data/models/traffic_light_green.jpg",
   "start": 29022283,
   "end": 29040709
  }, {
   "filename": "/data/tracks/farm/quads.xml",
   "start": 29040709,
   "end": 29059123
  }, {
   "filename": "/data/textures/explode.png",
   "start": 29059123,
   "end": 29077508
  }, {
   "filename": "/data/tracks/scotland/Public_Phone_Box.png",
   "start": 29077508,
   "end": 29095890
  }, {
   "filename": "/data/karts/tux/goo.ogg",
   "start": 29095890,
   "end": 29114268,
   "audio": 1
  }, {
   "filename": "/data/gui/skins/ocean/dialog.png",
   "start": 29114268,
   "end": 29132501
  }, {
   "filename": "/data/tracks/mansion/red.png",
   "start": 29132501,
   "end": 29150603
  }, {
   "filename": "/data/tracks/mansion/screenshot.png",
   "start": 29150603,
   "end": 29168705
  }, {
   "filename": "/data/tracks/subsea/Cube.013.b3d",
   "start": 29168705,
   "end": 29186797
  }, {
   "filename": "/data/models/reset-attach-icon.png",
   "start": 29186797,
   "end": 29204845
  }, {
   "filename": "/data/karts/tux/win.ogg",
   "start": 29204845,
   "end": 29222889,
   "audio": 1
  }, {
   "filename": "/data/tracks/hacienda/bigFork.png",
   "start": 29222889,
   "end": 29240928
  }, {
   "filename": "/data/tracks/tutorial/bigFork.png",
   "start": 29240928,
   "end": 29258967
  }, {
   "filename": "/data/tracks/overworld/bubble_mountain.b3d",
   "start": 29258967,
   "end": 29276977
  }, {
   "filename": "/data/textures/starparticle.png",
   "start": 29276977,
   "end": 29294865
  }, {
   "filename": "/data/tracks/subsea/pigeon-1-subsea.jpg",
   "start": 29294865,
   "end": 29312656
  }, {
   "filename": "/data/karts/tux/wheel-front-left.b3d",
   "start": 29312656,
   "end": 29330437
  }, {
   "filename": "/data/karts/tux/wheel-front-right.b3d",
   "start": 29330437,
   "end": 29348218
  }, {
   "filename": "/data/tracks/endcutscene/Wheel2.b3d",
   "start": 29348218,
   "end": 29365999
  }, {
   "filename": "/data/tracks/endcutscene/Wheel3.b3d",
   "start": 29365999,
   "end": 29383780
  }, {
   "filename": "/data/karts/tux/wheel-rear-left.b3d",
   "start": 29383780,
   "end": 29401560
  }, {
   "filename": "/data/karts/tux/wheel-rear-right.b3d",
   "start": 29401560,
   "end": 29419340
  }, {
   "filename": "/data/tracks/endcutscene/Wheel1.b3d",
   "start": 29419340,
   "end": 29437120
  }, {
   "filename": "/data/tracks/endcutscene/Wheel4.b3d",
   "start": 29437120,
   "end": 29454900
  }, {
   "filename": "/data/tracks/zengarden/waterparticles.png",
   "start": 29454900,
   "end": 29472635
  }, {
   "filename": "/data/models/parachute-attach-icon.png",
   "start": 29472635,
   "end": 29490354
  }, {
   "filename": "/data/tracks/scotland/tux_inn.png",
   "start": 29490354,
   "end": 29508054
  }, {
   "filename": "/data/tracks/mines/Circle.036_Circle.001.b3d",
   "start": 29508054,
   "end": 29525736
  }, {
   "filename": "/data/gui/skins/peach/glassbutton_focused.png",
   "start": 29525736,
   "end": 29543408
  }, {
   "filename": "/data/models/traffic_light_red.jpg",
   "start": 29543408,
   "end": 29561077
  }, {
   "filename": "/data/tracks/snowtuxpeak/scene.xml",
   "start": 29561077,
   "end": 29578723
  }, {
   "filename": "/data/tracks/startrack/trim1a.jpg",
   "start": 29578723,
   "end": 29596369
  }, {
   "filename": "/data/karts/sara/wheel-rear-right.b3d",
   "start": 29596369,
   "end": 29614006
  }, {
   "filename": "/data/tracks/subsea/diffus-subsea.png",
   "start": 29614006,
   "end": 29631589
  }, {
   "filename": "/data/karts/suzanne/wheel-front-left.b3d",
   "start": 29631589,
   "end": 29649091
  }, {
   "filename": "/data/karts/suzanne/wheel-front-right.b3d",
   "start": 29649091,
   "end": 29666593
  }, {
   "filename": "/data/karts/suzanne/wheel-rear-left.b3d",
   "start": 29666593,
   "end": 29684095
  }, {
   "filename": "/data/karts/suzanne/wheel-rear-right.b3d",
   "start": 29684095,
   "end": 29701597
  }, {
   "filename": "/data/tracks/snowmountain/roadwayborder.png",
   "start": 29701597,
   "end": 29719011
  }, {
   "filename": "/data/textures/garagedoor.jpg",
   "start": 29719011,
   "end": 29736368
  }, {
   "filename": "/data/tracks/subsea/pigeon-2-subsea.jpg",
   "start": 29736368,
   "end": 29753709
  }, {
   "filename": "/data/fonts/title_font.xml",
   "start": 29753709,
   "end": 29771011
  }, {
   "filename": "/data/sfx/inflate.ogg",
   "start": 29771011,
   "end": 29788249,
   "audio": 1
  }, {
   "filename": "/data/models/parachute-icon.png",
   "start": 29788249,
   "end": 29805472
  }, {
   "filename": "/data/gui/mode_soccer.png",
   "start": 29805472,
   "end": 29822612
  }, {
   "filename": "/data/tracks/fortmagma/bronze-subsea.jpg",
   "start": 29822612,
   "end": 29839698
  }, {
   "filename": "/data/tracks/mansion/bronze-subsea.jpg",
   "start": 29839698,
   "end": 29856784
  }, {
   "filename": "/data/tracks/subsea/bronze-subsea.jpg",
   "start": 29856784,
   "end": 29873870
  }, {
   "filename": "/data/tracks/xr591/sandred.jpg",
   "start": 29873870,
   "end": 29890809
  }, {
   "filename": "/data/tracks/xr591/sandred2.jpg",
   "start": 29890809,
   "end": 29907748
  }, {
   "filename": "/data/tracks/greenvalley/w_sky_6.jpg",
   "start": 29907748,
   "end": 29924679
  }, {
   "filename": "/data/sfx/swatter.ogg",
   "start": 29924679,
   "end": 29941595,
   "audio": 1
  }, {
   "filename": "/data/karts/tux/pass.ogg",
   "start": 29941595,
   "end": 29958352,
   "audio": 1
  }, {
   "filename": "/data/tracks/startrack/moonHalo.png",
   "start": 29958352,
   "end": 29975107
  }, {
   "filename": "/data/tracks/subsea/sub-subsea.jpg",
   "start": 29975107,
   "end": 29991811
  }, {
   "filename": "/data/tracks/hacienda/lanternDetail.png",
   "start": 29991811,
   "end": 30008310
  }, {
   "filename": "/data/tracks/tutorial/lanternDetail.png",
   "start": 30008310,
   "end": 30024809
  }, {
   "filename": "/data/gui/difficulty_easy.png",
   "start": 30024809,
   "end": 30041207
  }, {
   "filename": "/data/tracks/overworld/bubble_techno1.b3d",
   "start": 30041207,
   "end": 30057587
  }, {
   "filename": "/data/tracks/subsea/Tortue-dessus-subsea.jpg",
   "start": 30057587,
   "end": 30073921
  }, {
   "filename": "/data/gui/skins/peach/glassspinner_down.png",
   "start": 30073921,
   "end": 30090203
  }, {
   "filename": "/data/tracks/fortmagma/dynamiclight.png",
   "start": 30090203,
   "end": 30106392
  }, {
   "filename": "/data/tracks/overworld/cart.b3d",
   "start": 30106392,
   "end": 30122530
  }, {
   "filename": "/data/gui/screen32.png",
   "start": 30122530,
   "end": 30138605
  }, {
   "filename": "/data/tracks/overworld/CornusAmericana.png",
   "start": 30138605,
   "end": 30154664
  }, {
   "filename": "/data/tracks/lighthouse/bulb.png",
   "start": 30154664,
   "end": 30170671
  }, {
   "filename": "/data/tracks/mines/bulb.png",
   "start": 30170671,
   "end": 30186678
  }, {
   "filename": "/data/tracks/overworld/mountainTrees2.b3d",
   "start": 30186678,
   "end": 30202683
  }, {
   "filename": "/data/tracks/startrack/trim4b.jpg",
   "start": 30202683,
   "end": 30218584
  }, {
   "filename": "/data/sfx/bubblegum_explode.ogg",
   "start": 30218584,
   "end": 30234465,
   "audio": 1
  }, {
   "filename": "/data/gui/skins/peach/dialog.png",
   "start": 30234465,
   "end": 30250341
  }, {
   "filename": "/data/tracks/scotland/pub1.png",
   "start": 30250341,
   "end": 30266217
  }, {
   "filename": "/data/tracks/farm/gnarly_tool.jpg",
   "start": 30266217,
   "end": 30282032
  }, {
   "filename": "/data/tracks/lighthouse/grass_chunk.b3d",
   "start": 30282032,
   "end": 30297803
  }, {
   "filename": "/data/sfx/plopp.ogg",
   "start": 30297803,
   "end": 30313536,
   "audio": 1
  }, {
   "filename": "/data/tracks/introcutscene/ShipMouth.b3d",
   "start": 30313536,
   "end": 30329263
  }, {
   "filename": "/data/tracks/introcutscene2/ShipMouth.b3d",
   "start": 30329263,
   "end": 30344990
  }, {
   "filename": "/data/textures/waterparticles.png",
   "start": 30344990,
   "end": 30360697
  }, {
   "filename": "/data/tracks/scotland/wooden.jpg",
   "start": 30360697,
   "end": 30376300
  }, {
   "filename": "/data/tracks/startrack/basictrim1a.jpg",
   "start": 30376300,
   "end": 30391812
  }, {
   "filename": "/data/tracks/fortmagma/chain.png",
   "start": 30391812,
   "end": 30407284
  }, {
   "filename": "/data/tracks/jungle/quads.xml",
   "start": 30407284,
   "end": 30422746
  }, {
   "filename": "/data/tracks/subsea/Pirate_Flag_of_Rack_Rackham-subsea.png",
   "start": 30422746,
   "end": 30438147
  }, {
   "filename": "/data/tracks/zengarden/skylantern.b3d",
   "start": 30438147,
   "end": 30453493
  }, {
   "filename": "/data/gui/addons.png",
   "start": 30453493,
   "end": 30468697
  }, {
   "filename": "/data/tracks/mines/cart_hit.b3d",
   "start": 30468697,
   "end": 30483815
  }, {
   "filename": "/data/tracks/mines/cart.b3d",
   "start": 30483815,
   "end": 30498929
  }, {
   "filename": "/data/sfx/goo.ogg",
   "start": 30498929,
   "end": 30514026,
   "audio": 1
  }, {
   "filename": "/data/tracks/startrack/comp1a.jpg",
   "start": 30514026,
   "end": 30529001
  }, {
   "filename": "/data/karts/nolok/nolokwheel.png",
   "start": 30529001,
   "end": 30543877
  }, {
   "filename": "/data/karts/beagle/beagle_icon.png",
   "start": 30543877,
   "end": 30558725
  }, {
   "filename": "/data/gui/skins/ocean/glassspinner_down.png",
   "start": 30558725,
   "end": 30573557
  }, {
   "filename": "/data/karts/elephpant/wheel-front-left.b3d",
   "start": 30573557,
   "end": 30588372
  }, {
   "filename": "/data/karts/elephpant/wheel-front-right.b3d",
   "start": 30588372,
   "end": 30603187
  }, {
   "filename": "/data/karts/elephpant/wheel-rear-left.b3d",
   "start": 30603187,
   "end": 30618001
  }, {
   "filename": "/data/karts/elephpant/wheel-rear-right.b3d",
   "start": 30618001,
   "end": 30632815
  }, {
   "filename": "/data/sfx/forcefield.ogg",
   "start": 30632815,
   "end": 30647611,
   "audio": 1
  }, {
   "filename": "/data/textures/deprecated/grass.jpg",
   "start": 30647611,
   "end": 30662378
  }, {
   "filename": "/data/models/nitrotank-small-low.b3d",
   "start": 30662378,
   "end": 30677003
  }, {
   "filename": "/data/gui/difficulty_medium.png",
   "start": 30677003,
   "end": 30691610
  }, {
   "filename": "/data/tracks/xr591/galaxy2.jpg",
   "start": 30691610,
   "end": 30706157
  }, {
   "filename": "/data/karts/emule/emule_char.jpg",
   "start": 30706157,
   "end": 30720623
  }, {
   "filename": "/data/textures/waterfall-particules.png",
   "start": 30720623,
   "end": 30735076
  }, {
   "filename": "/data/sfx/WilhelmScream.ogg",
   "start": 30735076,
   "end": 30749514,
   "audio": 1
  }, {
   "filename": "/data/tracks/olivermath/bananawrap.png",
   "start": 30749514,
   "end": 30763872
  }, {
   "filename": "/data/tracks/snowmountain/quads.xml",
   "start": 30763872,
   "end": 30778202
  }, {
   "filename": "/data/tracks/overworld/GroundCover.png",
   "start": 30778202,
   "end": 30792491
  }, {
   "filename": "/data/tracks/subsea/sea.b3d",
   "start": 30792491,
   "end": 30806659
  }, {
   "filename": "/data/tracks/startrack/trim6e.jpg",
   "start": 30806659,
   "end": 30820798
  }, {
   "filename": "/data/karts/suzanne/icon_large.png",
   "start": 30820798,
   "end": 30834934
  }, {
   "filename": "/data/tracks/overworld/canyon_cactus.png",
   "start": 30834934,
   "end": 30849040
  }, {
   "filename": "/data/gui/cup_bronze.png",
   "start": 30849040,
   "end": 30863041
  }, {
   "filename": "/data/tracks/city/scene.xml",
   "start": 30863041,
   "end": 30876961
  }, {
   "filename": "/data/tracks/farm/hayBail.b3d",
   "start": 30876961,
   "end": 30890855
  }, {
   "filename": "/data/karts/sara/hair.png",
   "start": 30890855,
   "end": 30904734
  }, {
   "filename": "/data/tracks/zengarden/sakuraPine_LOD200.b3d",
   "start": 30904734,
   "end": 30918592
  }, {
   "filename": "/data/tracks/mansion/Mesh.016.b3d",
   "start": 30918592,
   "end": 30932444
  }, {
   "filename": "/data/tracks/introcutscene/button.ogg",
   "start": 30932444,
   "end": 30946288,
   "audio": 1
  }, {
   "filename": "/data/karts/emule/emule_icon128.png",
   "start": 30946288,
   "end": 30960052
  }, {
   "filename": "/data/karts/beagle/wheel-front-left.b3d",
   "start": 30960052,
   "end": 30973801
  }, {
   "filename": "/data/karts/beagle/wheel-front-right.b3d",
   "start": 30973801,
   "end": 30987550
  }, {
   "filename": "/data/karts/beagle/wheel-rear-left.b3d",
   "start": 30987550,
   "end": 31001299
  }, {
   "filename": "/data/karts/beagle/wheel-rear-right.b3d",
   "start": 31001299,
   "end": 31015044
  }, {
   "filename": "/data/tracks/fortmagma/sshot.jpg",
   "start": 31015044,
   "end": 31028685
  }, {
   "filename": "/data/gui/cup_gold.png",
   "start": 31028685,
   "end": 31042303
  }, {
   "filename": "/data/models/bubblegum-low.b3d",
   "start": 31042303,
   "end": 31055915
  }, {
   "filename": "/data/textures/deprecated/bonusblock2.png",
   "start": 31055915,
   "end": 31069503
  }, {
   "filename": "/data/gui/main_race_multi.png",
   "start": 31069503,
   "end": 31083080
  }, {
   "filename": "/data/gui/package-featured.png",
   "start": 31083080,
   "end": 31096609
  }, {
   "filename": "/data/gui/screen1610.png",
   "start": 31096609,
   "end": 31110130
  }, {
   "filename": "/data/gui/red_mark.png",
   "start": 31110130,
   "end": 31123646
  }, {
   "filename": "/data/tracks/mansion/mansion_curtains.png",
   "start": 31123646,
   "end": 31137077
  }, {
   "filename": "/data/karts/adiumy/wheel-front-left.b3d",
   "start": 31137077,
   "end": 31150476
  }, {
   "filename": "/data/karts/adiumy/wheel-front-right.b3d",
   "start": 31150476,
   "end": 31163875
  }, {
   "filename": "/data/karts/xfcemouse/xfce_icon64.png",
   "start": 31163875,
   "end": 31177272
  }, {
   "filename": "/data/tracks/minigolf/duck.jpg",
   "start": 31177272,
   "end": 31190667
  }, {
   "filename": "/data/tracks/overworld/Jackinthepulpit.png",
   "start": 31190667,
   "end": 31203992
  }, {
   "filename": "/data/supertuxkart_128.png",
   "start": 31203992,
   "end": 31217309
  }, {
   "filename": "/data/gui/mode_normal.png",
   "start": 31217309,
   "end": 31230600
  }, {
   "filename": "/data/tracks/mines/quads.xml",
   "start": 31230600,
   "end": 31243812
  }, {
   "filename": "/data/gui/screen169.png",
   "start": 31243812,
   "end": 31257011
  }, {
   "filename": "/data/tracks/mines/lamp_2.b3d",
   "start": 31257011,
   "end": 31270205
  }, {
   "filename": "/data/gui/skins/peach/glassspinner_halo.png",
   "start": 31270205,
   "end": 31283398
  }, {
   "filename": "/data/tracks/mines/redSpot.b3d",
   "start": 31283398,
   "end": 31296581
  }, {
   "filename": "/data/tracks/mines/greenSpot.b3d",
   "start": 31296581,
   "end": 31309763
  }, {
   "filename": "/data/tracks/hacienda/l_lampsglass0.png",
   "start": 31309763,
   "end": 31322927
  }, {
   "filename": "/data/tracks/tutorial/l_lampsglass0.png",
   "start": 31322927,
   "end": 31336091
  }, {
   "filename": "/data/sfx/shoot.ogg",
   "start": 31336091,
   "end": 31349254,
   "audio": 1
  }, {
   "filename": "/data/gui/package-update.png",
   "start": 31349254,
   "end": 31362378
  }, {
   "filename": "/data/tracks/snowtuxpeak/adScreen_LOD50.b3d",
   "start": 31362378,
   "end": 31375459
  }, {
   "filename": "/data/tracks/mansion/Circle.028.b3d",
   "start": 31375459,
   "end": 31388527
  }, {
   "filename": "/data/fonts/rasheeq0.png",
   "start": 31388527,
   "end": 31401594
  }, {
   "filename": "/data/models/swatter-icon.png",
   "start": 31401594,
   "end": 31414624
  }, {
   "filename": "/data/gui/mode_tt.png",
   "start": 31414624,
   "end": 31427626
  }, {
   "filename": "/data/tracks/mansion/l_lampsglass0.png",
   "start": 31427626,
   "end": 31440601
  }, {
   "filename": "/data/gui/difficulty_hard.png",
   "start": 31440601,
   "end": 31453533
  }, {
   "filename": "/data/tracks/zengarden/wooden2.png",
   "start": 31453533,
   "end": 31466454
  }, {
   "filename": "/data/tracks/subsea/Tortue-dessous-subsea.jpg",
   "start": 31466454,
   "end": 31479350
  }, {
   "filename": "/data/karts/sara/leatherShoes.png",
   "start": 31479350,
   "end": 31492237
  }, {
   "filename": "/data/karts/tux/zipper.ogg",
   "start": 31492237,
   "end": 31505094,
   "audio": 1
  }, {
   "filename": "/data/CREDITS",
   "start": 31505094,
   "end": 31517948
  }, {
   "filename": "/data/tracks/scotland/wooden2.png",
   "start": 31517948,
   "end": 31530794
  }, {
   "filename": "/data/tracks/overworld/Mushroom 3 side.png",
   "start": 31530794,
   "end": 31543621
  }, {
   "filename": "/data/sfx/engine_small.ogg",
   "start": 31543621,
   "end": 31556374,
   "audio": 1
  }, {
   "filename": "/data/tracks/soccer_field/soccer_ball.b3d",
   "start": 31556374,
   "end": 31569122
  }, {
   "filename": "/data/karts/nolok/Private-sphere.png",
   "start": 31569122,
   "end": 31581841
  }, {
   "filename": "/data/textures/water-splash.png",
   "start": 31581841,
   "end": 31594449
  }, {
   "filename": "/data/gui/tutorial.png",
   "start": 31594449,
   "end": 31607051
  }, {
   "filename": "/data/karts/tux/Terminal.png",
   "start": 31607051,
   "end": 31619636
  }, {
   "filename": "/data/tracks/city/fern.b3d",
   "start": 31619636,
   "end": 31632209
  }, {
   "filename": "/data/tracks/scotland/quads.xml",
   "start": 31632209,
   "end": 31644772
  }, {
   "filename": "/data/karts/sara/wheel-rear-left.b3d",
   "start": 31644772,
   "end": 31657225
  }, {
   "filename": "/data/gui/mode_ftl.png",
   "start": 31657225,
   "end": 31669592
  }, {
   "filename": "/data/gui/screen53.png",
   "start": 31669592,
   "end": 31681942
  }, {
   "filename": "/data/gui/no-package-featured.png",
   "start": 31681942,
   "end": 31694288
  }, {
   "filename": "/data/gui/screen54.png",
   "start": 31694288,
   "end": 31706560
  }, {
   "filename": "/data/tracks/overworld/track_screenshot_dummy.png",
   "start": 31706560,
   "end": 31718820
  }, {
   "filename": "/data/gui/gauge_full.png",
   "start": 31718820,
   "end": 31731040
  }, {
   "filename": "/data/gui/skins/ocean/rating_star.png",
   "start": 31731040,
   "end": 31743238
  }, {
   "filename": "/data/gui/skins/peach/rating_star.png",
   "start": 31743238,
   "end": 31755436
  }, {
   "filename": "/data/tracks/minigolf/stone.jpg",
   "start": 31755436,
   "end": 31767564
  }, {
   "filename": "/data/tracks/mansion/roof.png",
   "start": 31767564,
   "end": 31779689
  }, {
   "filename": "/data/tracks/xr591/welcome_to_XR591.jpg",
   "start": 31779689,
   "end": 31791777
  }, {
   "filename": "/data/models/bomb-attach-icon.png",
   "start": 31791777,
   "end": 31803847
  }, {
   "filename": "/data/tracks/zengarden/monumentWater.png",
   "start": 31803847,
   "end": 31815902
  }, {
   "filename": "/data/tracks/introcutscene/Tori2.b3d",
   "start": 31815902,
   "end": 31827932
  }, {
   "filename": "/data/tracks/zengarden/torii_LOD50.b3d",
   "start": 31827932,
   "end": 31839962
  }, {
   "filename": "/data/tracks/fortmagma/backRoom.b3d",
   "start": 31839962,
   "end": 31851990
  }, {
   "filename": "/data/tracks/introcutscene/Tori1.b3d",
   "start": 31851990,
   "end": 31864016
  }, {
   "filename": "/data/karts/konqi/wheel-front-left.b3d",
   "start": 31864016,
   "end": 31875961
  }, {
   "filename": "/data/karts/konqi/wheel-front-right.b3d",
   "start": 31875961,
   "end": 31887906
  }, {
   "filename": "/data/karts/konqi/wheel-rear-left.b3d",
   "start": 31887906,
   "end": 31899850
  }, {
   "filename": "/data/karts/konqi/wheel-rear-right.b3d",
   "start": 31899850,
   "end": 31911794
  }, {
   "filename": "/data/models/zipper_collect.png",
   "start": 31911794,
   "end": 31923668
  }, {
   "filename": "/data/tracks/islandtrack/seabed.jpg",
   "start": 31923668,
   "end": 31935539
  }, {
   "filename": "/data/tracks/jungle/seabed.jpg",
   "start": 31935539,
   "end": 31947410
  }, {
   "filename": "/data/tracks/sandtrack/seabed.jpg",
   "start": 31947410,
   "end": 31959281
  }, {
   "filename": "/data/tracks/zengarden/sand.jpg",
   "start": 31959281,
   "end": 31971152
  }, {
   "filename": "/data/tracks/olivermath/usaflag.png",
   "start": 31971152,
   "end": 31982943
  }, {
   "filename": "/data/tracks/lighthouse/miniLampPost.b3d",
   "start": 31982943,
   "end": 31994696
  }, {
   "filename": "/data/tracks/lighthouse/miniLampPost_low.b3d",
   "start": 31994696,
   "end": 32006449
  }, {
   "filename": "/data/gui/package.png",
   "start": 32006449,
   "end": 32018201
  }, {
   "filename": "/data/karts/beastie/wheel-front-left.b3d",
   "start": 32018201,
   "end": 32029953
  }, {
   "filename": "/data/karts/beastie/wheel-front-right.b3d",
   "start": 32029953,
   "end": 32041705
  }, {
   "filename": "/data/karts/beastie/wheel-rear-left.b3d",
   "start": 32041705,
   "end": 32053456
  }, {
   "filename": "/data/karts/beastie/wheel-rear-right.b3d",
   "start": 32053456,
   "end": 32065207
  }, {
   "filename": "/data/tracks/fortmagma/xx-61.jpg",
   "start": 32065207,
   "end": 32076947
  }, {
   "filename": "/data/gui/screen_other.png",
   "start": 32076947,
   "end": 32088676
  }, {
   "filename": "/data/gui/skins/ocean/glassbutton.png",
   "start": 32088676,
   "end": 32100394
  }, {
   "filename": "/data/karts/beastie/beastie-icon.png",
   "start": 32100394,
   "end": 32112038
  }, {
   "filename": "/data/models/bonusblock1.png",
   "start": 32112038,
   "end": 32123633
  }, {
   "filename": "/data/tracks/subsea/coquillage-subsea.jpg",
   "start": 32123633,
   "end": 32135200
  }, {
   "filename": "/data/karts/puffy/wheel-front-left.b3d",
   "start": 32135200,
   "end": 32146757
  }, {
   "filename": "/data/karts/puffy/wheel-front-right.b3d",
   "start": 32146757,
   "end": 32158314
  }, {
   "filename": "/data/karts/puffy/wheel-rear-left.b3d",
   "start": 32158314,
   "end": 32169870
  }, {
   "filename": "/data/karts/puffy/wheel-rear-right.b3d",
   "start": 32169870,
   "end": 32181426
  }, {
   "filename": "/data/models/banana-low.b3d",
   "start": 32181426,
   "end": 32192971
  }, {
   "filename": "/data/models/bowling-icon.png",
   "start": 32192971,
   "end": 32204515
  }, {
   "filename": "/data/sfx/hammer.ogg",
   "start": 32204515,
   "end": 32216043,
   "audio": 1
  }, {
   "filename": "/data/tracks/zengarden/pineTree1_LOD50.b3d",
   "start": 32216043,
   "end": 32227540
  }, {
   "filename": "/data/tracks/subsea/egg.b3d",
   "start": 32227540,
   "end": 32239005
  }, {
   "filename": "/data/gui/skins/ocean/glassspinner_focus.png",
   "start": 32239005,
   "end": 32250454
  }, {
   "filename": "/data/tracks/fortmagma/backeffect.jpg",
   "start": 32250454,
   "end": 32261846
  }, {
   "filename": "/data/sfx/appear.ogg",
   "start": 32261846,
   "end": 32273227,
   "audio": 1
  }, {
   "filename": "/data/textures/deprecated/fence.png",
   "start": 32273227,
   "end": 32284557
  }, {
   "filename": "/data/gui/mode_3strikes.png",
   "start": 32284557,
   "end": 32295883
  }, {
   "filename": "/data/tracks/xr591/galaxy1.jpg",
   "start": 32295883,
   "end": 32307174
  }, {
   "filename": "/data/tracks/hacienda/Mesh.b3d",
   "start": 32307174,
   "end": 32318441
  }, {
   "filename": "/data/tracks/tutorial/Mesh.b3d",
   "start": 32318441,
   "end": 32329708
  }, {
   "filename": "/data/tracks/lighthouse/lightBeam.b3d",
   "start": 32329708,
   "end": 32340957
  }, {
   "filename": "/data/tracks/mansion/Circle.024.b3d",
   "start": 32340957,
   "end": 32352190
  }, {
   "filename": "/data/tracks/zengarden/road_Lighthalo.png",
   "start": 32352190,
   "end": 32363407
  }, {
   "filename": "/data/tracks/minigolf/duck.b3d",
   "start": 32363407,
   "end": 32374564
  }, {
   "filename": "/data/tracks/minigolf/duck2.b3d",
   "start": 32374564,
   "end": 32385721
  }, {
   "filename": "/data/tracks/minigolf/duck3.b3d",
   "start": 32385721,
   "end": 32396878
  }, {
   "filename": "/data/karts/sara/wheel-front-left.b3d",
   "start": 32396878,
   "end": 32408031
  }, {
   "filename": "/data/karts/sara/wheel-front-right.b3d",
   "start": 32408031,
   "end": 32419184
  }, {
   "filename": "/data/gui/weapons.png",
   "start": 32419184,
   "end": 32430316
  }, {
   "filename": "/data/karts/pidgin/wheel-front-left.b3d",
   "start": 32430316,
   "end": 32441447
  }, {
   "filename": "/data/karts/pidgin/wheel-front-right.b3d",
   "start": 32441447,
   "end": 32452578
  }, {
   "filename": "/data/karts/nolok/wheel-front-left.b3d",
   "start": 32452578,
   "end": 32463708
  }, {
   "filename": "/data/karts/nolok/wheel-front-right.b3d",
   "start": 32463708,
   "end": 32474838
  }, {
   "filename": "/data/karts/pidgin/wheel-rear-left.b3d",
   "start": 32474838,
   "end": 32485968
  }, {
   "filename": "/data/karts/pidgin/wheel-rear-right.b3d",
   "start": 32485968,
   "end": 32497098
  }, {
   "filename": "/data/karts/nolok/wheel-rear-left.b3d",
   "start": 32497098,
   "end": 32508227
  }, {
   "filename": "/data/karts/nolok/wheel-rear-right.b3d",
   "start": 32508227,
   "end": 32519356
  }, {
   "filename": "/data/tracks/scotland/pub2.png",
   "start": 32519356,
   "end": 32530465
  }, {
   "filename": "/data/tracks/zengarden/bridge_LOD500.b3d",
   "start": 32530465,
   "end": 32541526
  }, {
   "filename": "/data/tracks/xr591/marsrobotsign.jpg",
   "start": 32541526,
   "end": 32552581
  }, {
   "filename": "/data/tracks/overworld/pedestral_lo.b3d",
   "start": 32552581,
   "end": 32563632
  }, {
   "filename": "/data/tracks/city/canyon_conveyor_belt.png",
   "start": 32563632,
   "end": 32574656
  }, {
   "filename": "/data/gui/package-uninstall.png",
   "start": 32574656,
   "end": 32585675
  }, {
   "filename": "/data/gui/skins/ocean/glassspinner_halo.png",
   "start": 32585675,
   "end": 32596672
  }, {
   "filename": "/data/tracks/farm/cow.jpg",
   "start": 32596672,
   "end": 32607611
  }, {
   "filename": "/data/tracks/tutorial/scene.xml",
   "start": 32607611,
   "end": 32618537
  }, {
   "filename": "/data/gui/skins/Ocean.stkskin",
   "start": 32618537,
   "end": 32629462
  }, {
   "filename": "/data/gui/skins/Peach.stkskin",
   "start": 32629462,
   "end": 32640382
  }, {
   "filename": "/data/tracks/subsea/Tortue-tete-subsea.jpg",
   "start": 32640382,
   "end": 32651299
  }, {
   "filename": "/data/tracks/subsea/pillar2_lo.b3d",
   "start": 32651299,
   "end": 32662111
  }, {
   "filename": "/data/tracks/subsea/pillar_lo.b3d",
   "start": 32662111,
   "end": 32672923
  }, {
   "filename": "/data/tracks/snowtuxpeak/icepic.png",
   "start": 32672923,
   "end": 32683734
  }, {
   "filename": "/data/tracks/city/city_signs.png",
   "start": 32683734,
   "end": 32694506
  }, {
   "filename": "/data/gui/race_giveup.png",
   "start": 32694506,
   "end": 32705150
  }, {
   "filename": "/data/tracks/minigolf/windmill_arm1.b3d",
   "start": 32705150,
   "end": 32715709
  }, {
   "filename": "/data/tracks/zengarden/directionLanLite_LOD80.b3d",
   "start": 32715709,
   "end": 32726218
  }, {
   "filename": "/data/karts/puffy/puffy-icon.png",
   "start": 32726218,
   "end": 32736672
  }, {
   "filename": "/data/fonts/LayneHansomBigDigits.png",
   "start": 32736672,
   "end": 32747107
  }, {
   "filename": "/data/gui/no-package.png",
   "start": 32747107,
   "end": 32757542
  }, {
   "filename": "/data/tracks/mines/lamp1.b3d",
   "start": 32757542,
   "end": 32767964
  }, {
   "filename": "/data/sfx/wooden_bridge.ogg",
   "start": 32767964,
   "end": 32778344,
   "audio": 1
  }, {
   "filename": "/data/tracks/lighthouse/quads.xml",
   "start": 32778344,
   "end": 32788616
  }, {
   "filename": "/data/tracks/startrack/marsrobot5.jpg",
   "start": 32788616,
   "end": 32798874
  }, {
   "filename": "/data/tracks/overworld/Mushroom 1 side.png",
   "start": 32798874,
   "end": 32809127
  }, {
   "filename": "/data/gui/options_ui.png",
   "start": 32809127,
   "end": 32819343
  }, {
   "filename": "/data/tracks/overworld/splat.png",
   "start": 32819343,
   "end": 32829491
  }, {
   "filename": "/data/tracks/overworld/splat2.png",
   "start": 32829491,
   "end": 32839639
  }, {
   "filename": "/data/gui/screen43.png",
   "start": 32839639,
   "end": 32849762
  }, {
   "filename": "/data/karts/tux/horn.ogg",
   "start": 32849762,
   "end": 32859819,
   "audio": 1
  }, {
   "filename": "/data/gui/main_network.png",
   "start": 32859819,
   "end": 32869846
  }, {
   "filename": "/data/tracks/snowtuxpeak/adScreen_LOD160.b3d",
   "start": 32869846,
   "end": 32879847
  }, {
   "filename": "/data/tracks/zengarden/Plane.002.b3d",
   "start": 32879847,
   "end": 32889796
  }, {
   "filename": "/data/tracks/xr591/SomeModel.b3d",
   "start": 32889796,
   "end": 32899744
  }, {
   "filename": "/data/tracks/xr591/generator.b3d",
   "start": 32899744,
   "end": 32909692
  }, {
   "filename": "/data/tracks/xr591/water2.b3d",
   "start": 32909692,
   "end": 32919637
  }, {
   "filename": "/data/tracks/lighthouse/seaAnimation.b3d",
   "start": 32919637,
   "end": 32929577
  }, {
   "filename": "/data/tracks/lighthouse/waterTop.b3d",
   "start": 32929577,
   "end": 32939517
  }, {
   "filename": "/data/tracks/overworld/lava.b3d",
   "start": 32939517,
   "end": 32949453
  }, {
   "filename": "/data/tracks/mines/lantern_LOD20.b3d",
   "start": 32949453,
   "end": 32959354
  }, {
   "filename": "/data/tracks/mines/lantern_LODx.b3d",
   "start": 32959354,
   "end": 32969255
  }, {
   "filename": "/data/textures/wooden2.png",
   "start": 32969255,
   "end": 32979092
  }, {
   "filename": "/data/gui/skins/ocean/glassspinner.png",
   "start": 32979092,
   "end": 32988916
  }, {
   "filename": "/data/gui/skins/peach/glassspinner.png",
   "start": 32988916,
   "end": 32998740
  }, {
   "filename": "/data/gui/banana.png",
   "start": 32998740,
   "end": 33008528
  }, {
   "filename": "/data/gui/skins/ocean/glassbutton_focused.png",
   "start": 33008528,
   "end": 33018274
  }, {
   "filename": "/data/tracks/fortmagma/winFrame.b3d",
   "start": 33018274,
   "end": 33027996
  }, {
   "filename": "/data/textures/skidmarks.png",
   "start": 33027996,
   "end": 33037697
  }, {
   "filename": "/data/karts/tux/tuxicon.png",
   "start": 33037697,
   "end": 33047341
  }, {
   "filename": "/data/models/stk_mod_nitroLogo.png",
   "start": 33047341,
   "end": 33056981
  }, {
   "filename": "/data/tracks/city/building_1.b3d",
   "start": 33056981,
   "end": 33066580
  }, {
   "filename": "/data/models/plunger-icon.png",
   "start": 33066580,
   "end": 33076111
  }, {
   "filename": "/data/sfx/horn.ogg",
   "start": 33076111,
   "end": 33085639,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/scene.xml",
   "start": 33085639,
   "end": 33095160
  }, {
   "filename": "/data/tracks/hacienda/quads.xml",
   "start": 33095160,
   "end": 33104613
  }, {
   "filename": "/data/tracks/tutorial/quads.xml",
   "start": 33104613,
   "end": 33114066
  }, {
   "filename": "/data/tracks/snowtuxpeak/treeMod1_LOD80.b3d",
   "start": 33114066,
   "end": 33123489
  }, {
   "filename": "/data/tracks/startrack/moon.jpg",
   "start": 33123489,
   "end": 33132912
  }, {
   "filename": "/data/tracks/introcutscene/lanternDirection.png",
   "start": 33132912,
   "end": 33142283
  }, {
   "filename": "/data/gui/cup_silver.png",
   "start": 33142283,
   "end": 33151637
  }, {
   "filename": "/data/tracks/subsea/LilySmall-subsea.png",
   "start": 33151637,
   "end": 33160982
  }, {
   "filename": "/data/tracks/fortmagma/back-text.jpg",
   "start": 33160982,
   "end": 33170324
  }, {
   "filename": "/data/tracks/snowtuxpeak/pipe_LOD50.b3d",
   "start": 33170324,
   "end": 33179663
  }, {
   "filename": "/data/fonts/rasheeq1.png",
   "start": 33179663,
   "end": 33188931
  }, {
   "filename": "/data/karts/hexley/hexleyicon.png",
   "start": 33188931,
   "end": 33198179
  }, {
   "filename": "/data/models/easter_egg.b3d",
   "start": 33198179,
   "end": 33207421
  }, {
   "filename": "/data/tracks/startrack/lightHaloG.png",
   "start": 33207421,
   "end": 33216649
  }, {
   "filename": "/data/gui/random_kart.png",
   "start": 33216649,
   "end": 33225866
  }, {
   "filename": "/data/fonts/rasheeq4.png",
   "start": 33225866,
   "end": 33235043
  }, {
   "filename": "/data/tracks/zengarden/lantern_light.png",
   "start": 33235043,
   "end": 33244200
  }, {
   "filename": "/data/tracks/zengarden/monumentWater2.png",
   "start": 33244200,
   "end": 33253342
  }, {
   "filename": "/data/tracks/zengarden/torii_LOD75.b3d",
   "start": 33253342,
   "end": 33262484
  }, {
   "filename": "/data/tracks/xr591/marsroad_blue.jpg",
   "start": 33262484,
   "end": 33271572
  }, {
   "filename": "/data/tracks/farm/silo.b3d",
   "start": 33271572,
   "end": 33280633
  }, {
   "filename": "/data/sfx/jump.ogg",
   "start": 33280633,
   "end": 33289685,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/Window5.png",
   "start": 33289685,
   "end": 33298735
  }, {
   "filename": "/data/karts/emule/wheel-front-left.b3d",
   "start": 33298735,
   "end": 33307775
  }, {
   "filename": "/data/karts/emule/wheel-front-right.b3d",
   "start": 33307775,
   "end": 33316815
  }, {
   "filename": "/data/karts/emule/wheel-rear-left.b3d",
   "start": 33316815,
   "end": 33325854
  }, {
   "filename": "/data/karts/emule/wheel-rear-right.b3d",
   "start": 33325854,
   "end": 33334893
  }, {
   "filename": "/data/gui/help2.stkgui",
   "start": 33334893,
   "end": 33343923
  }, {
   "filename": "/data/gui/soccer_ball_blue.png",
   "start": 33343923,
   "end": 33352952
  }, {
   "filename": "/data/tracks/startrack/bzzt2.ogg",
   "start": 33352952,
   "end": 33361964,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/DoorOld.png",
   "start": 33361964,
   "end": 33370952
  }, {
   "filename": "/data/tracks/minigolf/Icosphere.b3d",
   "start": 33370952,
   "end": 33379808
  }, {
   "filename": "/data/gui/soccer_ball_red.png",
   "start": 33379808,
   "end": 33388653
  }, {
   "filename": "/data/tracks/subsea/eggs-subsea.png",
   "start": 33388653,
   "end": 33397489
  }, {
   "filename": "/data/karts/emule/emule_shadow.png",
   "start": 33397489,
   "end": 33406291
  }, {
   "filename": "/data/models/anchor-attach-icon.png",
   "start": 33406291,
   "end": 33415031
  }, {
   "filename": "/data/models/anchor-icon.png",
   "start": 33415031,
   "end": 33423729
  }, {
   "filename": "/data/tracks/fortmagma/lavaspike.002.b3d",
   "start": 33423729,
   "end": 33432416
  }, {
   "filename": "/data/models/gplose_door.b3d",
   "start": 33432416,
   "end": 33441100
  }, {
   "filename": "/data/gui/gamepad_off.png",
   "start": 33441100,
   "end": 33449705
  }, {
   "filename": "/data/tracks/overworld/quads.xml",
   "start": 33449705,
   "end": 33458303
  }, {
   "filename": "/data/tracks/scotland/water1.b3d",
   "start": 33458303,
   "end": 33466879
  }, {
   "filename": "/data/textures/deprecated/metalgrid.png",
   "start": 33466879,
   "end": 33475332
  }, {
   "filename": "/data/gui/gamepad.png",
   "start": 33475332,
   "end": 33483732
  }, {
   "filename": "/data/karts/sara/sara-shadow.png",
   "start": 33483732,
   "end": 33492128
  }, {
   "filename": "/data/gui/options_players.png",
   "start": 33492128,
   "end": 33500462
  }, {
   "filename": "/data/models/bowling.png",
   "start": 33500462,
   "end": 33508758
  }, {
   "filename": "/data/models/gift-box-low.b3d",
   "start": 33508758,
   "end": 33516981
  }, {
   "filename": "/data/tracks/minigolf/scene.xml",
   "start": 33516981,
   "end": 33525199
  }, {
   "filename": "/data/gui/help3.stkgui",
   "start": 33525199,
   "end": 33533411
  }, {
   "filename": "/data/fonts/rasheeq3.png",
   "start": 33533411,
   "end": 33541603
  }, {
   "filename": "/data/sfx/crash.ogg",
   "start": 33541603,
   "end": 33549764,
   "audio": 1
  }, {
   "filename": "/data/tracks/xr591/jupiter.jpg",
   "start": 33549764,
   "end": 33557902
  }, {
   "filename": "/data/textures/deprecated/bananawrap.png",
   "start": 33557902,
   "end": 33566026
  }, {
   "filename": "/data/tracks/mansion/Circle.027.b3d",
   "start": 33566026,
   "end": 33574150
  }, {
   "filename": "/data/textures/deprecated/flames.png",
   "start": 33574150,
   "end": 33582266
  }, {
   "filename": "/data/tracks/overworld/water.b3d",
   "start": 33582266,
   "end": 33590378
  }, {
   "filename": "/data/gui/track_random.png",
   "start": 33590378,
   "end": 33598479
  }, {
   "filename": "/data/tracks/scotland/WindowOld.png",
   "start": 33598479,
   "end": 33606578
  }, {
   "filename": "/data/sfx/bzzt.ogg",
   "start": 33606578,
   "end": 33614665,
   "audio": 1
  }, {
   "filename": "/data/karts/gnu/gnuicon.png",
   "start": 33614665,
   "end": 33622726
  }, {
   "filename": "/data/tracks/introcutscene/tree1.b3d",
   "start": 33622726,
   "end": 33630727
  }, {
   "filename": "/data/tracks/introcutscene/tree2.b3d",
   "start": 33630727,
   "end": 33638728
  }, {
   "filename": "/data/tracks/introcutscene/tree3.b3d",
   "start": 33638728,
   "end": 33646729
  }, {
   "filename": "/data/tracks/introcutscene/tree4.b3d",
   "start": 33646729,
   "end": 33654730
  }, {
   "filename": "/data/tracks/overworld/pinetreeDetailed.b3d",
   "start": 33654730,
   "end": 33662731
  }, {
   "filename": "/data/tracks/scotland/pinetree.b3d",
   "start": 33662731,
   "end": 33670732
  }, {
   "filename": "/data/tracks/zengarden/pineTree1_LOD90.b3d",
   "start": 33670732,
   "end": 33678733
  }, {
   "filename": "/data/tracks/zengarden/fern_LOD30.b3d",
   "start": 33678733,
   "end": 33686729
  }, {
   "filename": "/data/tracks/zengarden/grassCaves.b3d",
   "start": 33686729,
   "end": 33694720
  }, {
   "filename": "/data/tracks/farm/leaf.png",
   "start": 33694720,
   "end": 33702701
  }, {
   "filename": "/data/tracks/mansion/swamp.png",
   "start": 33702701,
   "end": 33710636
  }, {
   "filename": "/data/tracks/subsea/snowyrock2brick-subsea.jpg",
   "start": 33710636,
   "end": 33718565
  }, {
   "filename": "/data/sfx/plunger.ogg",
   "start": 33718565,
   "end": 33726489,
   "audio": 1
  }, {
   "filename": "/data/tracks/hacienda/scene.xml",
   "start": 33726489,
   "end": 33734406
  }, {
   "filename": "/data/tracks/xr591/road_dirt_red.jpg",
   "start": 33734406,
   "end": 33742315
  }, {
   "filename": "/data/karts/adiumy/adiumyicon.png",
   "start": 33742315,
   "end": 33750216
  }, {
   "filename": "/data/models/nitrotank-big-low.b3d",
   "start": 33750216,
   "end": 33758093
  }, {
   "filename": "/data/karts/konqi/konqiV1-name.png",
   "start": 33758093,
   "end": 33765948
  }, {
   "filename": "/data/tracks/mansion/quads.xml",
   "start": 33765948,
   "end": 33773773
  }, {
   "filename": "/data/gui/main_race.png",
   "start": 33773773,
   "end": 33781522
  }, {
   "filename": "/data/tracks/startrack/pipe1c.jpg",
   "start": 33781522,
   "end": 33789258
  }, {
   "filename": "/data/gui/restart.png",
   "start": 33789258,
   "end": 33796988
  }, {
   "filename": "/data/tracks/xr591/scene.xml",
   "start": 33796988,
   "end": 33804698
  }, {
   "filename": "/data/gui/options_audio.png",
   "start": 33804698,
   "end": 33812400
  }, {
   "filename": "/data/karts/konqi/konqi_icon.png",
   "start": 33812400,
   "end": 33820088
  }, {
   "filename": "/data/sfx/portal.ogg",
   "start": 33820088,
   "end": 33827765,
   "audio": 1
  }, {
   "filename": "/data/tracks/scotland/Window4.png",
   "start": 33827765,
   "end": 33835432
  }, {
   "filename": "/data/sfx/grab_collectable.ogg",
   "start": 33835432,
   "end": 33843013,
   "audio": 1
  }, {
   "filename": "/data/sfx/anvil.ogg",
   "start": 33843013,
   "end": 33850548,
   "audio": 1
  }, {
   "filename": "/data/tracks/overworld/Mushroom 7 side.png",
   "start": 33850548,
   "end": 33858074
  }, {
   "filename": "/data/gui/skins/peach/glasstab.png",
   "start": 33858074,
   "end": 33865594
  }, {
   "filename": "/data/tracks/scotland/POD_Pillar.png",
   "start": 33865594,
   "end": 33873106
  }, {
   "filename": "/data/sfx/License.txt",
   "start": 33873106,
   "end": 33880530
  }, {
   "filename": "/data/tracks/scotland/NessyDarkGreen.png",
   "start": 33880530,
   "end": 33887923
  }, {
   "filename": "/data/textures/ants.png",
   "start": 33887923,
   "end": 33895313
  }, {
   "filename": "/data/tracks/snowtuxpeak/quads.xml",
   "start": 33895313,
   "end": 33902672
  }, {
   "filename": "/data/tracks/overworld/wood_planks6.png",
   "start": 33902672,
   "end": 33910017
  }, {
   "filename": "/data/tracks/scotland/wood_planks6.png",
   "start": 33910017,
   "end": 33917362
  }, {
   "filename": "/data/tracks/fortmagma/quads.xml",
   "start": 33917362,
   "end": 33924689
  }, {
   "filename": "/data/sfx/ball_bounce.ogg",
   "start": 33924689,
   "end": 33931936,
   "audio": 1
  }, {
   "filename": "/data/tracks/xr591/marsroad_blue2.jpg",
   "start": 33931936,
   "end": 33939175
  }, {
   "filename": "/data/karts/nolok/nolokicon.png",
   "start": 33939175,
   "end": 33946411
  }, {
   "filename": "/data/models/bonusblock2.b3d",
   "start": 33946411,
   "end": 33953644
  }, {
   "filename": "/data/tracks/farm/barn_window.jpg",
   "start": 33953644,
   "end": 33960807
  }, {
   "filename": "/data/tracks/zengarden/quads.xml",
   "start": 33960807,
   "end": 33967910
  }, {
   "filename": "/data/tracks/overworld/bubble_techno2.b3d",
   "start": 33967910,
   "end": 33975006
  }, {
   "filename": "/data/karts/elephpant/elephpanticon.png",
   "start": 33975006,
   "end": 33982049
  }, {
   "filename": "/data/tracks/mines/chrome.png",
   "start": 33982049,
   "end": 33989064
  }, {
   "filename": "/data/tracks/overworld/wood_planks7.png",
   "start": 33989064,
   "end": 33996039
  }, {
   "filename": "/data/tracks/scotland/wood_planks7.png",
   "start": 33996039,
   "end": 34003014
  }, {
   "filename": "/data/sfx/parachute.ogg",
   "start": 34003014,
   "end": 34009950,
   "audio": 1
  }, {
   "filename": "/data/gui/gauge_goal.png",
   "start": 34009950,
   "end": 34016854
  }, {
   "filename": "/data/tracks/subsea/sand2water-subsea.jpg",
   "start": 34016854,
   "end": 34023752
  }, {
   "filename": "/data/karts/puffy/puffy-shadow.png",
   "start": 34023752,
   "end": 34030629
  }, {
   "filename": "/data/sfx/explosion.ogg",
   "start": 34030629,
   "end": 34037500,
   "audio": 1
  }, {
   "filename": "/data/gui/options_video.png",
   "start": 34037500,
   "end": 34044344
  }, {
   "filename": "/data/gui/loading.png",
   "start": 34044344,
   "end": 34051130
  }, {
   "filename": "/data/gui/help1.stkgui",
   "start": 34051130,
   "end": 34057898
  }, {
   "filename": "/data/tracks/fortmagma/postTooth.jpg",
   "start": 34057898,
   "end": 34064641
  }, {
   "filename": "/data/tracks/hacienda/Mesh.001.b3d",
   "start": 34064641,
   "end": 34071376
  }, {
   "filename": "/data/tracks/tutorial/Mesh.001.b3d",
   "start": 34071376,
   "end": 34078111
  }, {
   "filename": "/data/tracks/greenvalley/Flower3F.png",
   "start": 34078111,
   "end": 34084829
  }, {
   "filename": "/data/tracks/zengarden/torii_LOD120.b3d",
   "start": 34084829,
   "end": 34091539
  }, {
   "filename": "/data/tracks/mansion/Mesh.001.b3d",
   "start": 34091539,
   "end": 34098163
  }, {
   "filename": "/data/karts/sara/saraEyes.png",
   "start": 34098163,
   "end": 34104762
  }, {
   "filename": "/data/gui/skins/peach/left_arrow_focus.png",
   "start": 34104762,
   "end": 34111352
  }, {
   "filename": "/data/textures/materials.xml",
   "start": 34111352,
   "end": 34117878
  }, {
   "filename": "/data/tracks/subsea/Transparent-Broken-1-subsea.png",
   "start": 34117878,
   "end": 34124395
  }, {
   "filename": "/data/gui/skins/peach/right_arrow_focus.png",
   "start": 34124395,
   "end": 34130900
  }, {
   "filename": "/data/tracks/mines/halo_lamp.png",
   "start": 34130900,
   "end": 34137362
  }, {
   "filename": "/data/tracks/overworld/wood_planks5.png",
   "start": 34137362,
   "end": 34143811
  }, {
   "filename": "/data/tracks/scotland/seabed.png",
   "start": 34143811,
   "end": 34150260
  }, {
   "filename": "/data/tracks/scotland/wood_planks5.png",
   "start": 34150260,
   "end": 34156709
  }, {
   "filename": "/data/gui/skins/ocean/left_arrow_focus.png",
   "start": 34156709,
   "end": 34163152
  }, {
   "filename": "/data/textures/signs.png",
   "start": 34163152,
   "end": 34169547
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_sea.b3d",
   "start": 34169547,
   "end": 34175940
  }, {
   "filename": "/data/gui/skins/ocean/right_arrow_focus.png",
   "start": 34175940,
   "end": 34182291
  }, {
   "filename": "/data/tracks/xr591/marsroad_green.jpg",
   "start": 34182291,
   "end": 34188624
  }, {
   "filename": "/data/tracks/mansion/Circle.025.b3d",
   "start": 34188624,
   "end": 34194913
  }, {
   "filename": "/data/karts/wilber/wilbericon.png",
   "start": 34194913,
   "end": 34201182
  }, {
   "filename": "/data/gui/main_quit.png",
   "start": 34201182,
   "end": 34207450
  }, {
   "filename": "/data/textures/License.txt",
   "start": 34207450,
   "end": 34213681
  }, {
   "filename": "/data/textures/flaring-star.png",
   "start": 34213681,
   "end": 34219906
  }, {
   "filename": "/data/tracks/subsea/dirt_0-subsea.jpg",
   "start": 34219906,
   "end": 34226122
  }, {
   "filename": "/data/tracks/greenvalley/License.txt",
   "start": 34226122,
   "end": 34232251
  }, {
   "filename": "/data/tracks/subsea/Transparent-Particles-subsea.png",
   "start": 34232251,
   "end": 34238358
  }, {
   "filename": "/data/karts/adiumy/wheel-rear-left.b3d",
   "start": 34238358,
   "end": 34244460
  }, {
   "filename": "/data/karts/adiumy/wheel-rear-right.b3d",
   "start": 34244460,
   "end": 34250562
  }, {
   "filename": "/data/gui/search.png",
   "start": 34250562,
   "end": 34256661
  }, {
   "filename": "/data/karts/beastie/beastie-shadow.png",
   "start": 34256661,
   "end": 34262733
  }, {
   "filename": "/data/tracks/xr591/venus.jpg",
   "start": 34262733,
   "end": 34268763
  }, {
   "filename": "/data/karts/konqi/konqi_kerchief.png",
   "start": 34268763,
   "end": 34274786
  }, {
   "filename": "/data/tracks/startrack/trak3_light1b.png",
   "start": 34274786,
   "end": 34280708
  }, {
   "filename": "/data/powerup.xml",
   "start": 34280708,
   "end": 34286616
  }, {
   "filename": "/data/tracks/olivermath/tv.png",
   "start": 34286616,
   "end": 34292511
  }, {
   "filename": "/data/textures/butterfly.png",
   "start": 34292511,
   "end": 34298312
  }, {
   "filename": "/data/tracks/fortmagma/roadpart.b3d",
   "start": 34298312,
   "end": 34304110
  }, {
   "filename": "/data/tracks/snowtuxpeak/treeMod1_LOD170.b3d",
   "start": 34304110,
   "end": 34309889
  }, {
   "filename": "/data/tracks/zengarden/limit_LOD35.b3d",
   "start": 34309889,
   "end": 34315629
  }, {
   "filename": "/data/tracks/startrack/trak3_light1a.png",
   "start": 34315629,
   "end": 34321353
  }, {
   "filename": "/data/tracks/zengarden/lightHaloY.png",
   "start": 34321353,
   "end": 34327075
  }, {
   "filename": "/data/gui/gauge_empty.png",
   "start": 34327075,
   "end": 34332779
  }, {
   "filename": "/data/tracks/overworld/bubble_solid.b3d",
   "start": 34332779,
   "end": 34338480
  }, {
   "filename": "/data/tracks/overworld/bubble_solid2.b3d",
   "start": 34338480,
   "end": 34344181
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_mountain.b3d",
   "start": 34344181,
   "end": 34349882
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_techno.b3d",
   "start": 34349882,
   "end": 34355583
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_house.b3d",
   "start": 34355583,
   "end": 34361280
  }, {
   "filename": "/data/tracks/mansion/bugsSwamp.b3d",
   "start": 34361280,
   "end": 34366969
  }, {
   "filename": "/data/tracks/overworld/fern_LOD30.b3d",
   "start": 34366969,
   "end": 34372657
  }, {
   "filename": "/data/tracks/zengarden/Plane.007.b3d",
   "start": 34372657,
   "end": 34378344
  }, {
   "filename": "/data/gui/help4.stkgui",
   "start": 34378344,
   "end": 34383988
  }, {
   "filename": "/data/tracks/introcutscene/Remote.b3d",
   "start": 34383988,
   "end": 34389627
  }, {
   "filename": "/data/sfx/ugh.ogg",
   "start": 34389627,
   "end": 34395234,
   "audio": 1
  }, {
   "filename": "/data/tracks/fortmagma/lavaspike.003.b3d",
   "start": 34395234,
   "end": 34400817
  }, {
   "filename": "/data/models/christmas_hat.png",
   "start": 34400817,
   "end": 34406361
  }, {
   "filename": "/data/textures/deprecated/tinytux.png",
   "start": 34406361,
   "end": 34411874
  }, {
   "filename": "/data/tracks/fortmagma/diamond.b3d",
   "start": 34411874,
   "end": 34417373
  }, {
   "filename": "/data/tracks/mines/lantern_LOD50.b3d",
   "start": 34417373,
   "end": 34422738
  }, {
   "filename": "/data/models/bubblegum_nolok.jpg",
   "start": 34422738,
   "end": 34428048
  }, {
   "filename": "/data/gui/skins/peach/glasstab_focus.png",
   "start": 34428048,
   "end": 34433343
  }, {
   "filename": "/data/tracks/fortmagma/lightHaloY.png",
   "start": 34433343,
   "end": 34438617
  }, {
   "filename": "/data/sfx/bowling_shoot.ogg",
   "start": 34438617,
   "end": 34443882,
   "audio": 1
  }, {
   "filename": "/data/karts/pidgin/pidginicon.png",
   "start": 34443882,
   "end": 34449138
  }, {
   "filename": "/data/tracks/minigolf/vlag.b3d",
   "start": 34449138,
   "end": 34454362
  }, {
   "filename": "/data/tracks/startrack/lightHaloY.png",
   "start": 34454362,
   "end": 34459586
  }, {
   "filename": "/data/textures/sea.jpg",
   "start": 34459586,
   "end": 34464784
  }, {
   "filename": "/data/tracks/lighthouse/sea-bed.jpg",
   "start": 34464784,
   "end": 34469982
  }, {
   "filename": "/data/karts/puffy/fog.png",
   "start": 34469982,
   "end": 34475177
  }, {
   "filename": "/data/tracks/subsea/License.txt",
   "start": 34475177,
   "end": 34480322
  }, {
   "filename": "/data/gui/skins/ocean/left_arrow.png",
   "start": 34480322,
   "end": 34485434
  }, {
   "filename": "/data/gui/skins/peach/left_arrow.png",
   "start": 34485434,
   "end": 34490546
  }, {
   "filename": "/data/gui/skins/peach/glasstab_down.png",
   "start": 34490546,
   "end": 34495651
  }, {
   "filename": "/data/tracks/xr591/mars_spider.jpg",
   "start": 34495651,
   "end": 34500731
  }, {
   "filename": "/data/tracks/xr591/marsrobot6.jpg",
   "start": 34500731,
   "end": 34505811
  }, {
   "filename": "/data/tracks/overworld/materials.xml",
   "start": 34505811,
   "end": 34510834
  }, {
   "filename": "/data/sfx/wee.ogg",
   "start": 34510834,
   "end": 34515856,
   "audio": 1
  }, {
   "filename": "/data/gui/skins/ocean/right_arrow.png",
   "start": 34515856,
   "end": 34520877
  }, {
   "filename": "/data/gui/skins/peach/right_arrow.png",
   "start": 34520877,
   "end": 34525898
  }, {
   "filename": "/data/karts/tux/tuxkartshadow.png",
   "start": 34525898,
   "end": 34530883
  }, {
   "filename": "/data/tracks/endcutscene/tuxkartshadow.png",
   "start": 34530883,
   "end": 34535868
  }, {
   "filename": "/data/tracks/subsea/wood_planks2-subsea.jpg",
   "start": 34535868,
   "end": 34540828
  }, {
   "filename": "/data/tracks/startrack/lightLenFlareR.png",
   "start": 34540828,
   "end": 34545779
  }, {
   "filename": "/data/tracks/scotland/Phoque_Plane.png",
   "start": 34545779,
   "end": 34550680
  }, {
   "filename": "/data/karts/hexley/wheel-front-right.b3d",
   "start": 34550680,
   "end": 34555555
  }, {
   "filename": "/data/karts/wilber/wheel-front-left.b3d",
   "start": 34555555,
   "end": 34560430
  }, {
   "filename": "/data/karts/wilber/wheel-front-right.b3d",
   "start": 34560430,
   "end": 34565305
  }, {
   "filename": "/data/karts/hexley/wheel-rear-left.b3d",
   "start": 34565305,
   "end": 34570179
  }, {
   "filename": "/data/karts/hexley/wheel-rear-right.b3d",
   "start": 34570179,
   "end": 34575053
  }, {
   "filename": "/data/karts/wilber/wheel-rear-right.b3d",
   "start": 34575053,
   "end": 34579927
  }, {
   "filename": "/data/karts/hexley/wheel-front-left.b3d",
   "start": 34579927,
   "end": 34584798
  }, {
   "filename": "/data/karts/wilber/wheel-rear-left.b3d",
   "start": 34584798,
   "end": 34589668
  }, {
   "filename": "/data/gui/keyboard.png",
   "start": 34589668,
   "end": 34594480
  }, {
   "filename": "/data/tracks/subsea/water_dark-subsea.jpg",
   "start": 34594480,
   "end": 34599284
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_saucer.b3d",
   "start": 34599284,
   "end": 34604073
  }, {
   "filename": "/data/tracks/lighthouse/lightHaloY.png",
   "start": 34604073,
   "end": 34608861
  }, {
   "filename": "/data/tracks/mansion/lightHaloY.png",
   "start": 34608861,
   "end": 34613649
  }, {
   "filename": "/data/tracks/mines/lightHaloY.png",
   "start": 34613649,
   "end": 34618437
  }, {
   "filename": "/data/tracks/lighthouse/death_grass_chunk_hight.b3d",
   "start": 34618437,
   "end": 34623198
  }, {
   "filename": "/data/tracks/startrack/lightHaloB.png",
   "start": 34623198,
   "end": 34627952
  }, {
   "filename": "/data/tracks/lighthouse/grass_chunk_hight.b3d",
   "start": 34627952,
   "end": 34632703
  }, {
   "filename": "/data/karts/konqi/konqiV1 shadow.png",
   "start": 34632703,
   "end": 34637382
  }, {
   "filename": "/data/gui/skins/peach/glasscheckbox_checked_focus.png",
   "start": 34637382,
   "end": 34642034
  }, {
   "filename": "/data/gui/skins/peach/glasscheckbox.png",
   "start": 34642034,
   "end": 34646667
  }, {
   "filename": "/data/tracks/xr591/marsrobot3.jpg",
   "start": 34646667,
   "end": 34651253
  }, {
   "filename": "/data/tracks/scotland/water2.b3d",
   "start": 34651253,
   "end": 34655837
  }, {
   "filename": "/data/tracks/subsea/organic-subsea.jpg",
   "start": 34655837,
   "end": 34660409
  }, {
   "filename": "/data/tracks/snowmountain/scene.xml",
   "start": 34660409,
   "end": 34664922
  }, {
   "filename": "/data/tracks/xr591/lightBeam.b3d",
   "start": 34664922,
   "end": 34669426
  }, {
   "filename": "/data/gui/skins/peach/glasscheckbox_focus.png",
   "start": 34669426,
   "end": 34673900
  }, {
   "filename": "/data/gui/skins/peach/textbubble2.png",
   "start": 34673900,
   "end": 34678374
  }, {
   "filename": "/data/gui/nitro.png",
   "start": 34678374,
   "end": 34682834
  }, {
   "filename": "/data/gui/skins/peach/textbubble.png",
   "start": 34682834,
   "end": 34687274
  }, {
   "filename": "/data/fonts/comix.png",
   "start": 34687274,
   "end": 34691693
  }, {
   "filename": "/data/tracks/zengarden/haloStoneLantern.png",
   "start": 34691693,
   "end": 34696088
  }, {
   "filename": "/data/tracks/snowmountain/door.png",
   "start": 34696088,
   "end": 34700475
  }, {
   "filename": "/data/tracks/scotland/Door4.png",
   "start": 34700475,
   "end": 34704848
  }, {
   "filename": "/data/tracks/olivermath/lunchbox2.png",
   "start": 34704848,
   "end": 34709214
  }, {
   "filename": "/data/gui/gui_lock.png",
   "start": 34709214,
   "end": 34713564
  }, {
   "filename": "/data/tracks/olivermath/lunchbox.png",
   "start": 34713564,
   "end": 34717889
  }, {
   "filename": "/data/textures/chrome.png",
   "start": 34717889,
   "end": 34722195
  }, {
   "filename": "/data/tracks/city/grass.b3d",
   "start": 34722195,
   "end": 34726470
  }, {
   "filename": "/data/tracks/xr591/marsrobot4.jpg",
   "start": 34726470,
   "end": 34730739
  }, {
   "filename": "/data/tracks/mansion/metal_barrier.b3d",
   "start": 34730739,
   "end": 34735005
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_sphere.b3d",
   "start": 34735005,
   "end": 34739267
  }, {
   "filename": "/data/tracks/subsea/chain-subsea.png",
   "start": 34739267,
   "end": 34743510
  }, {
   "filename": "/data/karts/beagle/beagle_shadow.png",
   "start": 34743510,
   "end": 34747739
  }, {
   "filename": "/data/gui/skins/ocean/glasstab_down.png",
   "start": 34747739,
   "end": 34751956
  }, {
   "filename": "/data/gui/skins/ocean/glasstab_focus.png",
   "start": 34751956,
   "end": 34756173
  }, {
   "filename": "/data/tracks/soccer_field/racetrack_red.png",
   "start": 34756173,
   "end": 34760362
  }, {
   "filename": "/data/tracks/stadium/racetrack_red.png",
   "start": 34760362,
   "end": 34764551
  }, {
   "filename": "/data/sfx/sfx.xml",
   "start": 34764551,
   "end": 34768739
  }, {
   "filename": "/data/gui/main_help.png",
   "start": 34768739,
   "end": 34772910
  }, {
   "filename": "/data/textures/generickartshadow.png",
   "start": 34772910,
   "end": 34777077
  }, {
   "filename": "/data/tracks/subsea/Rubis-subsea.png",
   "start": 34777077,
   "end": 34781221
  }, {
   "filename": "/data/tracks/startrack/terminal_text.png",
   "start": 34781221,
   "end": 34785344
  }, {
   "filename": "/data/tracks/xr591/marswindow2.jpg",
   "start": 34785344,
   "end": 34789467
  }, {
   "filename": "/data/tracks/snowmountain/windowshutters.png",
   "start": 34789467,
   "end": 34793589
  }, {
   "filename": "/data/tracks/zengarden/fern_LOD60.b3d",
   "start": 34793589,
   "end": 34797697
  }, {
   "filename": "/data/tracks/snowmountain/eyes.jpg",
   "start": 34797697,
   "end": 34801790
  }, {
   "filename": "/data/tracks/snowtuxpeak/eyes.jpg",
   "start": 34801790,
   "end": 34805883
  }, {
   "filename": "/data/gui/options_video.stkgui",
   "start": 34805883,
   "end": 34809974
  }, {
   "filename": "/data/karts/sara/Skin2.png",
   "start": 34809974,
   "end": 34814057
  }, {
   "filename": "/data/tracks/islandtrack/scene.xml",
   "start": 34814057,
   "end": 34818107
  }, {
   "filename": "/data/tracks/jungle/scene.xml",
   "start": 34818107,
   "end": 34822125
  }, {
   "filename": "/data/tracks/subsea/Rubis.b3d",
   "start": 34822125,
   "end": 34826098
  }, {
   "filename": "/data/tracks/mines/lightHaloR.png",
   "start": 34826098,
   "end": 34830053
  }, {
   "filename": "/data/tracks/sandtrack/scene.xml",
   "start": 34830053,
   "end": 34833995
  }, {
   "filename": "/data/tracks/xr591/marsroad_red.jpg",
   "start": 34833995,
   "end": 34837935
  }, {
   "filename": "/data/gui/main_options.png",
   "start": 34837935,
   "end": 34841868
  }, {
   "filename": "/data/tracks/mines/lightHaloG.png",
   "start": 34841868,
   "end": 34845763
  }, {
   "filename": "/data/tracks/zengarden/water_light2.png",
   "start": 34845763,
   "end": 34849647
  }, {
   "filename": "/data/tracks/lighthouse/fishing_net.b3d",
   "start": 34849647,
   "end": 34853515
  }, {
   "filename": "/data/po/extract_strings_from_XML.py",
   "start": 34853515,
   "end": 34857361
  }, {
   "filename": "/data/tracks/snowtuxpeak/pillard_LOD180.b3d",
   "start": 34857361,
   "end": 34861149
  }, {
   "filename": "/data/tracks/xr591/marswindow3.jpg",
   "start": 34861149,
   "end": 34864927
  }, {
   "filename": "/data/tracks/olivermath/quads.xml",
   "start": 34864927,
   "end": 34868696
  }, {
   "filename": "/data/tracks/zengarden/limit_LOD90.b3d",
   "start": 34868696,
   "end": 34872460
  }, {
   "filename": "/data/tracks/snowmountain/window2.png",
   "start": 34872460,
   "end": 34876222
  }, {
   "filename": "/data/gui/back.png",
   "start": 34876222,
   "end": 34879952
  }, {
   "filename": "/data/gui/challenge.png",
   "start": 34879952,
   "end": 34883670
  }, {
   "filename": "/data/tracks/xr591/marswindow1.jpg",
   "start": 34883670,
   "end": 34887382
  }, {
   "filename": "/data/tracks/subsea/Varan-peau-1-subsea.jpg",
   "start": 34887382,
   "end": 34891093
  }, {
   "filename": "/data/tracks/introcutscene2/door.b3d",
   "start": 34891093,
   "end": 34894776
  }, {
   "filename": "/data/gui/hourglass.png",
   "start": 34894776,
   "end": 34898442
  }, {
   "filename": "/data/tracks/hacienda/pot.b3d",
   "start": 34898442,
   "end": 34902095
  }, {
   "filename": "/data/tracks/hacienda/InvisibleWalls.b3d",
   "start": 34902095,
   "end": 34905743
  }, {
   "filename": "/data/karts/suzanne/shadow.png",
   "start": 34905743,
   "end": 34909377
  }, {
   "filename": "/data/tracks/mines/lamp2.b3d",
   "start": 34909377,
   "end": 34912987
  }, {
   "filename": "/data/tracks/snowtuxpeak/wpill_LOD50.b3d",
   "start": 34912987,
   "end": 34916590
  }, {
   "filename": "/data/tracks/subsea/Transparent-door-subsea.png",
   "start": 34916590,
   "end": 34920185
  }, {
   "filename": "/data/tracks/subsea/Transparent-subsea.png",
   "start": 34920185,
   "end": 34923780
  }, {
   "filename": "/data/tracks/startrack/terminal_graphic.png",
   "start": 34923780,
   "end": 34927372
  }, {
   "filename": "/data/tracks/mansion/water_light2.png",
   "start": 34927372,
   "end": 34930948
  }, {
   "filename": "/data/gui/skins/peach/scrollbar_btn_down.png",
   "start": 34930948,
   "end": 34934469
  }, {
   "filename": "/data/tracks/zengarden/materials.xml",
   "start": 34934469,
   "end": 34937971
  }, {
   "filename": "/data/gui/skins/peach/glasscheckbox_checked.png",
   "start": 34937971,
   "end": 34941467
  }, {
   "filename": "/data/karts/xfcemouse/shadow.png",
   "start": 34941467,
   "end": 34944951
  }, {
   "filename": "/data/gui/skins/peach/scrollbar_thumb.png",
   "start": 34944951,
   "end": 34948409
  }, {
   "filename": "/data/tracks/greenvalley/ArctinumMinus.b3d",
   "start": 34948409,
   "end": 34951851
  }, {
   "filename": "/data/gui/soccer_player_red.png",
   "start": 34951851,
   "end": 34955215
  }, {
   "filename": "/data/tracks/zengarden/pineTree1_LOD500.b3d",
   "start": 34955215,
   "end": 34958562
  }, {
   "filename": "/data/gui/skins/ocean/glasscheckbox_checked_focus.png",
   "start": 34958562,
   "end": 34961890
  }, {
   "filename": "/data/karts/nolok/AAARH.png",
   "start": 34961890,
   "end": 34965215
  }, {
   "filename": "/data/gui/soccer_player_blue.png",
   "start": 34965215,
   "end": 34968524
  }, {
   "filename": "/data/karts/pidgin/pidginshadow.png",
   "start": 34968524,
   "end": 34971822
  }, {
   "filename": "/data/gui/options_audio.stkgui",
   "start": 34971822,
   "end": 34975109
  }, {
   "filename": "/data/textures/deprecated/pebbles.png",
   "start": 34975109,
   "end": 34978368
  }, {
   "filename": "/data/tracks/zengarden/blueFireflies.b3d",
   "start": 34978368,
   "end": 34981627
  }, {
   "filename": "/data/tracks/subsea/Varan-gueule-subsea.jpg",
   "start": 34981627,
   "end": 34984875
  }, {
   "filename": "/data/gui/skins/ocean/glasstab.png",
   "start": 34984875,
   "end": 34988108
  }, {
   "filename": "/data/tracks/islandtrack/turn_sharp_24med.png",
   "start": 34988108,
   "end": 34991313
  }, {
   "filename": "/data/tracks/mines/warning_sign.b3d",
   "start": 34991313,
   "end": 34994509
  }, {
   "filename": "/data/tracks/mines/warning_sign2.b3d",
   "start": 34994509,
   "end": 34997705
  }, {
   "filename": "/data/tracks/subsea/Phoque_Plane-subsea.jpg",
   "start": 34997705,
   "end": 35000894
  }, {
   "filename": "/data/textures/snowflake.png",
   "start": 35000894,
   "end": 35004004
  }, {
   "filename": "/data/tracks/fortmagma/xx-45.jpg",
   "start": 35004004,
   "end": 35007106
  }, {
   "filename": "/data/karts/nolok/nolokshadow.png",
   "start": 35007106,
   "end": 35010152
  }, {
   "filename": "/data/models/License.txt",
   "start": 35010152,
   "end": 35013191
  }, {
   "filename": "/data/gui/skins/ocean/scrollbar_btn_down.png",
   "start": 35013191,
   "end": 35016226
  }, {
   "filename": "/data/shaders/motion_blur.frag",
   "start": 35016226,
   "end": 35019197
  }, {
   "filename": "/data/gui/skins/ocean/textbubble.png",
   "start": 35019197,
   "end": 35022153
  }, {
   "filename": "/data/tracks/overworld/Light.b3d",
   "start": 35022153,
   "end": 35025099
  }, {
   "filename": "/data/gui/track_info_dialog.stkgui",
   "start": 35025099,
   "end": 35028044
  }, {
   "filename": "/data/gui/skins/ocean/glasscheckbox_focus.png",
   "start": 35028044,
   "end": 35030971
  }, {
   "filename": "/data/gui/skins/ocean/textbubble2.png",
   "start": 35030971,
   "end": 35033898
  }, {
   "filename": "/data/tracks/xr591/curious.png",
   "start": 35033898,
   "end": 35036792
  }, {
   "filename": "/data/gui/skins/ocean/glasscheckbox_checked.png",
   "start": 35036792,
   "end": 35039630
  }, {
   "filename": "/data/gui/skins/ocean/list_sort_down.png",
   "start": 35039630,
   "end": 35042456
  }, {
   "filename": "/data/gui/skins/peach/list_sort_down.png",
   "start": 35042456,
   "end": 35045282
  }, {
   "filename": "/data/tracks/lighthouse/death_grass_chunk_low.b3d",
   "start": 35045282,
   "end": 35048099
  }, {
   "filename": "/data/tracks/introcutscene/leaves5.b3d",
   "start": 35048099,
   "end": 35050912
  }, {
   "filename": "/data/gui/main.stkgui",
   "start": 35050912,
   "end": 35053723
  }, {
   "filename": "/data/tracks/lighthouse/grass_chunk_low.b3d",
   "start": 35053723,
   "end": 35056534
  }, {
   "filename": "/data/tracks/snowmountain/balloon.png",
   "start": 35056534,
   "end": 35059341
  }, {
   "filename": "/data/tracks/greenvalley/materials.xml",
   "start": 35059341,
   "end": 35062126
  }, {
   "filename": "/data/tracks/xr591/eyes.jpg",
   "start": 35062126,
   "end": 35064904
  }, {
   "filename": "/data/karts/adiumy/adiumyshadow.png",
   "start": 35064904,
   "end": 35067671
  }, {
   "filename": "/data/textures/skid-particle2.png",
   "start": 35067671,
   "end": 35070414
  }, {
   "filename": "/data/tracks/overworld/licence2.txt",
   "start": 35070414,
   "end": 35073122
  }, {
   "filename": "/data/tracks/xr591/saturn.jpg",
   "start": 35073122,
   "end": 35075829
  }, {
   "filename": "/data/tracks/xr591/License.txt",
   "start": 35075829,
   "end": 35078531
  }, {
   "filename": "/data/tracks/subsea/metall003-new-subsea.jpg",
   "start": 35078531,
   "end": 35081210
  }, {
   "filename": "/data/tracks/fortmagma/xx-18.jpg",
   "start": 35081210,
   "end": 35083876
  }, {
   "filename": "/data/tracks/hacienda/wire.png",
   "start": 35083876,
   "end": 35086541
  }, {
   "filename": "/data/tracks/tutorial/wire.png",
   "start": 35086541,
   "end": 35089206
  }, {
   "filename": "/data/gui/skins/ocean/list_sort_up.png",
   "start": 35089206,
   "end": 35091866
  }, {
   "filename": "/data/gui/skins/ocean/scrollbar_btn.png",
   "start": 35091866,
   "end": 35094526
  }, {
   "filename": "/data/gui/skins/peach/list_sort_up.png",
   "start": 35094526,
   "end": 35097186
  }, {
   "filename": "/data/gui/skins/peach/scrollbar_btn.png",
   "start": 35097186,
   "end": 35099846
  }, {
   "filename": "/data/tracks/hacienda/materials.xml",
   "start": 35099846,
   "end": 35102497
  }, {
   "filename": "/data/tracks/snowtuxpeak/pipe_LOD170.b3d",
   "start": 35102497,
   "end": 35105148
  }, {
   "filename": "/data/tracks/xr591/love.png",
   "start": 35105148,
   "end": 35107788
  }, {
   "filename": "/data/gui/skins/peach/glasssgauge_fill.png",
   "start": 35107788,
   "end": 35110407
  }, {
   "filename": "/data/tracks/subsea/tex-subsea.jpg",
   "start": 35110407,
   "end": 35112980
  }, {
   "filename": "/data/tracks/subsea/materials.xml",
   "start": 35112980,
   "end": 35115543
  }, {
   "filename": "/data/gui/options_ui.stkgui",
   "start": 35115543,
   "end": 35118105
  }, {
   "filename": "/data/gui/notes.png",
   "start": 35118105,
   "end": 35120664
  }, {
   "filename": "/data/models/wood_podium.b3d",
   "start": 35120664,
   "end": 35123219
  }, {
   "filename": "/data/karts/hexley/hexley2shadow.png",
   "start": 35123219,
   "end": 35125767
  }, {
   "filename": "/data/tracks/tutorial/materials.xml",
   "start": 35125767,
   "end": 35128311
  }, {
   "filename": "/data/gui/icons-frame.png",
   "start": 35128311,
   "end": 35130833
  }, {
   "filename": "/data/karts/gnu/gnushadow.png",
   "start": 35130833,
   "end": 35133347
  }, {
   "filename": "/data/gui/main_about.png",
   "start": 35133347,
   "end": 35135849
  }, {
   "filename": "/data/gui/skins/ocean/glass_section.png",
   "start": 35135849,
   "end": 35138349
  }, {
   "filename": "/data/gui/skins/peach/glass_section.png",
   "start": 35138349,
   "end": 35140849
  }, {
   "filename": "/data/gui/top_bar.png",
   "start": 35140849,
   "end": 35143346
  }, {
   "filename": "/data/tracks/introcutscene/leaves6.b3d",
   "start": 35143346,
   "end": 35145835
  }, {
   "filename": "/data/tracks/introcutscene/leaves7.b3d",
   "start": 35145835,
   "end": 35148324
  }, {
   "filename": "/data/gui/skins/ocean/glasscheckbox.png",
   "start": 35148324,
   "end": 35150807
  }, {
   "filename": "/data/tracks/startrack/brushedbarrel.jpg",
   "start": 35150807,
   "end": 35153290
  }, {
   "filename": "/data/tracks/startrack/License.txt",
   "start": 35153290,
   "end": 35155727
  }, {
   "filename": "/data/shaders/spheremap.frag",
   "start": 35155727,
   "end": 35158155
  }, {
   "filename": "/data/textures/skid-particle1.png",
   "start": 35158155,
   "end": 35160556
  }, {
   "filename": "/data/shaders/skinning.vert",
   "start": 35160556,
   "end": 35162927
  }, {
   "filename": "/data/tracks/scotland/License.txt",
   "start": 35162927,
   "end": 35165286
  }, {
   "filename": "/data/textures/deprecated/skyscraper3a.png",
   "start": 35165286,
   "end": 35167641
  }, {
   "filename": "/data/karts/wilber/wilbershadow.png",
   "start": 35167641,
   "end": 35169949
  }, {
   "filename": "/data/gui/custom_video_settings.stkgui",
   "start": 35169949,
   "end": 35172246
  }, {
   "filename": "/data/gui/skins/ocean/scrollbar_thumb.png",
   "start": 35172246,
   "end": 35174505
  }, {
   "filename": "/data/tracks/xr591/marsrobot5.jpg",
   "start": 35174505,
   "end": 35176751
  }, {
   "filename": "/data/tracks/xr591/marssnail.jpg",
   "start": 35176751,
   "end": 35178989
  }, {
   "filename": "/data/gui/options_device.stkgui",
   "start": 35178989,
   "end": 35181210
  }, {
   "filename": "/data/tracks/greenvalley/sheep_LOD10000.b3d",
   "start": 35181210,
   "end": 35183407
  }, {
   "filename": "/data/tracks/xr591/acid_lake_bottom.jpg",
   "start": 35183407,
   "end": 35185603
  }, {
   "filename": "/data/tracks/fortmagma/xx-70.jpg",
   "start": 35185603,
   "end": 35187795
  }, {
   "filename": "/data/tracks/introcutscene/light.b3d",
   "start": 35187795,
   "end": 35189984
  }, {
   "filename": "/data/tracks/introcutscene/leaves4.b3d",
   "start": 35189984,
   "end": 35192149
  }, {
   "filename": "/data/tracks/introcutscene/leaves8.b3d",
   "start": 35192149,
   "end": 35194314
  }, {
   "filename": "/data/karts/License.txt",
   "start": 35194314,
   "end": 35196443
  }, {
   "filename": "/data/tracks/lighthouse/materials.xml",
   "start": 35196443,
   "end": 35198572
  }, {
   "filename": "/data/textures/round_shadow.png",
   "start": 35198572,
   "end": 35200697
  }, {
   "filename": "/data/gui/addons_screen.stkgui",
   "start": 35200697,
   "end": 35202818
  }, {
   "filename": "/data/tracks/subsea/pigeon-3-subsea.jpg",
   "start": 35202818,
   "end": 35204939
  }, {
   "filename": "/data/tracks/mansion/BezierCurve.002.b3d",
   "start": 35204939,
   "end": 35207047
  }, {
   "filename": "/data/shaders/water_fog.frag",
   "start": 35207047,
   "end": 35209140
  }, {
   "filename": "/data/gui/options_players.stkgui",
   "start": 35209140,
   "end": 35211232
  }, {
   "filename": "/data/gui/skins/peach/select.png",
   "start": 35211232,
   "end": 35213322
  }, {
   "filename": "/data/gui/skins/peach/table_header_down.png",
   "start": 35213322,
   "end": 35215412
  }, {
   "filename": "/data/tracks/xr591/erde.jpg",
   "start": 35215412,
   "end": 35217465
  }, {
   "filename": "/data/tracks/zengarden/fern_LOD100.b3d",
   "start": 35217465,
   "end": 35219509
  }, {
   "filename": "/data/karts/emule/emule_icon32.png",
   "start": 35219509,
   "end": 35221530
  }, {
   "filename": "/data/tracks/zengarden/License.txt",
   "start": 35221530,
   "end": 35223543
  }, {
   "filename": "/data/karts/elephpant/elephpantshadow.png",
   "start": 35223543,
   "end": 35225540
  }, {
   "filename": "/data/tracks/greenvalley/ClethraAlnifolia.b3d",
   "start": 35225540,
   "end": 35227527
  }, {
   "filename": "/data/gui/addons_loading.stkgui",
   "start": 35227527,
   "end": 35229507
  }, {
   "filename": "/data/tracks/cave/scene.xml",
   "start": 35229507,
   "end": 35231485
  }, {
   "filename": "/data/tracks/fortmagma/Rubis-subsea.png",
   "start": 35231485,
   "end": 35233454
  }, {
   "filename": "/data/gui/skins/ocean/glasssgauge_fill.png",
   "start": 35233454,
   "end": 35235402
  }, {
   "filename": "/data/tracks/mines/materials.xml",
   "start": 35235402,
   "end": 35237335
  }, {
   "filename": "/data/gui/racesetup.stkgui",
   "start": 35237335,
   "end": 35239246
  }, {
   "filename": "/data/tracks/fortmagma/Plane.038.b3d",
   "start": 35239246,
   "end": 35241139
  }, {
   "filename": "/data/tracks/mansion/materials.xml",
   "start": 35241139,
   "end": 35243032
  }, {
   "filename": "/data/tracks/subsea/carapace-subsea.jpg",
   "start": 35243032,
   "end": 35244915
  }, {
   "filename": "/data/tracks/startrack/glassWindows.png",
   "start": 35244915,
   "end": 35246787
  }, {
   "filename": "/data/tracks/olivermath/scene.xml",
   "start": 35246787,
   "end": 35248655
  }, {
   "filename": "/data/tracks/greenvalley/BushFlower.png",
   "start": 35248655,
   "end": 35250513
  }, {
   "filename": "/data/tracks/jungle/materials.xml",
   "start": 35250513,
   "end": 35252363
  }, {
   "filename": "/data/supertuxkart_32.png",
   "start": 35252363,
   "end": 35254204
  }, {
   "filename": "/data/tracks/introcutscene/leaves2.b3d",
   "start": 35254204,
   "end": 35256045
  }, {
   "filename": "/data/shaders/splatting.frag",
   "start": 35256045,
   "end": 35257885
  }, {
   "filename": "/data/music/License.txt",
   "start": 35257885,
   "end": 35259695
  }, {
   "filename": "/data/gui/race_paused_dialog.stkgui",
   "start": 35259695,
   "end": 35261467
  }, {
   "filename": "/data/gui/options_input.stkgui",
   "start": 35261467,
   "end": 35263232
  }, {
   "filename": "/data/tracks/greenvalley/TyphaLatifolia.b3d",
   "start": 35263232,
   "end": 35264972
  }, {
   "filename": "/data/tracks/minigolf/windmill_arm2.b3d",
   "start": 35264972,
   "end": 35266708
  }, {
   "filename": "/data/tracks/soccer_field/scene.xml",
   "start": 35266708,
   "end": 35268444
  }, {
   "filename": "/data/tracks/startrack/materials.xml",
   "start": 35268444,
   "end": 35270173
  }, {
   "filename": "/data/shaders/spheremap.vert",
   "start": 35270173,
   "end": 35271892
  }, {
   "filename": "/data/shaders/water.frag",
   "start": 35271892,
   "end": 35273605
  }, {
   "filename": "/data/fonts/BigDigitFont.xml",
   "start": 35273605,
   "end": 35275301
  }, {
   "filename": "/data/tracks/snowtuxpeak/wpill_LOD150.b3d",
   "start": 35275301,
   "end": 35276996
  }, {
   "filename": "/data/gui/dropdown.png",
   "start": 35276996,
   "end": 35278671
  }, {
   "filename": "/data/karts/suzanne/icon32.png",
   "start": 35278671,
   "end": 35280327
  }, {
   "filename": "/data/tracks/farm/License.txt",
   "start": 35280327,
   "end": 35281982
  }, {
   "filename": "/data/gui/soccer_ball_empty.png",
   "start": 35281982,
   "end": 35283624
  }, {
   "filename": "/data/gui/skins/ocean/tooltip.png",
   "start": 35283624,
   "end": 35285264
  }, {
   "filename": "/data/gui/skins/peach/tooltip.png",
   "start": 35285264,
   "end": 35286904
  }, {
   "filename": "/data/models/materials.xml",
   "start": 35286904,
   "end": 35288540
  }, {
   "filename": "/data/shaders/grass.frag",
   "start": 35288540,
   "end": 35290173
  }, {
   "filename": "/data/tracks/mines/floatingObject.b3d",
   "start": 35290173,
   "end": 35291791
  }, {
   "filename": "/data/karts/xfcemouse/xfce_icon32.png",
   "start": 35291791,
   "end": 35293404
  }, {
   "filename": "/data/karts/beastie/License.txt",
   "start": 35293404,
   "end": 35295005
  }, {
   "filename": "/data/gui/select_challenge.stkgui",
   "start": 35295005,
   "end": 35296601
  }, {
   "filename": "/data/tracks/xr591/mars_lava2.jpg",
   "start": 35296601,
   "end": 35298165
  }, {
   "filename": "/data/tracks/introcutscene/materials.xml",
   "start": 35298165,
   "end": 35299725
  }, {
   "filename": "/data/karts/wilber/eye.png",
   "start": 35299725,
   "end": 35301282
  }, {
   "filename": "/data/karts/sara/kart.xml",
   "start": 35301282,
   "end": 35302814
  }, {
   "filename": "/data/tracks/hacienda/License.txt",
   "start": 35302814,
   "end": 35304344
  }, {
   "filename": "/data/tracks/lighthouse/lightWindows.b3d",
   "start": 35304344,
   "end": 35305871
  }, {
   "filename": "/data/tracks/snowtuxpeak/crystal.b3d",
   "start": 35305871,
   "end": 35307390
  }, {
   "filename": "/data/tracks/snowtuxpeak/crystal_LOD20.b3d",
   "start": 35307390,
   "end": 35308909
  }, {
   "filename": "/data/tracks/introcutscene/leaves12.b3d",
   "start": 35308909,
   "end": 35310426
  }, {
   "filename": "/data/tracks/lighthouse/vineUnderCave.b3d",
   "start": 35310426,
   "end": 35311943
  }, {
   "filename": "/data/tracks/xr591/mars.jpg",
   "start": 35311943,
   "end": 35313454
  }, {
   "filename": "/data/tracks/fortmagma/License.txt",
   "start": 35313454,
   "end": 35314964
  }, {
   "filename": "/data/textures/deprecated/wood.jpg",
   "start": 35314964,
   "end": 35316460
  }, {
   "filename": "/data/tracks/fortmagma/materials.xml",
   "start": 35316460,
   "end": 35317955
  }, {
   "filename": "/data/karts/emule/kart.xml",
   "start": 35317955,
   "end": 35319448
  }, {
   "filename": "/data/textures/deprecated/materials.xml",
   "start": 35319448,
   "end": 35320941
  }, {
   "filename": "/data/po/gen-mo.sh",
   "start": 35320941,
   "end": 35322422
  }, {
   "filename": "/data/gui/soccer_setup.stkgui",
   "start": 35322422,
   "end": 35323902
  }, {
   "filename": "/data/tracks/battleisland/scene.xml",
   "start": 35323902,
   "end": 35325371
  }, {
   "filename": "/data/karts/beastie/kart.xml",
   "start": 35325371,
   "end": 35326837
  }, {
   "filename": "/data/karts/beagle/kart.xml",
   "start": 35326837,
   "end": 35328292
  }, {
   "filename": "/data/tracks/xr591/materials.xml",
   "start": 35328292,
   "end": 35329743
  }, {
   "filename": "/data/karts/konqi/kart.xml",
   "start": 35329743,
   "end": 35331192
  }, {
   "filename": "/data/karts/suzanne/kart.xml",
   "start": 35331192,
   "end": 35332635
  }, {
   "filename": "/data/tracks/battleisland/Water.b3d",
   "start": 35332635,
   "end": 35334077
  }, {
   "filename": "/data/tracks/xr591/mars_lava3.jpg",
   "start": 35334077,
   "end": 35335517
  }, {
   "filename": "/data/tracks/hacienda/Plane.002.b3d",
   "start": 35335517,
   "end": 35336951
  }, {
   "filename": "/data/tracks/hacienda/Plane.049.b3d",
   "start": 35336951,
   "end": 35338385
  }, {
   "filename": "/data/tracks/hacienda/Plane.050.b3d",
   "start": 35338385,
   "end": 35339819
  }, {
   "filename": "/data/tracks/tutorial/Plane.002.b3d",
   "start": 35339819,
   "end": 35341253
  }, {
   "filename": "/data/tracks/tutorial/Plane.049.b3d",
   "start": 35341253,
   "end": 35342687
  }, {
   "filename": "/data/tracks/tutorial/Plane.050.b3d",
   "start": 35342687,
   "end": 35344121
  }, {
   "filename": "/data/tracks/startrack/rotating.b3d",
   "start": 35344121,
   "end": 35345554
  }, {
   "filename": "/data/gui/overworld_dialog.stkgui",
   "start": 35345554,
   "end": 35346978
  }, {
   "filename": "/data/shaders/water_fog.vert",
   "start": 35346978,
   "end": 35348398
  }, {
   "filename": "/data/karts/adiumy/kart.xml",
   "start": 35348398,
   "end": 35349813
  }, {
   "filename": "/data/karts/nolok/kart.xml",
   "start": 35349813,
   "end": 35351226
  }, {
   "filename": "/data/tracks/hacienda/easter_eggs.xml",
   "start": 35351226,
   "end": 35352639
  }, {
   "filename": "/data/karts/tux/kart.xml",
   "start": 35352639,
   "end": 35354042
  }, {
   "filename": "/data/tracks/subsea/wood_planks7-subsea.jpg",
   "start": 35354042,
   "end": 35355441
  }, {
   "filename": "/data/shaders/gum_shield.vert",
   "start": 35355441,
   "end": 35356834
  }, {
   "filename": "/data/tracks/mansion/easter_eggs.xml",
   "start": 35356834,
   "end": 35358224
  }, {
   "filename": "/data/shaders/lightbeam.frag",
   "start": 35358224,
   "end": 35359613
  }, {
   "filename": "/data/gui/skins/ocean/glass_square_focused3.png",
   "start": 35359613,
   "end": 35361e3
  }, {
   "filename": "/data/gui/skins/peach/glass_square_focused.png",
   "start": 35361e3,
   "end": 35362387
  }, {
   "filename": "/data/tracks/greenvalley/MyasotisScorpioides.b3d",
   "start": 35362387,
   "end": 35363772
  }, {
   "filename": "/data/gui/story_mode_new.stkgui",
   "start": 35363772,
   "end": 35365143
  }, {
   "filename": "/data/po/update_pot.sh",
   "start": 35365143,
   "end": 35366503
  }, {
   "filename": "/data/gui/skins/ocean/glass_rsection.png",
   "start": 35366503,
   "end": 35367857
  }, {
   "filename": "/data/gui/skins/peach/glass_rsection.png",
   "start": 35367857,
   "end": 35369211
  }, {
   "filename": "/data/tracks/greenvalley/Eupatorium.b3d",
   "start": 35369211,
   "end": 35370563
  }, {
   "filename": "/data/gui/skins/ocean/scrollbar_bg.png",
   "start": 35370563,
   "end": 35371900
  }, {
   "filename": "/data/gui/skins/peach/scrollbar_bg.png",
   "start": 35371900,
   "end": 35373237
  }, {
   "filename": "/data/tracks/zengarden/detailJapan.png",
   "start": 35373237,
   "end": 35374573
  }, {
   "filename": "/data/tracks/olivermath/easter_eggs.xml",
   "start": 35374573,
   "end": 35375908
  }, {
   "filename": "/data/tracks/endcutscene/CellShadow.b3d",
   "start": 35375908,
   "end": 35377233
  }, {
   "filename": "/data/shaders/normalmap.vert",
   "start": 35377233,
   "end": 35378542
  }, {
   "filename": "/data/tracks/farm/materials.xml",
   "start": 35378542,
   "end": 35379846
  }, {
   "filename": "/data/shaders/water.vert",
   "start": 35379846,
   "end": 35381149
  }, {
   "filename": "/data/gfx/rain-ground.xml",
   "start": 35381149,
   "end": 35382442
  }, {
   "filename": "/data/tracks/fortmagma/Plane.039.b3d",
   "start": 35382442,
   "end": 35383727
  }, {
   "filename": "/data/shaders/gum_shield.frag",
   "start": 35383727,
   "end": 35385008
  }, {
   "filename": "/data/tracks/stadium/scene.xml",
   "start": 35385008,
   "end": 35386280
  }, {
   "filename": "/data/tracks/scotland/zipper_collect.png",
   "start": 35386280,
   "end": 35387548
  }, {
   "filename": "/data/tracks/minigolf/materials.xml",
   "start": 35387548,
   "end": 35388812
  }, {
   "filename": "/data/shaders/bubble.vert",
   "start": 35388812,
   "end": 35390071
  }, {
   "filename": "/data/karts/xfcemouse/kart.xml",
   "start": 35390071,
   "end": 35391328
  }, {
   "filename": "/data/karts/wilber/kart.xml",
   "start": 35391328,
   "end": 35392582
  }, {
   "filename": "/data/karts/pidgin/kart.xml",
   "start": 35392582,
   "end": 35393835
  }, {
   "filename": "/data/tracks/mines/phys_box_tnt.b3d",
   "start": 35393835,
   "end": 35395069
  }, {
   "filename": "/data/tracks/city/materials.xml",
   "start": 35395069,
   "end": 35396302
  }, {
   "filename": "/data/shaders/lightbeam.vert",
   "start": 35396302,
   "end": 35397523
  }, {
   "filename": "/data/gfx/rain.xml",
   "start": 35397523,
   "end": 35398736
  }, {
   "filename": "/data/shaders/grass.vert",
   "start": 35398736,
   "end": 35399947
  }, {
   "filename": "/data/shaders/splatting.vert",
   "start": 35399947,
   "end": 35401151
  }, {
   "filename": "/data/karts/elephpant/kart.xml",
   "start": 35401151,
   "end": 35402351
  }, {
   "filename": "/data/tracks/introcutscene/leaves1.b3d",
   "start": 35402351,
   "end": 35403544
  }, {
   "filename": "/data/tracks/introcutscene/leaves14.b3d",
   "start": 35403544,
   "end": 35404737
  }, {
   "filename": "/data/tracks/introcutscene/leaves3.b3d",
   "start": 35404737,
   "end": 35405930
  }, {
   "filename": "/data/gui/race_result.stkgui",
   "start": 35405930,
   "end": 35407115
  }, {
   "filename": "/data/gui/tracks.stkgui",
   "start": 35407115,
   "end": 35408295
  }, {
   "filename": "/data/karts/puffy/kart.xml",
   "start": 35408295,
   "end": 35409463
  }, {
   "filename": "/data/karts/gnu/kart.xml",
   "start": 35409463,
   "end": 35410625
  }, {
   "filename": "/data/karts/hexley/kart.xml",
   "start": 35410625,
   "end": 35411768
  }, {
   "filename": "/data/gui/License.txt",
   "start": 35411768,
   "end": 35412910
  }, {
   "filename": "/data/tracks/tutorial/WoodenBox.b3d",
   "start": 35412910,
   "end": 35414047
  }, {
   "filename": "/data/tracks/startrack/Box.b3d",
   "start": 35414047,
   "end": 35415182
  }, {
   "filename": "/data/tracks/mines/phys_box.b3d",
   "start": 35415182,
   "end": 35416316
  }, {
   "filename": "/data/tracks/mines/phys_box_dark.b3d",
   "start": 35416316,
   "end": 35417450
  }, {
   "filename": "/data/gui/skins/ocean/glass_square_focused.png",
   "start": 35417450,
   "end": 35418581
  }, {
   "filename": "/data/gui/skins/peach/glass_square_focused2.png",
   "start": 35418581,
   "end": 35419712
  }, {
   "filename": "/data/tracks/introcutscene/pineVeryLow.b3d",
   "start": 35419712,
   "end": 35420841
  }, {
   "filename": "/data/tracks/introcutscene2/pineVeryLow.b3d",
   "start": 35420841,
   "end": 35421970
  }, {
   "filename": "/data/tracks/zengarden/pineVeryLow.b3d",
   "start": 35421970,
   "end": 35423099
  }, {
   "filename": "/data/tracks/city/crate.b3d",
   "start": 35423099,
   "end": 35424226
  }, {
   "filename": "/data/tracks/zengarden/easter_eggs.xml",
   "start": 35424226,
   "end": 35425349
  }, {
   "filename": "/data/tracks/introcutscene/license.txt",
   "start": 35425349,
   "end": 35426456
  }, {
   "filename": "/data/tracks/jungle/skybox5.jpg",
   "start": 35426456,
   "end": 35427558
  }, {
   "filename": "/data/tracks/mansion/Circle.012.b3d",
   "start": 35427558,
   "end": 35428638
  }, {
   "filename": "/data/tracks/mansion/Circle.013.b3d",
   "start": 35428638,
   "end": 35429718
  }, {
   "filename": "/data/tracks/mansion/Circle.016.b3d",
   "start": 35429718,
   "end": 35430798
  }, {
   "filename": "/data/tracks/mansion/Circle.019.b3d",
   "start": 35430798,
   "end": 35431878
  }, {
   "filename": "/data/tracks/mansion/Circle.020.b3d",
   "start": 35431878,
   "end": 35432958
  }, {
   "filename": "/data/optimize_data.sh",
   "start": 35432958,
   "end": 35434011
  }, {
   "filename": "/data/tracks/scotland/materials.xml",
   "start": 35434011,
   "end": 35435059
  }, {
   "filename": "/data/gui/skins/ocean/glass_square_focused4.png",
   "start": 35435059,
   "end": 35436092
  }, {
   "filename": "/data/gui/skins/peach/glass_square_focused3.png",
   "start": 35436092,
   "end": 35437125
  }, {
   "filename": "/data/tracks/scotland/Flag_of_Scotland.png",
   "start": 35437125,
   "end": 35438158
  }, {
   "filename": "/data/tracks/snowtuxpeak/materials.xml",
   "start": 35438158,
   "end": 35439177
  }, {
   "filename": "/data/shaders/bubble.frag",
   "start": 35439177,
   "end": 35440181
  }, {
   "filename": "/data/gfx/skid1.xml",
   "start": 35440181,
   "end": 35441178
  }, {
   "filename": "/data/gfx/skid2.xml",
   "start": 35441178,
   "end": 35442174
  }, {
   "filename": "/data/tracks/hacienda/mars_eye.png",
   "start": 35442174,
   "end": 35443169
  }, {
   "filename": "/data/gui/skins/ocean/select.png",
   "start": 35443169,
   "end": 35444159
  }, {
   "filename": "/data/gui/skins/ocean/table_header_down.png",
   "start": 35444159,
   "end": 35445149
  }, {
   "filename": "/data/tracks/minigolf/sand.xml",
   "start": 35445149,
   "end": 35446134
  }, {
   "filename": "/data/tracks/hacienda/mini_pillar.b3d",
   "start": 35446134,
   "end": 35447115
  }, {
   "filename": "/data/tracks/xr591/marsrobot2.jpg",
   "start": 35447115,
   "end": 35448096
  }, {
   "filename": "/data/tracks/mansion/Plane.029.b3d",
   "start": 35448096,
   "end": 35449071
  }, {
   "filename": "/data/tracks/mansion/Plane.030.b3d",
   "start": 35449071,
   "end": 35450046
  }, {
   "filename": "/data/tracks/mansion/clounds.b3d",
   "start": 35450046,
   "end": 35451017
  }, {
   "filename": "/data/shaders/motion_blur.vert",
   "start": 35451017,
   "end": 35451975
  }, {
   "filename": "/data/gui/karts.stkgui",
   "start": 35451975,
   "end": 35452931
  }, {
   "filename": "/data/shaders/normalmap.frag",
   "start": 35452931,
   "end": 35453882
  }, {
   "filename": "/data/gui/arenas.stkgui",
   "start": 35453882,
   "end": 35454827
  }, {
   "filename": "/data/gui/skins/ocean/glass_square_focused2.png",
   "start": 35454827,
   "end": 35455762
  }, {
   "filename": "/data/gui/skins/peach/glass_square_focused4.png",
   "start": 35455762,
   "end": 35456697
  }, {
   "filename": "/data/gfx/splash.xml",
   "start": 35456697,
   "end": 35457627
  }, {
   "filename": "/data/tracks/islandtrack/materials.xml",
   "start": 35457627,
   "end": 35458555
  }, {
   "filename": "/data/gfx/swampDriving.xml",
   "start": 35458555,
   "end": 35459481
  }, {
   "filename": "/data/tracks/subsea/chrome-subsea.jpg",
   "start": 35459481,
   "end": 35460405
  }, {
   "filename": "/data/tracks/xr591/mars_eye.png",
   "start": 35460405,
   "end": 35461326
  }, {
   "filename": "/data/gfx/nitro.xml",
   "start": 35461326,
   "end": 35462246
  }, {
   "filename": "/data/tracks/subsea/Window-boat-subsea.jpg",
   "start": 35462246,
   "end": 35463158
  }, {
   "filename": "/data/tracks/Makefile.am",
   "start": 35463158,
   "end": 35464066
  }, {
   "filename": "/data/tracks/xr591/acid_splash.xml",
   "start": 35464066,
   "end": 35464965
  }, {
   "filename": "/data/gfx/explosion.xml",
   "start": 35464965,
   "end": 35465859
  }, {
   "filename": "/data/gfx/explosion_bomb.xml",
   "start": 35465859,
   "end": 35466753
  }, {
   "filename": "/data/gfx/explosion_cake.xml",
   "start": 35466753,
   "end": 35467647
  }, {
   "filename": "/data/gfx/jump_explosion.xml",
   "start": 35467647,
   "end": 35468538
  }, {
   "filename": "/data/tracks/greenvalley/waterfall_right.xml",
   "start": 35468538,
   "end": 35469407
  }, {
   "filename": "/data/tracks/introcutscene/leaves10.b3d",
   "start": 35469407,
   "end": 35470276
  }, {
   "filename": "/data/tracks/introcutscene/leaves13.b3d",
   "start": 35470276,
   "end": 35471145
  }, {
   "filename": "/data/tracks/lighthouse/buoy_halo.b3d",
   "start": 35471145,
   "end": 35472013
  }, {
   "filename": "/data/gfx/zipper_fire.xml",
   "start": 35472013,
   "end": 35472880
  }, {
   "filename": "/data/gfx/snow.xml",
   "start": 35472880,
   "end": 35473744
  }, {
   "filename": "/data/tracks/zengarden/catailVeg_LOD50.b3d",
   "start": 35473744,
   "end": 35474607
  }, {
   "filename": "/data/models/warning.b3d",
   "start": 35474607,
   "end": 35475468
  }, {
   "filename": "/data/tracks/subsea/waterparticles0-subsea.xml",
   "start": 35475468,
   "end": 35476321
  }, {
   "filename": "/data/Makefile.am",
   "start": 35476321,
   "end": 35477171
  }, {
   "filename": "/data/gfx/sparks.xml",
   "start": 35477171,
   "end": 35478020
  }, {
   "filename": "/data/SuperTuxKart-Info.plist",
   "start": 35478020,
   "end": 35478863
  }, {
   "filename": "/data/gui/story_mode_lobby.stkgui",
   "start": 35478863,
   "end": 35479705
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.002.b3d",
   "start": 35479705,
   "end": 35480546
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.005.b3d",
   "start": 35480546,
   "end": 35481387
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.007.b3d",
   "start": 35481387,
   "end": 35482228
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.008.b3d",
   "start": 35482228,
   "end": 35483069
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.009.b3d",
   "start": 35483069,
   "end": 35483910
  }, {
   "filename": "/data/gfx/nitro-smoke.xml",
   "start": 35483910,
   "end": 35484747
  }, {
   "filename": "/data/karts/hexley/hexley_eye.png",
   "start": 35484747,
   "end": 35485581
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.001.b3d",
   "start": 35485581,
   "end": 35486415
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.003.b3d",
   "start": 35486415,
   "end": 35487249
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.004.b3d",
   "start": 35487249,
   "end": 35488083
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.006.b3d",
   "start": 35488083,
   "end": 35488917
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.007.b3d",
   "start": 35488917,
   "end": 35489751
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.011.b3d",
   "start": 35489751,
   "end": 35490585
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.014.b3d",
   "start": 35490585,
   "end": 35491419
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.018.b3d",
   "start": 35491419,
   "end": 35492253
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.020.b3d",
   "start": 35492253,
   "end": 35493087
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.023.b3d",
   "start": 35493087,
   "end": 35493921
  }, {
   "filename": "/data/tracks/minigolf/testblok.b3d",
   "start": 35493921,
   "end": 35494754
  }, {
   "filename": "/data/tracks/startrack/graph.xml",
   "start": 35494754,
   "end": 35495586
  }, {
   "filename": "/data/tracks/fortmagma/Plane.012.b3d",
   "start": 35495586,
   "end": 35496416
  }, {
   "filename": "/data/tracks/fortmagma/Plane.043.b3d",
   "start": 35496416,
   "end": 35497246
  }, {
   "filename": "/data/tracks/fortmagma/Plane.047.b3d",
   "start": 35497246,
   "end": 35498076
  }, {
   "filename": "/data/tracks/hacienda/arrow2.b3d",
   "start": 35498076,
   "end": 35498906
  }, {
   "filename": "/data/tracks/snowtuxpeak/PanelDisplay.b3d",
   "start": 35498906,
   "end": 35499736
  }, {
   "filename": "/data/tracks/tutorial/arrow2.b3d",
   "start": 35499736,
   "end": 35500566
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.006.b3d",
   "start": 35500566,
   "end": 35501393
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.008.b3d",
   "start": 35501393,
   "end": 35502220
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.012.b3d",
   "start": 35502220,
   "end": 35503047
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.013.b3d",
   "start": 35503047,
   "end": 35503874
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.017.b3d",
   "start": 35503874,
   "end": 35504701
  }, {
   "filename": "/data/tracks/snowtuxpeak/Plane.024.b3d",
   "start": 35504701,
   "end": 35505528
  }, {
   "filename": "/data/tracks/mansion/Plane.018.b3d",
   "start": 35505528,
   "end": 35506354
  }, {
   "filename": "/data/tracks/mansion/Circle.010.b3d",
   "start": 35506354,
   "end": 35507178
  }, {
   "filename": "/data/tracks/mansion/Circle.011.b3d",
   "start": 35507178,
   "end": 35508002
  }, {
   "filename": "/data/tracks/mansion/Circle.014.b3d",
   "start": 35508002,
   "end": 35508826
  }, {
   "filename": "/data/tracks/mansion/Circle.015.b3d",
   "start": 35508826,
   "end": 35509650
  }, {
   "filename": "/data/tracks/mansion/Circle.017.b3d",
   "start": 35509650,
   "end": 35510474
  }, {
   "filename": "/data/tracks/mansion/Circle.018.b3d",
   "start": 35510474,
   "end": 35511298
  }, {
   "filename": "/data/tracks/fortmagma/Plane.011.b3d",
   "start": 35511298,
   "end": 35512121
  }, {
   "filename": "/data/tracks/fortmagma/Plane.044.b3d",
   "start": 35512121,
   "end": 35512944
  }, {
   "filename": "/data/tracks/fortmagma/Plane.048.b3d",
   "start": 35512944,
   "end": 35513767
  }, {
   "filename": "/data/tracks/hacienda/arrow.b3d",
   "start": 35513767,
   "end": 35514590
  }, {
   "filename": "/data/tracks/hacienda/boost_arrows.b3d",
   "start": 35514590,
   "end": 35515413
  }, {
   "filename": "/data/tracks/minigolf/fol1.b3d",
   "start": 35515413,
   "end": 35516236
  }, {
   "filename": "/data/tracks/minigolf/fol2.b3d",
   "start": 35516236,
   "end": 35517059
  }, {
   "filename": "/data/tracks/tutorial/arrow.b3d",
   "start": 35517059,
   "end": 35517882
  }, {
   "filename": "/data/tracks/zengarden/sun_physical.b3d",
   "start": 35517882,
   "end": 35518702
  }, {
   "filename": "/data/tracks/greenvalley/waterfall_left.xml",
   "start": 35518702,
   "end": 35519519
  }, {
   "filename": "/data/gfx/smoke_short_burst.xml",
   "start": 35519519,
   "end": 35520331
  }, {
   "filename": "/data/models/referee.xml",
   "start": 35520331,
   "end": 35521133
  }, {
   "filename": "/data/gfx/smoke_red.xml",
   "start": 35521133,
   "end": 35521923
  }, {
   "filename": "/data/gfx/smoke_yellow.xml",
   "start": 35521923,
   "end": 35522712
  }, {
   "filename": "/data/gfx/smoke_brown.xml",
   "start": 35522712,
   "end": 35523499
  }, {
   "filename": "/data/gfx/black_smoke.xml",
   "start": 35523499,
   "end": 35524285
  }, {
   "filename": "/data/gui/skins/ocean/table_header.png",
   "start": 35524285,
   "end": 35525069
  }, {
   "filename": "/data/gui/skins/peach/table_header.png",
   "start": 35525069,
   "end": 35525853
  }, {
   "filename": "/data/tracks/subsea/fuite1.xml",
   "start": 35525853,
   "end": 35526636
  }, {
   "filename": "/data/gfx/smoke.xml",
   "start": 35526636,
   "end": 35527418
  }, {
   "filename": "/data/tracks/subsea/fuite.xml",
   "start": 35527418,
   "end": 35528199
  }, {
   "filename": "/data/tracks/subsea/fuite0.xml",
   "start": 35528199,
   "end": 35528979
  }, {
   "filename": "/data/tracks/startrack/window_dor.b3d",
   "start": 35528979,
   "end": 35529758
  }, {
   "filename": "/data/tracks/subsea/waterparticles-subsea.png",
   "start": 35529758,
   "end": 35530536
  }, {
   "filename": "/data/tracks/startrack/window_doors.b3d",
   "start": 35530536,
   "end": 35531311
  }, {
   "filename": "/data/tracks/overworld/graph.xml",
   "start": 35531311,
   "end": 35532077
  }, {
   "filename": "/data/tracks/snowtuxpeak/crystal_LOD70.b3d",
   "start": 35532077,
   "end": 35532836
  }, {
   "filename": "/data/items.xml",
   "start": 35532836,
   "end": 35533585
  }, {
   "filename": "/data/tracks/hacienda/light.png",
   "start": 35533585,
   "end": 35534320
  }, {
   "filename": "/data/tracks/tutorial/light.png",
   "start": 35534320,
   "end": 35535055
  }, {
   "filename": "/data/tracks/soccer_field/goal.png",
   "start": 35535055,
   "end": 35535779
  }, {
   "filename": "/data/karts/Makefile.am",
   "start": 35535779,
   "end": 35536502
  }, {
   "filename": "/data/tracks/startrack/lightmap_space.png",
   "start": 35536502,
   "end": 35537225
  }, {
   "filename": "/data/gui/challenges.stkgui",
   "start": 35537225,
   "end": 35537930
  }, {
   "filename": "/data/gfx/waterfall.xml",
   "start": 35537930,
   "end": 35538632
  }, {
   "filename": "/data/karts/elephpant/auge.png",
   "start": 35538632,
   "end": 35539333
  }, {
   "filename": "/data/challenges/fortmagma.challenge",
   "start": 35539333,
   "end": 35540027
  }, {
   "filename": "/data/karts/xfcemouse/License.txt",
   "start": 35540027,
   "end": 35540717
  }, {
   "filename": "/data/gfx/fire.xml",
   "start": 35540717,
   "end": 35541406
  }, {
   "filename": "/data/tracks/greenvalley/RudbeckiaHirta.b3d",
   "start": 35541406,
   "end": 35542090
  }, {
   "filename": "/data/tracks/mansion/Plane.008.b3d",
   "start": 35542090,
   "end": 35542764
  }, {
   "filename": "/data/tracks/mansion/Plane.009.b3d",
   "start": 35542764,
   "end": 35543438
  }, {
   "filename": "/data/tracks/mansion/Plane.014.b3d",
   "start": 35543438,
   "end": 35544112
  }, {
   "filename": "/data/tracks/mansion/Plane.015.b3d",
   "start": 35544112,
   "end": 35544786
  }, {
   "filename": "/data/tracks/mansion/Plane.016.b3d",
   "start": 35544786,
   "end": 35545460
  }, {
   "filename": "/data/tracks/mansion/Plane.017.b3d",
   "start": 35545460,
   "end": 35546134
  }, {
   "filename": "/data/tracks/mansion/Plane.019.b3d",
   "start": 35546134,
   "end": 35546808
  }, {
   "filename": "/data/tracks/mansion/Plane.020.b3d",
   "start": 35546808,
   "end": 35547482
  }, {
   "filename": "/data/tracks/mansion/Plane.026.b3d",
   "start": 35547482,
   "end": 35548156
  }, {
   "filename": "/data/tracks/mansion/Plane.027.b3d",
   "start": 35548156,
   "end": 35548830
  }, {
   "filename": "/data/tracks/mansion/Plane.028.b3d",
   "start": 35548830,
   "end": 35549504
  }, {
   "filename": "/data/tracks/zengarden/waterLily.b3d",
   "start": 35549504,
   "end": 35550178
  }, {
   "filename": "/data/tracks/xr591/curious.b3d",
   "start": 35550178,
   "end": 35550850
  }, {
   "filename": "/data/tracks/introcutscene/catailVeg_LOD50.b3d",
   "start": 35550850,
   "end": 35551521
  }, {
   "filename": "/data/tracks/xr591/love.b3d",
   "start": 35551521,
   "end": 35552190
  }, {
   "filename": "/data/tracks/greenvalley/OsmundaCinnamoneaS.005.b3d",
   "start": 35552190,
   "end": 35552850
  }, {
   "filename": "/data/karts/konqi/License.txt",
   "start": 35552850,
   "end": 35553505
  }, {
   "filename": "/data/tracks/sandtrack/License.txt",
   "start": 35553505,
   "end": 35554153
  }, {
   "filename": "/data/gui/tutorial.stkgui",
   "start": 35554153,
   "end": 35554791
  }, {
   "filename": "/data/gui/enter_player_name_dialog.stkgui",
   "start": 35554791,
   "end": 35555422
  }, {
   "filename": "/data/gui/confirm_resolution_dialog.stkgui",
   "start": 35555422,
   "end": 35556052
  }, {
   "filename": "/data/tracks/introcutscene2/materials.xml",
   "start": 35556052,
   "end": 35556655
  }, {
   "filename": "/data/karts/emule/license.txt",
   "start": 35556655,
   "end": 35557251
  }, {
   "filename": "/data/tracks/battleisland/materials.xml",
   "start": 35557251,
   "end": 35557834
  }, {
   "filename": "/data/tracks/subsea/graph.xml",
   "start": 35557834,
   "end": 35558404
  }, {
   "filename": "/data/tracks/city/graph.xml",
   "start": 35558404,
   "end": 35558968
  }, {
   "filename": "/data/tracks/greenvalley/graph.xml",
   "start": 35558968,
   "end": 35559528
  }, {
   "filename": "/data/tracks/minigolf/graph.xml",
   "start": 35559528,
   "end": 35560088
  }, {
   "filename": "/data/tracks/mines/Music_license.rtf",
   "start": 35560088,
   "end": 35560646
  }, {
   "filename": "/data/tracks/snowmountain/License.txt",
   "start": 35560646,
   "end": 35561195
  }, {
   "filename": "/data/gui/Makefile.am",
   "start": 35561195,
   "end": 35561740
  }, {
   "filename": "/data/tracks/mansion/bugslight.png",
   "start": 35561740,
   "end": 35562283
  }, {
   "filename": "/data/tracks/greenvalley/tree_model_4_faces.b3d",
   "start": 35562283,
   "end": 35562821
  }, {
   "filename": "/data/tracks/overworld/pineVeryLow.b3d",
   "start": 35562821,
   "end": 35563355
  }, {
   "filename": "/data/tracks/hacienda/Plane.018.b3d",
   "start": 35563355,
   "end": 35563888
  }, {
   "filename": "/data/tracks/hacienda/Plane.019.b3d",
   "start": 35563888,
   "end": 35564421
  }, {
   "filename": "/data/tracks/tutorial/Plane.018.b3d",
   "start": 35564421,
   "end": 35564954
  }, {
   "filename": "/data/tracks/tutorial/Plane.019.b3d",
   "start": 35564954,
   "end": 35565487
  }, {
   "filename": "/data/tracks/greenvalley/WaterPlant1.lod.low.b3d",
   "start": 35565487,
   "end": 35566016
  }, {
   "filename": "/data/models/zipper.b3d",
   "start": 35566016,
   "end": 35566544
  }, {
   "filename": "/data/tracks/zengarden/sakuraLow_LOD100.b3d",
   "start": 35566544,
   "end": 35567070
  }, {
   "filename": "/data/gui/materials.xml",
   "start": 35567070,
   "end": 35567595
  }, {
   "filename": "/data/tracks/overworld/littleTree.b3d",
   "start": 35567595,
   "end": 35568120
  }, {
   "filename": "/data/tracks/overworld/pineLow_LOD100.b3d",
   "start": 35568120,
   "end": 35568645
  }, {
   "filename": "/data/tracks/hacienda/Plane.009.b3d",
   "start": 35568645,
   "end": 35569168
  }, {
   "filename": "/data/tracks/hacienda/Plane.010.b3d",
   "start": 35569168,
   "end": 35569691
  }, {
   "filename": "/data/tracks/mansion/basicfence.b3d",
   "start": 35569691,
   "end": 35570214
  }, {
   "filename": "/data/tracks/tutorial/Plane.009.b3d",
   "start": 35570214,
   "end": 35570737
  }, {
   "filename": "/data/tracks/tutorial/Plane.010.b3d",
   "start": 35570737,
   "end": 35571260
  }, {
   "filename": "/data/tracks/zengarden/bugslight.png",
   "start": 35571260,
   "end": 35571783
  }, {
   "filename": "/data/tracks/mansion/dead_branch.b3d",
   "start": 35571783,
   "end": 35572305
  }, {
   "filename": "/data/tracks/mansion/dead_tree_low.b3d",
   "start": 35572305,
   "end": 35572827
  }, {
   "filename": "/data/tracks/snowtuxpeak/treelow1.b3d",
   "start": 35572827,
   "end": 35573348
  }, {
   "filename": "/data/tracks/zengarden/pineLow_LOD100.b3d",
   "start": 35573348,
   "end": 35573869
  }, {
   "filename": "/data/tracks/hacienda/Plane.043.b3d",
   "start": 35573869,
   "end": 35574388
  }, {
   "filename": "/data/tracks/hacienda/Plane.044.b3d",
   "start": 35574388,
   "end": 35574907
  }, {
   "filename": "/data/tracks/hacienda/Plane.045.b3d",
   "start": 35574907,
   "end": 35575426
  }, {
   "filename": "/data/tracks/hacienda/Plane.046.b3d",
   "start": 35575426,
   "end": 35575945
  }, {
   "filename": "/data/tracks/hacienda/Plane.047.b3d",
   "start": 35575945,
   "end": 35576464
  }, {
   "filename": "/data/tracks/tutorial/Plane.043.b3d",
   "start": 35576464,
   "end": 35576983
  }, {
   "filename": "/data/tracks/tutorial/Plane.044.b3d",
   "start": 35576983,
   "end": 35577502
  }, {
   "filename": "/data/tracks/tutorial/Plane.045.b3d",
   "start": 35577502,
   "end": 35578021
  }, {
   "filename": "/data/tracks/tutorial/Plane.046.b3d",
   "start": 35578021,
   "end": 35578540
  }, {
   "filename": "/data/tracks/tutorial/Plane.047.b3d",
   "start": 35578540,
   "end": 35579059
  }, {
   "filename": "/data/tracks/mansion/Plane.003.b3d",
   "start": 35579059,
   "end": 35579576
  }, {
   "filename": "/data/tracks/snowtuxpeak/crystal_LOD170.b3d",
   "start": 35579576,
   "end": 35580093
  }, {
   "filename": "/data/gui/credits.stkgui",
   "start": 35580093,
   "end": 35580607
  }, {
   "filename": "/data/run_me.sh",
   "start": 35580607,
   "end": 35581116
  }, {
   "filename": "/data/tracks/jungle/License.txt",
   "start": 35581116,
   "end": 35581622
  }, {
   "filename": "/data/gui/confirm_dialog.stkgui",
   "start": 35581622,
   "end": 35582120
  }, {
   "filename": "/data/tracks/soccer_field/track.xml",
   "start": 35582120,
   "end": 35582617
  }, {
   "filename": "/data/tracks/endcutscene/License.txt",
   "start": 35582617,
   "end": 35583106
  }, {
   "filename": "/data/challenges/olivermath.challenge",
   "start": 35583106,
   "end": 35583585
  }, {
   "filename": "/data/supertuxkart_desktop.template",
   "start": 35583585,
   "end": 35584064
  }, {
   "filename": "/data/challenges/sandtrack.challenge",
   "start": 35584064,
   "end": 35584541
  }, {
   "filename": "/data/challenges/xr591.challenge",
   "start": 35584541,
   "end": 35585018
  }, {
   "filename": "/data/tracks/endcutscene/materials.xml",
   "start": 35585018,
   "end": 35585490
  }, {
   "filename": "/data/gui/press_a_key_dialog.stkgui",
   "start": 35585490,
   "end": 35585959
  }, {
   "filename": "/data/tracks/mansion/License.txt",
   "start": 35585959,
   "end": 35586427
  }, {
   "filename": "/data/challenges/lighthouse.challenge",
   "start": 35586427,
   "end": 35586885
  }, {
   "filename": "/data/challenges/snowpeak.challenge",
   "start": 35586885,
   "end": 35587342
  }, {
   "filename": "/data/challenges/gp1.challenge",
   "start": 35587342,
   "end": 35587798
  }, {
   "filename": "/data/challenges/gp2.challenge",
   "start": 35587798,
   "end": 35588254
  }, {
   "filename": "/data/challenges/gp3.challenge",
   "start": 35588254,
   "end": 35588710
  }, {
   "filename": "/data/challenges/startrack.challenge",
   "start": 35588710,
   "end": 35589165
  }, {
   "filename": "/data/challenges/hacienda.challenge",
   "start": 35589165,
   "end": 35589619
  }, {
   "filename": "/data/challenges/scotland.challenge",
   "start": 35589619,
   "end": 35590072
  }, {
   "filename": "/data/challenges/jungle.challenge",
   "start": 35590072,
   "end": 35590524
  }, {
   "filename": "/data/challenges/gp4.challenge",
   "start": 35590524,
   "end": 35590975
  }, {
   "filename": "/data/challenges/islandtrack.challenge",
   "start": 35590975,
   "end": 35591426
  }, {
   "filename": "/data/challenges/subsea.challenge",
   "start": 35591426,
   "end": 35591877
  }, {
   "filename": "/data/challenges/tuxtollway.challenge",
   "start": 35591877,
   "end": 35592327
  }, {
   "filename": "/data/tracks/overworld/track.xml",
   "start": 35592327,
   "end": 35592777
  }, {
   "filename": "/data/challenges/farm.challenge",
   "start": 35592777,
   "end": 35593226
  }, {
   "filename": "/data/challenges/minigolf.challenge",
   "start": 35593226,
   "end": 35593674
  }, {
   "filename": "/data/challenges/zengarden.challenge",
   "start": 35593674,
   "end": 35594122
  }, {
   "filename": "/data/challenges/snowmountain.challenge",
   "start": 35594122,
   "end": 35594567
  }, {
   "filename": "/data/tracks/snowmountain/materials.xml",
   "start": 35594567,
   "end": 35595012
  }, {
   "filename": "/data/challenges/city.challenge",
   "start": 35595012,
   "end": 35595455
  }, {
   "filename": "/data/challenges/mansion.challenge",
   "start": 35595455,
   "end": 35595895
  }, {
   "filename": "/data/challenges/mines.challenge",
   "start": 35595895,
   "end": 35596335
  }, {
   "filename": "/data/tracks/xr591/graph.xml",
   "start": 35596335,
   "end": 35596775
  }, {
   "filename": "/data/tracks/sandtrack/graph.xml",
   "start": 35596775,
   "end": 35597214
  }, {
   "filename": "/data/tracks/jungle/graph.xml",
   "start": 35597214,
   "end": 35597647
  }, {
   "filename": "/data/tracks/olivermath/graph.xml",
   "start": 35597647,
   "end": 35598078
  }, {
   "filename": "/data/tracks/fortmagma/graph.xml",
   "start": 35598078,
   "end": 35598505
  }, {
   "filename": "/data/tracks/hacienda/mars_nose.jpg",
   "start": 35598505,
   "end": 35598932
  }, {
   "filename": "/data/tracks/jungle/track.xml",
   "start": 35598932,
   "end": 35599359
  }, {
   "filename": "/data/tracks/xr591/mars_nose.jpg",
   "start": 35599359,
   "end": 35599786
  }, {
   "filename": "/data/tracks/tutorial/track.xml",
   "start": 35599786,
   "end": 35600207
  }, {
   "filename": "/data/tracks/battleisland/track.xml",
   "start": 35600207,
   "end": 35600626
  }, {
   "filename": "/data/tracks/introcutscene2/track.xml",
   "start": 35600626,
   "end": 35601045
  }, {
   "filename": "/data/tracks/snowtuxpeak/track.xml",
   "start": 35601045,
   "end": 35601463
  }, {
   "filename": "/data/tracks/xr591/marsrobot1.jpg",
   "start": 35601463,
   "end": 35601878
  }, {
   "filename": "/data/tracks/introcutscene/fence_pagoda.png",
   "start": 35601878,
   "end": 35602290
  }, {
   "filename": "/data/tracks/zengarden/fence_pagoda.png",
   "start": 35602290,
   "end": 35602702
  }, {
   "filename": "/data/tracks/sandtrack/materials.xml",
   "start": 35602702,
   "end": 35603109
  }, {
   "filename": "/data/tracks/farm/track.xml",
   "start": 35603109,
   "end": 35603515
  }, {
   "filename": "/data/tracks/lighthouse/track.xml",
   "start": 35603515,
   "end": 35603919
  }, {
   "filename": "/data/tracks/sandtrack/track.xml",
   "start": 35603919,
   "end": 35604323
  }, {
   "filename": "/data/tracks/xr591/track.xml",
   "start": 35604323,
   "end": 35604727
  }, {
   "filename": "/data/tracks/mines/track.xml",
   "start": 35604727,
   "end": 35605130
  }, {
   "filename": "/data/tracks/startrack/track.xml",
   "start": 35605130,
   "end": 35605532
  }, {
   "filename": "/data/karts/sara/materials.xml",
   "start": 35605532,
   "end": 35605931
  }, {
   "filename": "/data/tracks/mansion/track.xml",
   "start": 35605931,
   "end": 35606330
  }, {
   "filename": "/data/tracks/olivermath/track.xml",
   "start": 35606330,
   "end": 35606728
  }, {
   "filename": "/data/tracks/stadium/track.xml",
   "start": 35606728,
   "end": 35607125
  }, {
   "filename": "/data/tracks/hacienda/track.xml",
   "start": 35607125,
   "end": 35607517
  }, {
   "filename": "/data/tracks/introcutscene2/license.txt",
   "start": 35607517,
   "end": 35607908
  }, {
   "filename": "/data/tracks/islandtrack/track.xml",
   "start": 35607908,
   "end": 35608297
  }, {
   "filename": "/data/tracks/zengarden/track.xml",
   "start": 35608297,
   "end": 35608685
  }, {
   "filename": "/data/tracks/city/track.xml",
   "start": 35608685,
   "end": 35609071
  }, {
   "filename": "/data/grandprix/3_tothemoonandback.grandprix",
   "start": 35609071,
   "end": 35609455
  }, {
   "filename": "/data/tracks/fortmagma/track.xml",
   "start": 35609455,
   "end": 35609837
  }, {
   "filename": "/data/tracks/mines/License.txt",
   "start": 35609837,
   "end": 35610218
  }, {
   "filename": "/data/karts/nolok/nolok_window.png",
   "start": 35610218,
   "end": 35610597
  }, {
   "filename": "/data/tracks/endcutscene/track.xml",
   "start": 35610597,
   "end": 35610976
  }, {
   "filename": "/data/tracks/introcutscene/track.xml",
   "start": 35610976,
   "end": 35611355
  }, {
   "filename": "/data/tracks/islandtrack/License.txt",
   "start": 35611355,
   "end": 35611734
  }, {
   "filename": "/data/tracks/snowmountain/track.xml",
   "start": 35611734,
   "end": 35612111
  }, {
   "filename": "/data/tracks/fortmagma/windows.b3d",
   "start": 35612111,
   "end": 35612487
  }, {
   "filename": "/data/tracks/greenvalley/grass_tall.b3d",
   "start": 35612487,
   "end": 35612862
  }, {
   "filename": "/data/tracks/endcutscene/TuxShadow.b3d",
   "start": 35612862,
   "end": 35613236
  }, {
   "filename": "/data/tracks/minigolf/track.xml",
   "start": 35613236,
   "end": 35613610
  }, {
   "filename": "/data/tracks/zengarden/sakuraLow_LOD500.b3d",
   "start": 35613610,
   "end": 35613984
  }, {
   "filename": "/data/grandprix/2_offthebeatentrack.grandprix",
   "start": 35613984,
   "end": 35614357
  }, {
   "filename": "/data/tracks/fortmagma/Plane.034.b3d",
   "start": 35614357,
   "end": 35614730
  }, {
   "filename": "/data/tracks/fortmagma/Plane.035.b3d",
   "start": 35614730,
   "end": 35615103
  }, {
   "filename": "/data/tracks/fortmagma/Plane.036.b3d",
   "start": 35615103,
   "end": 35615476
  }, {
   "filename": "/data/tracks/fortmagma/Plane.037.b3d",
   "start": 35615476,
   "end": 35615849
  }, {
   "filename": "/data/tracks/fortmagma/Plane.062.b3d",
   "start": 35615849,
   "end": 35616222
  }, {
   "filename": "/data/tracks/startrack/screen_halo.b3d",
   "start": 35616222,
   "end": 35616593
  }, {
   "filename": "/data/tracks/scotland/track.xml",
   "start": 35616593,
   "end": 35616963
  }, {
   "filename": "/data/grandprix/1_penguinplayground.grandprix",
   "start": 35616963,
   "end": 35617332
  }, {
   "filename": "/data/tracks/introcutscene/NolokShadow.b3d",
   "start": 35617332,
   "end": 35617701
  }, {
   "filename": "/data/tracks/zengarden/pineLow_LOD500.b3d",
   "start": 35617701,
   "end": 35618070
  }, {
   "filename": "/data/grandprix/4_atworldsend.grandprix",
   "start": 35618070,
   "end": 35618438
  }, {
   "filename": "/data/tracks/subsea/track.xml",
   "start": 35618438,
   "end": 35618805
  }, {
   "filename": "/data/tracks/cave/materials.xml",
   "start": 35618805,
   "end": 35619170
  }, {
   "filename": "/data/tracks/hacienda/Plane.021.b3d",
   "start": 35619170,
   "end": 35619535
  }, {
   "filename": "/data/tracks/hacienda/Plane.023.b3d",
   "start": 35619535,
   "end": 35619900
  }, {
   "filename": "/data/tracks/hacienda/Plane.024.b3d",
   "start": 35619900,
   "end": 35620265
  }, {
   "filename": "/data/tracks/hacienda/Plane.025.b3d",
   "start": 35620265,
   "end": 35620630
  }, {
   "filename": "/data/tracks/hacienda/Plane.026.b3d",
   "start": 35620630,
   "end": 35620995
  }, {
   "filename": "/data/tracks/tutorial/Plane.021.b3d",
   "start": 35620995,
   "end": 35621360
  }, {
   "filename": "/data/tracks/tutorial/Plane.023.b3d",
   "start": 35621360,
   "end": 35621725
  }, {
   "filename": "/data/tracks/tutorial/Plane.024.b3d",
   "start": 35621725,
   "end": 35622090
  }, {
   "filename": "/data/tracks/tutorial/Plane.025.b3d",
   "start": 35622090,
   "end": 35622455
  }, {
   "filename": "/data/tracks/tutorial/Plane.026.b3d",
   "start": 35622455,
   "end": 35622820
  }, {
   "filename": "/data/tracks/farm/mill.001.b3d",
   "start": 35622820,
   "end": 35623184
  }, {
   "filename": "/data/tracks/hacienda/mill.001.b3d",
   "start": 35623184,
   "end": 35623548
  }, {
   "filename": "/data/tracks/hacienda/mill.002.b3d",
   "start": 35623548,
   "end": 35623912
  }, {
   "filename": "/data/tracks/tutorial/mill.001.b3d",
   "start": 35623912,
   "end": 35624276
  }, {
   "filename": "/data/tracks/tutorial/mill.002.b3d",
   "start": 35624276,
   "end": 35624640
  }, {
   "filename": "/data/tracks/hacienda/mill.b3d",
   "start": 35624640,
   "end": 35625e3
  }, {
   "filename": "/data/tracks/tutorial/mill.b3d",
   "start": 35625e3,
   "end": 35625360
  }, {
   "filename": "/data/tracks/greenvalley/track.xml",
   "start": 35625360,
   "end": 35625719
  }, {
   "filename": "/data/tracks/olivermath/Line.png",
   "start": 35625719,
   "end": 35626075
  }, {
   "filename": "/data/tracks/cave/track.xml",
   "start": 35626075,
   "end": 35626430
  }, {
   "filename": "/data/models/Makefile.am",
   "start": 35626430,
   "end": 35626778
  }, {
   "filename": "/data/grandprix/basic_drive.tutorial",
   "start": 35626778,
   "end": 35627125
  }, {
   "filename": "/data/tracks/olivermath/materials.xml",
   "start": 35627125,
   "end": 35627469
  }, {
   "filename": "/data/shaders/check.sh",
   "start": 35627469,
   "end": 35627809
  }, {
   "filename": "/data/karts/adiumy/License.txt",
   "start": 35627809,
   "end": 35628139
  }, {
   "filename": "/data/music/dance_cleopatra.music",
   "start": 35628139,
   "end": 35628465
  }, {
   "filename": "/data/tracks/xr591/laser_bridge_red.png",
   "start": 35628465,
   "end": 35628783
  }, {
   "filename": "/data/music/demonhill.music",
   "start": 35628783,
   "end": 35629098
  }, {
   "filename": "/data/gui/tutorial_message_dialog.stkgui",
   "start": 35629098,
   "end": 35629412
  }, {
   "filename": "/data/tracks/olivermath/shine.png",
   "start": 35629412,
   "end": 35629724
  }, {
   "filename": "/data/tracks/farm/graph.xml",
   "start": 35629724,
   "end": 35630034
  }, {
   "filename": "/data/tracks/hacienda/graph.xml",
   "start": 35630034,
   "end": 35630344
  }, {
   "filename": "/data/tracks/islandtrack/graph.xml",
   "start": 35630344,
   "end": 35630654
  }, {
   "filename": "/data/tracks/lighthouse/graph.xml",
   "start": 35630654,
   "end": 35630964
  }, {
   "filename": "/data/tracks/mines/graph.xml",
   "start": 35630964,
   "end": 35631274
  }, {
   "filename": "/data/tracks/scotland/graph.xml",
   "start": 35631274,
   "end": 35631584
  }, {
   "filename": "/data/tracks/snowmountain/graph.xml",
   "start": 35631584,
   "end": 35631894
  }, {
   "filename": "/data/tracks/tutorial/graph.xml",
   "start": 35631894,
   "end": 35632204
  }, {
   "filename": "/data/tracks/greenvalley/sheep_black.jpg",
   "start": 35632204,
   "end": 35632512
  }, {
   "filename": "/data/tracks/greenvalley/sheep_white.jpg",
   "start": 35632512,
   "end": 35632820
  }, {
   "filename": "/data/tracks/mansion/graph.xml",
   "start": 35632820,
   "end": 35633128
  }, {
   "filename": "/data/tracks/snowtuxpeak/graph.xml",
   "start": 35633128,
   "end": 35633436
  }, {
   "filename": "/data/tracks/zengarden/graph.xml",
   "start": 35633436,
   "end": 35633744
  }, {
   "filename": "/data/textures/deprecated/trackborder.png",
   "start": 35633744,
   "end": 35634048
  }, {
   "filename": "/data/tracks/xr591/laser_bridge_green.png",
   "start": 35634048,
   "end": 35634350
  }, {
   "filename": "/data/tracks/soccer_field/license.txt",
   "start": 35634350,
   "end": 35634651
  }, {
   "filename": "/data/gui/skins/ocean/License.txt",
   "start": 35634651,
   "end": 35634939
  }, {
   "filename": "/data/gui/skins/peach/License.txt",
   "start": 35634939,
   "end": 35635227
  }, {
   "filename": "/data/tracks/soccer_field/materials.xml",
   "start": 35635227,
   "end": 35635503
  }, {
   "filename": "/data/grandprix/Makefile.am",
   "start": 35635503,
   "end": 35635772
  }, {
   "filename": "/data/karts/puffy/water-P.png",
   "start": 35635772,
   "end": 35636041
  }, {
   "filename": "/data/karts/puffy/window.png",
   "start": 35636041,
   "end": 35636310
  }, {
   "filename": "/data/models/zipper.png",
   "start": 35636310,
   "end": 35636574
  }, {
   "filename": "/data/tracks/greenvalley/invisible.png",
   "start": 35636574,
   "end": 35636824
  }, {
   "filename": "/data/sfx/Makefile.am",
   "start": 35636824,
   "end": 35637069
  }, {
   "filename": "/data/textures/Makefile.am",
   "start": 35637069,
   "end": 35637310
  }, {
   "filename": "/data/gui/feature_unlocked.stkgui",
   "start": 35637310,
   "end": 35637547
  }, {
   "filename": "/data/textures/chess.png",
   "start": 35637547,
   "end": 35637782
  }, {
   "filename": "/data/karts/adiumy/window.png",
   "start": 35637782,
   "end": 35638012
  }, {
   "filename": "/data/karts/sara/window.png",
   "start": 35638012,
   "end": 35638242
  }, {
   "filename": "/data/tracks/snowtuxpeak/License.txt",
   "start": 35638242,
   "end": 35638469
  }, {
   "filename": "/data/gui/grand_prix_lose.stkgui",
   "start": 35638469,
   "end": 35638693
  }, {
   "filename": "/data/gui/grand_prix_win.stkgui",
   "start": 35638693,
   "end": 35638917
  }, {
   "filename": "/data/music/Makefile.am",
   "start": 35638917,
   "end": 35639139
  }, {
   "filename": "/data/tracks/startrack/reset.png",
   "start": 35639139,
   "end": 35639361
  }, {
   "filename": "/data/tracks/battleisland/License.txt",
   "start": 35639361,
   "end": 35639575
  }, {
   "filename": "/data/karts/suzanne/License.txt",
   "start": 35639575,
   "end": 35639777
  }, {
   "filename": "/data/karts/konqi/materials.xml",
   "start": 35639777,
   "end": 35639974
  }, {
   "filename": "/data/tracks/overworld/ufo_window.png",
   "start": 35639974,
   "end": 35640168
  }, {
   "filename": "/data/shaders/Makefile.am",
   "start": 35640168,
   "end": 35640360
  }, {
   "filename": "/data/tracks/mines/clip.png",
   "start": 35640360,
   "end": 35640551
  }, {
   "filename": "/data/fonts/Makefile.am",
   "start": 35640551,
   "end": 35640739
  }, {
   "filename": "/data/tracks/introcutscene2/intro2.music",
   "start": 35640739,
   "end": 35640927
  }, {
   "filename": "/data/po/Makefile.am",
   "start": 35640927,
   "end": 35641112
  }, {
   "filename": "/data/karts/puffy/materials.xml",
   "start": 35641112,
   "end": 35641294
  }, {
   "filename": "/data/tracks/overworld/bubble_solid_texture.png",
   "start": 35641294,
   "end": 35641468
  }, {
   "filename": "/data/music/SkyVibe-HighFrequency.music",
   "start": 35641468,
   "end": 35641641
  }, {
   "filename": "/data/music/TheDeadRocks-GreenSecretFromAmazonia.music",
   "start": 35641641,
   "end": 35641810
  }, {
   "filename": "/data/tracks/mines/West.music",
   "start": 35641810,
   "end": 35641978
  }, {
   "filename": "/data/tracks/stadium/License.txt",
   "start": 35641978,
   "end": 35642145
  }, {
   "filename": "/data/tracks/lighthouse/easter_eggs.xml",
   "start": 35642145,
   "end": 35642310
  }, {
   "filename": "/data/tracks/startrack/easter_eggs.xml",
   "start": 35642310,
   "end": 35642475
  }, {
   "filename": "/data/tracks/subsea/easter_eggs.xml",
   "start": 35642475,
   "end": 35642640
  }, {
   "filename": "/data/tracks/xr591/easter_eggs.xml",
   "start": 35642640,
   "end": 35642805
  }, {
   "filename": "/data/tracks/startrack/xeon.music",
   "start": 35642805,
   "end": 35642968
  }, {
   "filename": "/data/tracks/soccer_field/soccer_ball.png",
   "start": 35642968,
   "end": 35643129
  }, {
   "filename": "/data/tracks/jungle/amazon_jungle.music",
   "start": 35643129,
   "end": 35643286
  }, {
   "filename": "/data/karts/adiumy/materials.xml",
   "start": 35643286,
   "end": 35643437
  }, {
   "filename": "/data/music/win_theme.music",
   "start": 35643437,
   "end": 35643585
  }, {
   "filename": "/data/challenges/Makefile.am",
   "start": 35643585,
   "end": 35643731
  }, {
   "filename": "/data/music/overworld.music",
   "start": 35643731,
   "end": 35643876
  }, {
   "filename": "/data/tracks/cave/License.txt",
   "start": 35643876,
   "end": 35644021
  }, {
   "filename": "/data/music/hacienda.music",
   "start": 35644021,
   "end": 35644165
  }, {
   "filename": "/data/models/candy_stripe.png",
   "start": 35644165,
   "end": 35644308
  }, {
   "filename": "/data/music/subsea.music",
   "start": 35644308,
   "end": 35644451
  }, {
   "filename": "/data/music/TheDeadRocks-EasyJob.music",
   "start": 35644451,
   "end": 35644585
  }, {
   "filename": "/data/tracks/city/License.txt",
   "start": 35644585,
   "end": 35644718
  }, {
   "filename": "/data/tracks/fortmagma/pix.png",
   "start": 35644718,
   "end": 35644851
  }, {
   "filename": "/data/tracks/tutorial/pix.png",
   "start": 35644851,
   "end": 35644984
  }, {
   "filename": "/data/tracks/tutorial/pix_2.png",
   "start": 35644984,
   "end": 35645117
  }, {
   "filename": "/data/music/Penguin_Party.music",
   "start": 35645117,
   "end": 35645249
  }, {
   "filename": "/data/karts/nolok/materials.xml",
   "start": 35645249,
   "end": 35645380
  }, {
   "filename": "/data/music/main_theme.music",
   "start": 35645380,
   "end": 35645511
  }, {
   "filename": "/data/karts/sara/pix.png",
   "start": 35645511,
   "end": 35645641
  }, {
   "filename": "/data/music/Boom_boom_boom.music",
   "start": 35645641,
   "end": 35645771
  }, {
   "filename": "/data/tracks/hacienda/pix.png",
   "start": 35645771,
   "end": 35645901
  }, {
   "filename": "/data/tracks/hacienda/pix_2.png",
   "start": 35645901,
   "end": 35646031
  }, {
   "filename": "/data/tracks/mansion/pix.png",
   "start": 35646031,
   "end": 35646161
  }, {
   "filename": "/data/tracks/zengarden/pix.png",
   "start": 35646161,
   "end": 35646291
  }, {
   "filename": "/data/tracks/zengarden/pix_nr.png",
   "start": 35646291,
   "end": 35646421
  }, {
   "filename": "/data/music/kart_grand_prix.music",
   "start": 35646421,
   "end": 35646550
  }, {
   "filename": "/data/music/lava.music",
   "start": 35646550,
   "end": 35646679
  }, {
   "filename": "/data/textures/transparence.png",
   "start": 35646679,
   "end": 35646807
  }, {
   "filename": "/data/textures/transparence2.png",
   "start": 35646807,
   "end": 35646935
  }, {
   "filename": "/data/tracks/xr591/transparence.png",
   "start": 35646935,
   "end": 35647063
  }, {
   "filename": "/data/music/race_summary.music",
   "start": 35647063,
   "end": 35647190
  }, {
   "filename": "/data/music/OnTheRiver.music",
   "start": 35647190,
   "end": 35647314
  }, {
   "filename": "/data/gfx/Makefile.am",
   "start": 35647314,
   "end": 35647436
  }, {
   "filename": "/data/music/lose_theme.music",
   "start": 35647436,
   "end": 35647557
  }, {
   "filename": "/data/music/garden.music",
   "start": 35647557,
   "end": 35647677
  }, {
   "filename": "/data/music/Snowy.music",
   "start": 35647677,
   "end": 35647795
  }, {
   "filename": "/data/textures/deprecated/fuzzy.png",
   "start": 35647795,
   "end": 35647912
  }, {
   "filename": "/data/music/valley.music",
   "start": 35647912,
   "end": 35648025
  }, {
   "filename": "/data/music/Origin.music",
   "start": 35648025,
   "end": 35648137
  }, {
   "filename": "/data/tracks/olivermath/License.txt",
   "start": 35648137,
   "end": 35648249
  }, {
   "filename": "/data/tracks/stadium/materials.xml",
   "start": 35648249,
   "end": 35648359
  }, {
   "filename": "/data/karts/beastie/materials.xml",
   "start": 35648359,
   "end": 35648462
  }, {
   "filename": "/data/tracks/mansion/Circle.007.b3d",
   "start": 35648462,
   "end": 35648565
  }, {
   "filename": "/data/tracks/mansion/Circle.008.b3d",
   "start": 35648565,
   "end": 35648668
  }, {
   "filename": "/data/karts/pidgin/materials.xml",
   "start": 35648668,
   "end": 35648770
  }, {
   "filename": "/data/karts/emule/materials.xml",
   "start": 35648770,
   "end": 35648869
  }, {
   "filename": "/data/karts/xfcemouse/materials.xml",
   "start": 35648869,
   "end": 35648968
  }, {
   "filename": "/data/karts/gnu/materials.xml",
   "start": 35648968,
   "end": 35649064
  }, {
   "filename": "/data/karts/beagle/materials.xml",
   "start": 35649064,
   "end": 35649159
  }, {
   "filename": "/data/tracks/greenvalley/.directory",
   "start": 35649159,
   "end": 35649228
  }, {
   "filename": "/data/tracks/minigolf/license.txt",
   "start": 35649228,
   "end": 35649267
  } ],
  "remote_package_size": 35649267,
  "package_uuid": "87920ffc-36ee-4194-825d-7c31aa04a5a8"
 });
})();

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary, setWindowTitle;

function logExceptionOnExit(e) {
 if (e instanceof ExitStatus) return;
 let toLog = e;
 err("exiting due to exception: " + toLog);
}

var fs;

var nodePath;

var requireNodeFS;

if (ENVIRONMENT_IS_NODE) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = require("path").dirname(scriptDirectory) + "/";
 } else {
  scriptDirectory = __dirname + "/";
 }
 requireNodeFS = (() => {
  if (!nodePath) {
   fs = require("fs");
   nodePath = require("path");
  }
 });
 read_ = function shell_read(filename, binary) {
  requireNodeFS();
  filename = nodePath["normalize"](filename);
  return fs.readFileSync(filename, binary ? undefined : "utf8");
 };
 readBinary = (filename => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  return ret;
 });
 readAsync = ((filename, onload, onerror) => {
  requireNodeFS();
  filename = nodePath["normalize"](filename);
  fs.readFile(filename, function(err, data) {
   if (err) onerror(err); else onload(data.buffer);
  });
 });
 if (process["argv"].length > 1) {
  thisProgram = process["argv"][1].replace(/\\/g, "/");
 }
 arguments_ = process["argv"].slice(2);
 if (typeof module != "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 });
 process["on"]("unhandledRejection", function(reason) {
  throw reason;
 });
 quit_ = ((status, toThrow) => {
  if (keepRuntimeAlive()) {
   process["exitCode"] = status;
   throw toThrow;
  }
  logExceptionOnExit(toThrow);
  process["exit"](status);
 });
 Module["inspect"] = function() {
  return "[Emscripten Module object]";
 };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 {
  read_ = (url => {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  });
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = (url => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(xhr.response);
   });
  }
  readAsync = ((url, onload, onerror) => {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = (() => {
    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
     onload(xhr.response);
     return;
    }
    onerror();
   });
   xhr.onerror = onerror;
   xhr.send(null);
  });
 }
 setWindowTitle = (title => document.title = title);
} else {}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.warn.bind(console);

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (Module["quit"]) quit_ = Module["quit"];

function warnOnce(text) {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
}

var tempRet0 = 0;

var setTempRet0 = value => {
 tempRet0 = value;
};

var getTempRet0 = () => tempRet0;

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

var noExitRuntime = Module["noExitRuntime"] || true;

if (typeof WebAssembly != "object") {
 abort("no native wasm support detected");
}

var wasmMemory;

var ABORT = false;

var EXITSTATUS;

function assert(condition, text) {
 if (!condition) {
  abort(text);
 }
}

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(heap, idx, maxBytesToRead) {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(heap.subarray(idx, endPtr));
 } else {
  var str = "";
  while (idx < endPtr) {
   var u0 = heap[idx++];
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   var u1 = heap[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   var u2 = heap[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
 return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | u >> 6;
   heap[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | u >> 12;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   heap[outIdx++] = 240 | u >> 18;
   heap[outIdx++] = 128 | u >> 12 & 63;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4;
 }
 return len;
}

function allocateUTF8(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function allocateUTF8OnStack(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function writeArrayToMemory(array, buffer) {
 HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
 buffer = buf;
 Module["HEAP8"] = HEAP8 = new Int8Array(buf);
 Module["HEAP16"] = HEAP16 = new Int16Array(buf);
 Module["HEAP32"] = HEAP32 = new Int32Array(buf);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 268435456;

var wasmTable;

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeExited = false;

var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
 return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 runtimeInitialized = true;
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
 FS.ignorePermissions = false;
 TTY.init();
 SOCKFS.root = FS.mount(SOCKFS, {}, null);
 callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
 runtimeExited = true;
}

function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
 return id;
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

Module["preloadedImages"] = {};

Module["preloadedAudios"] = {};

function abort(what) {
 {
  if (Module["onAbort"]) {
   Module["onAbort"](what);
  }
 }
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 what += ". Build with -s ASSERTIONS=1 for more info.";
 var e = new WebAssembly.RuntimeError(what);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return filename.startsWith(dataURIPrefix);
}

function isFileURI(filename) {
 return filename.startsWith("file://");
}

var wasmBinaryFile;

wasmBinaryFile = "supertuxkart.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
 try {
  if (file == wasmBinaryFile && wasmBinary) {
   return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
   return readBinary(file);
  } else {
   throw "both async and sync fetching of the wasm failed";
  }
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise() {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(function() {
    return getBinary(wasmBinaryFile);
   });
  } else {
   if (readAsync) {
    return new Promise(function(resolve, reject) {
     readAsync(wasmBinaryFile, function(response) {
      resolve(new Uint8Array(response));
     }, reject);
    });
   }
  }
 }
 return Promise.resolve().then(function() {
  return getBinary(wasmBinaryFile);
 });
}

function createWasm() {
 var info = {
  "a": asmLibraryArg
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  Module["asm"] = exports;
  wasmMemory = Module["asm"]["zk"];
  updateGlobalBufferAndViews(wasmMemory.buffer);
  wasmTable = Module["asm"]["Ck"];
  addOnInit(Module["asm"]["Ak"]);
  removeRunDependency("wasm-instantiate");
 }
 addRunDependency("wasm-instantiate");
 function receiveInstantiationResult(result) {
  receiveInstance(result["instance"]);
 }
 function instantiateArrayBuffer(receiver) {
  return getBinaryPromise().then(function(binary) {
   return WebAssembly.instantiate(binary, info);
  }).then(function(instance) {
   return instance;
  }).then(receiver, function(reason) {
   err("failed to asynchronously prepare wasm: " + reason);
   abort(reason);
  });
 }
 function instantiateAsync() {
  if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch == "function") {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    var result = WebAssembly.instantiateStreaming(response, info);
    return result.then(receiveInstantiationResult, function(reason) {
     err("wasm streaming compile failed: " + reason);
     err("falling back to ArrayBuffer instantiation");
     return instantiateArrayBuffer(receiveInstantiationResult);
    });
   });
  } else {
   return instantiateArrayBuffer(receiveInstantiationResult);
  }
 }
 if (Module["instantiateWasm"]) {
  try {
   var exports = Module["instantiateWasm"](info, receiveInstance);
   return exports;
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   return false;
  }
 }
 instantiateAsync();
 return {};
}

var tempDouble;

var tempI64;

var ASM_CONSTS = {
 404948: function() {
  var status = document.getElementById("status");
  if (status) status.textContent = "SuperTuxKart failed to start due to an unknown error.";
 },
 405090: function($0) {
  var status = document.getElementById("status");
  if (status) status.textContent = "SuperTuxKart failed to start: " + UTF8ToString($0);
 }
};

function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback(Module);
   continue;
  }
  var func = callback.func;
  if (typeof func == "number") {
   if (callback.arg === undefined) {
    getWasmTableEntry(func)();
   } else {
    getWasmTableEntry(func)(callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}

var wasmTableMirror = [];

function getWasmTableEntry(funcPtr) {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 return func;
}

function handleException(e) {
 if (e instanceof ExitStatus || e == "unwind") {
  return EXITSTATUS;
 }
 quit_(1, e);
}

function getRandomDevice() {
 if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
  var randomBuffer = new Uint8Array(1);
  return function() {
   crypto.getRandomValues(randomBuffer);
   return randomBuffer[0];
  };
 } else if (ENVIRONMENT_IS_NODE) {
  try {
   var crypto_module = require("crypto");
   return function() {
    return crypto_module["randomBytes"](1)[0];
   };
  } catch (e) {}
 }
 return function() {
  abort("randomDevice");
 };
}

var PATH = {
 splitPath: function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(function(p) {
   return !!p;
  }), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: function(path) {
  if (path === "/") return "/";
  path = PATH.normalize(path);
  path = path.replace(/\/$/, "");
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 extname: function(path) {
  return PATH.splitPath(path)[3];
 },
 join: function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 },
 join2: function(l, r) {
  return PATH.normalize(l + "/" + r);
 }
};

var PATH_FS = {
 resolve: function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path != "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
   return !!p;
  }), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 },
 relative: function(from, to) {
  from = PATH_FS.resolve(from).substr(1);
  to = PATH_FS.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

var TTY = {
 ttys: [],
 init: function() {},
 shutdown: function() {},
 register: function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open: function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(43);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  flush: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  read: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(60);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(6);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(60);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char: function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = Buffer.alloc(BUFSIZE);
     var bytesRead = 0;
     try {
      bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
     } catch (e) {
      if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  },
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 },
 default_tty1_ops: {
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

function zeroMemory(address, size) {
 HEAPU8.fill(0, address, address + size);
}

function mmapAlloc(size) {
 abort();
}

var MEMFS = {
 ops_table: null,
 mount: function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(63);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
   parent.timestamp = node.timestamp;
  }
  return node;
 },
 getFileDataAsTypedArray: function(node) {
  if (!node.contents) return new Uint8Array(0);
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage: function(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
 },
 resizeFileStorage: function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
  } else {
   var oldContents = node.contents;
   node.contents = new Uint8Array(newSize);
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
  }
 },
 node_ops: {
  getattr: function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr: function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup: function(parent, name) {
   throw FS.genericErrors[44];
  },
  mknod: function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename: function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(55);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.parent.timestamp = Date.now();
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   new_dir.timestamp = old_node.parent.timestamp;
   old_node.parent = new_dir;
  },
  unlink: function(parent, name) {
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  rmdir: function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(55);
   }
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  readdir: function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink: function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink: function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   return node.link;
  }
 },
 stream_ops: {
  read: function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write: function(stream, buffer, offset, length, position, canOwn) {
   if (buffer.buffer === HEAP8.buffer) {
    canOwn = false;
   }
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = buffer.slice(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) {
    node.contents.set(buffer.subarray(offset, offset + length), position);
   } else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  },
  allocate: function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap: function(stream, address, length, position, prot, flags) {
   if (address !== 0) {
    throw new FS.ErrnoError(28);
   }
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && contents.buffer === buffer) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < contents.length) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = mmapAlloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(48);
    }
    HEAP8.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync: function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

function asyncLoad(url, onload, onerror, noRunDep) {
 var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
 readAsync(url, function(arrayBuffer) {
  assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
  onload(new Uint8Array(arrayBuffer));
  if (dep) removeRunDependency(dep);
 }, function(event) {
  if (onerror) {
   onerror();
  } else {
   throw 'Loading data file "' + url + '" failed.';
  }
 });
 if (dep) addRunDependency(dep);
}

var IDBFS = {
 dbs: {},
 indexedDB: () => {
  if (typeof indexedDB != "undefined") return indexedDB;
  var ret = null;
  if (typeof window == "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBFS used, but indexedDB not supported");
  return ret;
 },
 DB_VERSION: 21,
 DB_STORE_NAME: "FILE_DATA",
 mount: function(mount) {
  return MEMFS.mount.apply(null, arguments);
 },
 syncfs: (mount, populate, callback) => {
  IDBFS.getLocalSet(mount, (err, local) => {
   if (err) return callback(err);
   IDBFS.getRemoteSet(mount, (err, remote) => {
    if (err) return callback(err);
    var src = populate ? remote : local;
    var dst = populate ? local : remote;
    IDBFS.reconcile(src, dst, callback);
   });
  });
 },
 getDB: (name, callback) => {
  var db = IDBFS.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  if (!req) {
   return callback("Unable to connect to IndexedDB");
  }
  req.onupgradeneeded = (e => {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
   }
   if (!fileStore.indexNames.contains("timestamp")) {
    fileStore.createIndex("timestamp", "timestamp", {
     unique: false
    });
   }
  });
  req.onsuccess = (() => {
   db = req.result;
   IDBFS.dbs[name] = db;
   callback(null, db);
  });
  req.onerror = (e => {
   callback(this.error);
   e.preventDefault();
  });
 },
 getLocalSet: (mount, callback) => {
  var entries = {};
  function isRealDir(p) {
   return p !== "." && p !== "..";
  }
  function toAbsolute(root) {
   return p => {
    return PATH.join2(root, p);
   };
  }
  var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  while (check.length) {
   var path = check.pop();
   var stat;
   try {
    stat = FS.stat(path);
   } catch (e) {
    return callback(e);
   }
   if (FS.isDir(stat.mode)) {
    check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
   }
   entries[path] = {
    "timestamp": stat.mtime
   };
  }
  return callback(null, {
   type: "local",
   entries: entries
  });
 },
 getRemoteSet: (mount, callback) => {
  var entries = {};
  IDBFS.getDB(mount.mountpoint, (err, db) => {
   if (err) return callback(err);
   try {
    var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readonly");
    transaction.onerror = (e => {
     callback(this.error);
     e.preventDefault();
    });
    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
    var index = store.index("timestamp");
    index.openKeyCursor().onsuccess = (event => {
     var cursor = event.target.result;
     if (!cursor) {
      return callback(null, {
       type: "remote",
       db: db,
       entries: entries
      });
     }
     entries[cursor.primaryKey] = {
      "timestamp": cursor.key
     };
     cursor.continue();
    });
   } catch (e) {
    return callback(e);
   }
  });
 },
 loadLocalEntry: (path, callback) => {
  var stat, node;
  try {
   var lookup = FS.lookupPath(path);
   node = lookup.node;
   stat = FS.stat(path);
  } catch (e) {
   return callback(e);
  }
  if (FS.isDir(stat.mode)) {
   return callback(null, {
    "timestamp": stat.mtime,
    "mode": stat.mode
   });
  } else if (FS.isFile(stat.mode)) {
   node.contents = MEMFS.getFileDataAsTypedArray(node);
   return callback(null, {
    "timestamp": stat.mtime,
    "mode": stat.mode,
    "contents": node.contents
   });
  } else {
   return callback(new Error("node type not supported"));
  }
 },
 storeLocalEntry: (path, entry, callback) => {
  try {
   if (FS.isDir(entry["mode"])) {
    FS.mkdirTree(path, entry["mode"]);
   } else if (FS.isFile(entry["mode"])) {
    FS.writeFile(path, entry["contents"], {
     canOwn: true
    });
   } else {
    return callback(new Error("node type not supported"));
   }
   FS.chmod(path, entry["mode"]);
   FS.utime(path, entry["timestamp"], entry["timestamp"]);
  } catch (e) {
   return callback(e);
  }
  callback(null);
 },
 removeLocalEntry: (path, callback) => {
  try {
   var lookup = FS.lookupPath(path);
   var stat = FS.stat(path);
   if (FS.isDir(stat.mode)) {
    FS.rmdir(path);
   } else if (FS.isFile(stat.mode)) {
    FS.unlink(path);
   }
  } catch (e) {
   return callback(e);
  }
  callback(null);
 },
 loadRemoteEntry: (store, path, callback) => {
  var req = store.get(path);
  req.onsuccess = (event => {
   callback(null, event.target.result);
  });
  req.onerror = (e => {
   callback(this.error);
   e.preventDefault();
  });
 },
 storeRemoteEntry: (store, path, entry, callback) => {
  try {
   var req = store.put(entry, path);
  } catch (e) {
   callback(e);
   return;
  }
  req.onsuccess = (() => {
   callback(null);
  });
  req.onerror = (e => {
   callback(this.error);
   e.preventDefault();
  });
 },
 removeRemoteEntry: (store, path, callback) => {
  var req = store.delete(path);
  req.onsuccess = (() => {
   callback(null);
  });
  req.onerror = (e => {
   callback(this.error);
   e.preventDefault();
  });
 },
 reconcile: (src, dst, callback) => {
  var total = 0;
  var create = [];
  Object.keys(src.entries).forEach(function(key) {
   var e = src.entries[key];
   var e2 = dst.entries[key];
   if (!e2 || e["timestamp"].getTime() != e2["timestamp"].getTime()) {
    create.push(key);
    total++;
   }
  });
  var remove = [];
  Object.keys(dst.entries).forEach(function(key) {
   if (!src.entries[key]) {
    remove.push(key);
    total++;
   }
  });
  if (!total) {
   return callback(null);
  }
  var errored = false;
  var db = src.type === "remote" ? src.db : dst.db;
  var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readwrite");
  var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  function done(err) {
   if (err && !errored) {
    errored = true;
    return callback(err);
   }
  }
  transaction.onerror = (e => {
   done(this.error);
   e.preventDefault();
  });
  transaction.oncomplete = (e => {
   if (!errored) {
    callback(null);
   }
  });
  create.sort().forEach(path => {
   if (dst.type === "local") {
    IDBFS.loadRemoteEntry(store, path, (err, entry) => {
     if (err) return done(err);
     IDBFS.storeLocalEntry(path, entry, done);
    });
   } else {
    IDBFS.loadLocalEntry(path, (err, entry) => {
     if (err) return done(err);
     IDBFS.storeRemoteEntry(store, path, entry, done);
    });
   }
  });
  remove.sort().reverse().forEach(path => {
   if (dst.type === "local") {
    IDBFS.removeLocalEntry(path, done);
   } else {
    IDBFS.removeRemoteEntry(store, path, done);
   }
  });
 }
};

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 lookupPath: (path, opts = {}) => {
  path = PATH_FS.resolve(FS.cwd(), path);
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(32);
  }
  var parts = PATH.normalizeArray(path.split("/").filter(p => !!p), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(32);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath: node => {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 },
 hashName: (parentid, name) => {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 },
 hashAddNode: node => {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode: node => {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode: (parent, name) => {
  var errCode = FS.mayLookup(parent);
  if (errCode) {
   throw new FS.ErrnoError(errCode, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode: (parent, name, mode, rdev) => {
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode: node => {
  FS.hashRemoveNode(node);
 },
 isRoot: node => {
  return node === node.parent;
 },
 isMountpoint: node => {
  return !!node.mounted;
 },
 isFile: mode => {
  return (mode & 61440) === 32768;
 },
 isDir: mode => {
  return (mode & 61440) === 16384;
 },
 isLink: mode => {
  return (mode & 61440) === 40960;
 },
 isChrdev: mode => {
  return (mode & 61440) === 8192;
 },
 isBlkdev: mode => {
  return (mode & 61440) === 24576;
 },
 isFIFO: mode => {
  return (mode & 61440) === 4096;
 },
 isSocket: mode => {
  return (mode & 49152) === 49152;
 },
 flagModes: {
  "r": 0,
  "r+": 2,
  "w": 577,
  "w+": 578,
  "a": 1089,
  "a+": 1090
 },
 modeStringToFlags: str => {
  var flags = FS.flagModes[str];
  if (typeof flags == "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 },
 flagsToPermissionString: flag => {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions: (node, perms) => {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.includes("r") && !(node.mode & 292)) {
   return 2;
  } else if (perms.includes("w") && !(node.mode & 146)) {
   return 2;
  } else if (perms.includes("x") && !(node.mode & 73)) {
   return 2;
  }
  return 0;
 },
 mayLookup: dir => {
  var errCode = FS.nodePermissions(dir, "x");
  if (errCode) return errCode;
  if (!dir.node_ops.lookup) return 2;
  return 0;
 },
 mayCreate: (dir, name) => {
  try {
   var node = FS.lookupNode(dir, name);
   return 20;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete: (dir, name, isdir) => {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var errCode = FS.nodePermissions(dir, "wx");
  if (errCode) {
   return errCode;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 54;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 10;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 31;
   }
  }
  return 0;
 },
 mayOpen: (node, flags) => {
  if (!node) {
   return 44;
  }
  if (FS.isLink(node.mode)) {
   return 32;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return 31;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(33);
 },
 getStream: fd => FS.streams[fd],
 createStream: (stream, fd_start, fd_end) => {
  if (!FS.FSStream) {
   FS.FSStream = function() {};
   FS.FSStream.prototype = {
    object: {
     get: function() {
      return this.node;
     },
     set: function(val) {
      this.node = val;
     }
    },
    isRead: {
     get: function() {
      return (this.flags & 2097155) !== 1;
     }
    },
    isWrite: {
     get: function() {
      return (this.flags & 2097155) !== 0;
     }
    },
    isAppend: {
     get: function() {
      return this.flags & 1024;
     }
    }
   };
  }
  stream = Object.assign(new FS.FSStream(), stream);
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream: fd => {
  FS.streams[fd] = null;
 },
 chrdev_stream_ops: {
  open: stream => {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  },
  llseek: () => {
   throw new FS.ErrnoError(70);
  }
 },
 major: dev => dev >> 8,
 minor: dev => dev & 255,
 makedev: (ma, mi) => ma << 8 | mi,
 registerDevice: (dev, ops) => {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: dev => FS.devices[dev],
 getMounts: mount => {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 },
 syncfs: (populate, callback) => {
  if (typeof populate == "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(errCode) {
   FS.syncFSRequests--;
   return callback(errCode);
  }
  function done(errCode) {
   if (errCode) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(errCode);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(mount => {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount: (type, opts, mountpoint) => {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(10);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount: mountpoint => {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(28);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(hash => {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.includes(current.mount)) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  node.mount.mounts.splice(idx, 1);
 },
 lookup: (parent, name) => {
  return parent.node_ops.lookup(parent, name);
 },
 mknod: (path, mode, dev) => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.mayCreate(parent, name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create: (path, mode) => {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir: (path, mode) => {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree: (path, mode) => {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 20) throw e;
   }
  }
 },
 mkdev: (path, mode, dev) => {
  if (typeof dev == "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink: (oldpath, newpath) => {
  if (!PATH_FS.resolve(oldpath)) {
   throw new FS.ErrnoError(44);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var newname = PATH.basename(newpath);
  var errCode = FS.mayCreate(parent, newname);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename: (old_path, new_path) => {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  lookup = FS.lookupPath(old_path, {
   parent: true
  });
  old_dir = lookup.node;
  lookup = FS.lookupPath(new_path, {
   parent: true
  });
  new_dir = lookup.node;
  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(75);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH_FS.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(28);
  }
  relative = PATH_FS.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(55);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var errCode = FS.mayDelete(old_dir, old_name, isdir);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(10);
  }
  if (new_dir !== old_dir) {
   errCode = FS.nodePermissions(old_dir, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
 },
 rmdir: path => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, true);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
 },
 readdir: path => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(54);
  }
  return node.node_ops.readdir(node);
 },
 unlink: path => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, false);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
 },
 readlink: path => {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(44);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(28);
  }
  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat: (path, dontFollow) => {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(63);
  }
  return node.node_ops.getattr(node);
 },
 lstat: path => {
  return FS.stat(path, true);
 },
 chmod: (path, mode, dontFollow) => {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 },
 lchmod: (path, mode) => {
  FS.chmod(path, mode, true);
 },
 fchmod: (fd, mode) => {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  FS.chmod(stream.node, mode);
 },
 chown: (path, uid, gid, dontFollow) => {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown: (path, uid, gid) => {
  FS.chown(path, uid, gid, true);
 },
 fchown: (fd, uid, gid) => {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  FS.chown(stream.node, uid, gid);
 },
 truncate: (path, len) => {
  if (len < 0) {
   throw new FS.ErrnoError(28);
  }
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.nodePermissions(node, "w");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate: (fd, len) => {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(28);
  }
  FS.truncate(stream.node, len);
 },
 utime: (path, atime, mtime) => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open: (path, flags, mode, fd_start, fd_end) => {
  if (path === "") {
   throw new FS.ErrnoError(44);
  }
  flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode == "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path == "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(20);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(54);
  }
  if (!created) {
   var errCode = FS.mayOpen(node, flags);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512 | 131072);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
   }
  }
  return stream;
 },
 close: stream => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed: stream => {
  return stream.fd === null;
 },
 llseek: (stream, offset, whence) => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(70);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(28);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read: (stream, buffer, offset, length, position) => {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(28);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write: (stream, buffer, offset, length, position, canOwn) => {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(28);
  }
  if (stream.seekable && stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  return bytesWritten;
 },
 allocate: (stream, offset, length) => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(28);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(138);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap: (stream, address, length, position, prot, flags) => {
  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
   throw new FS.ErrnoError(2);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(2);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(43);
  }
  return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
 },
 msync: (stream, buffer, offset, length, mmapFlags) => {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 munmap: stream => 0,
 ioctl: (stream, cmd, arg) => {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(59);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile: (path, opts = {}) => {
  opts.flags = opts.flags || 0;
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile: (path, data, opts = {}) => {
  opts.flags = opts.flags || 577;
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data == "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: () => FS.currentPath,
 chdir: path => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(44);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(54);
  }
  var errCode = FS.nodePermissions(lookup.node, "x");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories: () => {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices: () => {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: () => 0,
   write: (stream, buffer, offset, length, pos) => length
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device = getRandomDevice();
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories: () => {
  FS.mkdir("/proc");
  var proc_self = FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: () => {
    var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: (parent, name) => {
      var fd = +name;
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(8);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: () => stream.path
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams: () => {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", 0);
  var stdout = FS.open("/dev/stdout", 1);
  var stderr = FS.open("/dev/stderr", 1);
 },
 ensureErrnoError: () => {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = function(errno) {
    this.errno = errno;
   };
   this.setErrno(errno);
   this.message = "FS error";
  };
  FS.ErrnoError.prototype = new Error();
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ 44 ].forEach(code => {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
 },
 staticInit: () => {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS,
   "IDBFS": IDBFS
  };
 },
 init: (input, output, error) => {
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit: () => {
  FS.init.initialized = false;
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 getMode: (canRead, canWrite) => {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 },
 findObject: (path, dontResolveLastLink) => {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   return null;
  }
 },
 analyzePath: (path, dontResolveLastLink) => {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createPath: (parent, path, canRead, canWrite) => {
  parent = typeof parent == "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile: (parent, name, properties, canRead, canWrite) => {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
  var path = name;
  if (parent) {
   parent = typeof parent == "string" ? parent : FS.getPath(parent);
   path = name ? PATH.join2(parent, name) : parent;
  }
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data == "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, 577);
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 },
 createDevice: (parent, name, input, output) => {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: stream => {
    stream.seekable = false;
   },
   close: stream => {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   },
   read: (stream, buffer, offset, length, pos) => {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write: (stream, buffer, offset, length, pos) => {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 forceLoadFile: obj => {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  if (typeof XMLHttpRequest != "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (read_) {
   try {
    obj.contents = intArrayFromString(read_(obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
 },
 createLazyFile: (parent, name, url, canRead, canWrite) => {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest();
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (from, to) => {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   };
   var lazyArray = this;
   lazyArray.setDataGetter(chunkNum => {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] == "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   });
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    out("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest != "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array();
   Object.defineProperties(lazyArray, {
    length: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     }
    },
    chunkSize: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     }
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(key => {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    FS.forceLoadFile(node);
    return fn.apply(null, arguments);
   };
  });
  stream_ops.read = ((stream, buffer, offset, length, position) => {
   FS.forceLoadFile(node);
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  });
  node.stream_ops = stream_ops;
  return node;
 },
 createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
  var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
    if (onerror) onerror();
    removeRunDependency(dep);
   })) {
    return;
   }
   finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   asyncLoad(url, byteArray => processData(byteArray), onerror);
  } else {
   processData(url);
  }
 },
 indexedDB: () => {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 },
 DB_NAME: () => {
  return "EM_FS_" + window.location.pathname;
 },
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: (paths, onload, onerror) => {
  onload = onload || (() => {});
  onerror = onerror || (() => {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = (() => {
   out("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  });
  openRequest.onsuccess = (() => {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(path => {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = (() => {
     ok++;
     if (ok + fail == total) finish();
    });
    putRequest.onerror = (() => {
     fail++;
     if (ok + fail == total) finish();
    });
   });
   transaction.onerror = onerror;
  });
  openRequest.onerror = onerror;
 },
 loadFilesFromDB: (paths, onload, onerror) => {
  onload = onload || (() => {});
  onerror = onerror || (() => {});
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = (() => {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(path => {
    var getRequest = files.get(path);
    getRequest.onsuccess = (() => {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    });
    getRequest.onerror = (() => {
     fail++;
     if (ok + fail == total) finish();
    });
   });
   transaction.onerror = onerror;
  });
  openRequest.onerror = onerror;
 }
};

function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  return 1;
 }
 if (!Browser.mainLoop.running) {
  Browser.mainLoop.running = true;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (typeof setImmediate == "undefined") {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   var Browser_setImmediate_messageHandler = function(event) {
    if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   };
   addEventListener("message", Browser_setImmediate_messageHandler, true);
   setImmediate = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   setImmediate(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}

var _emscripten_get_now;

if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = (() => {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 });
} else _emscripten_get_now = (() => performance.now());

function _exit(status) {
 exit(status);
}

function maybeExit() {
 if (!keepRuntimeAlive()) {
  try {
   _exit(EXITSTATUS);
  } catch (e) {
   handleException(e);
  }
 }
}

function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = browserIterationFunc;
 Browser.mainLoop.arg = arg;
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 function checkIsRunning() {
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
   maybeExit();
   return false;
  }
  return true;
 }
 Browser.mainLoop.running = false;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   out('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (!checkIsRunning()) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (!checkIsRunning()) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  GL.newRenderingFrameStarted();
  Browser.mainLoop.runIter(browserIterationFunc);
  if (!checkIsRunning()) return;
  if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "unwind";
 }
}

function callUserCallback(func, synchronous) {
 if (runtimeExited || ABORT) {
  return;
 }
 if (synchronous) {
  func();
  return;
 }
 try {
  func();
 } catch (e) {
  handleException(e);
 }
}

function safeSetTimeout(func, timeout) {
 return setTimeout(function() {
  callUserCallback(func);
 }, timeout);
}

var Browser = {
 mainLoop: {
  running: false,
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  },
  resume: function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  },
  updateStatus: function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  },
  runIter: function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   callUserCallback(func);
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  }
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob();
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   out("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? out("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject == "undefined") {
   out("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ new Uint8Array(byteArray).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder();
    bb.append(new Uint8Array(byteArray).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   var img = new Image();
   img.onload = (() => {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   });
   img.onerror = (event => {
    out("Image " + url + " could not be decoded");
    if (onerror) onerror();
   });
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio();
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    var audio = new Audio();
    audio.addEventListener("canplaythrough", function() {
     finish(audio);
    }, false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     out("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    safeSetTimeout(function() {
     finish(audio);
    }, 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function() {};
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function() {};
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }, false);
   }
  }
 },
 handledByPreloadPlugin: function(byteArray, fullname, finish, onerror) {
  Browser.init();
  var handled = false;
  Module["preloadPlugins"].forEach(function(plugin) {
   if (handled) return;
   if (plugin["canHandle"](fullname)) {
    plugin["handle"](byteArray, fullname, finish, onerror);
    handled = true;
   }
  });
  return handled;
 },
 createContext: function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false,
    majorVersion: 2
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   if (typeof GL != "undefined") {
    contextHandle = GL.createContext(canvas, contextAttributes);
    if (contextHandle) {
     ctx = GL.getContext(contextHandle).GLctx;
    }
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx == "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
    callback();
   });
   Browser.init();
  }
  return ctx;
 },
 destroyContext: function(canvas, useWebGL, setInModule) {},
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: function(lockPointer, resizeCanvas) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = Browser.exitFullscreen;
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) {
     Browser.setFullscreenCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) {
     Browser.setWindowedCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null) || (canvasContainer["webkitRequestFullScreen"] ? function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null);
  canvasContainer.requestFullscreen();
 },
 exitFullscreen: function() {
  if (!Browser.isFullscreen) {
   return false;
  }
  var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function() {};
  CFS.apply(document, []);
  return true;
 },
 nextRAF: 0,
 fakeRequestAnimationFrame: function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 },
 requestAnimationFrame: function(func) {
  if (typeof requestAnimationFrame == "function") {
   requestAnimationFrame(func);
   return;
  }
  var RAF = Browser.fakeRequestAnimationFrame;
  RAF(func);
 },
 safeSetTimeout: function(func) {
  return safeSetTimeout(func);
 },
 safeRequestAnimationFrame: function(func) {
  return Browser.requestAnimationFrame(function() {
   callUserCallback(func);
  });
 },
 getMimetype: function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 },
 getUserMedia: function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 },
 getMovementX: function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 },
 getMovementY: function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 },
 getMouseWheelDelta: function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail / 3;
   break;

  case "mousewheel":
   delta = event.wheelDelta / 120;
   break;

  case "wheel":
   delta = event.deltaY;
   switch (event.deltaMode) {
   case 0:
    delta /= 100;
    break;

   case 1:
    delta /= 3;
    break;

   case 2:
    delta *= 80;
    break;

   default:
    throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
   }
   break;

  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 },
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 },
 resizeListeners: [],
 updateResizeListeners: function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach(function(listener) {
   listener(canvas.width, canvas.height);
  });
 },
 setCanvasSize: function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 },
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 setWindowedCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 updateCanvasDimensions: function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 }
};

function _SDL_GetTicks() {
 return Date.now() - SDL.startTime | 0;
}

function _SDL_LockSurface(surf) {
 var surfData = SDL.surfaces[surf];
 surfData.locked++;
 if (surfData.locked > 1) return 0;
 if (!surfData.buffer) {
  surfData.buffer = _malloc(surfData.width * surfData.height * 4);
  HEAP32[surf + 20 >> 2] = surfData.buffer;
 }
 HEAP32[surf + 20 >> 2] = surfData.buffer;
 if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
 if (SDL.defaults.discardOnLock) {
  if (!surfData.image) {
   surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height);
  }
  if (!SDL.defaults.opaqueFrontBuffer) return;
 } else {
  surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
 }
 if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
  var data = surfData.image.data;
  var num = data.length;
  for (var i = 0; i < num / 4; i++) {
   data[i * 4 + 3] = 255;
  }
 }
 if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
  if (surfData.isFlagSet(2097152)) {
   throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + new Error().stack;
  } else {
   HEAPU8.set(surfData.image.data, surfData.buffer);
  }
 }
 return 0;
}

function SDL_unicode() {
 return SDL.unicode;
}

function SDL_ttfContext() {
 return SDL.ttfContext;
}

function SDL_audio() {
 return SDL.audio;
}

var SDL = {
 defaults: {
  width: 320,
  height: 200,
  copyOnLock: true,
  discardOnLock: false,
  opaqueFrontBuffer: true
 },
 version: null,
 surfaces: {},
 canvasPool: [],
 events: [],
 fonts: [ null ],
 audios: [ null ],
 rwops: [ null ],
 music: {
  audio: null,
  volume: 1
 },
 mixerFrequency: 22050,
 mixerFormat: 32784,
 mixerNumChannels: 2,
 mixerChunkSize: 1024,
 channelMinimumNumber: 0,
 GL: false,
 glAttributes: {
  0: 3,
  1: 3,
  2: 2,
  3: 0,
  4: 0,
  5: 1,
  6: 16,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 1,
  16: 0,
  17: 0,
  18: 0
 },
 keyboardState: null,
 keyboardMap: {},
 canRequestFullscreen: false,
 isRequestingFullscreen: false,
 textInput: false,
 startTime: null,
 initFlags: 0,
 buttonState: 0,
 modState: 0,
 DOMButtons: [ 0, 0, 0 ],
 DOMEventToSDLEvent: {},
 TOUCH_DEFAULT_ID: 0,
 eventHandler: null,
 eventHandlerContext: null,
 eventHandlerTemp: 0,
 keyCodes: {
  16: 1249,
  17: 1248,
  18: 1250,
  20: 1081,
  33: 1099,
  34: 1102,
  35: 1101,
  36: 1098,
  37: 1104,
  38: 1106,
  39: 1103,
  40: 1105,
  44: 316,
  45: 1097,
  46: 127,
  91: 1251,
  93: 1125,
  96: 1122,
  97: 1113,
  98: 1114,
  99: 1115,
  100: 1116,
  101: 1117,
  102: 1118,
  103: 1119,
  104: 1120,
  105: 1121,
  106: 1109,
  107: 1111,
  109: 1110,
  110: 1123,
  111: 1108,
  112: 1082,
  113: 1083,
  114: 1084,
  115: 1085,
  116: 1086,
  117: 1087,
  118: 1088,
  119: 1089,
  120: 1090,
  121: 1091,
  122: 1092,
  123: 1093,
  124: 1128,
  125: 1129,
  126: 1130,
  127: 1131,
  128: 1132,
  129: 1133,
  130: 1134,
  131: 1135,
  132: 1136,
  133: 1137,
  134: 1138,
  135: 1139,
  144: 1107,
  160: 94,
  161: 33,
  162: 34,
  163: 35,
  164: 36,
  165: 37,
  166: 38,
  167: 95,
  168: 40,
  169: 41,
  170: 42,
  171: 43,
  172: 124,
  173: 45,
  174: 123,
  175: 125,
  176: 126,
  181: 127,
  182: 129,
  183: 128,
  188: 44,
  190: 46,
  191: 47,
  192: 96,
  219: 91,
  220: 92,
  221: 93,
  222: 39,
  224: 1251
 },
 scanCodes: {
  8: 42,
  9: 43,
  13: 40,
  27: 41,
  32: 44,
  35: 204,
  39: 53,
  44: 54,
  46: 55,
  47: 56,
  48: 39,
  49: 30,
  50: 31,
  51: 32,
  52: 33,
  53: 34,
  54: 35,
  55: 36,
  56: 37,
  57: 38,
  58: 203,
  59: 51,
  61: 46,
  91: 47,
  92: 49,
  93: 48,
  96: 52,
  97: 4,
  98: 5,
  99: 6,
  100: 7,
  101: 8,
  102: 9,
  103: 10,
  104: 11,
  105: 12,
  106: 13,
  107: 14,
  108: 15,
  109: 16,
  110: 17,
  111: 18,
  112: 19,
  113: 20,
  114: 21,
  115: 22,
  116: 23,
  117: 24,
  118: 25,
  119: 26,
  120: 27,
  121: 28,
  122: 29,
  127: 76,
  305: 224,
  308: 226,
  316: 70
 },
 loadRect: function(rect) {
  return {
   x: HEAP32[rect + 0 >> 2],
   y: HEAP32[rect + 4 >> 2],
   w: HEAP32[rect + 8 >> 2],
   h: HEAP32[rect + 12 >> 2]
  };
 },
 updateRect: function(rect, r) {
  HEAP32[rect >> 2] = r.x;
  HEAP32[rect + 4 >> 2] = r.y;
  HEAP32[rect + 8 >> 2] = r.w;
  HEAP32[rect + 12 >> 2] = r.h;
 },
 intersectionOfRects: function(first, second) {
  var leftX = Math.max(first.x, second.x);
  var leftY = Math.max(first.y, second.y);
  var rightX = Math.min(first.x + first.w, second.x + second.w);
  var rightY = Math.min(first.y + first.h, second.y + second.h);
  return {
   x: leftX,
   y: leftY,
   w: Math.max(leftX, rightX) - leftX,
   h: Math.max(leftY, rightY) - leftY
  };
 },
 checkPixelFormat: function(fmt) {},
 loadColorToCSSRGB: function(color) {
  var rgba = HEAP32[color >> 2];
  return "rgb(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + ")";
 },
 loadColorToCSSRGBA: function(color) {
  var rgba = HEAP32[color >> 2];
  return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >> 24 & 255) / 255 + ")";
 },
 translateColorToCSSRGBA: function(rgba) {
  return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")";
 },
 translateRGBAToCSSRGBA: function(r, g, b, a) {
  return "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")";
 },
 translateRGBAToColor: function(r, g, b, a) {
  return r | g << 8 | b << 16 | a << 24;
 },
 makeSurface: function(width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
  flags = flags || 0;
  var is_SDL_HWSURFACE = flags & 1;
  var is_SDL_HWPALETTE = flags & 2097152;
  var is_SDL_OPENGL = flags & 67108864;
  var surf = _malloc(60);
  var pixelFormat = _malloc(44);
  var bpp = is_SDL_HWPALETTE ? 1 : 4;
  var buffer = 0;
  if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
   buffer = _malloc(width * height * 4);
  }
  HEAP32[surf >> 2] = flags;
  HEAP32[surf + 4 >> 2] = pixelFormat;
  HEAP32[surf + 8 >> 2] = width;
  HEAP32[surf + 12 >> 2] = height;
  HEAP32[surf + 16 >> 2] = width * bpp;
  HEAP32[surf + 20 >> 2] = buffer;
  HEAP32[surf + 36 >> 2] = 0;
  HEAP32[surf + 40 >> 2] = 0;
  HEAP32[surf + 44 >> 2] = Module["canvas"].width;
  HEAP32[surf + 48 >> 2] = Module["canvas"].height;
  HEAP32[surf + 56 >> 2] = 1;
  HEAP32[pixelFormat >> 2] = -2042224636;
  HEAP32[pixelFormat + 4 >> 2] = 0;
  HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
  HEAP8[pixelFormat + 9 >> 0] = bpp;
  HEAP32[pixelFormat + 12 >> 2] = rmask || 255;
  HEAP32[pixelFormat + 16 >> 2] = gmask || 65280;
  HEAP32[pixelFormat + 20 >> 2] = bmask || 16711680;
  HEAP32[pixelFormat + 24 >> 2] = amask || 4278190080;
  SDL.GL = SDL.GL || is_SDL_OPENGL;
  var canvas;
  if (!usePageCanvas) {
   if (SDL.canvasPool.length > 0) {
    canvas = SDL.canvasPool.pop();
   } else {
    canvas = document.createElement("canvas");
   }
   canvas.width = width;
   canvas.height = height;
  } else {
   canvas = Module["canvas"];
  }
  var webGLContextAttributes = {
   antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
   depth: SDL.glAttributes[6] > 0,
   stencil: SDL.glAttributes[7] > 0,
   alpha: SDL.glAttributes[3] > 0
  };
  var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
  SDL.surfaces[surf] = {
   width: width,
   height: height,
   canvas: canvas,
   ctx: ctx,
   surf: surf,
   buffer: buffer,
   pixelFormat: pixelFormat,
   alpha: 255,
   flags: flags,
   locked: 0,
   usePageCanvas: usePageCanvas,
   source: source,
   isFlagSet: function(flag) {
    return flags & flag;
   }
  };
  return surf;
 },
 copyIndexedColorData: function(surfData, rX, rY, rW, rH) {
  if (!surfData.colors) {
   return;
  }
  var fullWidth = Module["canvas"].width;
  var fullHeight = Module["canvas"].height;
  var startX = rX || 0;
  var startY = rY || 0;
  var endX = (rW || fullWidth - startX) + startX;
  var endY = (rH || fullHeight - startY) + startY;
  var buffer = surfData.buffer;
  if (!surfData.image.data32) {
   surfData.image.data32 = new Uint32Array(surfData.image.data.buffer);
  }
  var data32 = surfData.image.data32;
  var colors32 = surfData.colors32;
  for (var y = startY; y < endY; ++y) {
   var base = y * fullWidth;
   for (var x = startX; x < endX; ++x) {
    data32[base + x] = colors32[HEAPU8[buffer + base + x >> 0]];
   }
  }
 },
 freeSurface: function(surf) {
  var refcountPointer = surf + 56;
  var refcount = HEAP32[refcountPointer >> 2];
  if (refcount > 1) {
   HEAP32[refcountPointer >> 2] = refcount - 1;
   return;
  }
  var info = SDL.surfaces[surf];
  if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
  if (info.buffer) _free(info.buffer);
  _free(info.pixelFormat);
  _free(surf);
  SDL.surfaces[surf] = null;
  if (surf === SDL.screen) {
   SDL.screen = null;
  }
 },
 blitSurface: function(src, srcrect, dst, dstrect, scale) {
  var srcData = SDL.surfaces[src];
  var dstData = SDL.surfaces[dst];
  var sr, dr;
  if (srcrect) {
   sr = SDL.loadRect(srcrect);
  } else {
   sr = {
    x: 0,
    y: 0,
    w: srcData.width,
    h: srcData.height
   };
  }
  if (dstrect) {
   dr = SDL.loadRect(dstrect);
  } else {
   dr = {
    x: 0,
    y: 0,
    w: srcData.width,
    h: srcData.height
   };
  }
  if (dstData.clipRect) {
   var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
   var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
   dr = SDL.intersectionOfRects(dstData.clipRect, dr);
   sr.w = dr.w * widthScale;
   sr.h = dr.h * heightScale;
   if (dstrect) {
    SDL.updateRect(dstrect, dr);
   }
  }
  var blitw, blith;
  if (scale) {
   blitw = dr.w;
   blith = dr.h;
  } else {
   blitw = sr.w;
   blith = sr.h;
  }
  if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
   return 0;
  }
  var oldAlpha = dstData.ctx.globalAlpha;
  dstData.ctx.globalAlpha = srcData.alpha / 255;
  dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
  dstData.ctx.globalAlpha = oldAlpha;
  if (dst != SDL.screen) {
   warnOnce("WARNING: copying canvas data to memory for compatibility");
   _SDL_LockSurface(dst);
   dstData.locked--;
  }
  return 0;
 },
 downFingers: {},
 savedKeydown: null,
 receiveEvent: function(event) {
  function unpressAllPressedKeys() {
   for (var code in SDL.keyboardMap) {
    SDL.events.push({
     type: "keyup",
     keyCode: SDL.keyboardMap[code]
    });
   }
  }
  switch (event.type) {
  case "touchstart":
  case "touchmove":
   {
    event.preventDefault();
    var touches = [];
    if (event.type === "touchstart") {
     for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      if (SDL.downFingers[touch.identifier] != true) {
       SDL.downFingers[touch.identifier] = true;
       touches.push(touch);
      }
     }
    } else {
     touches = event.touches;
    }
    var firstTouch = touches[0];
    if (firstTouch) {
     if (event.type == "touchstart") {
      SDL.DOMButtons[0] = 1;
     }
     var mouseEventType;
     switch (event.type) {
     case "touchstart":
      mouseEventType = "mousedown";
      break;

     case "touchmove":
      mouseEventType = "mousemove";
      break;
     }
     var mouseEvent = {
      type: mouseEventType,
      button: 0,
      pageX: firstTouch.clientX,
      pageY: firstTouch.clientY
     };
     SDL.events.push(mouseEvent);
    }
    for (var i = 0; i < touches.length; i++) {
     var touch = touches[i];
     SDL.events.push({
      type: event.type,
      touch: touch
     });
    }
    break;
   }

  case "touchend":
   {
    event.preventDefault();
    for (var i = 0; i < event.changedTouches.length; i++) {
     var touch = event.changedTouches[i];
     if (SDL.downFingers[touch.identifier] === true) {
      delete SDL.downFingers[touch.identifier];
     }
    }
    var mouseEvent = {
     type: "mouseup",
     button: 0,
     pageX: event.changedTouches[0].clientX,
     pageY: event.changedTouches[0].clientY
    };
    SDL.DOMButtons[0] = 0;
    SDL.events.push(mouseEvent);
    for (var i = 0; i < event.changedTouches.length; i++) {
     var touch = event.changedTouches[i];
     SDL.events.push({
      type: "touchend",
      touch: touch
     });
    }
    break;
   }

  case "DOMMouseScroll":
  case "mousewheel":
  case "wheel":
   var delta = -Browser.getMouseWheelDelta(event);
   delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
   var button = delta > 0 ? 3 : 4;
   SDL.events.push({
    type: "mousedown",
    button: button,
    pageX: event.pageX,
    pageY: event.pageY
   });
   SDL.events.push({
    type: "mouseup",
    button: button,
    pageX: event.pageX,
    pageY: event.pageY
   });
   SDL.events.push({
    type: "wheel",
    deltaX: 0,
    deltaY: delta
   });
   event.preventDefault();
   break;

  case "mousemove":
   if (SDL.DOMButtons[0] === 1) {
    SDL.events.push({
     type: "touchmove",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
   }
   if (Browser.pointerLock) {
    if ("mozMovementX" in event) {
     event["movementX"] = event["mozMovementX"];
     event["movementY"] = event["mozMovementY"];
    }
    if (event["movementX"] == 0 && event["movementY"] == 0) {
     event.preventDefault();
     return;
    }
   }

  case "keydown":
  case "keyup":
  case "keypress":
  case "mousedown":
  case "mouseup":
   if (event.type !== "keydown" || !SDL_unicode() && !SDL.textInput || (event.keyCode === 8 || event.keyCode === 9)) {
    event.preventDefault();
   }
   if (event.type == "mousedown") {
    SDL.DOMButtons[event.button] = 1;
    SDL.events.push({
     type: "touchstart",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
   } else if (event.type == "mouseup") {
    if (!SDL.DOMButtons[event.button]) {
     return;
    }
    SDL.events.push({
     type: "touchend",
     touch: {
      identifier: 0,
      deviceID: -1,
      pageX: event.pageX,
      pageY: event.pageY
     }
    });
    SDL.DOMButtons[event.button] = 0;
   }
   if (event.type === "keydown" || event.type === "mousedown") {
    SDL.canRequestFullscreen = true;
   } else if (event.type === "keyup" || event.type === "mouseup") {
    if (SDL.isRequestingFullscreen) {
     Module["requestFullscreen"](true, true);
     SDL.isRequestingFullscreen = false;
    }
    SDL.canRequestFullscreen = false;
   }
   if (event.type === "keypress" && SDL.savedKeydown) {
    SDL.savedKeydown.keypressCharCode = event.charCode;
    SDL.savedKeydown = null;
   } else if (event.type === "keydown") {
    SDL.savedKeydown = event;
   }
   if (event.type !== "keypress" || SDL.textInput) {
    SDL.events.push(event);
   }
   break;

  case "mouseout":
   for (var i = 0; i < 3; i++) {
    if (SDL.DOMButtons[i]) {
     SDL.events.push({
      type: "mouseup",
      button: i,
      pageX: event.pageX,
      pageY: event.pageY
     });
     SDL.DOMButtons[i] = 0;
    }
   }
   event.preventDefault();
   break;

  case "focus":
   SDL.events.push(event);
   event.preventDefault();
   break;

  case "blur":
   SDL.events.push(event);
   unpressAllPressedKeys();
   event.preventDefault();
   break;

  case "visibilitychange":
   SDL.events.push({
    type: "visibilitychange",
    visible: !document.hidden
   });
   unpressAllPressedKeys();
   event.preventDefault();
   break;

  case "unload":
   if (Browser.mainLoop.runner) {
    SDL.events.push(event);
    Browser.mainLoop.runner();
   }
   return;

  case "resize":
   SDL.events.push(event);
   if (event.preventDefault) {
    event.preventDefault();
   }
   break;
  }
  if (SDL.events.length >= 1e4) {
   err("SDL event queue full, dropping events");
   SDL.events = SDL.events.slice(0, 1e4);
  }
  SDL.flushEventsToHandler();
  return;
 },
 lookupKeyCodeForEvent: function(event) {
  var code = event.keyCode;
  if (code >= 65 && code <= 90) {
   code += 32;
  } else {
   code = SDL.keyCodes[event.keyCode] || event.keyCode;
   if (event.location === 2 && code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
    code += 4;
   }
  }
  return code;
 },
 handleEvent: function(event) {
  if (event.handled) return;
  event.handled = true;
  switch (event.type) {
  case "touchstart":
  case "touchend":
  case "touchmove":
   {
    Browser.calculateMouseEvent(event);
    break;
   }

  case "keydown":
  case "keyup":
   {
    var down = event.type === "keydown";
    var code = SDL.lookupKeyCodeForEvent(event);
    HEAP8[SDL.keyboardState + code >> 0] = down;
    SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0);
    if (down) {
     SDL.keyboardMap[code] = event.keyCode;
    } else {
     delete SDL.keyboardMap[code];
    }
    break;
   }

  case "mousedown":
  case "mouseup":
   if (event.type == "mousedown") {
    SDL.buttonState |= 1 << event.button;
   } else if (event.type == "mouseup") {
    SDL.buttonState &= ~(1 << event.button);
   }

  case "mousemove":
   {
    Browser.calculateMouseEvent(event);
    break;
   }
  }
 },
 flushEventsToHandler: function() {
  if (!SDL.eventHandler) return;
  while (SDL.pollEvent(SDL.eventHandlerTemp)) {
   getWasmTableEntry(SDL.eventHandler)(SDL.eventHandlerContext, SDL.eventHandlerTemp);
  }
 },
 pollEvent: function(ptr) {
  if (SDL.initFlags & 512 && SDL.joystickEventState) {
   SDL.queryJoysticks();
  }
  if (ptr) {
   while (SDL.events.length > 0) {
    if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1;
   }
   return 0;
  } else {
   return SDL.events.length > 0;
  }
 },
 makeCEvent: function(event, ptr) {
  if (typeof event == "number") {
   _memcpy(ptr, event, 28);
   _free(event);
   return;
  }
  SDL.handleEvent(event);
  switch (event.type) {
  case "keydown":
  case "keyup":
   {
    var down = event.type === "keydown";
    var key = SDL.lookupKeyCodeForEvent(event);
    var scan;
    if (key >= 1024) {
     scan = key - 1024;
    } else {
     scan = SDL.scanCodes[key] || key;
    }
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 8 >> 0] = down ? 1 : 0;
    HEAP8[ptr + 9 >> 0] = 0;
    HEAP32[ptr + 12 >> 2] = scan;
    HEAP32[ptr + 16 >> 2] = key;
    HEAP16[ptr + 20 >> 1] = SDL.modState;
    HEAP32[ptr + 24 >> 2] = event.keypressCharCode || key;
    break;
   }

  case "keypress":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    var cStr = intArrayFromString(String.fromCharCode(event.charCode));
    for (var i = 0; i < cStr.length; ++i) {
     HEAP8[ptr + (8 + i) >> 0] = cStr[i];
    }
    break;
   }

  case "mousedown":
  case "mouseup":
  case "mousemove":
   {
    if (event.type != "mousemove") {
     var down = event.type === "mousedown";
     HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
     HEAP32[ptr + 4 >> 2] = 0;
     HEAP32[ptr + 8 >> 2] = 0;
     HEAP32[ptr + 12 >> 2] = 0;
     HEAP8[ptr + 16 >> 0] = event.button + 1;
     HEAP8[ptr + 17 >> 0] = down ? 1 : 0;
     HEAP32[ptr + 20 >> 2] = Browser.mouseX;
     HEAP32[ptr + 24 >> 2] = Browser.mouseY;
    } else {
     HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
     HEAP32[ptr + 4 >> 2] = 0;
     HEAP32[ptr + 8 >> 2] = 0;
     HEAP32[ptr + 12 >> 2] = 0;
     HEAP32[ptr + 16 >> 2] = SDL.buttonState;
     HEAP32[ptr + 20 >> 2] = Browser.mouseX;
     HEAP32[ptr + 24 >> 2] = Browser.mouseY;
     HEAP32[ptr + 28 >> 2] = Browser.mouseMovementX;
     HEAP32[ptr + 32 >> 2] = Browser.mouseMovementY;
    }
    break;
   }

  case "wheel":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 16 >> 2] = event.deltaX;
    HEAP32[ptr + 20 >> 2] = event.deltaY;
    break;
   }

  case "touchstart":
  case "touchend":
  case "touchmove":
   {
    var touch = event.touch;
    if (!Browser.touches[touch.identifier]) break;
    var w = Module["canvas"].width;
    var h = Module["canvas"].height;
    var x = Browser.touches[touch.identifier].x / w;
    var y = Browser.touches[touch.identifier].y / h;
    var lx = Browser.lastTouches[touch.identifier].x / w;
    var ly = Browser.lastTouches[touch.identifier].y / h;
    var dx = x - lx;
    var dy = y - ly;
    if (touch["deviceID"] === undefined) touch.deviceID = SDL.TOUCH_DEFAULT_ID;
    if (dx === 0 && dy === 0 && event.type === "touchmove") return false;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = _SDL_GetTicks();
    tempI64 = [ touch.deviceID >>> 0, (tempDouble = touch.deviceID, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
    HEAP32[ptr + 8 >> 2] = tempI64[0], HEAP32[ptr + 12 >> 2] = tempI64[1];
    tempI64 = [ touch.identifier >>> 0, (tempDouble = touch.identifier, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
    HEAP32[ptr + 16 >> 2] = tempI64[0], HEAP32[ptr + 20 >> 2] = tempI64[1];
    HEAPF32[ptr + 24 >> 2] = x;
    HEAPF32[ptr + 28 >> 2] = y;
    HEAPF32[ptr + 32 >> 2] = dx;
    HEAPF32[ptr + 36 >> 2] = dy;
    if (touch.force !== undefined) {
     HEAPF32[ptr + 40 >> 2] = touch.force;
    } else {
     HEAPF32[ptr + 40 >> 2] = event.type == "touchend" ? 0 : 1;
    }
    break;
   }

  case "unload":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    break;
   }

  case "resize":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = event.w;
    HEAP32[ptr + 8 >> 2] = event.h;
    break;
   }

  case "joystick_button_up":
  case "joystick_button_down":
   {
    var state = event.type === "joystick_button_up" ? 0 : 1;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 4 >> 0] = event.index;
    HEAP8[ptr + 5 >> 0] = event.button;
    HEAP8[ptr + 6 >> 0] = state;
    break;
   }

  case "joystick_axis_motion":
   {
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP8[ptr + 4 >> 0] = event.index;
    HEAP8[ptr + 5 >> 0] = event.axis;
    HEAP32[ptr + 8 >> 2] = SDL.joystickAxisValueConversion(event.value);
    break;
   }

  case "focus":
   {
    var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
    break;
   }

  case "blur":
   {
    var SDL_WINDOWEVENT_FOCUS_LOST = 13;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
    break;
   }

  case "visibilitychange":
   {
    var SDL_WINDOWEVENT_SHOWN = 1;
    var SDL_WINDOWEVENT_HIDDEN = 2;
    var visibilityEventID = event.visible ? SDL_WINDOWEVENT_SHOWN : SDL_WINDOWEVENT_HIDDEN;
    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
    HEAP32[ptr + 4 >> 2] = 0;
    HEAP8[ptr + 8 >> 0] = visibilityEventID;
    break;
   }

  default:
   throw "Unhandled SDL event: " + event.type;
  }
 },
 makeFontString: function(height, fontName) {
  if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
   fontName = '"' + fontName + '"';
  }
  return height + "px " + fontName + ", serif";
 },
 estimateTextWidth: function(fontData, text) {
  var h = fontData.size;
  var fontString = SDL.makeFontString(h, fontData.name);
  var tempCtx = SDL_ttfContext();
  tempCtx.font = fontString;
  var ret = tempCtx.measureText(text).width | 0;
  return ret;
 },
 allocateChannels: function(num) {
  if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
  SDL.numChannels = num;
  SDL.channels = [];
  for (var i = 0; i < num; i++) {
   SDL.channels[i] = {
    audio: null,
    volume: 1
   };
  }
 },
 setGetVolume: function(info, volume) {
  if (!info) return 0;
  var ret = info.volume * 128;
  if (volume != -1) {
   info.volume = Math.min(Math.max(volume, 0), 128) / 128;
   if (info.audio) {
    try {
     info.audio.volume = info.volume;
     if (info.audio.webAudioGainNode) info.audio.webAudioGainNode["gain"]["value"] = info.volume;
    } catch (e) {
     err("setGetVolume failed to set audio volume: " + e);
    }
   }
  }
  return ret;
 },
 setPannerPosition: function(info, x, y, z) {
  if (!info) return;
  if (info.audio) {
   if (info.audio.webAudioPannerNode) {
    info.audio.webAudioPannerNode["setPosition"](x, y, z);
   }
  }
 },
 playWebAudio: function(audio) {
  if (!audio) return;
  if (audio.webAudioNode) return;
  if (!SDL.webAudioAvailable()) return;
  try {
   var webAudio = audio.resource.webAudio;
   audio.paused = false;
   if (!webAudio.decodedBuffer) {
    if (webAudio.onDecodeComplete === undefined) abort("Cannot play back audio object that was not loaded");
    webAudio.onDecodeComplete.push(function() {
     if (!audio.paused) SDL.playWebAudio(audio);
    });
    return;
   }
   audio.webAudioNode = SDL.audioContext["createBufferSource"]();
   audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
   audio.webAudioNode["loop"] = audio.loop;
   audio.webAudioNode["onended"] = function() {
    audio["onended"]();
   };
   audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
   audio.webAudioPannerNode["setPosition"](0, 0, -.5);
   audio.webAudioPannerNode["panningModel"] = "equalpower";
   audio.webAudioGainNode = SDL.audioContext["createGain"]();
   audio.webAudioGainNode["gain"]["value"] = audio.volume;
   audio.webAudioNode["connect"](audio.webAudioPannerNode);
   audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
   audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
   audio.webAudioNode["start"](0, audio.currentPosition);
   audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition;
  } catch (e) {
   err("playWebAudio failed: " + e);
  }
 },
 pauseWebAudio: function(audio) {
  if (!audio) return;
  if (audio.webAudioNode) {
   try {
    audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
    audio.webAudioNode["onended"] = undefined;
    audio.webAudioNode.stop(0);
    audio.webAudioNode = undefined;
   } catch (e) {
    err("pauseWebAudio failed: " + e);
   }
  }
  audio.paused = true;
 },
 openAudioContext: function() {
  if (!SDL.audioContext) {
   if (typeof AudioContext != "undefined") SDL.audioContext = new AudioContext(); else if (typeof webkitAudioContext != "undefined") SDL.audioContext = new webkitAudioContext();
  }
 },
 webAudioAvailable: function() {
  return !!SDL.audioContext;
 },
 fillWebAudioBufferFromHeap: function(heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
  var audio = SDL_audio();
  var numChannels = audio.channels;
  for (var c = 0; c < numChannels; ++c) {
   var channelData = dstAudioBuffer["getChannelData"](c);
   if (channelData.length != sizeSamplesPerChannel) {
    throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!";
   }
   if (audio.format == 32784) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     channelData[j] = HEAP16[heapPtr + (j * numChannels + c) * 2 >> 1] / 32768;
    }
   } else if (audio.format == 8) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     var v = HEAP8[heapPtr + (j * numChannels + c) >> 0];
     channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128;
    }
   } else if (audio.format == 33056) {
    for (var j = 0; j < sizeSamplesPerChannel; ++j) {
     channelData[j] = HEAPF32[heapPtr + (j * numChannels + c) * 4 >> 2];
    }
   } else {
    throw "Invalid SDL audio format " + audio.format + "!";
   }
  }
 },
 debugSurface: function(surfData) {
  out("dumping surface " + [ surfData.surf, surfData.source, surfData.width, surfData.height ]);
  var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
  var data = image.data;
  var num = Math.min(surfData.width, surfData.height);
  for (var i = 0; i < num; i++) {
   out("   diagonal " + i + ":" + [ data[i * surfData.width * 4 + i * 4 + 0], data[i * surfData.width * 4 + i * 4 + 1], data[i * surfData.width * 4 + i * 4 + 2], data[i * surfData.width * 4 + i * 4 + 3] ]);
  }
 },
 joystickEventState: 1,
 lastJoystickState: {},
 joystickNamePool: {},
 recordJoystickState: function(joystick, state) {
  var buttons = new Array(state.buttons.length);
  for (var i = 0; i < state.buttons.length; i++) {
   buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
  }
  SDL.lastJoystickState[joystick] = {
   buttons: buttons,
   axes: state.axes.slice(0),
   timestamp: state.timestamp,
   index: state.index,
   id: state.id
  };
 },
 getJoystickButtonState: function(button) {
  if (typeof button == "object") {
   return button["pressed"];
  } else {
   return button > 0;
  }
 },
 queryJoysticks: function() {
  for (var joystick in SDL.lastJoystickState) {
   var state = SDL.getGamepad(joystick - 1);
   var prevState = SDL.lastJoystickState[joystick];
   if (typeof state == "undefined") return;
   if (state === null) return;
   if (typeof state.timestamp != "number" || state.timestamp != prevState.timestamp || !state.timestamp) {
    var i;
    for (i = 0; i < state.buttons.length; i++) {
     var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
     if (buttonState !== prevState.buttons[i]) {
      SDL.events.push({
       type: buttonState ? "joystick_button_down" : "joystick_button_up",
       joystick: joystick,
       index: joystick - 1,
       button: i
      });
     }
    }
    for (i = 0; i < state.axes.length; i++) {
     if (state.axes[i] !== prevState.axes[i]) {
      SDL.events.push({
       type: "joystick_axis_motion",
       joystick: joystick,
       index: joystick - 1,
       axis: i,
       value: state.axes[i]
      });
     }
    }
    SDL.recordJoystickState(joystick, state);
   }
  }
 },
 joystickAxisValueConversion: function(value) {
  value = Math.min(1, Math.max(value, -1));
  return Math.ceil((value + 1) * 32767.5 - 32768);
 },
 getGamepads: function() {
  var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
  if (fcn !== undefined) {
   return fcn.apply(navigator);
  } else {
   return [];
  }
 },
 getGamepad: function(deviceIndex) {
  var gamepads = SDL.getGamepads();
  if (gamepads.length > deviceIndex && deviceIndex >= 0) {
   return gamepads[deviceIndex];
  }
  return null;
 }
};

function _SDL_CreateRGBSurfaceFrom(pixels, width, height, depth, pitch, rmask, gmask, bmask, amask) {
 var surf = SDL.makeSurface(width, height, 0, false, "CreateRGBSurfaceFrom", rmask, gmask, bmask, amask);
 if (depth !== 32) {
  out("TODO: Partially unimplemented SDL_CreateRGBSurfaceFrom called!");
  return surf;
 }
 var data = SDL.surfaces[surf];
 var image = data.ctx.createImageData(width, height);
 var pitchOfDst = width * 4;
 for (var row = 0; row < height; ++row) {
  var baseOfDst = row * pitchOfDst;
  for (var col = 0; col < width * 4; ++col) {
   image.data[baseOfDst + col] = HEAPU8[pixels + (baseOfDst + col) >> 0];
  }
 }
 data.ctx.putImageData(image, 0, 0);
 return surf;
}

function _SDL_Delay(delay) {
 if (!ENVIRONMENT_IS_WORKER) abort("SDL_Delay called on the main thread! Potential infinite loop, quitting. (consider building with async support like ASYNCIFY)");
 var now = Date.now();
 while (Date.now() - now < delay) {}
}

function _SDL_EnableKeyRepeat(delay, interval) {}

function _SDL_EnableUNICODE(on) {
 var ret = SDL.unicode || 0;
 SDL.unicode = on;
 return ret;
}

function _SDL_Flip(surf) {}

function _SDL_FreeSurface(surf) {
 if (surf) SDL.freeSurface(surf);
}

function _SDL_GL_SetAttribute(attr, value) {
 if (!(attr in SDL.glAttributes)) {
  abort("Unknown SDL GL attribute (" + attr + "). Please check if your SDL version is supported.");
 }
 SDL.glAttributes[attr] = value;
}

function _SDL_GL_SwapBuffers() {
 if (Browser.doSwapBuffers) Browser.doSwapBuffers();
}

function _SDL_GetError() {
 if (!SDL.errorMessage) {
  SDL.errorMessage = allocateUTF8("unknown SDL-emscripten error");
 }
 return SDL.errorMessage;
}

function _SDL_GetVideoInfo() {
 var ret = _malloc(20);
 zeroMemory(ret, 3);
 HEAP32[ret + 12 >> 2] = Module["canvas"].width;
 HEAP32[ret + 16 >> 2] = Module["canvas"].height;
 return ret;
}

function _SDL_Init(initFlags) {
 SDL.startTime = Date.now();
 SDL.initFlags = initFlags;
 if (!Module["doNotCaptureKeyboard"]) {
  var keyboardListeningElement = Module["keyboardListeningElement"] || document;
  keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
  keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
  keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
  window.addEventListener("focus", SDL.receiveEvent);
  window.addEventListener("blur", SDL.receiveEvent);
  document.addEventListener("visibilitychange", SDL.receiveEvent);
 }
 window.addEventListener("unload", SDL.receiveEvent);
 SDL.keyboardState = _malloc(65536);
 zeroMemory(SDL.keyboardState, 65536);
 SDL.DOMEventToSDLEvent["keydown"] = 768;
 SDL.DOMEventToSDLEvent["keyup"] = 769;
 SDL.DOMEventToSDLEvent["keypress"] = 771;
 SDL.DOMEventToSDLEvent["mousedown"] = 1025;
 SDL.DOMEventToSDLEvent["mouseup"] = 1026;
 SDL.DOMEventToSDLEvent["mousemove"] = 1024;
 SDL.DOMEventToSDLEvent["wheel"] = 1027;
 SDL.DOMEventToSDLEvent["touchstart"] = 1792;
 SDL.DOMEventToSDLEvent["touchend"] = 1793;
 SDL.DOMEventToSDLEvent["touchmove"] = 1794;
 SDL.DOMEventToSDLEvent["unload"] = 256;
 SDL.DOMEventToSDLEvent["resize"] = 28673;
 SDL.DOMEventToSDLEvent["visibilitychange"] = 512;
 SDL.DOMEventToSDLEvent["focus"] = 512;
 SDL.DOMEventToSDLEvent["blur"] = 512;
 SDL.DOMEventToSDLEvent["joystick_axis_motion"] = 1536;
 SDL.DOMEventToSDLEvent["joystick_button_down"] = 1539;
 SDL.DOMEventToSDLEvent["joystick_button_up"] = 1540;
 return 0;
}

function _SDL_JoystickClose(joystick) {
 delete SDL.lastJoystickState[joystick];
}

function _SDL_JoystickGetAxis(joystick, axis) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad && gamepad.axes.length > axis) {
  return SDL.joystickAxisValueConversion(gamepad.axes[axis]);
 }
 return 0;
}

function _SDL_JoystickGetButton(joystick, button) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad && gamepad.buttons.length > button) {
  return SDL.getJoystickButtonState(gamepad.buttons[button]) ? 1 : 0;
 }
 return 0;
}

function _SDL_JoystickGetHat(joystick, hat) {
 return 0;
}

function _SDL_JoystickName(deviceIndex) {
 var gamepad = SDL.getGamepad(deviceIndex);
 if (gamepad) {
  var name = gamepad.id;
  if (SDL.joystickNamePool.hasOwnProperty(name)) {
   return SDL.joystickNamePool[name];
  }
  return SDL.joystickNamePool[name] = allocateUTF8(name);
 }
 return 0;
}

function _SDL_JoystickNumAxes(joystick) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad) {
  return gamepad.axes.length;
 }
 return 0;
}

function _SDL_JoystickNumButtons(joystick) {
 var gamepad = SDL.getGamepad(joystick - 1);
 if (gamepad) {
  return gamepad.buttons.length;
 }
 return 0;
}

function _SDL_JoystickNumHats(joystick) {
 return 0;
}

function _SDL_JoystickOpen(deviceIndex) {
 var gamepad = SDL.getGamepad(deviceIndex);
 if (gamepad) {
  var joystick = deviceIndex + 1;
  SDL.recordJoystickState(joystick, gamepad);
  return joystick;
 }
 return 0;
}

function _SDL_JoystickUpdate() {
 SDL.queryJoysticks();
}

function _SDL_ListModes(format, flags) {
 return -1;
}

function _SDL_NumJoysticks() {
 var count = 0;
 var gamepads = SDL.getGamepads();
 for (var i = 0; i < gamepads.length; i++) {
  if (gamepads[i] !== undefined) count++;
 }
 return count;
}

function _SDL_PollEvent(ptr) {
 return SDL.pollEvent(ptr);
}

function _SDL_AudioQuit() {
 for (var i = 0; i < SDL.numChannels; ++i) {
  var chan = SDL.channels[i];
  if (chan.audio) {
   chan.audio.pause();
   chan.audio = undefined;
  }
 }
 var audio = SDL.music.audio;
 if (audio) audio.pause();
 SDL.music.audio = undefined;
}

function _SDL_Quit() {
 _SDL_AudioQuit();
 out("SDL_Quit called (and ignored)");
}

function _SDL_SetAlpha(surf, flag, alpha) {
 var surfData = SDL.surfaces[surf];
 surfData.alpha = alpha;
 if (!(flag & 65536)) {
  surfData.alpha = 255;
 }
}

function _SDL_SetColorKey(surf, flag, key) {
 warnOnce("SDL_SetColorKey is a no-op for performance reasons");
 return 0;
}

function __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(ctx) {
 return !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));
}

function __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(ctx) {
 return !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));
}

function __webgl_enable_WEBGL_multi_draw(ctx) {
 return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
}

var GL = {
 counter: 1,
 buffers: [],
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 shaders: [],
 vaos: [],
 contexts: [],
 offscreenCanvases: {},
 queries: [],
 samplers: [],
 transformFeedbacks: [],
 syncs: [],
 byteSizeByTypeRoot: 5120,
 byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
 stringCache: {},
 stringiCache: {},
 unpackAlignment: 4,
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: function(table) {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 },
 MAX_TEMP_BUFFER_SIZE: 2097152,
 numTempVertexBuffersPerSize: 64,
 log2ceilLookup: function(i) {
  return 32 - Math.clz32(i === 0 ? 0 : i - 1);
 },
 generateTempBuffers: function(quads, context) {
  var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
  context.tempVertexBufferCounters1 = [];
  context.tempVertexBufferCounters2 = [];
  context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
  context.tempVertexBuffers1 = [];
  context.tempVertexBuffers2 = [];
  context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
  context.tempIndexBuffers = [];
  context.tempIndexBuffers.length = largestIndex + 1;
  for (var i = 0; i <= largestIndex; ++i) {
   context.tempIndexBuffers[i] = null;
   context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
   var ringbufferLength = GL.numTempVertexBuffersPerSize;
   context.tempVertexBuffers1[i] = [];
   context.tempVertexBuffers2[i] = [];
   var ringbuffer1 = context.tempVertexBuffers1[i];
   var ringbuffer2 = context.tempVertexBuffers2[i];
   ringbuffer1.length = ringbuffer2.length = ringbufferLength;
   for (var j = 0; j < ringbufferLength; ++j) {
    ringbuffer1[j] = ringbuffer2[j] = null;
   }
  }
  if (quads) {
   context.tempQuadIndexBuffer = GLctx.createBuffer();
   context.GLctx.bindBuffer(34963, context.tempQuadIndexBuffer);
   var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
   var quadIndexes = new Uint16Array(numIndexes);
   var i = 0, v = 0;
   while (1) {
    quadIndexes[i++] = v;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 1;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 2;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 2;
    if (i >= numIndexes) break;
    quadIndexes[i++] = v + 3;
    if (i >= numIndexes) break;
    v += 4;
   }
   context.GLctx.bufferData(34963, quadIndexes, 35044);
   context.GLctx.bindBuffer(34963, null);
  }
 },
 getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
  var idx = GL.log2ceilLookup(sizeBytes);
  var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
  var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
  GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1;
  var vbo = ringbuffer[nextFreeBufferIndex];
  if (vbo) {
   return vbo;
  }
  var prevVBO = GLctx.getParameter(34964);
  ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
  GLctx.bindBuffer(34962, ringbuffer[nextFreeBufferIndex]);
  GLctx.bufferData(34962, 1 << idx, 35048);
  GLctx.bindBuffer(34962, prevVBO);
  return ringbuffer[nextFreeBufferIndex];
 },
 getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
  var idx = GL.log2ceilLookup(sizeBytes);
  var ibo = GL.currentContext.tempIndexBuffers[idx];
  if (ibo) {
   return ibo;
  }
  var prevIBO = GLctx.getParameter(34965);
  GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
  GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[idx]);
  GLctx.bufferData(34963, 1 << idx, 35048);
  GLctx.bindBuffer(34963, prevIBO);
  return GL.currentContext.tempIndexBuffers[idx];
 },
 newRenderingFrameStarted: function newRenderingFrameStarted() {
  if (!GL.currentContext) {
   return;
  }
  var vb = GL.currentContext.tempVertexBuffers1;
  GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
  GL.currentContext.tempVertexBuffers2 = vb;
  vb = GL.currentContext.tempVertexBufferCounters1;
  GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
  GL.currentContext.tempVertexBufferCounters2 = vb;
  var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
  for (var i = 0; i <= largestIndex; ++i) {
   GL.currentContext.tempVertexBufferCounters1[i] = 0;
  }
 },
 getSource: function(shader, count, string, length) {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var len = length ? HEAP32[length + i * 4 >> 2] : -1;
   source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len);
  }
  var type = GLctx.getShaderParameter(GL.shaders[shader], 35663);
  if (type == 35632) {
   if (GLEmulation.findToken(source, "dFdx") || GLEmulation.findToken(source, "dFdy") || GLEmulation.findToken(source, "fwidth")) {
    source = "#extension GL_OES_standard_derivatives : enable\n" + source;
    var extension = GLctx.getExtension("OES_standard_derivatives");
   }
  }
  return source;
 },
 createContext: function(canvas, webGLContextAttributes) {
  if (!canvas.getContextSafariWebGL2Fixed) {
   canvas.getContextSafariWebGL2Fixed = canvas.getContext;
   function fixedGetContext(ver, attrs) {
    var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
    return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null;
   }
   canvas.getContext = fixedGetContext;
  }
  var ctx = canvas.getContext("webgl2", webGLContextAttributes);
  if (!ctx) return 0;
  var handle = GL.registerContext(ctx, webGLContextAttributes);
  return handle;
 },
 registerContext: function(ctx, webGLContextAttributes) {
  var handle = GL.getNewId(GL.contexts);
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 },
 makeContextCurrent: function(contextHandle) {
  GL.currentContext = GL.contexts[contextHandle];
  Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
  return !(contextHandle && !GLctx);
 },
 getContext: function(contextHandle) {
  return GL.contexts[contextHandle];
 },
 deleteContext: function(contextHandle) {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents == "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  GL.contexts[contextHandle] = null;
 },
 initExtensions: function(context) {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  context.compressionExt = GLctx.getExtension("WEBGL_compressed_texture_s3tc");
  context.anisotropicExt = GLctx.getExtension("EXT_texture_filter_anisotropic");
  __webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
  __webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
  if (context.version >= 2) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
  }
  if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  }
  __webgl_enable_WEBGL_multi_draw(GLctx);
  var exts = GLctx.getSupportedExtensions() || [];
  exts.forEach(function(ext) {
   if (!ext.includes("lose_context") && !ext.includes("debug")) {
    GLctx.getExtension(ext);
   }
  });
 }
};

function _SDL_SetVideoMode(width, height, depth, flags) {
 [ "touchstart", "touchend", "touchmove", "mousedown", "mouseup", "mousemove", "DOMMouseScroll", "mousewheel", "wheel", "mouseout" ].forEach(function(event) {
  Module["canvas"].addEventListener(event, SDL.receiveEvent, true);
 });
 var canvas = Module["canvas"];
 if (width == 0 && height == 0) {
  width = canvas.width;
  height = canvas.height;
 }
 if (!SDL.addedResizeListener) {
  SDL.addedResizeListener = true;
  Browser.resizeListeners.push(function(w, h) {
   if (!SDL.settingVideoMode) {
    SDL.receiveEvent({
     type: "resize",
     w: w,
     h: h
    });
   }
  });
 }
 SDL.settingVideoMode = true;
 Browser.setCanvasSize(width, height);
 SDL.settingVideoMode = false;
 if (SDL.screen) {
  SDL.freeSurface(SDL.screen);
  assert(!SDL.screen);
 }
 if (SDL.GL) flags = flags | 67108864;
 SDL.screen = SDL.makeSurface(width, height, flags, true, "screen");
 return SDL.screen;
}

function _SDL_ShowCursor(toggle) {
 switch (toggle) {
 case 0:
  if (Browser.isFullscreen) {
   Module["canvas"].requestPointerLock();
   return 0;
  } else {
   return 1;
  }
  break;

 case 1:
  Module["canvas"].exitPointerLock();
  return 1;
  break;

 case -1:
  return !Browser.pointerLock;
  break;

 default:
  out("SDL_ShowCursor called with unknown toggle parameter value: " + toggle + ".");
  break;
 }
}

function _SDL_UpperBlit(src, srcrect, dst, dstrect) {
 return SDL.blitSurface(src, srcrect, dst, dstrect, false);
}

function _SDL_WM_IconifyWindow() {
 throw "SDL_WM_IconifyWindow TODO";
}

function _SDL_WM_SetCaption(title, icon) {
 if (title && typeof setWindowTitle != "undefined") {
  setWindowTitle(UTF8ToString(title));
 }
 icon = icon && UTF8ToString(icon);
}

function _SDL_WarpMouse(x, y) {
 return;
}

function ___cxa_allocate_exception(size) {
 return _malloc(size + 16) + 16;
}

function ExceptionInfo(excPtr) {
 this.excPtr = excPtr;
 this.ptr = excPtr - 16;
 this.set_type = function(type) {
  HEAP32[this.ptr + 4 >> 2] = type;
 };
 this.get_type = function() {
  return HEAP32[this.ptr + 4 >> 2];
 };
 this.set_destructor = function(destructor) {
  HEAP32[this.ptr + 8 >> 2] = destructor;
 };
 this.get_destructor = function() {
  return HEAP32[this.ptr + 8 >> 2];
 };
 this.set_refcount = function(refcount) {
  HEAP32[this.ptr >> 2] = refcount;
 };
 this.set_caught = function(caught) {
  caught = caught ? 1 : 0;
  HEAP8[this.ptr + 12 >> 0] = caught;
 };
 this.get_caught = function() {
  return HEAP8[this.ptr + 12 >> 0] != 0;
 };
 this.set_rethrown = function(rethrown) {
  rethrown = rethrown ? 1 : 0;
  HEAP8[this.ptr + 13 >> 0] = rethrown;
 };
 this.get_rethrown = function() {
  return HEAP8[this.ptr + 13 >> 0] != 0;
 };
 this.init = function(type, destructor) {
  this.set_type(type);
  this.set_destructor(destructor);
  this.set_refcount(0);
  this.set_caught(false);
  this.set_rethrown(false);
 };
 this.add_ref = function() {
  var value = HEAP32[this.ptr >> 2];
  HEAP32[this.ptr >> 2] = value + 1;
 };
 this.release_ref = function() {
  var prev = HEAP32[this.ptr >> 2];
  HEAP32[this.ptr >> 2] = prev - 1;
  return prev === 1;
 };
}

function CatchInfo(ptr) {
 this.free = function() {
  _free(this.ptr);
  this.ptr = 0;
 };
 this.set_base_ptr = function(basePtr) {
  HEAP32[this.ptr >> 2] = basePtr;
 };
 this.get_base_ptr = function() {
  return HEAP32[this.ptr >> 2];
 };
 this.set_adjusted_ptr = function(adjustedPtr) {
  HEAP32[this.ptr + 4 >> 2] = adjustedPtr;
 };
 this.get_adjusted_ptr_addr = function() {
  return this.ptr + 4;
 };
 this.get_adjusted_ptr = function() {
  return HEAP32[this.ptr + 4 >> 2];
 };
 this.get_exception_ptr = function() {
  var isPointer = ___cxa_is_pointer_type(this.get_exception_info().get_type());
  if (isPointer) {
   return HEAP32[this.get_base_ptr() >> 2];
  }
  var adjusted = this.get_adjusted_ptr();
  if (adjusted !== 0) return adjusted;
  return this.get_base_ptr();
 };
 this.get_exception_info = function() {
  return new ExceptionInfo(this.get_base_ptr());
 };
 if (ptr === undefined) {
  this.ptr = _malloc(8);
  this.set_adjusted_ptr(0);
 } else {
  this.ptr = ptr;
 }
}

var exceptionCaught = [];

function exception_addRef(info) {
 info.add_ref();
}

var uncaughtExceptionCount = 0;

function ___cxa_begin_catch(ptr) {
 var catchInfo = new CatchInfo(ptr);
 var info = catchInfo.get_exception_info();
 if (!info.get_caught()) {
  info.set_caught(true);
  uncaughtExceptionCount--;
 }
 info.set_rethrown(false);
 exceptionCaught.push(catchInfo);
 exception_addRef(info);
 return catchInfo.get_exception_ptr();
}

function ___cxa_call_unexpected(exception) {
 err("Unexpected exception thrown, this is not properly supported - aborting");
 ABORT = true;
 throw exception;
}

var exceptionLast = 0;

function ___cxa_free_exception(ptr) {
 return _free(new ExceptionInfo(ptr).ptr);
}

function exception_decRef(info) {
 if (info.release_ref() && !info.get_rethrown()) {
  var destructor = info.get_destructor();
  if (destructor) {
   getWasmTableEntry(destructor)(info.excPtr);
  }
  ___cxa_free_exception(info.excPtr);
 }
}

function ___cxa_end_catch() {
 _setThrew(0);
 var catchInfo = exceptionCaught.pop();
 exception_decRef(catchInfo.get_exception_info());
 catchInfo.free();
 exceptionLast = 0;
}

function ___resumeException(catchInfoPtr) {
 var catchInfo = new CatchInfo(catchInfoPtr);
 var ptr = catchInfo.get_base_ptr();
 if (!exceptionLast) {
  exceptionLast = ptr;
 }
 catchInfo.free();
 throw ptr;
}

function ___cxa_find_matching_catch_2() {
 var thrown = exceptionLast;
 if (!thrown) {
  setTempRet0(0);
  return 0 | 0;
 }
 var info = new ExceptionInfo(thrown);
 var thrownType = info.get_type();
 var catchInfo = new CatchInfo();
 catchInfo.set_base_ptr(thrown);
 catchInfo.set_adjusted_ptr(thrown);
 if (!thrownType) {
  setTempRet0(0);
  return catchInfo.ptr | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 for (var i = 0; i < typeArray.length; i++) {
  var caughtType = typeArray[i];
  if (caughtType === 0 || caughtType === thrownType) {
   break;
  }
  if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
   setTempRet0(caughtType);
   return catchInfo.ptr | 0;
  }
 }
 setTempRet0(thrownType);
 return catchInfo.ptr | 0;
}

function ___cxa_find_matching_catch_3() {
 var thrown = exceptionLast;
 if (!thrown) {
  setTempRet0(0);
  return 0 | 0;
 }
 var info = new ExceptionInfo(thrown);
 var thrownType = info.get_type();
 var catchInfo = new CatchInfo();
 catchInfo.set_base_ptr(thrown);
 catchInfo.set_adjusted_ptr(thrown);
 if (!thrownType) {
  setTempRet0(0);
  return catchInfo.ptr | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 for (var i = 0; i < typeArray.length; i++) {
  var caughtType = typeArray[i];
  if (caughtType === 0 || caughtType === thrownType) {
   break;
  }
  if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
   setTempRet0(caughtType);
   return catchInfo.ptr | 0;
  }
 }
 setTempRet0(thrownType);
 return catchInfo.ptr | 0;
}

function ___cxa_find_matching_catch_4() {
 var thrown = exceptionLast;
 if (!thrown) {
  setTempRet0(0);
  return 0 | 0;
 }
 var info = new ExceptionInfo(thrown);
 var thrownType = info.get_type();
 var catchInfo = new CatchInfo();
 catchInfo.set_base_ptr(thrown);
 catchInfo.set_adjusted_ptr(thrown);
 if (!thrownType) {
  setTempRet0(0);
  return catchInfo.ptr | 0;
 }
 var typeArray = Array.prototype.slice.call(arguments);
 for (var i = 0; i < typeArray.length; i++) {
  var caughtType = typeArray[i];
  if (caughtType === 0 || caughtType === thrownType) {
   break;
  }
  if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
   setTempRet0(caughtType);
   return catchInfo.ptr | 0;
  }
 }
 setTempRet0(thrownType);
 return catchInfo.ptr | 0;
}

function ___cxa_rethrow() {
 var catchInfo = exceptionCaught.pop();
 if (!catchInfo) {
  abort("no exception to throw");
 }
 var info = catchInfo.get_exception_info();
 var ptr = catchInfo.get_base_ptr();
 if (!info.get_rethrown()) {
  exceptionCaught.push(catchInfo);
  info.set_rethrown(true);
  info.set_caught(false);
  uncaughtExceptionCount++;
 } else {
  catchInfo.free();
 }
 exceptionLast = ptr;
 throw ptr;
}

function ___cxa_throw(ptr, type, destructor) {
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 throw ptr;
}

function ___cxa_uncaught_exceptions() {
 return uncaughtExceptionCount;
}

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 calculateAt: function(dirfd, path, allowEmpty) {
  if (path[0] === "/") {
   return path;
  }
  var dir;
  if (dirfd === -100) {
   dir = FS.cwd();
  } else {
   var dirstream = FS.getStream(dirfd);
   if (!dirstream) throw new FS.ErrnoError(8);
   dir = dirstream.path;
  }
  if (path.length == 0) {
   if (!allowEmpty) {
    throw new FS.ErrnoError(44);
   }
   return dir;
  }
  return PATH.join2(dir, path);
 },
 doStat: function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -54;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
  HEAP32[buf + 48 >> 2] = 4096;
  HEAP32[buf + 52 >> 2] = stat.blocks;
  HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 76 >> 2] = 0;
  tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
  return 0;
 },
 doMsync: function(addr, stream, len, flags, offset) {
  var buffer = HEAPU8.slice(addr, addr + len);
  FS.msync(stream, buffer, offset, len, flags);
 },
 doMkdir: function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 },
 doMknod: function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;

  default:
   return -28;
  }
  FS.mknod(path, mode, dev);
  return 0;
 },
 doReadlink: function(path, buf, bufsize) {
  if (bufsize <= 0) return -28;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 },
 doAccess: function(path, amode) {
  if (amode & ~7) {
   return -28;
  }
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 },
 doDup: function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 },
 doReadv: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 },
 doWritev: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 },
 varargs: undefined,
 get: function() {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 },
 getStr: function(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 },
 getStreamFromFD: function(fd) {
  var stream = FS.getStream(fd);
  if (!stream) throw new FS.ErrnoError(8);
  return stream;
 },
 get64: function(low, high) {
  return low;
 }
};

function ___syscall__newselect(nfds, readfds, writefds, exceptfds, timeout) {
 try {
  var total = 0;
  var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0, srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
  var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0, srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
  var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0, srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
  var dstReadLow = 0, dstReadHigh = 0;
  var dstWriteLow = 0, dstWriteHigh = 0;
  var dstExceptLow = 0, dstExceptHigh = 0;
  var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
  var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);
  var check = function(fd, low, high, val) {
   return fd < 32 ? low & val : high & val;
  };
  for (var fd = 0; fd < nfds; fd++) {
   var mask = 1 << fd % 32;
   if (!check(fd, allLow, allHigh, mask)) {
    continue;
   }
   var stream = FS.getStream(fd);
   if (!stream) throw new FS.ErrnoError(8);
   var flags = SYSCALLS.DEFAULT_POLLMASK;
   if (stream.stream_ops.poll) {
    flags = stream.stream_ops.poll(stream);
   }
   if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
    fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
    total++;
   }
   if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
    fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
    total++;
   }
   if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
    fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
    total++;
   }
  }
  if (readfds) {
   HEAP32[readfds >> 2] = dstReadLow;
   HEAP32[readfds + 4 >> 2] = dstReadHigh;
  }
  if (writefds) {
   HEAP32[writefds >> 2] = dstWriteLow;
   HEAP32[writefds + 4 >> 2] = dstWriteHigh;
  }
  if (exceptfds) {
   HEAP32[exceptfds >> 2] = dstExceptLow;
   HEAP32[exceptfds + 4 >> 2] = dstExceptHigh;
  }
  return total;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

var SOCKFS = {
 mount: function(mount) {
  Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
  Module["websocket"]._callbacks = {};
  Module["websocket"]["on"] = function(event, callback) {
   if ("function" === typeof callback) {
    this._callbacks[event] = callback;
   }
   return this;
  };
  Module["websocket"].emit = function(event, param) {
   if ("function" === typeof this._callbacks[event]) {
    this._callbacks[event].call(this, param);
   }
  };
  return FS.createNode(null, "/", 16384 | 511, 0);
 },
 createSocket: function(family, type, protocol) {
  type &= ~526336;
  var streaming = type == 1;
  if (protocol) {
   assert(streaming == (protocol == 6));
  }
  var sock = {
   family: family,
   type: type,
   protocol: protocol,
   server: null,
   error: null,
   peers: {},
   pending: [],
   recv_queue: [],
   sock_ops: SOCKFS.websocket_sock_ops
  };
  var name = SOCKFS.nextname();
  var node = FS.createNode(SOCKFS.root, name, 49152, 0);
  node.sock = sock;
  var stream = FS.createStream({
   path: name,
   node: node,
   flags: 2,
   seekable: false,
   stream_ops: SOCKFS.stream_ops
  });
  sock.stream = stream;
  return sock;
 },
 getSocket: function(fd) {
  var stream = FS.getStream(fd);
  if (!stream || !FS.isSocket(stream.node.mode)) {
   return null;
  }
  return stream.node.sock;
 },
 stream_ops: {
  poll: function(stream) {
   var sock = stream.node.sock;
   return sock.sock_ops.poll(sock);
  },
  ioctl: function(stream, request, varargs) {
   var sock = stream.node.sock;
   return sock.sock_ops.ioctl(sock, request, varargs);
  },
  read: function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   var msg = sock.sock_ops.recvmsg(sock, length);
   if (!msg) {
    return 0;
   }
   buffer.set(msg.buffer, offset);
   return msg.buffer.length;
  },
  write: function(stream, buffer, offset, length, position) {
   var sock = stream.node.sock;
   return sock.sock_ops.sendmsg(sock, buffer, offset, length);
  },
  close: function(stream) {
   var sock = stream.node.sock;
   sock.sock_ops.close(sock);
  }
 },
 nextname: function() {
  if (!SOCKFS.nextname.current) {
   SOCKFS.nextname.current = 0;
  }
  return "socket[" + SOCKFS.nextname.current++ + "]";
 },
 websocket_sock_ops: {
  createPeer: function(sock, addr, port) {
   var ws;
   if (typeof addr == "object") {
    ws = addr;
    addr = null;
    port = null;
   }
   if (ws) {
    if (ws._socket) {
     addr = ws._socket.remoteAddress;
     port = ws._socket.remotePort;
    } else {
     var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
     if (!result) {
      throw new Error("WebSocket URL must be in the format ws(s)://address:port");
     }
     addr = result[1];
     port = parseInt(result[2], 10);
    }
   } else {
    try {
     var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
     var url = "ws:#".replace("#", "//");
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["url"]) {
       url = Module["websocket"]["url"];
      }
     }
     if (url === "ws://" || url === "wss://") {
      var parts = addr.split("/");
      url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
     }
     var subProtocols = "binary";
     if (runtimeConfig) {
      if ("string" === typeof Module["websocket"]["subprotocol"]) {
       subProtocols = Module["websocket"]["subprotocol"];
      }
     }
     var opts = undefined;
     if (subProtocols !== "null") {
      subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
      opts = ENVIRONMENT_IS_NODE ? {
       "protocol": subProtocols.toString()
      } : subProtocols;
     }
     if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
      subProtocols = "null";
      opts = undefined;
     }
     var WebSocketConstructor;
     if (ENVIRONMENT_IS_NODE) {
      WebSocketConstructor = require("ws");
     } else {
      WebSocketConstructor = WebSocket;
     }
     ws = new WebSocketConstructor(url, opts);
     ws.binaryType = "arraybuffer";
    } catch (e) {
     throw new FS.ErrnoError(23);
    }
   }
   var peer = {
    addr: addr,
    port: port,
    socket: ws,
    dgram_send_queue: []
   };
   SOCKFS.websocket_sock_ops.addPeer(sock, peer);
   SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
   if (sock.type === 2 && typeof sock.sport != "undefined") {
    peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255 ]));
   }
   return peer;
  },
  getPeer: function(sock, addr, port) {
   return sock.peers[addr + ":" + port];
  },
  addPeer: function(sock, peer) {
   sock.peers[peer.addr + ":" + peer.port] = peer;
  },
  removePeer: function(sock, peer) {
   delete sock.peers[peer.addr + ":" + peer.port];
  },
  handlePeerEvents: function(sock, peer) {
   var first = true;
   var handleOpen = function() {
    Module["websocket"].emit("open", sock.stream.fd);
    try {
     var queued = peer.dgram_send_queue.shift();
     while (queued) {
      peer.socket.send(queued);
      queued = peer.dgram_send_queue.shift();
     }
    } catch (e) {
     peer.socket.close();
    }
   };
   function handleMessage(data) {
    if (typeof data == "string") {
     var encoder = new TextEncoder();
     data = encoder.encode(data);
    } else {
     assert(data.byteLength !== undefined);
     if (data.byteLength == 0) {
      return;
     } else {
      data = new Uint8Array(data);
     }
    }
    var wasfirst = first;
    first = false;
    if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
     var newport = data[8] << 8 | data[9];
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
     peer.port = newport;
     SOCKFS.websocket_sock_ops.addPeer(sock, peer);
     return;
    }
    sock.recv_queue.push({
     addr: peer.addr,
     port: peer.port,
     data: data
    });
    Module["websocket"].emit("message", sock.stream.fd);
   }
   if (ENVIRONMENT_IS_NODE) {
    peer.socket.on("open", handleOpen);
    peer.socket.on("message", function(data, flags) {
     if (!flags.binary) {
      return;
     }
     handleMessage(new Uint8Array(data).buffer);
    });
    peer.socket.on("close", function() {
     Module["websocket"].emit("close", sock.stream.fd);
    });
    peer.socket.on("error", function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    });
   } else {
    peer.socket.onopen = handleOpen;
    peer.socket.onclose = function() {
     Module["websocket"].emit("close", sock.stream.fd);
    };
    peer.socket.onmessage = function peer_socket_onmessage(event) {
     handleMessage(event.data);
    };
    peer.socket.onerror = function(error) {
     sock.error = 14;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
    };
   }
  },
  poll: function(sock) {
   if (sock.type === 1 && sock.server) {
    return sock.pending.length ? 64 | 1 : 0;
   }
   var mask = 0;
   var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
   if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 64 | 1;
   }
   if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
    mask |= 4;
   }
   if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
    mask |= 16;
   }
   return mask;
  },
  ioctl: function(sock, request, arg) {
   switch (request) {
   case 21531:
    var bytes = 0;
    if (sock.recv_queue.length) {
     bytes = sock.recv_queue[0].data.length;
    }
    HEAP32[arg >> 2] = bytes;
    return 0;

   default:
    return 28;
   }
  },
  close: function(sock) {
   if (sock.server) {
    try {
     sock.server.close();
    } catch (e) {}
    sock.server = null;
   }
   var peers = Object.keys(sock.peers);
   for (var i = 0; i < peers.length; i++) {
    var peer = sock.peers[peers[i]];
    try {
     peer.socket.close();
    } catch (e) {}
    SOCKFS.websocket_sock_ops.removePeer(sock, peer);
   }
   return 0;
  },
  bind: function(sock, addr, port) {
   if (typeof sock.saddr != "undefined" || typeof sock.sport != "undefined") {
    throw new FS.ErrnoError(28);
   }
   sock.saddr = addr;
   sock.sport = port;
   if (sock.type === 2) {
    if (sock.server) {
     sock.server.close();
     sock.server = null;
    }
    try {
     sock.sock_ops.listen(sock, 0);
    } catch (e) {
     if (!(e instanceof FS.ErrnoError)) throw e;
     if (e.errno !== 138) throw e;
    }
   }
  },
  connect: function(sock, addr, port) {
   if (sock.server) {
    throw new FS.ErrnoError(138);
   }
   if (typeof sock.daddr != "undefined" && typeof sock.dport != "undefined") {
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
    if (dest) {
     if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(7);
     } else {
      throw new FS.ErrnoError(30);
     }
    }
   }
   var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
   sock.daddr = peer.addr;
   sock.dport = peer.port;
   throw new FS.ErrnoError(26);
  },
  listen: function(sock, backlog) {
   if (!ENVIRONMENT_IS_NODE) {
    throw new FS.ErrnoError(138);
   }
   if (sock.server) {
    throw new FS.ErrnoError(28);
   }
   var WebSocketServer = require("ws").Server;
   var host = sock.saddr;
   sock.server = new WebSocketServer({
    host: host,
    port: sock.sport
   });
   Module["websocket"].emit("listen", sock.stream.fd);
   sock.server.on("connection", function(ws) {
    if (sock.type === 1) {
     var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
     var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
     newsock.daddr = peer.addr;
     newsock.dport = peer.port;
     sock.pending.push(newsock);
     Module["websocket"].emit("connection", newsock.stream.fd);
    } else {
     SOCKFS.websocket_sock_ops.createPeer(sock, ws);
     Module["websocket"].emit("connection", sock.stream.fd);
    }
   });
   sock.server.on("closed", function() {
    Module["websocket"].emit("close", sock.stream.fd);
    sock.server = null;
   });
   sock.server.on("error", function(error) {
    sock.error = 23;
    Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
   });
  },
  accept: function(listensock) {
   if (!listensock.server) {
    throw new FS.ErrnoError(28);
   }
   var newsock = listensock.pending.shift();
   newsock.stream.flags = listensock.stream.flags;
   return newsock;
  },
  getname: function(sock, peer) {
   var addr, port;
   if (peer) {
    if (sock.daddr === undefined || sock.dport === undefined) {
     throw new FS.ErrnoError(53);
    }
    addr = sock.daddr;
    port = sock.dport;
   } else {
    addr = sock.saddr || 0;
    port = sock.sport || 0;
   }
   return {
    addr: addr,
    port: port
   };
  },
  sendmsg: function(sock, buffer, offset, length, addr, port) {
   if (sock.type === 2) {
    if (addr === undefined || port === undefined) {
     addr = sock.daddr;
     port = sock.dport;
    }
    if (addr === undefined || port === undefined) {
     throw new FS.ErrnoError(17);
    }
   } else {
    addr = sock.daddr;
    port = sock.dport;
   }
   var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
   if (sock.type === 1) {
    if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
     throw new FS.ErrnoError(53);
    } else if (dest.socket.readyState === dest.socket.CONNECTING) {
     throw new FS.ErrnoError(6);
    }
   }
   if (ArrayBuffer.isView(buffer)) {
    offset += buffer.byteOffset;
    buffer = buffer.buffer;
   }
   var data;
   data = buffer.slice(offset, offset + length);
   if (sock.type === 2) {
    if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
     }
     dest.dgram_send_queue.push(data);
     return length;
    }
   }
   try {
    dest.socket.send(data);
    return length;
   } catch (e) {
    throw new FS.ErrnoError(28);
   }
  },
  recvmsg: function(sock, length) {
   if (sock.type === 1 && sock.server) {
    throw new FS.ErrnoError(53);
   }
   var queued = sock.recv_queue.shift();
   if (!queued) {
    if (sock.type === 1) {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (!dest) {
      throw new FS.ErrnoError(53);
     } else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      return null;
     } else {
      throw new FS.ErrnoError(6);
     }
    } else {
     throw new FS.ErrnoError(6);
    }
   }
   var queuedLength = queued.data.byteLength || queued.data.length;
   var queuedOffset = queued.data.byteOffset || 0;
   var queuedBuffer = queued.data.buffer || queued.data;
   var bytesRead = Math.min(length, queuedLength);
   var res = {
    buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
    addr: queued.addr,
    port: queued.port
   };
   if (sock.type === 1 && bytesRead < queuedLength) {
    var bytesRemaining = queuedLength - bytesRead;
    queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
    sock.recv_queue.unshift(queued);
   }
   return res;
  }
 }
};

function getSocketFromFD(fd) {
 var socket = SOCKFS.getSocket(fd);
 if (!socket) throw new FS.ErrnoError(8);
 return socket;
}

function setErrNo(value) {
 HEAP32[___errno_location() >> 2] = value;
 return value;
}

function inetNtop4(addr) {
 return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255);
}

function inetNtop6(ints) {
 var str = "";
 var word = 0;
 var longest = 0;
 var lastzero = 0;
 var zstart = 0;
 var len = 0;
 var i = 0;
 var parts = [ ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16 ];
 var hasipv4 = true;
 var v4part = "";
 for (i = 0; i < 5; i++) {
  if (parts[i] !== 0) {
   hasipv4 = false;
   break;
  }
 }
 if (hasipv4) {
  v4part = inetNtop4(parts[6] | parts[7] << 16);
  if (parts[5] === -1) {
   str = "::ffff:";
   str += v4part;
   return str;
  }
  if (parts[5] === 0) {
   str = "::";
   if (v4part === "0.0.0.0") v4part = "";
   if (v4part === "0.0.0.1") v4part = "1";
   str += v4part;
   return str;
  }
 }
 for (word = 0; word < 8; word++) {
  if (parts[word] === 0) {
   if (word - lastzero > 1) {
    len = 0;
   }
   lastzero = word;
   len++;
  }
  if (len > longest) {
   longest = len;
   zstart = word - longest + 1;
  }
 }
 for (word = 0; word < 8; word++) {
  if (longest > 1) {
   if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
    if (word === zstart) {
     str += ":";
     if (zstart === 0) str += ":";
    }
    continue;
   }
  }
  str += Number(_ntohs(parts[word] & 65535)).toString(16);
  str += word < 7 ? ":" : "";
 }
 return str;
}

function readSockaddr(sa, salen) {
 var family = HEAP16[sa >> 1];
 var port = _ntohs(HEAPU16[sa + 2 >> 1]);
 var addr;
 switch (family) {
 case 2:
  if (salen !== 16) {
   return {
    errno: 28
   };
  }
  addr = HEAP32[sa + 4 >> 2];
  addr = inetNtop4(addr);
  break;

 case 10:
  if (salen !== 28) {
   return {
    errno: 28
   };
  }
  addr = [ HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2] ];
  addr = inetNtop6(addr);
  break;

 default:
  return {
   errno: 5
  };
 }
 return {
  family: family,
  addr: addr,
  port: port
 };
}

function inetPton4(str) {
 var b = str.split(".");
 for (var i = 0; i < 4; i++) {
  var tmp = Number(b[i]);
  if (isNaN(tmp)) return null;
  b[i] = tmp;
 }
 return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0;
}

function jstoi_q(str) {
 return parseInt(str);
}

function inetPton6(str) {
 var words;
 var w, offset, z;
 var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
 var parts = [];
 if (!valid6regx.test(str)) {
  return null;
 }
 if (str === "::") {
  return [ 0, 0, 0, 0, 0, 0, 0, 0 ];
 }
 if (str.startsWith("::")) {
  str = str.replace("::", "Z:");
 } else {
  str = str.replace("::", ":Z:");
 }
 if (str.indexOf(".") > 0) {
  str = str.replace(new RegExp("[.]", "g"), ":");
  words = str.split(":");
  words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
  words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
  words = words.slice(0, words.length - 2);
 } else {
  words = str.split(":");
 }
 offset = 0;
 z = 0;
 for (w = 0; w < words.length; w++) {
  if (typeof words[w] == "string") {
   if (words[w] === "Z") {
    for (z = 0; z < 8 - words.length + 1; z++) {
     parts[w + z] = 0;
    }
    offset = z - 1;
   } else {
    parts[w + offset] = _htons(parseInt(words[w], 16));
   }
  } else {
   parts[w + offset] = words[w];
  }
 }
 return [ parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6] ];
}

var DNS = {
 address_map: {
  id: 1,
  addrs: {},
  names: {}
 },
 lookup_name: function(name) {
  var res = inetPton4(name);
  if (res !== null) {
   return name;
  }
  res = inetPton6(name);
  if (res !== null) {
   return name;
  }
  var addr;
  if (DNS.address_map.addrs[name]) {
   addr = DNS.address_map.addrs[name];
  } else {
   var id = DNS.address_map.id++;
   assert(id < 65535, "exceeded max address mappings of 65535");
   addr = "172.29." + (id & 255) + "." + (id & 65280);
   DNS.address_map.names[addr] = name;
   DNS.address_map.addrs[name] = addr;
  }
  return addr;
 },
 lookup_addr: function(addr) {
  if (DNS.address_map.names[addr]) {
   return DNS.address_map.names[addr];
  }
  return null;
 }
};

function getSocketAddress(addrp, addrlen, allowNull) {
 if (allowNull && addrp === 0) return null;
 var info = readSockaddr(addrp, addrlen);
 if (info.errno) throw new FS.ErrnoError(info.errno);
 info.addr = DNS.lookup_addr(info.addr) || info.addr;
 return info;
}

function ___syscall_bind(fd, addr, addrlen) {
 try {
  var sock = getSocketFromFD(fd);
  var info = getSocketAddress(addr, addrlen);
  sock.sock_ops.bind(sock, info.addr, info.port);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_chdir(path) {
 try {
  path = SYSCALLS.getStr(path);
  FS.chdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_faccessat(dirfd, path, amode, flags) {
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  return SYSCALLS.doAccess(path, amode);
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_fcntl64(fd, cmd, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 5:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }

  case 6:
  case 7:
   return 0;

  case 16:
  case 8:
   return -28;

  case 9:
   setErrNo(28);
   return -1;

  default:
   {
    return -28;
   }
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_getcwd(buf, size) {
 try {
  if (size === 0) return -28;
  var cwd = FS.cwd();
  var cwdLengthInBytes = lengthBytesUTF8(cwd);
  if (size < cwdLengthInBytes + 1) return -68;
  stringToUTF8(cwd, buf, size);
  return buf;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_getdents64(fd, dirp, count) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (!stream.getdents) {
   stream.getdents = FS.readdir(stream.path);
  }
  var struct_size = 280;
  var pos = 0;
  var off = FS.llseek(stream, 0, 1);
  var idx = Math.floor(off / struct_size);
  while (idx < stream.getdents.length && pos + struct_size <= count) {
   var id;
   var type;
   var name = stream.getdents[idx];
   if (name === ".") {
    id = stream.node.id;
    type = 4;
   } else if (name === "..") {
    var lookup = FS.lookupPath(stream.path, {
     parent: true
    });
    id = lookup.node.id;
    type = 4;
   } else {
    var child = FS.lookupNode(stream.node, name);
    id = child.id;
    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
   }
   tempI64 = [ id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
   tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, 
   +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
   HEAP16[dirp + pos + 16 >> 1] = 280;
   HEAP8[dirp + pos + 18 >> 0] = type;
   stringToUTF8(name, dirp + pos + 19, 256);
   pos += struct_size;
   idx += 1;
  }
  FS.llseek(stream, idx * struct_size, 0);
  return pos;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_ioctl(fd, op, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (op) {
  case 21509:
  case 21505:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_mkdir(path, mode) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doMkdir(path, mode);
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_open(path, flags, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(path);
  var mode = varargs ? SYSCALLS.get() : 0;
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_readlink(path, buf, bufsize) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doReadlink(path, buf, bufsize);
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function writeSockaddr(sa, family, addr, port, addrlen) {
 switch (family) {
 case 2:
  addr = inetPton4(addr);
  zeroMemory(sa, 16);
  if (addrlen) {
   HEAP32[addrlen >> 2] = 16;
  }
  HEAP16[sa >> 1] = family;
  HEAP32[sa + 4 >> 2] = addr;
  HEAP16[sa + 2 >> 1] = _htons(port);
  break;

 case 10:
  addr = inetPton6(addr);
  zeroMemory(sa, 28);
  if (addrlen) {
   HEAP32[addrlen >> 2] = 28;
  }
  HEAP32[sa >> 2] = family;
  HEAP32[sa + 8 >> 2] = addr[0];
  HEAP32[sa + 12 >> 2] = addr[1];
  HEAP32[sa + 16 >> 2] = addr[2];
  HEAP32[sa + 20 >> 2] = addr[3];
  HEAP16[sa + 2 >> 1] = _htons(port);
  break;

 default:
  return 5;
 }
 return 0;
}

function ___syscall_recvmsg(fd, message, flags) {
 try {
  var sock = getSocketFromFD(fd);
  var iov = HEAP32[message + 8 >> 2];
  var num = HEAP32[message + 12 >> 2];
  var total = 0;
  for (var i = 0; i < num; i++) {
   total += HEAP32[iov + (8 * i + 4) >> 2];
  }
  var msg = sock.sock_ops.recvmsg(sock, total);
  if (!msg) return 0;
  var name = HEAP32[message >> 2];
  if (name) {
   var errno = writeSockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
  }
  var bytesRead = 0;
  var bytesRemaining = msg.buffer.byteLength;
  for (var i = 0; bytesRemaining > 0 && i < num; i++) {
   var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
   var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
   if (!iovlen) {
    continue;
   }
   var length = Math.min(iovlen, bytesRemaining);
   var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
   HEAPU8.set(buf, iovbase + bytesRead);
   bytesRead += length;
   bytesRemaining -= length;
  }
  return bytesRead;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_rmdir(path) {
 try {
  path = SYSCALLS.getStr(path);
  FS.rmdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_sendmsg(fd, message, flags) {
 try {
  var sock = getSocketFromFD(fd);
  var iov = HEAP32[message + 8 >> 2];
  var num = HEAP32[message + 12 >> 2];
  var addr, port;
  var name = HEAP32[message >> 2];
  var namelen = HEAP32[message + 4 >> 2];
  if (name) {
   var info = readSockaddr(name, namelen);
   if (info.errno) return -info.errno;
   port = info.port;
   addr = DNS.lookup_addr(info.addr) || info.addr;
  }
  var total = 0;
  for (var i = 0; i < num; i++) {
   total += HEAP32[iov + (8 * i + 4) >> 2];
  }
  var view = new Uint8Array(total);
  var offset = 0;
  for (var i = 0; i < num; i++) {
   var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
   var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
   for (var j = 0; j < iovlen; j++) {
    view[offset++] = HEAP8[iovbase + j >> 0];
   }
  }
  return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port);
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_socket(domain, type, protocol) {
 try {
  var sock = SOCKFS.createSocket(domain, type, protocol);
  return sock.stream.fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_stat64(path, buf) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doStat(FS.stat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function ___syscall_unlink(path) {
 try {
  path = SYSCALLS.getStr(path);
  FS.unlink(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return -e.errno;
 }
}

function __emscripten_throw_longjmp() {
 throw Infinity;
}

function __gmtime_js(time, tmPtr) {
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getUTCSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
 HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
 HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
}

function __localtime_js(time, tmPtr) {
 var date = new Date(HEAP32[time >> 2] * 1e3);
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var start = new Date(date.getFullYear(), 0, 1);
 var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 HEAP32[tmPtr + 32 >> 2] = dst;
}

function __mktime_js(tmPtr) {
 var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
 var dst = HEAP32[tmPtr + 32 >> 2];
 var guessedOffset = date.getTimezoneOffset();
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dstOffset = Math.min(winterOffset, summerOffset);
 if (dst < 0) {
  HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
 } else if (dst > 0 != (dstOffset == guessedOffset)) {
  var nonDstOffset = Math.max(winterOffset, summerOffset);
  var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
  date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
 }
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 return date.getTime() / 1e3 | 0;
}

function _tzset_impl(timezone, daylight, tzname) {
 var currentYear = new Date().getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 var winterOffset = winter.getTimezoneOffset();
 var summerOffset = summer.getTimezoneOffset();
 var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
 HEAP32[timezone >> 2] = stdTimezoneOffset * 60;
 HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
 function extractZone(date) {
  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
  return match ? match[1] : "GMT";
 }
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 var winterNamePtr = allocateUTF8(winterName);
 var summerNamePtr = allocateUTF8(summerName);
 if (summerOffset < winterOffset) {
  HEAP32[tzname >> 2] = winterNamePtr;
  HEAP32[tzname + 4 >> 2] = summerNamePtr;
 } else {
  HEAP32[tzname >> 2] = summerNamePtr;
  HEAP32[tzname + 4 >> 2] = winterNamePtr;
 }
}

function __tzset_js(timezone, daylight, tzname) {
 if (__tzset_js.called) return;
 __tzset_js.called = true;
 _tzset_impl(timezone, daylight, tzname);
}

function _abort() {
 abort("");
}

var AL = {
 QUEUE_INTERVAL: 25,
 QUEUE_LOOKAHEAD: .1,
 DEVICE_NAME: "Emscripten OpenAL",
 CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
 ALC_EXTENSIONS: {
  ALC_SOFT_pause_device: true,
  ALC_SOFT_HRTF: true
 },
 AL_EXTENSIONS: {
  AL_EXT_float32: true,
  AL_SOFT_loop_points: true,
  AL_SOFT_source_length: true,
  AL_EXT_source_distance_model: true,
  AL_SOFT_source_spatialize: true
 },
 _alcErr: 0,
 alcErr: 0,
 deviceRefCounts: {},
 alcStringCache: {},
 paused: false,
 stringCache: {},
 contexts: {},
 currentCtx: null,
 buffers: {
  0: {
   id: 0,
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  }
 },
 paramArray: [],
 _nextId: 1,
 newId: function() {
  return AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++;
 },
 freeIds: [],
 scheduleContextAudio: function(ctx) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  for (var i in ctx.sources) {
   AL.scheduleSourceAudio(ctx.sources[i]);
  }
 },
 scheduleSourceAudio: function(src, lookahead) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  if (src.state !== 4114) {
   return;
  }
  var currentTime = AL.updateSourceTime(src);
  var startTime = src.bufStartTime;
  var startOffset = src.bufOffset;
  var bufCursor = src.bufsProcessed;
  for (var i = 0; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   startTime = audioSrc._startTime + audioSrc._duration;
   startOffset = 0;
   bufCursor += audioSrc._skipCount + 1;
  }
  if (!lookahead) {
   lookahead = AL.QUEUE_LOOKAHEAD;
  }
  var lookaheadTime = currentTime + lookahead;
  var skipCount = 0;
  while (startTime < lookaheadTime) {
   if (bufCursor >= src.bufQueue.length) {
    if (src.looping) {
     bufCursor %= src.bufQueue.length;
    } else {
     break;
    }
   }
   var buf = src.bufQueue[bufCursor % src.bufQueue.length];
   if (buf.length === 0) {
    skipCount++;
    if (skipCount === src.bufQueue.length) {
     break;
    }
   } else {
    var audioSrc = src.context.audioCtx.createBufferSource();
    audioSrc.buffer = buf.audioBuf;
    audioSrc.playbackRate.value = src.playbackRate;
    if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
     audioSrc.loopStart = buf.audioBuf._loopStart;
     audioSrc.loopEnd = buf.audioBuf._loopEnd;
    }
    var duration = 0;
    if (src.type === 4136 && src.looping) {
     duration = Number.POSITIVE_INFINITY;
     audioSrc.loop = true;
     if (buf.audioBuf._loopStart) {
      audioSrc.loopStart = buf.audioBuf._loopStart;
     }
     if (buf.audioBuf._loopEnd) {
      audioSrc.loopEnd = buf.audioBuf._loopEnd;
     }
    } else {
     duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
    }
    audioSrc._startOffset = startOffset;
    audioSrc._duration = duration;
    audioSrc._skipCount = skipCount;
    skipCount = 0;
    audioSrc.connect(src.gain);
    if (typeof audioSrc.start != "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.start(startTime, startOffset);
    } else if (typeof audioSrc.noteOn != "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.noteOn(startTime);
    }
    audioSrc._startTime = startTime;
    src.audioQueue.push(audioSrc);
    startTime += duration;
   }
   startOffset = 0;
   bufCursor++;
  }
 },
 updateSourceTime: function(src) {
  var currentTime = src.context.audioCtx.currentTime;
  if (src.state !== 4114) {
   return currentTime;
  }
  if (!isFinite(src.bufStartTime)) {
   src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
   src.bufOffset = 0;
  }
  var nextStartTime = 0;
  while (src.audioQueue.length) {
   var audioSrc = src.audioQueue[0];
   src.bufsProcessed += audioSrc._skipCount;
   nextStartTime = audioSrc._startTime + audioSrc._duration;
   if (currentTime < nextStartTime) {
    break;
   }
   src.audioQueue.shift();
   src.bufStartTime = nextStartTime;
   src.bufOffset = 0;
   src.bufsProcessed++;
  }
  if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
   AL.setSourceState(src, 4116);
  } else if (src.type === 4136 && src.looping) {
   var buf = src.bufQueue[0];
   if (buf.length === 0) {
    src.bufOffset = 0;
   } else {
    var delta = (currentTime - src.bufStartTime) * src.playbackRate;
    var loopStart = buf.audioBuf._loopStart || 0;
    var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
    if (loopEnd <= loopStart) {
     loopEnd = buf.audioBuf.duration;
    }
    if (delta < loopEnd) {
     src.bufOffset = delta;
    } else {
     src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
    }
   }
  } else if (src.audioQueue[0]) {
   src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
  } else {
   if (src.type !== 4136 && src.looping) {
    var srcDuration = AL.sourceDuration(src) / src.playbackRate;
    if (srcDuration > 0) {
     src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
    }
   }
   for (var i = 0; i < src.bufQueue.length; i++) {
    if (src.bufsProcessed >= src.bufQueue.length) {
     if (src.looping) {
      src.bufsProcessed %= src.bufQueue.length;
     } else {
      AL.setSourceState(src, 4116);
      break;
     }
    }
    var buf = src.bufQueue[src.bufsProcessed];
    if (buf.length > 0) {
     nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
     if (currentTime < nextStartTime) {
      src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
      break;
     }
     src.bufStartTime = nextStartTime;
    }
    src.bufOffset = 0;
    src.bufsProcessed++;
   }
  }
  return currentTime;
 },
 cancelPendingSourceAudio: function(src) {
  AL.updateSourceTime(src);
  for (var i = 1; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   audioSrc.stop();
  }
  if (src.audioQueue.length > 1) {
   src.audioQueue.length = 1;
  }
 },
 stopSourceAudio: function(src) {
  for (var i = 0; i < src.audioQueue.length; i++) {
   src.audioQueue[i].stop();
  }
  src.audioQueue.length = 0;
 },
 setSourceState: function(src, state) {
  if (state === 4114) {
   if (src.state === 4114 || src.state == 4116) {
    src.bufsProcessed = 0;
    src.bufOffset = 0;
   } else {}
   AL.stopSourceAudio(src);
   src.state = 4114;
   src.bufStartTime = Number.NEGATIVE_INFINITY;
   AL.scheduleSourceAudio(src);
  } else if (state === 4115) {
   if (src.state === 4114) {
    AL.updateSourceTime(src);
    AL.stopSourceAudio(src);
    src.state = 4115;
   }
  } else if (state === 4116) {
   if (src.state !== 4113) {
    src.state = 4116;
    src.bufsProcessed = src.bufQueue.length;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  } else if (state === 4113) {
   if (src.state !== 4113) {
    src.state = 4113;
    src.bufsProcessed = 0;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  }
 },
 initSourcePanner: function(src) {
  if (src.type === 4144) {
   return;
  }
  var templateBuf = AL.buffers[0];
  for (var i = 0; i < src.bufQueue.length; i++) {
   if (src.bufQueue[i].id !== 0) {
    templateBuf = src.bufQueue[i];
    break;
   }
  }
  if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
   if (src.panner) {
    return;
   }
   src.panner = src.context.audioCtx.createPanner();
   AL.updateSourceGlobal(src);
   AL.updateSourceSpace(src);
   src.panner.connect(src.context.gain);
   src.gain.disconnect();
   src.gain.connect(src.panner);
  } else {
   if (!src.panner) {
    return;
   }
   src.panner.disconnect();
   src.gain.disconnect();
   src.gain.connect(src.context.gain);
   src.panner = null;
  }
 },
 updateContextGlobal: function(ctx) {
  for (var i in ctx.sources) {
   AL.updateSourceGlobal(ctx.sources[i]);
  }
 },
 updateSourceGlobal: function(src) {
  var panner = src.panner;
  if (!panner) {
   return;
  }
  panner.refDistance = src.refDistance;
  panner.maxDistance = src.maxDistance;
  panner.rolloffFactor = src.rolloffFactor;
  panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
  var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
  switch (distanceModel) {
  case 0:
   panner.distanceModel = "inverse";
   panner.refDistance = 3.40282e38;
   break;

  case 53249:
  case 53250:
   panner.distanceModel = "inverse";
   break;

  case 53251:
  case 53252:
   panner.distanceModel = "linear";
   break;

  case 53253:
  case 53254:
   panner.distanceModel = "exponential";
   break;
  }
 },
 updateListenerSpace: function(ctx) {
  var listener = ctx.audioCtx.listener;
  if (listener.positionX) {
   listener.positionX.value = ctx.listener.position[0];
   listener.positionY.value = ctx.listener.position[1];
   listener.positionZ.value = ctx.listener.position[2];
  } else {
   listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
  }
  if (listener.forwardX) {
   listener.forwardX.value = ctx.listener.direction[0];
   listener.forwardY.value = ctx.listener.direction[1];
   listener.forwardZ.value = ctx.listener.direction[2];
   listener.upX.value = ctx.listener.up[0];
   listener.upY.value = ctx.listener.up[1];
   listener.upZ.value = ctx.listener.up[2];
  } else {
   listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
  }
  for (var i in ctx.sources) {
   AL.updateSourceSpace(ctx.sources[i]);
  }
 },
 updateSourceSpace: function(src) {
  if (!src.panner) {
   return;
  }
  var panner = src.panner;
  var posX = src.position[0];
  var posY = src.position[1];
  var posZ = src.position[2];
  var dirX = src.direction[0];
  var dirY = src.direction[1];
  var dirZ = src.direction[2];
  var listener = src.context.listener;
  var lPosX = listener.position[0];
  var lPosY = listener.position[1];
  var lPosZ = listener.position[2];
  if (src.relative) {
   var lBackX = -listener.direction[0];
   var lBackY = -listener.direction[1];
   var lBackZ = -listener.direction[2];
   var lUpX = listener.up[0];
   var lUpY = listener.up[1];
   var lUpZ = listener.up[2];
   var inverseMagnitude = function(x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z);
    if (length < Number.EPSILON) {
     return 0;
    }
    return 1 / length;
   };
   var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
   lBackX *= invMag;
   lBackY *= invMag;
   lBackZ *= invMag;
   invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
   lUpX *= invMag;
   lUpY *= invMag;
   lUpZ *= invMag;
   var lRightX = lUpY * lBackZ - lUpZ * lBackY;
   var lRightY = lUpZ * lBackX - lUpX * lBackZ;
   var lRightZ = lUpX * lBackY - lUpY * lBackX;
   invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
   lRightX *= invMag;
   lRightY *= invMag;
   lRightZ *= invMag;
   lUpX = lBackY * lRightZ - lBackZ * lRightY;
   lUpY = lBackZ * lRightX - lBackX * lRightZ;
   lUpZ = lBackX * lRightY - lBackY * lRightX;
   var oldX = dirX;
   var oldY = dirY;
   var oldZ = dirZ;
   dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   oldX = posX;
   oldY = posY;
   oldZ = posZ;
   posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   posX += lPosX;
   posY += lPosY;
   posZ += lPosZ;
  }
  if (panner.positionX) {
   if (posX != panner.positionX.value) panner.positionX.value = posX;
   if (posY != panner.positionY.value) panner.positionY.value = posY;
   if (posZ != panner.positionZ.value) panner.positionZ.value = posZ;
  } else {
   panner.setPosition(posX, posY, posZ);
  }
  if (panner.orientationX) {
   if (dirX != panner.orientationX.value) panner.orientationX.value = dirX;
   if (dirY != panner.orientationY.value) panner.orientationY.value = dirY;
   if (dirZ != panner.orientationZ.value) panner.orientationZ.value = dirZ;
  } else {
   panner.setOrientation(dirX, dirY, dirZ);
  }
  var oldShift = src.dopplerShift;
  var velX = src.velocity[0];
  var velY = src.velocity[1];
  var velZ = src.velocity[2];
  var lVelX = listener.velocity[0];
  var lVelY = listener.velocity[1];
  var lVelZ = listener.velocity[2];
  if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
   src.dopplerShift = 1;
  } else {
   var speedOfSound = src.context.speedOfSound;
   var dopplerFactor = src.context.dopplerFactor;
   var slX = lPosX - posX;
   var slY = lPosY - posY;
   var slZ = lPosZ - posZ;
   var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
   var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
   var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
   vls = Math.min(vls, speedOfSound / dopplerFactor);
   vss = Math.min(vss, speedOfSound / dopplerFactor);
   src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
  }
  if (src.dopplerShift !== oldShift) {
   AL.updateSourceRate(src);
  }
 },
 updateSourceRate: function(src) {
  if (src.state === 4114) {
   AL.cancelPendingSourceAudio(src);
   var audioSrc = src.audioQueue[0];
   if (!audioSrc) {
    return;
   }
   var duration;
   if (src.type === 4136 && src.looping) {
    duration = Number.POSITIVE_INFINITY;
   } else {
    duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
   }
   audioSrc._duration = duration;
   audioSrc.playbackRate.value = src.playbackRate;
   AL.scheduleSourceAudio(src);
  }
 },
 sourceDuration: function(src) {
  var length = 0;
  for (var i = 0; i < src.bufQueue.length; i++) {
   var audioBuf = src.bufQueue[i].audioBuf;
   length += audioBuf ? audioBuf.duration : 0;
  }
  return length;
 },
 sourceTell: function(src) {
  AL.updateSourceTime(src);
  var offset = 0;
  for (var i = 0; i < src.bufsProcessed; i++) {
   if (src.bufQueue[i].audioBuf) {
    offset += src.bufQueue[i].audioBuf.duration;
   }
  }
  offset += src.bufOffset;
  return offset;
 },
 sourceSeek: function(src, offset) {
  var playing = src.state == 4114;
  if (playing) {
   AL.setSourceState(src, 4113);
  }
  if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
   src.bufsProcessed = 0;
   while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
    offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
    src.bufsProcessed++;
   }
   src.bufOffset = offset;
  }
  if (playing) {
   AL.setSourceState(src, 4114);
  }
 },
 getGlobalParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 49152:
   return AL.currentCtx.dopplerFactor;

  case 49155:
   return AL.currentCtx.speedOfSound;

  case 53248:
   return AL.currentCtx.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setGlobalParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  switch (param) {
  case 49152:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.dopplerFactor = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 49155:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.speedOfSound = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    AL.currentCtx.distanceModel = value;
    AL.updateContextGlobal(AL.currentCtx);
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getListenerParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 4100:
   return AL.currentCtx.listener.position;

  case 4102:
   return AL.currentCtx.listener.velocity;

  case 4111:
   return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);

  case 4106:
   return AL.currentCtx.gain.gain.value;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setListenerParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  var listener = AL.currentCtx.listener;
  switch (param) {
  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.position[0] = value[0];
   listener.position[1] = value[1];
   listener.position[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.velocity[0] = value[0];
   listener.velocity[1] = value[1];
   listener.velocity[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.gain.gain.value = value;
   break;

  case 4111:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.direction[0] = value[0];
   listener.direction[1] = value[1];
   listener.direction[2] = value[2];
   listener.up[0] = value[3];
   listener.up[1] = value[4];
   listener.up[2] = value[5];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getBufferParam: function(funcname, bufferId, param) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  switch (param) {
  case 8193:
   return buf.frequency;

  case 8194:
   return buf.bytesPerSample * 8;

  case 8195:
   return buf.channels;

  case 8196:
   return buf.length * buf.bytesPerSample * buf.channels;

  case 8213:
   if (buf.length === 0) {
    return [ 0, 0 ];
   } else {
    return [ (buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency ];
   }

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setBufferParam: function(funcname, bufferId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 8196:
   if (value !== 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 8213:
   if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (buf.refCount > 0) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (buf.audioBuf) {
    buf.audioBuf._loopStart = value[0] / buf.frequency;
    buf.audioBuf._loopEnd = value[1] / buf.frequency;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getSourceParam: function(funcname, sourceId, param) {
  if (!AL.currentCtx) {
   return null;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return null;
  }
  switch (param) {
  case 514:
   return src.relative;

  case 4097:
   return src.coneInnerAngle;

  case 4098:
   return src.coneOuterAngle;

  case 4099:
   return src.pitch;

  case 4100:
   return src.position;

  case 4101:
   return src.direction;

  case 4102:
   return src.velocity;

  case 4103:
   return src.looping;

  case 4105:
   if (src.type === 4136) {
    return src.bufQueue[0].id;
   } else {
    return 0;
   }

  case 4106:
   return src.gain.gain.value;

  case 4109:
   return src.minGain;

  case 4110:
   return src.maxGain;

  case 4112:
   return src.state;

  case 4117:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
    return 0;
   } else {
    return src.bufQueue.length;
   }

  case 4118:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
    return 0;
   } else {
    return src.bufsProcessed;
   }

  case 4128:
   return src.refDistance;

  case 4129:
   return src.rolloffFactor;

  case 4130:
   return src.coneOuterGain;

  case 4131:
   return src.maxDistance;

  case 4132:
   return AL.sourceTell(src);

  case 4133:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency;
   }
   return offset;

  case 4134:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
   }
   return offset;

  case 4135:
   return src.type;

  case 4628:
   return src.spatialize;

  case 8201:
   var length = 0;
   var bytesPerFrame = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
    if (src.bufQueue[i].id !== 0) {
     bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
    }
   }
   return length * bytesPerFrame;

  case 8202:
   var length = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
   }
   return length;

  case 8203:
   return AL.sourceDuration(src);

  case 53248:
   return src.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setSourceParam: function(funcname, sourceId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 514:
   if (value === 1) {
    src.relative = true;
    AL.updateSourceSpace(src);
   } else if (value === 0) {
    src.relative = false;
    AL.updateSourceSpace(src);
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4097:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneInnerAngle = value;
   if (src.panner) {
    src.panner.coneInnerAngle = value % 360;
   }
   break;

  case 4098:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterAngle = value;
   if (src.panner) {
    src.panner.coneOuterAngle = value % 360;
   }
   break;

  case 4099:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (src.pitch === value) {
    break;
   }
   src.pitch = value;
   AL.updateSourceRate(src);
   break;

  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.position[0] = value[0];
   src.position[1] = value[1];
   src.position[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4101:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.direction[0] = value[0];
   src.direction[1] = value[1];
   src.direction[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.velocity[0] = value[0];
   src.velocity[1] = value[1];
   src.velocity[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4103:
   if (value === 1) {
    src.looping = true;
    AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = true;
     audioSrc._duration = Number.POSITIVE_INFINITY;
    }
   } else if (value === 0) {
    src.looping = false;
    var currentTime = AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = false;
     audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
     audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
    }
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4105:
   if (src.state === 4114 || src.state === 4115) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (value === 0) {
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 1;
    src.bufQueue[0] = AL.buffers[0];
    src.bufsProcessed = 0;
    src.type = 4144;
   } else {
    var buf = AL.buffers[value];
    if (!buf) {
     AL.currentCtx.err = 40963;
     return;
    }
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 0;
    buf.refCount++;
    src.bufQueue = [ buf ];
    src.bufsProcessed = 0;
    src.type = 4136;
   }
   AL.initSourcePanner(src);
   AL.scheduleSourceAudio(src);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.gain.gain.value = value;
   break;

  case 4109:
   if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.minGain = value;
   break;

  case 4110:
   if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxGain = value;
   break;

  case 4128:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.refDistance = value;
   if (src.panner) {
    src.panner.refDistance = value;
   }
   break;

  case 4129:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.rolloffFactor = value;
   if (src.panner) {
    src.panner.rolloffFactor = value;
   }
   break;

  case 4130:
   if (!Number.isFinite(value) || value < 0 || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterGain = value;
   if (src.panner) {
    src.panner.coneOuterGain = value;
   }
   break;

  case 4131:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxDistance = value;
   if (src.panner) {
    src.panner.maxDistance = value;
   }
   break;

  case 4132:
   if (value < 0 || value > AL.sourceDuration(src)) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4133:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var frequency;
    for (var bufId in src.bufQueue) {
     if (bufId) {
      frequency = src.bufQueue[bufId].frequency;
      break;
     }
    }
    value /= frequency;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4134:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var bytesPerSec;
    for (var bufId in src.bufQueue) {
     if (bufId) {
      var buf = src.bufQueue[bufId];
      bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
      break;
     }
    }
    value /= bytesPerSec;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4628:
   if (value !== 0 && value !== 1 && value !== 2) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.spatialize = value;
   AL.initSourcePanner(src);
   break;

  case 8201:
  case 8202:
  case 8203:
   AL.currentCtx.err = 40964;
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    src.distanceModel = value;
    if (AL.currentCtx.sourceDistanceModel) {
     AL.updateContextGlobal(AL.currentCtx);
    }
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 captures: {},
 sharedCaptureAudioCtx: null,
 requireValidCaptureDevice: function(deviceId, funcname) {
  if (deviceId === 0) {
   AL.alcErr = 40961;
   return null;
  }
  var c = AL.captures[deviceId];
  if (!c) {
   AL.alcErr = 40961;
   return null;
  }
  var err = c.mediaStreamError;
  if (err) {
   AL.alcErr = 40961;
   return null;
  }
  return c;
 }
};

function _alBufferData(bufferId, format, pData, size, freq) {
 if (!AL.currentCtx) {
  return;
 }
 var buf = AL.buffers[bufferId];
 if (!buf) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (freq <= 0) {
  AL.currentCtx.err = 40963;
  return;
 }
 var audioBuf = null;
 try {
  switch (format) {
  case 4352:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
    var channel0 = audioBuf.getChannelData(0);
    for (var i = 0; i < size; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 1;
   buf.length = size;
   break;

  case 4353:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 1;
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 1;
   buf.length = size >> 1;
   break;

  case 4354:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
     channel1[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 2;
   buf.length = size >> 1;
   break;

  case 4355:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 1;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
     channel1[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 2;
   buf.length = size >> 2;
   break;

  case 65552:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 2;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 1;
   buf.length = size >> 2;
   break;

  case 65553:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 2;
    for (var i = 0; i < size >> 3; ++i) {
     channel0[i] = HEAPF32[pData++];
     channel1[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 2;
   buf.length = size >> 3;
   break;

  default:
   AL.currentCtx.err = 40963;
   return;
  }
  buf.frequency = freq;
  buf.audioBuf = audioBuf;
 } catch (e) {
  AL.currentCtx.err = 40963;
  return;
 }
}

function _alDeleteBuffers(count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  if (bufId === 0) {
   continue;
  }
  if (!AL.buffers[bufId]) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (AL.buffers[bufId].refCount) {
   AL.currentCtx.err = 40964;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  if (bufId === 0) {
   continue;
  }
  AL.deviceRefCounts[AL.buffers[bufId].deviceId]--;
  delete AL.buffers[bufId];
  AL.freeIds.push(bufId);
 }
}

function _alSourcei(sourceId, param, value) {
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  AL.setSourceParam("alSourcei", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcei", sourceId, param, null);
  break;
 }
}

function _alDeleteSources(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var srcId = HEAP32[pSourceIds + i * 4 >> 2];
  if (!AL.currentCtx.sources[srcId]) {
   AL.currentCtx.err = 40961;
   return;
  }
 }
 for (var i = 0; i < count; ++i) {
  var srcId = HEAP32[pSourceIds + i * 4 >> 2];
  AL.setSourceState(AL.currentCtx.sources[srcId], 4116);
  _alSourcei(srcId, 4105, 0);
  delete AL.currentCtx.sources[srcId];
  AL.freeIds.push(srcId);
 }
}

function _alGenBuffers(count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var buf = {
   deviceId: AL.currentCtx.deviceId,
   id: AL.newId(),
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  };
  AL.deviceRefCounts[buf.deviceId]++;
  AL.buffers[buf.id] = buf;
  HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
 }
}

function _alGenSources(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var gain = AL.currentCtx.audioCtx.createGain();
  gain.connect(AL.currentCtx.gain);
  var src = {
   context: AL.currentCtx,
   id: AL.newId(),
   type: 4144,
   state: 4113,
   bufQueue: [ AL.buffers[0] ],
   audioQueue: [],
   looping: false,
   pitch: 1,
   dopplerShift: 1,
   gain: gain,
   minGain: 0,
   maxGain: 1,
   panner: null,
   bufsProcessed: 0,
   bufStartTime: Number.NEGATIVE_INFINITY,
   bufOffset: 0,
   relative: false,
   refDistance: 1,
   maxDistance: 3.40282e38,
   rolloffFactor: 1,
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   coneOuterGain: 0,
   coneInnerAngle: 360,
   coneOuterAngle: 360,
   distanceModel: 53250,
   spatialize: 2,
   get playbackRate() {
    return this.pitch * this.dopplerShift;
   }
  };
  AL.currentCtx.sources[src.id] = src;
  HEAP32[pSourceIds + i * 4 >> 2] = src.id;
 }
}

function _alGetError() {
 if (!AL.currentCtx) {
  return 40964;
 } else {
  var err = AL.currentCtx.err;
  AL.currentCtx.err = 0;
  return err;
 }
}

function _alGetSourcei(sourceId, param, pValue) {
 var val = AL.getSourceParam("alGetSourcei", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4112:
 case 4117:
 case 4118:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4135:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  HEAP32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

function _alIsBuffer(bufferId) {
 if (!AL.currentCtx) {
  return false;
 }
 if (bufferId > AL.buffers.length) {
  return false;
 }
 if (!AL.buffers[bufferId]) {
  return false;
 } else {
  return true;
 }
}

function _alListener3f(param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setListenerParam("alListener3f", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListener3f", param, null);
  break;
 }
}

function _alListenerfv(param, pValues) {
 if (!AL.currentCtx) {
  return;
 }
 if (!pValues) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 4100:
 case 4102:
  AL.paramArray[0] = HEAPF32[pValues >> 2];
  AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 case 4111:
  AL.paramArray[0] = HEAPF32[pValues >> 2];
  AL.paramArray[1] = HEAPF32[pValues + 4 >> 2];
  AL.paramArray[2] = HEAPF32[pValues + 8 >> 2];
  AL.paramArray[3] = HEAPF32[pValues + 12 >> 2];
  AL.paramArray[4] = HEAPF32[pValues + 16 >> 2];
  AL.paramArray[5] = HEAPF32[pValues + 20 >> 2];
  AL.setListenerParam("alListenerfv", param, AL.paramArray);
  break;

 default:
  AL.setListenerParam("alListenerfv", param, null);
  break;
 }
}

function _alSource3f(sourceId, param, value0, value1, value2) {
 switch (param) {
 case 4100:
 case 4101:
 case 4102:
  AL.paramArray[0] = value0;
  AL.paramArray[1] = value1;
  AL.paramArray[2] = value2;
  AL.setSourceParam("alSource3f", sourceId, param, AL.paramArray);
  break;

 default:
  AL.setSourceParam("alSource3f", sourceId, param, null);
  break;
 }
}

function _alSourcePause(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4115);
}

function _alSourcePlay(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4114);
}

function _alSourceQueueBuffers(sourceId, count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 if (src.type === 4136) {
  AL.currentCtx.err = 40964;
  return;
 }
 if (count === 0) {
  return;
 }
 var templateBuf = AL.buffers[0];
 for (var i = 0; i < src.bufQueue.length; i++) {
  if (src.bufQueue[i].id !== 0) {
   templateBuf = src.bufQueue[i];
   break;
  }
 }
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  var buf = AL.buffers[bufId];
  if (!buf) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (templateBuf.id !== 0 && (buf.frequency !== templateBuf.frequency || buf.bytesPerSample !== templateBuf.bytesPerSample || buf.channels !== templateBuf.channels)) {
   AL.currentCtx.err = 40964;
  }
 }
 if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
  src.bufQueue.length = 0;
 }
 src.type = 4137;
 for (var i = 0; i < count; ++i) {
  var bufId = HEAP32[pBufferIds + i * 4 >> 2];
  var buf = AL.buffers[bufId];
  buf.refCount++;
  src.bufQueue.push(buf);
 }
 if (src.looping) {
  AL.cancelPendingSourceAudio(src);
 }
 AL.initSourcePanner(src);
 AL.scheduleSourceAudio(src);
}

function _alSourceStop(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4116);
}

function _alSourceUnqueueBuffers(sourceId, count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 if (count > (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 ? 0 : src.bufsProcessed)) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (count === 0) {
  return;
 }
 for (var i = 0; i < count; i++) {
  var buf = src.bufQueue.shift();
  buf.refCount--;
  HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
  src.bufsProcessed--;
 }
 if (src.bufQueue.length === 0) {
  src.bufQueue.push(AL.buffers[0]);
 }
 AL.initSourcePanner(src);
 AL.scheduleSourceAudio(src);
}

function _alSourcef(sourceId, param, value) {
 switch (param) {
 case 4097:
 case 4098:
 case 4099:
 case 4106:
 case 4109:
 case 4110:
 case 4128:
 case 4129:
 case 4130:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 8203:
  AL.setSourceParam("alSourcef", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcef", sourceId, param, null);
  break;
 }
}

function _alcCloseDevice(deviceId) {
 if (!(deviceId in AL.deviceRefCounts) || AL.deviceRefCounts[deviceId] > 0) {
  return 0;
 }
 delete AL.deviceRefCounts[deviceId];
 AL.freeIds.push(deviceId);
 return 1;
}

function listenOnce(object, event, func) {
 object.addEventListener(event, func, {
  "once": true
 });
}

function autoResumeAudioContext(ctx, elements) {
 if (!elements) {
  elements = [ document, document.getElementById("canvas") ];
 }
 [ "keydown", "mousedown", "touchstart" ].forEach(function(event) {
  elements.forEach(function(element) {
   if (element) {
    listenOnce(element, event, function() {
     if (ctx.state === "suspended") ctx.resume();
    });
   }
  });
 });
}

function _alcCreateContext(deviceId, pAttrList) {
 if (!(deviceId in AL.deviceRefCounts)) {
  AL.alcErr = 40961;
  return 0;
 }
 var options = null;
 var attrs = [];
 var hrtf = null;
 pAttrList >>= 2;
 if (pAttrList) {
  var attr = 0;
  var val = 0;
  while (true) {
   attr = HEAP32[pAttrList++];
   attrs.push(attr);
   if (attr === 0) {
    break;
   }
   val = HEAP32[pAttrList++];
   attrs.push(val);
   switch (attr) {
   case 4103:
    if (!options) {
     options = {};
    }
    options.sampleRate = val;
    break;

   case 4112:
   case 4113:
    break;

   case 6546:
    switch (val) {
    case 0:
     hrtf = false;
     break;

    case 1:
     hrtf = true;
     break;

    case 2:
     break;

    default:
     AL.alcErr = 40964;
     return 0;
    }
    break;

   case 6550:
    if (val !== 0) {
     AL.alcErr = 40964;
     return 0;
    }
    break;

   default:
    AL.alcErr = 40964;
    return 0;
   }
  }
 }
 var AudioContext = window.AudioContext || window.webkitAudioContext;
 var ac = null;
 try {
  if (options) {
   ac = new AudioContext(options);
  } else {
   ac = new AudioContext();
  }
 } catch (e) {
  if (e.name === "NotSupportedError") {
   AL.alcErr = 40964;
  } else {
   AL.alcErr = 40961;
  }
  return 0;
 }
 autoResumeAudioContext(ac);
 if (typeof ac.createGain == "undefined") {
  ac.createGain = ac.createGainNode;
 }
 var gain = ac.createGain();
 gain.connect(ac.destination);
 var ctx = {
  deviceId: deviceId,
  id: AL.newId(),
  attrs: attrs,
  audioCtx: ac,
  listener: {
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   up: [ 0, 0, 0 ]
  },
  sources: [],
  interval: setInterval(function() {
   AL.scheduleContextAudio(ctx);
  }, AL.QUEUE_INTERVAL),
  gain: gain,
  distanceModel: 53250,
  speedOfSound: 343.3,
  dopplerFactor: 1,
  sourceDistanceModel: false,
  hrtf: hrtf || false,
  _err: 0,
  get err() {
   return this._err;
  },
  set err(val) {
   if (this._err === 0 || val === 0) {
    this._err = val;
   }
  }
 };
 AL.deviceRefCounts[deviceId]++;
 AL.contexts[ctx.id] = ctx;
 if (hrtf !== null) {
  for (var ctxId in AL.contexts) {
   var c = AL.contexts[ctxId];
   if (c.deviceId === deviceId) {
    c.hrtf = hrtf;
    AL.updateContextGlobal(c);
   }
  }
 }
 return ctx.id;
}

function _alcDestroyContext(contextId) {
 var ctx = AL.contexts[contextId];
 if (AL.currentCtx === ctx) {
  AL.alcErr = 40962;
  return;
 }
 if (AL.contexts[contextId].interval) {
  clearInterval(AL.contexts[contextId].interval);
 }
 AL.deviceRefCounts[ctx.deviceId]--;
 delete AL.contexts[contextId];
 AL.freeIds.push(contextId);
}

function _alcGetContextsDevice(contextId) {
 if (contextId in AL.contexts) {
  return AL.contexts[contextId].deviceId;
 } else {
  return 0;
 }
}

function _alcGetCurrentContext() {
 if (AL.currentCtx !== null) {
  return AL.currentCtx.id;
 } else {
  return 0;
 }
}

function _alcMakeContextCurrent(contextId) {
 if (contextId === 0) {
  AL.currentCtx = null;
  return 0;
 } else {
  AL.currentCtx = AL.contexts[contextId];
  return 1;
 }
}

function _alcOpenDevice(pDeviceName) {
 if (pDeviceName) {
  var name = UTF8ToString(pDeviceName);
  if (name !== AL.DEVICE_NAME) {
   return 0;
  }
 }
 if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
  var deviceId = AL.newId();
  AL.deviceRefCounts[deviceId] = 0;
  return deviceId;
 } else {
  return 0;
 }
}

function _difftime(time1, time0) {
 return time1 - time0;
}

var readAsmConstArgsArray = [];

function readAsmConstArgs(sigPtr, buf) {
 readAsmConstArgsArray.length = 0;
 var ch;
 buf >>= 2;
 while (ch = HEAPU8[sigPtr++]) {
  var readAsmConstArgsDouble = ch < 105;
  if (readAsmConstArgsDouble && buf & 1) buf++;
  readAsmConstArgsArray.push(readAsmConstArgsDouble ? HEAPF64[buf++ >> 1] : HEAP32[buf]);
  ++buf;
 }
 return readAsmConstArgsArray;
}

function _emscripten_asm_const_int(code, sigPtr, argbuf) {
 var args = readAsmConstArgs(sigPtr, argbuf);
 return ASM_CONSTS[code].apply(null, args);
}

function _emscripten_cancel_main_loop() {
 Browser.mainLoop.pause();
 Browser.mainLoop.func = null;
}

function _emscripten_get_heap_max() {
 return 2147483648;
}

function _emscripten_glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}

function _emscripten_glAlphaFunc(func, ref) {
 switch (func) {
 case 512:
 case 513:
 case 514:
 case 515:
 case 516:
 case 517:
 case 518:
 case 519:
  GLEmulation.alphaTestRef = ref;
  if (GLEmulation.alphaTestFunc != func) {
   GLEmulation.alphaTestFunc = func;
   GLImmediate.currentRenderer = null;
  }
  break;

 default:
  break;
 }
}

function _emscripten_glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

function _glEnable(x0) {
 GLctx["enable"](x0);
}

function _glDisable(x0) {
 GLctx["disable"](x0);
}

function _glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}

function writeI53ToI64(ptr, num) {
 HEAPU32[ptr >> 2] = num;
 HEAPU32[ptr + 4 >> 2] = (num - HEAPU32[ptr >> 2]) / 4294967296;
}

function emscriptenWebGLGet(name_, p, type) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;

 case 36344:
  if (type != 0 && type != 1) {
   GL.recordError(1280);
  }
  return;

 case 34814:
 case 36345:
  ret = 0;
  break;

 case 34466:
  var formats = GLctx.getParameter(34467);
  ret = formats ? formats.length : 0;
  break;

 case 33309:
  if (GL.currentContext.version < 2) {
   GL.recordError(1282);
   return;
  }
  var exts = GLctx.getSupportedExtensions() || [];
  ret = 2 * exts.length;
  break;

 case 33307:
 case 33308:
  if (GL.currentContext.version < 2) {
   GL.recordError(1280);
   return;
  }
  ret = name_ == 33307 ? 3 : 0;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;

  case "boolean":
   ret = result ? 1 : 0;
   break;

  case "string":
   GL.recordError(1280);
   return;

  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34229:
    case 36662:
    case 36663:
    case 35053:
    case 35055:
    case 36010:
    case 35097:
    case 35869:
    case 32874:
    case 36389:
    case 35983:
    case 35368:
    case 34068:
     {
      ret = 0;
      break;
     }

    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case 0:
      HEAP32[p + i * 4 >> 2] = result[i];
      break;

     case 2:
      HEAPF32[p + i * 4 >> 2] = result[i];
      break;

     case 4:
      HEAP8[p + i >> 0] = result[i] ? 1 : 0;
      break;
     }
    }
    return;
   } else {
    try {
     ret = result.name | 0;
    } catch (e) {
     GL.recordError(1280);
     err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
     return;
    }
   }
   break;

  default:
   GL.recordError(1280);
   err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof result + "!");
   return;
  }
 }
 switch (type) {
 case 1:
  writeI53ToI64(p, ret);
  break;

 case 0:
  HEAP32[p >> 2] = ret;
  break;

 case 2:
  HEAPF32[p >> 2] = ret;
  break;

 case 4:
  HEAP8[p >> 0] = ret ? 1 : 0;
  break;
 }
}

function _glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, 4);
}

function _glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, 0);
}

function stringToNewUTF8(jsString) {
 var length = lengthBytesUTF8(jsString) + 1;
 var cString = _malloc(length);
 stringToUTF8(jsString, cString, length);
 return cString;
}

function _glGetString(name_) {
 var ret = GL.stringCache[name_];
 if (!ret) {
  switch (name_) {
  case 7939:
   var exts = GLctx.getSupportedExtensions() || [];
   exts = exts.concat(exts.map(function(e) {
    return "GL_" + e;
   }));
   ret = stringToNewUTF8(exts.join(" "));
   break;

  case 7936:
  case 7937:
  case 37445:
  case 37446:
   var s = GLctx.getParameter(name_);
   if (!s) {
    GL.recordError(1280);
   }
   ret = s && stringToNewUTF8(s);
   break;

  case 7938:
   var glVersion = GLctx.getParameter(7938);
   if (true) glVersion = "OpenGL ES 3.0 (" + glVersion + ")"; else {
    glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
   }
   ret = stringToNewUTF8(glVersion);
   break;

  case 35724:
   var glslVersion = GLctx.getParameter(35724);
   var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
   var ver_num = glslVersion.match(ver_re);
   if (ver_num !== null) {
    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
    glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
   }
   ret = stringToNewUTF8(glslVersion);
   break;

  default:
   GL.recordError(1280);
  }
  GL.stringCache[name_] = ret;
 }
 return ret;
}

function _glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}

function _glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}

function _glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}

function _glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

function _glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}

function _glUseProgram(program) {
 program = GL.programs[program];
 GLctx.useProgram(program);
 GLctx.currentProgram = program;
}

function _glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
}

function _glBindAttribLocation(program, index, name) {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}

function _glLinkProgram(program) {
 program = GL.programs[program];
 GLctx.linkProgram(program);
 program.uniformLocsById = 0;
 program.uniformSizeAndIdsByName = {};
}

function _glBindBuffer(target, buffer) {
 if (target == 34962) {
  GLctx.currentArrayBufferBinding = buffer;
  GLImmediate.lastArrayBuffer = buffer;
 } else if (target == 34963) {
  GLctx.currentElementArrayBufferBinding = buffer;
 }
 if (target == 35051) {
  GLctx.currentPixelPackBufferBinding = buffer;
 } else if (target == 35052) {
  GLctx.currentPixelUnpackBufferBinding = buffer;
 }
 GLctx.bindBuffer(target, GL.buffers[buffer]);
}

function _glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, 2);
}

function _glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}

function _glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}

function _glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}

function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

function _glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}

var GLEmulation = {
 fogStart: 0,
 fogEnd: 1,
 fogDensity: 1,
 fogColor: null,
 fogMode: 2048,
 fogEnabled: false,
 MAX_CLIP_PLANES: 6,
 clipPlaneEnabled: [ false, false, false, false, false, false ],
 clipPlaneEquation: [],
 lightingEnabled: false,
 lightModelAmbient: null,
 lightModelLocalViewer: false,
 lightModelTwoSide: false,
 materialAmbient: null,
 materialDiffuse: null,
 materialSpecular: null,
 materialShininess: null,
 materialEmission: null,
 MAX_LIGHTS: 8,
 lightEnabled: [ false, false, false, false, false, false, false, false ],
 lightAmbient: [],
 lightDiffuse: [],
 lightSpecular: [],
 lightPosition: [],
 alphaTestEnabled: false,
 alphaTestFunc: 519,
 alphaTestRef: 0,
 pointSize: 1,
 vaos: [],
 currentVao: null,
 enabledVertexAttribArrays: {},
 hasRunInit: false,
 findToken: function(source, token) {
  function isIdentChar(ch) {
   if (ch >= 48 && ch <= 57) return true;
   if (ch >= 65 && ch <= 90) return true;
   if (ch >= 97 && ch <= 122) return true;
   return false;
  }
  var i = -1;
  do {
   i = source.indexOf(token, i + 1);
   if (i < 0) {
    break;
   }
   if (i > 0 && isIdentChar(source[i - 1])) {
    continue;
   }
   i += token.length;
   if (i < source.length - 1 && isIdentChar(source[i + 1])) {
    continue;
   }
   return true;
  } while (true);
  return false;
 },
 init: function() {
  if (GLEmulation.hasRunInit) {
   return;
  }
  GLEmulation.hasRunInit = true;
  GLEmulation.fogColor = new Float32Array(4);
  for (var clipPlaneId = 0; clipPlaneId < GLEmulation.MAX_CLIP_PLANES; clipPlaneId++) {
   GLEmulation.clipPlaneEquation[clipPlaneId] = new Float32Array(4);
  }
  GLEmulation.lightModelAmbient = new Float32Array([ .2, .2, .2, 1 ]);
  GLEmulation.materialAmbient = new Float32Array([ .2, .2, .2, 1 ]);
  GLEmulation.materialDiffuse = new Float32Array([ .8, .8, .8, 1 ]);
  GLEmulation.materialSpecular = new Float32Array([ 0, 0, 0, 1 ]);
  GLEmulation.materialShininess = new Float32Array([ 0 ]);
  GLEmulation.materialEmission = new Float32Array([ 0, 0, 0, 1 ]);
  for (var lightId = 0; lightId < GLEmulation.MAX_LIGHTS; lightId++) {
   GLEmulation.lightAmbient[lightId] = new Float32Array([ 0, 0, 0, 1 ]);
   GLEmulation.lightDiffuse[lightId] = lightId ? new Float32Array([ 0, 0, 0, 1 ]) : new Float32Array([ 1, 1, 1, 1 ]);
   GLEmulation.lightSpecular[lightId] = lightId ? new Float32Array([ 0, 0, 0, 1 ]) : new Float32Array([ 1, 1, 1, 1 ]);
   GLEmulation.lightPosition[lightId] = new Float32Array([ 0, 0, 1, 0 ]);
  }
  err("WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work.");
  var validCapabilities = {
   2884: 1,
   3042: 1,
   3024: 1,
   2960: 1,
   2929: 1,
   3089: 1,
   32823: 1,
   32926: 1,
   32928: 1
  };
  var glEnable = _glEnable;
  _glEnable = _emscripten_glEnable = (cap => {
   if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
   if (cap == 2912) {
    if (GLEmulation.fogEnabled != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.fogEnabled = true;
    }
    return;
   } else if (cap >= 12288 && cap < 12294) {
    var clipPlaneId = cap - 12288;
    if (GLEmulation.clipPlaneEnabled[clipPlaneId] != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.clipPlaneEnabled[clipPlaneId] = true;
    }
    return;
   } else if (cap >= 16384 && cap < 16392) {
    var lightId = cap - 16384;
    if (GLEmulation.lightEnabled[lightId] != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.lightEnabled[lightId] = true;
    }
    return;
   } else if (cap == 2896) {
    if (GLEmulation.lightingEnabled != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.lightingEnabled = true;
    }
    return;
   } else if (cap == 3008) {
    if (GLEmulation.alphaTestEnabled != true) {
     GLImmediate.currentRenderer = null;
     GLEmulation.alphaTestEnabled = true;
    }
    return;
   } else if (cap == 3168 || cap == 3169) {
    var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
    if (cap == 3168) GLImmediate.textureGenS[texUnit] = true;
    else GLImmediate.textureGenT[texUnit] = true;
    GLImmediate.currentRenderer = null;
    return;
   } else if (cap == 3168 || cap == 3169) {
    var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
    if (cap == 3168) GLImmediate.textureGenS[texUnit] = false;
    else GLImmediate.textureGenT[texUnit] = false;
    GLImmediate.currentRenderer = null;
    return;
   } else if (cap == 3553) {
    return;
   } else if (!(cap in validCapabilities)) {
    return;
   }
   glEnable(cap);
  });
  var glDisable = _glDisable;
  _glDisable = _emscripten_glDisable = (cap => {
   if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
   if (cap == 2912) {
    if (GLEmulation.fogEnabled != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.fogEnabled = false;
    }
    return;
   } else if (cap >= 12288 && cap < 12294) {
    var clipPlaneId = cap - 12288;
    if (GLEmulation.clipPlaneEnabled[clipPlaneId] != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.clipPlaneEnabled[clipPlaneId] = false;
    }
    return;
   } else if (cap >= 16384 && cap < 16392) {
    var lightId = cap - 16384;
    if (GLEmulation.lightEnabled[lightId] != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.lightEnabled[lightId] = false;
    }
    return;
   } else if (cap == 2896) {
    if (GLEmulation.lightingEnabled != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.lightingEnabled = false;
    }
    return;
   } else if (cap == 3008) {
    if (GLEmulation.alphaTestEnabled != false) {
     GLImmediate.currentRenderer = null;
     GLEmulation.alphaTestEnabled = false;
    }
    return;
   } else if (cap == 3553) {
    return;
   } else if (!(cap in validCapabilities)) {
    return;
   }
   glDisable(cap);
  });
  _glIsEnabled = _emscripten_glIsEnabled = (cap => {
   if (cap == 2912) {
    return GLEmulation.fogEnabled ? 1 : 0;
   } else if (cap >= 12288 && cap < 12294) {
    var clipPlaneId = cap - 12288;
    return GLEmulation.clipPlaneEnabled[clipPlaneId] ? 1 : 0;
   } else if (cap >= 16384 && cap < 16392) {
    var lightId = cap - 16384;
    return GLEmulation.lightEnabled[lightId] ? 1 : 0;
   } else if (cap == 2896) {
    return GLEmulation.lightingEnabled ? 1 : 0;
   } else if (cap == 3008) {
    return GLEmulation.alphaTestEnabled ? 1 : 0;
   } else if (cap == 3168) {
    return GLImmediate.textureGenS[GLImmediate.TexEnvJIT.getActiveTexture()] ? 1 : 0;
   } else if (cap == 3169) {
    return GLImmediate.textureGenT[GLImmediate.TexEnvJIT.getActiveTexture()] ? 1 : 0;
   } else if (!(cap in validCapabilities)) {
    return 0;
   }
   return GLctx.isEnabled(cap);
  });
  var glGetBooleanv = _glGetBooleanv;
  _glGetBooleanv = _emscripten_glGetBooleanv = ((pname, p) => {
   var attrib = GLEmulation.getAttributeFromCapability(pname);
   if (attrib !== null) {
    var result = GLImmediate.enabledClientAttributes[attrib];
    HEAP8[p >> 0] = result === true ? 1 : 0;
    return;
   }
   glGetBooleanv(pname, p);
  });
  var glGetIntegerv = _glGetIntegerv;
  _glGetIntegerv = _emscripten_glGetIntegerv = ((pname, params) => {
   switch (pname) {
   case 34018:
    pname = GLctx.MAX_TEXTURE_IMAGE_UNITS;
    break;

   case 35658:
    {
     var result = GLctx.getParameter(GLctx.MAX_VERTEX_UNIFORM_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }

   case 35657:
    {
     var result = GLctx.getParameter(GLctx.MAX_FRAGMENT_UNIFORM_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }

   case 35659:
    {
     var result = GLctx.getParameter(GLctx.MAX_VARYING_VECTORS);
     HEAP32[params >> 2] = result * 4;
     return;
    }

   case 34929:
    pname = GLctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS;
    break;

   case 32890:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }

   case 32891:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }

   case 32892:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }

   case 32897:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }

   case 32898:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }

   case 32899:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }

   case 32904:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.size : 0;
     return;
    }

   case 32905:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.type : 0;
     return;
    }

   case 32906:
    {
     var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
     HEAP32[params >> 2] = attribute ? attribute.stride : 0;
     return;
    }

   case 3378:
    {
     HEAP32[params >> 2] = GLEmulation.MAX_CLIP_PLANES;
     return;
    }

   case 2976:
    {
     HEAP32[params >> 2] = GLImmediate.currentMatrix + 5888;
     return;
    }

   case 3009:
    {
     HEAP32[params >> 2] = GLEmulation.alphaTestFunc;
     return;
    }
   }
   glGetIntegerv(pname, params);
  });
  var glGetString = _glGetString;
  _glGetString = _emscripten_glGetString = (name_ => {
   if (GL.stringCache[name_]) return GL.stringCache[name_];
   switch (name_) {
   case 7939:
    var ret = stringToNewUTF8((GLctx.getSupportedExtensions() || []).join(" ") + " GL_EXT_texture_env_combine GL_ARB_texture_env_crossbar GL_ATI_texture_env_combine3 GL_NV_texture_env_combine4 GL_EXT_texture_env_dot3 GL_ARB_multitexture GL_ARB_vertex_buffer_object GL_EXT_framebuffer_object GL_ARB_vertex_program GL_ARB_fragment_program GL_ARB_shading_language_100 GL_ARB_shader_objects GL_ARB_vertex_shader GL_ARB_fragment_shader GL_ARB_texture_cube_map GL_EXT_draw_range_elements" + (GL.currentContext.compressionExt ? " GL_ARB_texture_compression GL_EXT_texture_compression_s3tc" : "") + (GL.currentContext.anisotropicExt ? " GL_EXT_texture_filter_anisotropic" : ""));
    GL.stringCache[name_] = ret;
    return ret;
   }
   return glGetString(name_);
  });
  GL.shaderInfos = {};
  var glCreateShader = _glCreateShader;
  _glCreateShader = _emscripten_glCreateShader = (shaderType => {
   var id = glCreateShader(shaderType);
   GL.shaderInfos[id] = {
    type: shaderType,
    ftransform: false
   };
   return id;
  });
  function ensurePrecision(source) {
   if (!/precision +(low|medium|high)p +float *;/.test(source)) {
    source = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n" + source;
   }
   return source;
  }
  _glShaderSource = _emscripten_glShaderSource = ((shader, count, string, length) => {
   var source = GL.getSource(shader, count, string, length);
   if (GL.shaderInfos[shader].type == GLctx.VERTEX_SHADER) {
    var has_pm = source.search(/u_projection/) >= 0;
    var has_mm = source.search(/u_modelView/) >= 0;
    var has_pv = source.search(/a_position/) >= 0;
    var need_pm = 0, need_mm = 0, need_pv = 0;
    var old = source;
    source = source.replace(/ftransform\(\)/g, "(u_projection * u_modelView * a_position)");
    if (old != source) need_pm = need_mm = need_pv = 1;
    old = source;
    source = source.replace(/gl_ProjectionMatrix/g, "u_projection");
    if (old != source) need_pm = 1;
    old = source;
    source = source.replace(/gl_ModelViewMatrixTranspose\[2\]/g, "vec4(u_modelView[0][2], u_modelView[1][2], u_modelView[2][2], u_modelView[3][2])");
    if (old != source) need_mm = 1;
    old = source;
    source = source.replace(/gl_ModelViewMatrix/g, "u_modelView");
    if (old != source) need_mm = 1;
    old = source;
    source = source.replace(/gl_Vertex/g, "a_position");
    if (old != source) need_pv = 1;
    old = source;
    source = source.replace(/gl_ModelViewProjectionMatrix/g, "(u_projection * u_modelView)");
    if (old != source) need_pm = need_mm = 1;
    if (need_pv && !has_pv) source = "attribute vec4 a_position; \n" + source;
    if (need_mm && !has_mm) source = "uniform mat4 u_modelView; \n" + source;
    if (need_pm && !has_pm) source = "uniform mat4 u_projection; \n" + source;
    GL.shaderInfos[shader].ftransform = need_pm || need_mm || need_pv;
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     old = source;
     var need_vtc = source.search("v_texCoord" + i) == -1;
     source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i).replace(new RegExp("gl_MultiTexCoord" + i, "g"), "a_texCoord" + i);
     if (source != old) {
      source = "attribute vec4 a_texCoord" + i + "; \n" + source;
      if (need_vtc) {
       source = "varying vec4 v_texCoord" + i + ";   \n" + source;
      }
     }
     old = source;
     source = source.replace(new RegExp("gl_TextureMatrix\\[" + i + "\\]", "g"), "u_textureMatrix" + i);
     if (source != old) {
      source = "uniform mat4 u_textureMatrix" + i + "; \n" + source;
     }
    }
    if (source.includes("gl_FrontColor")) {
     source = "varying vec4 v_color; \n" + source.replace(/gl_FrontColor/g, "v_color");
    }
    if (source.includes("gl_Color")) {
     source = "attribute vec4 a_color; \n" + source.replace(/gl_Color/g, "a_color");
    }
    if (source.includes("gl_Normal")) {
     source = "attribute vec3 a_normal; \n" + source.replace(/gl_Normal/g, "a_normal");
    }
    if (source.includes("gl_FogFragCoord")) {
     source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord");
    }
   } else {
    for (i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     old = source;
     source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i);
     if (source != old) {
      source = "varying vec4 v_texCoord" + i + ";   \n" + source;
     }
    }
    if (source.includes("gl_Color")) {
     source = "varying vec4 v_color; \n" + source.replace(/gl_Color/g, "v_color");
    }
    if (source.includes("gl_Fog.color")) {
     source = "uniform vec4 u_fogColor;   \n" + source.replace(/gl_Fog.color/g, "u_fogColor");
    }
    if (source.includes("gl_Fog.end")) {
     source = "uniform float u_fogEnd;   \n" + source.replace(/gl_Fog.end/g, "u_fogEnd");
    }
    if (source.includes("gl_Fog.scale")) {
     source = "uniform float u_fogScale;   \n" + source.replace(/gl_Fog.scale/g, "u_fogScale");
    }
    if (source.includes("gl_Fog.density")) {
     source = "uniform float u_fogDensity;   \n" + source.replace(/gl_Fog.density/g, "u_fogDensity");
    }
    if (source.includes("gl_FogFragCoord")) {
     source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord");
    }
    source = ensurePrecision(source);
   }
   GLctx.shaderSource(GL.shaders[shader], source);
  });
  _glCompileShader = _emscripten_glCompileShader = (shader => {
   GLctx.compileShader(GL.shaders[shader]);
  });
  GL.programShaders = {};
  var glAttachShader = _glAttachShader;
  _glAttachShader = _emscripten_glAttachShader = ((program, shader) => {
   if (!GL.programShaders[program]) GL.programShaders[program] = [];
   GL.programShaders[program].push(shader);
   glAttachShader(program, shader);
  });
  var glDetachShader = _glDetachShader;
  _glDetachShader = _emscripten_glDetachShader = ((program, shader) => {
   var programShader = GL.programShaders[program];
   if (!programShader) {
    err("WARNING: _glDetachShader received invalid program: " + program);
    return;
   }
   var index = programShader.indexOf(shader);
   programShader.splice(index, 1);
   glDetachShader(program, shader);
  });
  var glUseProgram = _glUseProgram;
  _glUseProgram = _emscripten_glUseProgram = (program => {
   if (GL.currProgram != program) {
    GLImmediate.currentRenderer = null;
    GL.currProgram = program;
    GLImmediate.fixedFunctionProgram = 0;
    glUseProgram(program);
   }
  });
  var glDeleteProgram = _glDeleteProgram;
  _glDeleteProgram = _emscripten_glDeleteProgram = (program => {
   glDeleteProgram(program);
   if (program == GL.currProgram) {
    GLImmediate.currentRenderer = null;
    GL.currProgram = 0;
   }
  });
  var zeroUsedPrograms = {};
  var glBindAttribLocation = _glBindAttribLocation;
  _glBindAttribLocation = _emscripten_glBindAttribLocation = ((program, index, name) => {
   if (index == 0) zeroUsedPrograms[program] = true;
   glBindAttribLocation(program, index, name);
  });
  var glLinkProgram = _glLinkProgram;
  _glLinkProgram = _emscripten_glLinkProgram = (program => {
   if (!(program in zeroUsedPrograms)) {
    GLctx.bindAttribLocation(GL.programs[program], 0, "a_position");
   }
   glLinkProgram(program);
  });
  var glBindBuffer = _glBindBuffer;
  _glBindBuffer = _emscripten_glBindBuffer = ((target, buffer) => {
   glBindBuffer(target, buffer);
   if (target == GLctx.ARRAY_BUFFER) {
    if (GLEmulation.currentVao) {
     GLEmulation.currentVao.arrayBuffer = buffer;
    }
   } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
    if (GLEmulation.currentVao) GLEmulation.currentVao.elementArrayBuffer = buffer;
   }
  });
  var glGetFloatv = _glGetFloatv;
  _glGetFloatv = _emscripten_glGetFloatv = ((pname, params) => {
   if (pname == 2982) {
    HEAPF32.set(GLImmediate.matrix[0], params >> 2);
   } else if (pname == 2983) {
    HEAPF32.set(GLImmediate.matrix[1], params >> 2);
   } else if (pname == 2984) {
    HEAPF32.set(GLImmediate.matrix[2 + GLImmediate.clientActiveTexture], params >> 2);
   } else if (pname == 2918) {
    HEAPF32.set(GLEmulation.fogColor, params >> 2);
   } else if (pname == 2915) {
    HEAPF32[params >> 2] = GLEmulation.fogStart;
   } else if (pname == 2916) {
    HEAPF32[params >> 2] = GLEmulation.fogEnd;
   } else if (pname == 2914) {
    HEAPF32[params >> 2] = GLEmulation.fogDensity;
   } else if (pname == 2917) {
    HEAPF32[params >> 2] = GLEmulation.fogMode;
   } else if (pname == 2899) {
    HEAPF32[params >> 2] = GLEmulation.lightModelAmbient[0];
    HEAPF32[params + 4 >> 2] = GLEmulation.lightModelAmbient[1];
    HEAPF32[params + 8 >> 2] = GLEmulation.lightModelAmbient[2];
    HEAPF32[params + 12 >> 2] = GLEmulation.lightModelAmbient[3];
   } else if (pname == 3010) {
    HEAPF32[params >> 2] = GLEmulation.alphaTestRef;
   } else {
    glGetFloatv(pname, params);
   }
  });
  var glHint = _glHint;
  _glHint = _emscripten_glHint = ((target, mode) => {
   if (target == 34031) {
    return;
   }
   glHint(target, mode);
  });
  var glEnableVertexAttribArray = _glEnableVertexAttribArray;
  _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray = (index => {
   glEnableVertexAttribArray(index);
   GLEmulation.enabledVertexAttribArrays[index] = 1;
   if (GLEmulation.currentVao) GLEmulation.currentVao.enabledVertexAttribArrays[index] = 1;
  });
  var glDisableVertexAttribArray = _glDisableVertexAttribArray;
  _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray = (index => {
   glDisableVertexAttribArray(index);
   delete GLEmulation.enabledVertexAttribArrays[index];
   if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledVertexAttribArrays[index];
  });
  var glVertexAttribPointer = _glVertexAttribPointer;
  _glVertexAttribPointer = _emscripten_glVertexAttribPointer = ((index, size, type, normalized, stride, pointer) => {
   glVertexAttribPointer(index, size, type, normalized, stride, pointer);
   if (GLEmulation.currentVao) {
    GLEmulation.currentVao.vertexAttribPointers[index] = [ index, size, type, normalized, stride, pointer ];
   }
  });
 },
 getAttributeFromCapability: function(cap) {
  var attrib = null;
  switch (cap) {
  case 3553:
  case 32888:
   attrib = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture;
   break;

  case 32884:
   attrib = GLImmediate.VERTEX;
   break;

  case 32885:
   attrib = GLImmediate.NORMAL;
   break;

  case 32886:
   attrib = GLImmediate.COLOR;
   break;
  }
  return attrib;
 }
};

var GLImmediate = {
 MapTreeLib: null,
 spawnMapTreeLib: function() {
  function CNaiveListMap() {
   var list = [];
   this.insert = function CNaiveListMap_insert(key, val) {
    if (this.contains(key | 0)) return false;
    list.push([ key, val ]);
    return true;
   };
   var __contains_i;
   this.contains = function CNaiveListMap_contains(key) {
    for (__contains_i = 0; __contains_i < list.length; ++__contains_i) {
     if (list[__contains_i][0] === key) return true;
    }
    return false;
   };
   var __get_i;
   this.get = function CNaiveListMap_get(key) {
    for (__get_i = 0; __get_i < list.length; ++__get_i) {
     if (list[__get_i][0] === key) return list[__get_i][1];
    }
    return undefined;
   };
  }
  function CMapTree() {
   function CNLNode() {
    var map = new CNaiveListMap();
    this.child = function CNLNode_child(keyFrag) {
     if (!map.contains(keyFrag | 0)) {
      map.insert(keyFrag | 0, new CNLNode());
     }
     return map.get(keyFrag | 0);
    };
    this.value = undefined;
    this.get = function CNLNode_get() {
     return this.value;
    };
    this.set = function CNLNode_set(val) {
     this.value = val;
    };
   }
   function CKeyView(root) {
    var cur;
    this.reset = function CKeyView_reset() {
     cur = root;
     return this;
    };
    this.reset();
    this.next = function CKeyView_next(keyFrag) {
     cur = cur.child(keyFrag);
     return this;
    };
    this.get = function CKeyView_get() {
     return cur.get();
    };
    this.set = function CKeyView_set(val) {
     cur.set(val);
    };
   }
   var root;
   var staticKeyView;
   this.createKeyView = function CNLNode_createKeyView() {
    return new CKeyView(root);
   };
   this.clear = function CNLNode_clear() {
    root = new CNLNode();
    staticKeyView = this.createKeyView();
   };
   this.clear();
   this.getStaticKeyView = function CNLNode_getStaticKeyView() {
    staticKeyView.reset();
    return staticKeyView;
   };
  }
  return {
   create: function() {
    return new CMapTree();
   }
  };
 },
 TexEnvJIT: null,
 spawnTexEnvJIT: function() {
  var GL_TEXTURE0 = 33984;
  var GL_TEXTURE_1D = 3552;
  var GL_TEXTURE_2D = 3553;
  var GL_TEXTURE_3D = 32879;
  var GL_TEXTURE_CUBE_MAP = 34067;
  var GL_TEXTURE_ENV = 8960;
  var GL_TEXTURE_ENV_MODE = 8704;
  var GL_TEXTURE_ENV_COLOR = 8705;
  var GL_SRC0_RGB = 34176;
  var GL_SRC1_RGB = 34177;
  var GL_SRC2_RGB = 34178;
  var GL_SRC0_ALPHA = 34184;
  var GL_SRC1_ALPHA = 34185;
  var GL_SRC2_ALPHA = 34186;
  var GL_OPERAND0_RGB = 34192;
  var GL_OPERAND1_RGB = 34193;
  var GL_OPERAND2_RGB = 34194;
  var GL_OPERAND0_ALPHA = 34200;
  var GL_OPERAND1_ALPHA = 34201;
  var GL_OPERAND2_ALPHA = 34202;
  var GL_COMBINE_RGB = 34161;
  var GL_COMBINE_ALPHA = 34162;
  var GL_RGB_SCALE = 34163;
  var GL_ALPHA_SCALE = 3356;
  var GL_ADD = 260;
  var GL_BLEND = 3042;
  var GL_REPLACE = 7681;
  var GL_MODULATE = 8448;
  var GL_DECAL = 8449;
  var GL_COMBINE = 34160;
  var GL_SUBTRACT = 34023;
  var GL_INTERPOLATE = 34165;
  var GL_TEXTURE = 5890;
  var GL_CONSTANT = 34166;
  var GL_PRIMARY_COLOR = 34167;
  var GL_PREVIOUS = 34168;
  var GL_SRC_COLOR = 768;
  var GL_ONE_MINUS_SRC_COLOR = 769;
  var GL_SRC_ALPHA = 770;
  var GL_ONE_MINUS_SRC_ALPHA = 771;
  var TEXENVJIT_NAMESPACE_PREFIX = "tej_";
  var TEX_UNIT_UNIFORM_PREFIX = "uTexUnit";
  var TEX_COORD_VARYING_PREFIX = "vTexCoord";
  var PRIM_COLOR_VARYING = "vPrimColor";
  var TEX_MATRIX_UNIFORM_PREFIX = "uTexMatrix";
  var s_texUnits = null;
  var s_activeTexture = 0;
  var s_requiredTexUnitsForPass = [];
  function abort(info) {
   assert(false, "[TexEnvJIT] ABORT: " + info);
  }
  function abort_noSupport(info) {
   abort("No support: " + info);
  }
  function abort_sanity(info) {
   abort("Sanity failure: " + info);
  }
  function genTexUnitSampleExpr(texUnitID) {
   var texUnit = s_texUnits[texUnitID];
   var texType = texUnit.getTexType();
   var func = null;
   switch (texType) {
   case GL_TEXTURE_1D:
    func = "texture2D";
    break;

   case GL_TEXTURE_2D:
    func = "texture2D";
    break;

   case GL_TEXTURE_3D:
    return abort_noSupport("No support for 3D textures.");

   case GL_TEXTURE_CUBE_MAP:
    func = "textureCube";
    break;

   default:
    return abort_sanity("Unknown texType: 0x" + texType.toString(16));
   }
   var texCoordExpr = TEX_COORD_VARYING_PREFIX + texUnitID;
   if (TEX_MATRIX_UNIFORM_PREFIX != null) {
    texCoordExpr = "(" + TEX_MATRIX_UNIFORM_PREFIX + texUnitID + " * " + texCoordExpr + ")";
   }
   return func + "(" + TEX_UNIT_UNIFORM_PREFIX + texUnitID + ", " + texCoordExpr + ".xy)";
  }
  function getTypeFromCombineOp(op) {
   switch (op) {
   case GL_SRC_COLOR:
   case GL_ONE_MINUS_SRC_COLOR:
    return "vec3";

   case GL_SRC_ALPHA:
   case GL_ONE_MINUS_SRC_ALPHA:
    return "float";
   }
   return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
  }
  function getCurTexUnit() {
   return s_texUnits[s_activeTexture];
  }
  function genCombinerSourceExpr(texUnitID, constantExpr, previousVar, src, op) {
   var srcExpr = null;
   switch (src) {
   case GL_TEXTURE:
    srcExpr = genTexUnitSampleExpr(texUnitID);
    break;

   case GL_CONSTANT:
    srcExpr = constantExpr;
    break;

   case GL_PRIMARY_COLOR:
    srcExpr = PRIM_COLOR_VARYING;
    break;

   case GL_PREVIOUS:
    srcExpr = previousVar;
    break;

   default:
    return abort_noSupport("Unsupported combiner src: 0x" + src.toString(16));
   }
   var expr = null;
   switch (op) {
   case GL_SRC_COLOR:
    expr = srcExpr + ".rgb";
    break;

   case GL_ONE_MINUS_SRC_COLOR:
    expr = "(vec3(1.0) - " + srcExpr + ".rgb)";
    break;

   case GL_SRC_ALPHA:
    expr = srcExpr + ".a";
    break;

   case GL_ONE_MINUS_SRC_ALPHA:
    expr = "(1.0 - " + srcExpr + ".a)";
    break;

   default:
    return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16));
   }
   return expr;
  }
  function valToFloatLiteral(val) {
   if (val == Math.round(val)) return val + ".0";
   return val;
  }
  function CTexEnv() {
   this.mode = GL_MODULATE;
   this.colorCombiner = GL_MODULATE;
   this.alphaCombiner = GL_MODULATE;
   this.colorScale = 1;
   this.alphaScale = 1;
   this.envColor = [ 0, 0, 0, 0 ];
   this.colorSrc = [ GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT ];
   this.alphaSrc = [ GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT ];
   this.colorOp = [ GL_SRC_COLOR, GL_SRC_COLOR, GL_SRC_ALPHA ];
   this.alphaOp = [ GL_SRC_ALPHA, GL_SRC_ALPHA, GL_SRC_ALPHA ];
   this.traverseKey = {
    7681: 0,
    8448: 1,
    260: 2,
    3042: 3,
    8449: 4,
    34160: 5,
    34023: 3,
    34165: 4,
    5890: 0,
    34166: 1,
    34167: 2,
    34168: 3,
    768: 0,
    769: 1,
    770: 2,
    771: 3
   };
   this.key0 = -1;
   this.key1 = 0;
   this.key2 = 0;
   this.computeKey0 = function() {
    var k = this.traverseKey;
    var key = k[this.mode] * 1638400;
    key += k[this.colorCombiner] * 327680;
    key += k[this.alphaCombiner] * 65536;
    key += (this.colorScale - 1) * 16384;
    key += (this.alphaScale - 1) * 4096;
    key += k[this.colorSrc[0]] * 1024;
    key += k[this.colorSrc[1]] * 256;
    key += k[this.colorSrc[2]] * 64;
    key += k[this.alphaSrc[0]] * 16;
    key += k[this.alphaSrc[1]] * 4;
    key += k[this.alphaSrc[2]];
    return key;
   };
   this.computeKey1 = function() {
    var k = this.traverseKey;
    var key = k[this.colorOp[0]] * 4096;
    key += k[this.colorOp[1]] * 1024;
    key += k[this.colorOp[2]] * 256;
    key += k[this.alphaOp[0]] * 16;
    key += k[this.alphaOp[1]] * 4;
    key += k[this.alphaOp[2]];
    return key;
   };
   this.computeKey2 = function() {
    return this.envColor[0] * 16777216 + this.envColor[1] * 65536 + this.envColor[2] * 256 + 1 + this.envColor[3];
   };
   this.recomputeKey = function() {
    this.key0 = this.computeKey0();
    this.key1 = this.computeKey1();
    this.key2 = this.computeKey2();
   };
   this.invalidateKey = function() {
    this.key0 = -1;
    GLImmediate.currentRenderer = null;
   };
  }
  function CTexUnit() {
   this.env = new CTexEnv();
   this.enabled_tex1D = false;
   this.enabled_tex2D = false;
   this.enabled_tex3D = false;
   this.enabled_texCube = false;
   this.texTypesEnabled = 0;
   this.traverseState = function CTexUnit_traverseState(keyView) {
    if (this.texTypesEnabled) {
     if (this.env.key0 == -1) {
      this.env.recomputeKey();
     }
     keyView.next(this.texTypesEnabled | this.env.key0 << 4);
     keyView.next(this.env.key1);
     keyView.next(this.env.key2);
    } else {
     keyView.next(0);
    }
   };
  }
  CTexUnit.prototype.enabled = function CTexUnit_enabled() {
   return this.texTypesEnabled;
  };
  CTexUnit.prototype.genPassLines = function CTexUnit_genPassLines(passOutputVar, passInputVar, texUnitID) {
   if (!this.enabled()) {
    return [ "vec4 " + passOutputVar + " = " + passInputVar + ";" ];
   }
   var lines = this.env.genPassLines(passOutputVar, passInputVar, texUnitID).join("\n");
   var texLoadLines = "";
   var texLoadRegex = /(texture.*?\((?:[^()]|\([^()]*\))*\))/g;
   var loadCounter = 0;
   var load;
   while (load = texLoadRegex.exec(lines)) {
    var texLoadExpr = load[1];
    var secondOccurrence = lines.slice(load.index + 1).indexOf(texLoadExpr);
    if (secondOccurrence != -1) {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texLoadVar = prefix + "texload" + loadCounter++;
     var texLoadLine = "vec4 " + texLoadVar + " = " + texLoadExpr + ";\n";
     texLoadLines += texLoadLine + "\n";
     lines = lines.split(texLoadExpr).join(texLoadVar);
     texLoadRegex = /(texture.*?\((?:[^()]|\([^()]*\))*\))/g;
    }
   }
   return [ texLoadLines + lines ];
  };
  CTexUnit.prototype.getTexType = function CTexUnit_getTexType() {
   if (this.enabled_texCube) {
    return GL_TEXTURE_CUBE_MAP;
   } else if (this.enabled_tex3D) {
    return GL_TEXTURE_3D;
   } else if (this.enabled_tex2D) {
    return GL_TEXTURE_2D;
   } else if (this.enabled_tex1D) {
    return GL_TEXTURE_1D;
   }
   return 0;
  };
  CTexEnv.prototype.genPassLines = function CTexEnv_genPassLines(passOutputVar, passInputVar, texUnitID) {
   switch (this.mode) {
   case GL_REPLACE:
    {
     return [ "vec4 " + passOutputVar + " = " + genTexUnitSampleExpr(texUnitID) + ";" ];
    }

   case GL_ADD:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", "vec3 " + colorVar + " = " + passInputVar + ".rgb + " + texVar + ".rgb;", "float " + alphaVar + " = " + passInputVar + ".a * " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }

   case GL_MODULATE:
    {
     var line = [ "vec4 " + passOutputVar, " = ", passInputVar, " * ", genTexUnitSampleExpr(texUnitID), ";" ];
     return [ line.join("") ];
    }

   case GL_DECAL:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", [ "vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".a)", " + ", texVar + ".rgb * " + texVar + ".a", ";" ].join(""), "float " + alphaVar + " = " + passInputVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }

   case GL_BLEND:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var texVar = prefix + "tex";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     return [ "vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", [ "vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".rgb)", " + ", PRIM_COLOR_VARYING + ".rgb * " + texVar + ".rgb", ";" ].join(""), "float " + alphaVar + " = " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");" ];
    }

   case GL_COMBINE:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var colorVar = prefix + "color";
     var alphaVar = prefix + "alpha";
     var colorLines = this.genCombinerLines(true, colorVar, passInputVar, texUnitID, this.colorCombiner, this.colorSrc, this.colorOp);
     var alphaLines = this.genCombinerLines(false, alphaVar, passInputVar, texUnitID, this.alphaCombiner, this.alphaSrc, this.alphaOp);
     var scaledColor = this.colorScale == 1 ? colorVar : colorVar + " * " + valToFloatLiteral(this.colorScale);
     var scaledAlpha = this.alphaScale == 1 ? alphaVar : alphaVar + " * " + valToFloatLiteral(this.alphaScale);
     var line = [ "vec4 " + passOutputVar, " = ", "vec4(", scaledColor, ", ", scaledAlpha, ")", ";" ].join("");
     return [].concat(colorLines, alphaLines, [ line ]);
    }
   }
   return abort_noSupport("Unsupported TexEnv mode: 0x" + this.mode.toString(16));
  };
  CTexEnv.prototype.genCombinerLines = function CTexEnv_getCombinerLines(isColor, outputVar, passInputVar, texUnitID, combiner, srcArr, opArr) {
   var argsNeeded = null;
   switch (combiner) {
   case GL_REPLACE:
    argsNeeded = 1;
    break;

   case GL_MODULATE:
   case GL_ADD:
   case GL_SUBTRACT:
    argsNeeded = 2;
    break;

   case GL_INTERPOLATE:
    argsNeeded = 3;
    break;

   default:
    return abort_noSupport("Unsupported combiner: 0x" + combiner.toString(16));
   }
   var constantExpr = [ "vec4(", valToFloatLiteral(this.envColor[0]), ", ", valToFloatLiteral(this.envColor[1]), ", ", valToFloatLiteral(this.envColor[2]), ", ", valToFloatLiteral(this.envColor[3]), ")" ].join("");
   var src0Expr = argsNeeded >= 1 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[0], opArr[0]) : null;
   var src1Expr = argsNeeded >= 2 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[1], opArr[1]) : null;
   var src2Expr = argsNeeded >= 3 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[2], opArr[2]) : null;
   var outputType = isColor ? "vec3" : "float";
   var lines = null;
   switch (combiner) {
   case GL_REPLACE:
    {
     var line = [ outputType + " " + outputVar, " = ", src0Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }

   case GL_MODULATE:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " * " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }

   case GL_ADD:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " + " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }

   case GL_SUBTRACT:
    {
     var line = [ outputType + " " + outputVar + " = ", src0Expr + " - " + src1Expr, ";" ];
     lines = [ line.join("") ];
     break;
    }

   case GL_INTERPOLATE:
    {
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
     var arg2Var = prefix + "colorSrc2";
     var arg2Line = getTypeFromCombineOp(this.colorOp[2]) + " " + arg2Var + " = " + src2Expr + ";";
     var line = [ outputType + " " + outputVar, " = ", src0Expr + " * " + arg2Var, " + ", src1Expr + " * (1.0 - " + arg2Var + ")", ";" ];
     lines = [ arg2Line, line.join("") ];
     break;
    }

   default:
    return abort_sanity("Unmatched TexEnv.colorCombiner?");
   }
   return lines;
  };
  return {
   init: function(gl, specifiedMaxTextureImageUnits) {
    var maxTexUnits = 0;
    if (specifiedMaxTextureImageUnits) {
     maxTexUnits = specifiedMaxTextureImageUnits;
    } else if (gl) {
     maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    }
    s_texUnits = [];
    for (var i = 0; i < maxTexUnits; i++) {
     s_texUnits.push(new CTexUnit());
    }
   },
   setGLSLVars: function(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix) {
    TEX_UNIT_UNIFORM_PREFIX = uTexUnitPrefix;
    TEX_COORD_VARYING_PREFIX = vTexCoordPrefix;
    PRIM_COLOR_VARYING = vPrimColor;
    TEX_MATRIX_UNIFORM_PREFIX = uTexMatrixPrefix;
   },
   genAllPassLines: function(resultDest, indentSize = 0) {
    s_requiredTexUnitsForPass.length = 0;
    var lines = [];
    var lastPassVar = PRIM_COLOR_VARYING;
    for (var i = 0; i < s_texUnits.length; i++) {
     if (!s_texUnits[i].enabled()) continue;
     s_requiredTexUnitsForPass.push(i);
     var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + i + "_";
     var passOutputVar = prefix + "result";
     var newLines = s_texUnits[i].genPassLines(passOutputVar, lastPassVar, i);
     lines = lines.concat(newLines, [ "" ]);
     lastPassVar = passOutputVar;
    }
    lines.push(resultDest + " = " + lastPassVar + ";");
    var indent = "";
    for (var i = 0; i < indentSize; i++) indent += " ";
    var output = indent + lines.join("\n" + indent);
    return output;
   },
   getUsedTexUnitList: function() {
    return s_requiredTexUnitsForPass;
   },
   getActiveTexture: function() {
    return s_activeTexture;
   },
   traverseState: function(keyView) {
    for (var i = 0; i < s_texUnits.length; i++) {
     s_texUnits[i].traverseState(keyView);
    }
   },
   getTexUnitType: function(texUnitID) {
    return s_texUnits[texUnitID].getTexType();
   },
   hook_activeTexture: function(texture) {
    s_activeTexture = texture - GL_TEXTURE0;
    if (GLImmediate.currentMatrix >= 2) {
     GLImmediate.currentMatrix = 2 + s_activeTexture;
    }
   },
   hook_enable: function(cap) {
    var cur = getCurTexUnit();
    switch (cap) {
    case GL_TEXTURE_1D:
     if (!cur.enabled_tex1D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex1D = true;
      cur.texTypesEnabled |= 1;
     }
     break;

    case GL_TEXTURE_2D:
     if (!cur.enabled_tex2D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex2D = true;
      cur.texTypesEnabled |= 2;
     }
     break;

    case GL_TEXTURE_3D:
     if (!cur.enabled_tex3D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex3D = true;
      cur.texTypesEnabled |= 4;
     }
     break;

    case GL_TEXTURE_CUBE_MAP:
     if (!cur.enabled_texCube) {
      GLImmediate.currentRenderer = null;
      cur.enabled_texCube = true;
      cur.texTypesEnabled |= 8;
     }
     break;
    }
   },
   hook_disable: function(cap) {
    var cur = getCurTexUnit();
    switch (cap) {
    case GL_TEXTURE_1D:
     if (cur.enabled_tex1D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex1D = false;
      cur.texTypesEnabled &= ~1;
     }
     break;

    case GL_TEXTURE_2D:
     if (cur.enabled_tex2D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex2D = false;
      cur.texTypesEnabled &= ~2;
     }
     break;

    case GL_TEXTURE_3D:
     if (cur.enabled_tex3D) {
      GLImmediate.currentRenderer = null;
      cur.enabled_tex3D = false;
      cur.texTypesEnabled &= ~4;
     }
     break;

    case GL_TEXTURE_CUBE_MAP:
     if (cur.enabled_texCube) {
      GLImmediate.currentRenderer = null;
      cur.enabled_texCube = false;
      cur.texTypesEnabled &= ~8;
     }
     break;
    }
   },
   hook_texEnvf: function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_RGB_SCALE:
     if (env.colorScale != param) {
      env.invalidateKey();
      env.colorScale = param;
     }
     break;

    case GL_ALPHA_SCALE:
     if (env.alphaScale != param) {
      env.invalidateKey();
      env.alphaScale = param;
     }
     break;

    default:
     GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param);
    }
   },
   hook_texEnvi: function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_MODE:
     if (env.mode != param) {
      env.invalidateKey();
      env.mode = param;
     }
     break;

    case GL_COMBINE_RGB:
     if (env.colorCombiner != param) {
      env.invalidateKey();
      env.colorCombiner = param;
     }
     break;

    case GL_COMBINE_ALPHA:
     if (env.alphaCombiner != param) {
      env.invalidateKey();
      env.alphaCombiner = param;
     }
     break;

    case GL_SRC0_RGB:
     if (env.colorSrc[0] != param) {
      env.invalidateKey();
      env.colorSrc[0] = param;
     }
     break;

    case GL_SRC1_RGB:
     if (env.colorSrc[1] != param) {
      env.invalidateKey();
      env.colorSrc[1] = param;
     }
     break;

    case GL_SRC2_RGB:
     if (env.colorSrc[2] != param) {
      env.invalidateKey();
      env.colorSrc[2] = param;
     }
     break;

    case GL_SRC0_ALPHA:
     if (env.alphaSrc[0] != param) {
      env.invalidateKey();
      env.alphaSrc[0] = param;
     }
     break;

    case GL_SRC1_ALPHA:
     if (env.alphaSrc[1] != param) {
      env.invalidateKey();
      env.alphaSrc[1] = param;
     }
     break;

    case GL_SRC2_ALPHA:
     if (env.alphaSrc[2] != param) {
      env.invalidateKey();
      env.alphaSrc[2] = param;
     }
     break;

    case GL_OPERAND0_RGB:
     if (env.colorOp[0] != param) {
      env.invalidateKey();
      env.colorOp[0] = param;
     }
     break;

    case GL_OPERAND1_RGB:
     if (env.colorOp[1] != param) {
      env.invalidateKey();
      env.colorOp[1] = param;
     }
     break;

    case GL_OPERAND2_RGB:
     if (env.colorOp[2] != param) {
      env.invalidateKey();
      env.colorOp[2] = param;
     }
     break;

    case GL_OPERAND0_ALPHA:
     if (env.alphaOp[0] != param) {
      env.invalidateKey();
      env.alphaOp[0] = param;
     }
     break;

    case GL_OPERAND1_ALPHA:
     if (env.alphaOp[1] != param) {
      env.invalidateKey();
      env.alphaOp[1] = param;
     }
     break;

    case GL_OPERAND2_ALPHA:
     if (env.alphaOp[2] != param) {
      env.invalidateKey();
      env.alphaOp[2] = param;
     }
     break;

    case GL_RGB_SCALE:
     if (env.colorScale != param) {
      env.invalidateKey();
      env.colorScale = param;
     }
     break;

    case GL_ALPHA_SCALE:
     if (env.alphaScale != param) {
      env.invalidateKey();
      env.alphaScale = param;
     }
     break;

    default:
     err("WARNING: Unhandled `pname` in call to `glTexEnvi`.");
    }
   },
   hook_texEnvfv: function(target, pname, params) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_COLOR:
     {
      for (var i = 0; i < 4; i++) {
       var param = HEAPF32[params + i * 4 >> 2];
       if (env.envColor[i] != param) {
        env.invalidateKey();
        env.envColor[i] = param;
       }
      }
      break;
     }

    default:
     err("WARNING: Unhandled `pname` in call to `glTexEnvfv`.");
    }
   },
   hook_getTexEnviv: function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_MODE:
     HEAP32[param >> 2] = env.mode;
     return;

    case GL_TEXTURE_ENV_COLOR:
     HEAP32[param >> 2] = Math.max(Math.min(env.envColor[0] * 255, 255, -255));
     HEAP32[param + 1 >> 2] = Math.max(Math.min(env.envColor[1] * 255, 255, -255));
     HEAP32[param + 2 >> 2] = Math.max(Math.min(env.envColor[2] * 255, 255, -255));
     HEAP32[param + 3 >> 2] = Math.max(Math.min(env.envColor[3] * 255, 255, -255));
     return;

    case GL_COMBINE_RGB:
     HEAP32[param >> 2] = env.colorCombiner;
     return;

    case GL_COMBINE_ALPHA:
     HEAP32[param >> 2] = env.alphaCombiner;
     return;

    case GL_SRC0_RGB:
     HEAP32[param >> 2] = env.colorSrc[0];
     return;

    case GL_SRC1_RGB:
     HEAP32[param >> 2] = env.colorSrc[1];
     return;

    case GL_SRC2_RGB:
     HEAP32[param >> 2] = env.colorSrc[2];
     return;

    case GL_SRC0_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[0];
     return;

    case GL_SRC1_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[1];
     return;

    case GL_SRC2_ALPHA:
     HEAP32[param >> 2] = env.alphaSrc[2];
     return;

    case GL_OPERAND0_RGB:
     HEAP32[param >> 2] = env.colorOp[0];
     return;

    case GL_OPERAND1_RGB:
     HEAP32[param >> 2] = env.colorOp[1];
     return;

    case GL_OPERAND2_RGB:
     HEAP32[param >> 2] = env.colorOp[2];
     return;

    case GL_OPERAND0_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[0];
     return;

    case GL_OPERAND1_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[1];
     return;

    case GL_OPERAND2_ALPHA:
     HEAP32[param >> 2] = env.alphaOp[2];
     return;

    case GL_RGB_SCALE:
     HEAP32[param >> 2] = env.colorScale;
     return;

    case GL_ALPHA_SCALE:
     HEAP32[param >> 2] = env.alphaScale;
     return;

    default:
     err("WARNING: Unhandled `pname` in call to `glGetTexEnvi`.");
    }
   },
   hook_getTexEnvfv: function(target, pname, param) {
    if (target != GL_TEXTURE_ENV) return;
    var env = getCurTexUnit().env;
    switch (pname) {
    case GL_TEXTURE_ENV_COLOR:
     HEAPF32[param >> 2] = env.envColor[0];
     HEAPF32[param + 4 >> 2] = env.envColor[1];
     HEAPF32[param + 8 >> 2] = env.envColor[2];
     HEAPF32[param + 12 >> 2] = env.envColor[3];
     return;
    }
   }
  };
 },
 vertexData: null,
 vertexDataU8: null,
 tempData: null,
 indexData: null,
 vertexCounter: 0,
 mode: -1,
 rendererCache: null,
 rendererComponents: [],
 rendererComponentPointer: 0,
 lastRenderer: null,
 lastArrayBuffer: null,
 lastProgram: null,
 lastStride: -1,
 matrix: [],
 matrixStack: [],
 currentMatrix: 0,
 textureGenS: [],
 textureGenT: [],
 textureGenModeS: [],
 textureGenModeT: [],
 tempMatrix: null,
 matricesModified: false,
 useTextureMatrix: false,
 VERTEX: 0,
 NORMAL: 1,
 COLOR: 2,
 TEXTURE0: 3,
 NUM_ATTRIBUTES: -1,
 MAX_TEXTURES: -1,
 totalEnabledClientAttributes: 0,
 enabledClientAttributes: [ 0, 0 ],
 clientAttributes: [],
 liveClientAttributes: [],
 currentRenderer: null,
 modifiedClientAttributes: false,
 clientActiveTexture: 0,
 clientColor: null,
 usedTexUnitList: [],
 fixedFunctionProgram: null,
 setClientAttribute: function setClientAttribute(name, size, type, stride, pointer) {
  var attrib = GLImmediate.clientAttributes[name];
  if (!attrib) {
   for (var i = 0; i <= name; i++) {
    if (!GLImmediate.clientAttributes[i]) {
     GLImmediate.clientAttributes[i] = {
      name: name,
      size: size,
      type: type,
      stride: stride,
      pointer: pointer,
      offset: 0
     };
    }
   }
  } else {
   attrib.name = name;
   attrib.size = size;
   attrib.type = type;
   attrib.stride = stride;
   attrib.pointer = pointer;
   attrib.offset = 0;
  }
  GLImmediate.modifiedClientAttributes = true;
 },
 addRendererComponent: function addRendererComponent(name, size, type) {
  if (!GLImmediate.rendererComponents[name]) {
   GLImmediate.rendererComponents[name] = 1;
   GLImmediate.enabledClientAttributes[name] = true;
   GLImmediate.setClientAttribute(name, size, type, 0, GLImmediate.rendererComponentPointer);
   GLImmediate.rendererComponentPointer += size * GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
  } else {
   GLImmediate.rendererComponents[name]++;
  }
 },
 disableBeginEndClientAttributes: function disableBeginEndClientAttributes() {
  for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
   if (GLImmediate.rendererComponents[i]) GLImmediate.enabledClientAttributes[i] = false;
  }
 },
 getRenderer: function getRenderer() {
  if (GLImmediate.currentRenderer) {
   return GLImmediate.currentRenderer;
  }
  var attributes = GLImmediate.liveClientAttributes;
  var cacheMap = GLImmediate.rendererCache;
  var keyView = cacheMap.getStaticKeyView().reset();
  var enabledAttributesKey = 0;
  for (var i = 0; i < attributes.length; i++) {
   enabledAttributesKey |= 1 << attributes[i].name;
  }
  keyView.next(enabledAttributesKey);
  enabledAttributesKey = 0;
  var fogParam = 0;
  if (GLEmulation.fogEnabled) {
   switch (GLEmulation.fogMode) {
   case 2049:
    fogParam = 1;
    break;

   case 9729:
    fogParam = 2;
    break;

   default:
    fogParam = 3;
    break;
   }
  }
  enabledAttributesKey = enabledAttributesKey << 2 | fogParam;
  for (var clipPlaneId = 0; clipPlaneId < GLEmulation.MAX_CLIP_PLANES; clipPlaneId++) {
   enabledAttributesKey = enabledAttributesKey << 1 | GLEmulation.clipPlaneEnabled[clipPlaneId];
  }
  enabledAttributesKey = enabledAttributesKey << 1 | GLEmulation.lightingEnabled;
  for (var lightId = 0; lightId < GLEmulation.MAX_LIGHTS; lightId++) {
   enabledAttributesKey = enabledAttributesKey << 1 | (GLEmulation.lightingEnabled ? GLEmulation.lightEnabled[lightId] : 0);
  }
  enabledAttributesKey = enabledAttributesKey << 3 | (GLEmulation.alphaTestEnabled ? GLEmulation.alphaTestFunc - 512 : 7);
  enabledAttributesKey = enabledAttributesKey << 1 | (GLImmediate.mode == GLctx.POINTS ? 1 : 0);
  keyView.next(enabledAttributesKey);
  var textureGenKey = 0;
  for (var texUnit = 0; texUnit < GLImmediate.MAX_TEXTURES; texUnit++) {
   var sphereMap = GLImmediate.textureGenS[texUnit] && GLImmediate.textureGenT[texUnit] &&
    GLImmediate.textureGenModeS[texUnit] == 9218 && GLImmediate.textureGenModeT[texUnit] == 9218;
   textureGenKey = textureGenKey * 2 + (sphereMap ? 1 : 0);
  }
  keyView.next(textureGenKey);
  keyView.next(GL.currProgram);
  if (!GL.currProgram) {
   GLImmediate.TexEnvJIT.traverseState(keyView);
  }
  var renderer = keyView.get();
  if (!renderer) {
   renderer = GLImmediate.createRenderer();
   GLImmediate.currentRenderer = renderer;
   keyView.set(renderer);
   return renderer;
  }
  GLImmediate.currentRenderer = renderer;
  return renderer;
 },
 createRenderer: function createRenderer(renderer) {
  var useCurrProgram = !!GL.currProgram;
  var hasTextures = false;
  for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
   var texAttribName = GLImmediate.TEXTURE0 + i;
   if (!GLImmediate.enabledClientAttributes[texAttribName]) continue;
   hasTextures = true;
  }
  function Renderer() {
   this.init = function() {
    var uTexUnitPrefix = "u_texUnit";
    var aTexCoordPrefix = "a_texCoord";
    var vTexCoordPrefix = "v_texCoord";
    var vPrimColor = "v_color";
    var uTexMatrixPrefix = GLImmediate.useTextureMatrix ? "u_textureMatrix" : null;
    if (useCurrProgram) {
     if (GL.shaderInfos[GL.programShaders[GL.currProgram][0]].type == GLctx.VERTEX_SHADER) {
      this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
      this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
     } else {
      this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
      this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
     }
     this.program = GL.programs[GL.currProgram];
     this.usedTexUnitList = [];
    } else {
     if (GLEmulation.fogEnabled) {
      switch (GLEmulation.fogMode) {
      case 2049:
       var fogFormula = "  float fog = exp(-u_fogDensity * u_fogDensity * ecDistance * ecDistance); \n";
       break;

      case 9729:
       var fogFormula = "  float fog = (u_fogEnd - ecDistance) * u_fogScale; \n";
       break;

      default:
       var fogFormula = "  float fog = exp(-u_fogDensity * ecDistance); \n";
       break;
      }
     }
     GLImmediate.TexEnvJIT.setGLSLVars(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix);
     var fsTexEnvPass = GLImmediate.TexEnvJIT.genAllPassLines("gl_FragColor", 2);
     var texUnitAttribList = "";
     var texUnitVaryingList = "";
     var texUnitUniformList = "";
     var vsTexCoordInits = "";
     var sphereMapUnits = [];
     var hasSphereMap = false;
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      sphereMapUnits[i] = !useCurrProgram && GLImmediate.textureGenS[i] && GLImmediate.textureGenT[i] &&
       GLImmediate.textureGenModeS[i] == 9218 && GLImmediate.textureGenModeT[i] == 9218;
      hasSphereMap = hasSphereMap || sphereMapUnits[i];
     }
     if (hasSphereMap && !GLImmediate.enabledClientAttributes[GLImmediate.NORMAL]) {
      sphereMapUnits = [];
      hasSphereMap = false;
     }
     this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();
     for (var i = 0; i < this.usedTexUnitList.length; i++) {
      var texUnit = this.usedTexUnitList[i];
      texUnitAttribList += "attribute vec4 " + aTexCoordPrefix + texUnit + ";\n";
      texUnitVaryingList += "varying vec4 " + vTexCoordPrefix + texUnit + ";\n";
      texUnitUniformList += "uniform sampler2D " + uTexUnitPrefix + texUnit + ";\n";
      if (sphereMapUnits[texUnit]) {
       var suffix = texUnit;
       vsTexCoordInits += "  vec3 sphereNormal" + suffix + " = normalize(u_normalMatrix * a_normal);\n";
       vsTexCoordInits += "  vec3 sphereEye" + suffix + " = normalize(ecPosition.xyz);\n";
       vsTexCoordInits += "  vec3 sphereReflection" + suffix + " = reflect(sphereEye" + suffix + ", sphereNormal" + suffix + ");\n";
       vsTexCoordInits += "  float sphereDenom" + suffix + " = max(2.0 * length(vec3(sphereReflection" + suffix + ".x, sphereReflection" + suffix + ".y, sphereReflection" + suffix + ".z + 1.0)), 0.000001);\n";
       vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = vec4(sphereReflection" + suffix + ".xy / sphereDenom" + suffix + " + vec2(0.5), 0.0, 1.0);\n";
      } else {
       vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = " + aTexCoordPrefix + texUnit + ";\n";
      }
      if (GLImmediate.useTextureMatrix) {
       texUnitUniformList += "uniform mat4 " + uTexMatrixPrefix + texUnit + ";\n";
      }
     }
     var vsFogVaryingInit = null;
     if (GLEmulation.fogEnabled) {
      vsFogVaryingInit = "  v_fogFragCoord = abs(ecPosition.z);\n";
     }
     var vsPointSizeDefs = null;
     var vsPointSizeInit = null;
     if (GLImmediate.mode == GLctx.POINTS) {
      vsPointSizeDefs = "uniform float u_pointSize;\n";
      vsPointSizeInit = "  gl_PointSize = u_pointSize;\n";
     }
     var vsClipPlaneDefs = "";
     var vsClipPlaneInit = "";
     var fsClipPlaneDefs = "";
     var fsClipPlanePass = "";
     for (var clipPlaneId = 0; clipPlaneId < GLEmulation.MAX_CLIP_PLANES; clipPlaneId++) {
      if (GLEmulation.clipPlaneEnabled[clipPlaneId]) {
       vsClipPlaneDefs += "uniform vec4 u_clipPlaneEquation" + clipPlaneId + ";";
       vsClipPlaneDefs += "varying float v_clipDistance" + clipPlaneId + ";";
       vsClipPlaneInit += "  v_clipDistance" + clipPlaneId + " = dot(ecPosition, u_clipPlaneEquation" + clipPlaneId + ");";
       fsClipPlaneDefs += "varying float v_clipDistance" + clipPlaneId + ";";
       fsClipPlanePass += "  if(v_clipDistance" + clipPlaneId + " < 0.0) discard;";
      }
     }
     var vsLightingDefs = "";
     var vsLightingPass = "";
     if (GLEmulation.lightingEnabled || hasSphereMap) {
      vsLightingDefs += "attribute vec3 a_normal;";
      vsLightingDefs += "uniform mat3 u_normalMatrix;";
     }
     if (GLEmulation.lightingEnabled) {
      vsLightingDefs += "uniform vec4 u_lightModelAmbient;";
      vsLightingDefs += "uniform vec4 u_materialAmbient;";
      vsLightingDefs += "uniform vec4 u_materialDiffuse;";
      vsLightingDefs += "uniform vec4 u_materialSpecular;";
      vsLightingDefs += "uniform float u_materialShininess;";
      vsLightingDefs += "uniform vec4 u_materialEmission;";
      vsLightingPass += "  vec3 ecNormal = normalize(u_normalMatrix * a_normal);";
      vsLightingPass += "  v_color.w = u_materialDiffuse.w;";
      vsLightingPass += "  v_color.xyz = u_materialEmission.xyz;";
      vsLightingPass += "  v_color.xyz += u_lightModelAmbient.xyz * u_materialAmbient.xyz;";
      for (var lightId = 0; lightId < GLEmulation.MAX_LIGHTS; lightId++) {
       if (GLEmulation.lightEnabled[lightId]) {
        vsLightingDefs += "uniform vec4 u_lightAmbient" + lightId + ";";
        vsLightingDefs += "uniform vec4 u_lightDiffuse" + lightId + ";";
        vsLightingDefs += "uniform vec4 u_lightSpecular" + lightId + ";";
        vsLightingDefs += "uniform vec4 u_lightPosition" + lightId + ";";
        vsLightingPass += "  {";
        vsLightingPass += "    vec3 lightDirection = normalize(u_lightPosition" + lightId + ").xyz;";
        vsLightingPass += "    vec3 halfVector = normalize(lightDirection + vec3(0,0,1));";
        vsLightingPass += "    vec3 ambient = u_lightAmbient" + lightId + ".xyz * u_materialAmbient.xyz;";
        vsLightingPass += "    float diffuseI = max(dot(ecNormal, lightDirection), 0.0);";
        vsLightingPass += "    float specularI = max(dot(ecNormal, halfVector), 0.0);";
        vsLightingPass += "    vec3 diffuse = diffuseI * u_lightDiffuse" + lightId + ".xyz * u_materialDiffuse.xyz;";
        vsLightingPass += "    specularI = (diffuseI > 0.0 && specularI > 0.0) ? exp(u_materialShininess * log(specularI)) : 0.0;";
        vsLightingPass += "    vec3 specular = specularI * u_lightSpecular" + lightId + ".xyz * u_materialSpecular.xyz;";
        vsLightingPass += "    v_color.xyz += ambient + diffuse + specular;";
        vsLightingPass += "  }";
       }
      }
      vsLightingPass += "  v_color = clamp(v_color, 0.0, 1.0);";
     }
     var vsSource = [ "attribute vec4 a_position;", "attribute vec4 a_color;", "varying vec4 v_color;", texUnitAttribList, texUnitVaryingList, GLEmulation.fogEnabled ? "varying float v_fogFragCoord;" : null, "uniform mat4 u_modelView;", "uniform mat4 u_projection;", vsPointSizeDefs, vsClipPlaneDefs, vsLightingDefs, "void main()", "{", "  vec4 ecPosition = u_modelView * a_position;", "  gl_Position = u_projection * ecPosition;", "  v_color = a_color;", vsTexCoordInits, vsFogVaryingInit, vsPointSizeInit, vsClipPlaneInit, vsLightingPass, "}", "" ].join("\n").replace(/\n\n+/g, "\n");
     this.vertexShader = GLctx.createShader(GLctx.VERTEX_SHADER);
     GLctx.shaderSource(this.vertexShader, vsSource);
     GLctx.compileShader(this.vertexShader);
     var fogHeaderIfNeeded = null;
     if (GLEmulation.fogEnabled) {
      fogHeaderIfNeeded = [ "", "varying float v_fogFragCoord; ", "uniform vec4 u_fogColor;      ", "uniform float u_fogEnd;       ", "uniform float u_fogScale;     ", "uniform float u_fogDensity;   ", "float ffog(in float ecDistance) { ", fogFormula, "  fog = clamp(fog, 0.0, 1.0); ", "  return fog;                 ", "}", "" ].join("\n");
     }
     var fogPass = null;
     if (GLEmulation.fogEnabled) {
      fogPass = "gl_FragColor = vec4(mix(u_fogColor.rgb, gl_FragColor.rgb, ffog(v_fogFragCoord)), gl_FragColor.a);\n";
     }
     var fsAlphaTestDefs = "";
     var fsAlphaTestPass = "";
     if (GLEmulation.alphaTestEnabled) {
      fsAlphaTestDefs = "uniform float u_alphaTestRef;";
      switch (GLEmulation.alphaTestFunc) {
      case 512:
       fsAlphaTestPass = "discard;";
       break;

      case 513:
       fsAlphaTestPass = "if( !(gl_FragColor.a < u_alphaTestRef) ) { discard; }";
       break;

      case 514:
       fsAlphaTestPass = "if( !(gl_FragColor.a == u_alphaTestRef) ) { discard; }";
       break;

      case 515:
       fsAlphaTestPass = "if( !(gl_FragColor.a <= u_alphaTestRef) ) { discard; }";
       break;

      case 516:
       fsAlphaTestPass = "if( !(gl_FragColor.a > u_alphaTestRef) ) { discard; }";
       break;

      case 517:
       fsAlphaTestPass = "if( !(gl_FragColor.a != u_alphaTestRef) ) { discard; }";
       break;

      case 518:
       fsAlphaTestPass = "if( !(gl_FragColor.a >= u_alphaTestRef) ) { discard; }";
       break;

      case 519:
       fsAlphaTestPass = "";
       break;
      }
     }
     var fsSource = [ "precision mediump float;", texUnitVaryingList, texUnitUniformList, "varying vec4 v_color;", fogHeaderIfNeeded, fsClipPlaneDefs, fsAlphaTestDefs, "void main()", "{", fsClipPlanePass, fsTexEnvPass, fogPass, fsAlphaTestPass, "}", "" ].join("\n").replace(/\n\n+/g, "\n");
     this.fragmentShader = GLctx.createShader(GLctx.FRAGMENT_SHADER);
     GLctx.shaderSource(this.fragmentShader, fsSource);
     GLctx.compileShader(this.fragmentShader);
     this.program = GLctx.createProgram();
     GLctx.attachShader(this.program, this.vertexShader);
     GLctx.attachShader(this.program, this.fragmentShader);
     GLctx.bindAttribLocation(this.program, GLImmediate.VERTEX, "a_position");
     GLctx.bindAttribLocation(this.program, GLImmediate.COLOR, "a_color");
     GLctx.bindAttribLocation(this.program, GLImmediate.NORMAL, "a_normal");
     var maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
     for (var i = 0; i < GLImmediate.MAX_TEXTURES && GLImmediate.TEXTURE0 + i < maxVertexAttribs; i++) {
      GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, "a_texCoord" + i);
      GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, aTexCoordPrefix + i);
     }
     GLctx.linkProgram(this.program);
    }
    this.textureMatrixVersion = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    this.positionLocation = GLctx.getAttribLocation(this.program, "a_position");
    this.texCoordLocations = [];
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     if (!GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i]) {
      this.texCoordLocations[i] = -1;
      continue;
     }
     if (useCurrProgram) {
      this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, "a_texCoord" + i);
     } else {
      this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, aTexCoordPrefix + i);
     }
    }
    this.colorLocation = GLctx.getAttribLocation(this.program, "a_color");
    if (!useCurrProgram) {
     var prevBoundProg = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
     GLctx.useProgram(this.program);
     {
      for (var i = 0; i < this.usedTexUnitList.length; i++) {
       var texUnitID = this.usedTexUnitList[i];
       var texSamplerLoc = GLctx.getUniformLocation(this.program, uTexUnitPrefix + texUnitID);
       GLctx.uniform1i(texSamplerLoc, texUnitID);
      }
     }
     GLctx.vertexAttrib4fv(this.colorLocation, [ 1, 1, 1, 1 ]);
     GLctx.useProgram(prevBoundProg);
    }
    this.textureMatrixLocations = [];
    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
     this.textureMatrixLocations[i] = GLctx.getUniformLocation(this.program, "u_textureMatrix" + i);
    }
    this.normalLocation = GLctx.getAttribLocation(this.program, "a_normal");
    this.modelViewLocation = GLctx.getUniformLocation(this.program, "u_modelView");
    this.projectionLocation = GLctx.getUniformLocation(this.program, "u_projection");
    this.normalMatrixLocation = GLctx.getUniformLocation(this.program, "u_normalMatrix");
    this.hasTextures = hasTextures;
    this.hasNormal = GLImmediate.enabledClientAttributes[GLImmediate.NORMAL] && GLImmediate.clientAttributes[GLImmediate.NORMAL].size > 0 && this.normalLocation >= 0;
    this.hasColor = this.colorLocation === 0 || this.colorLocation > 0;
    this.floatType = GLctx.FLOAT;
    this.fogColorLocation = GLctx.getUniformLocation(this.program, "u_fogColor");
    this.fogEndLocation = GLctx.getUniformLocation(this.program, "u_fogEnd");
    this.fogScaleLocation = GLctx.getUniformLocation(this.program, "u_fogScale");
    this.fogDensityLocation = GLctx.getUniformLocation(this.program, "u_fogDensity");
    this.hasFog = !!(this.fogColorLocation || this.fogEndLocation || this.fogScaleLocation || this.fogDensityLocation);
    this.pointSizeLocation = GLctx.getUniformLocation(this.program, "u_pointSize");
    this.hasClipPlane = false;
    this.clipPlaneEquationLocation = [];
    for (var clipPlaneId = 0; clipPlaneId < GLEmulation.MAX_CLIP_PLANES; clipPlaneId++) {
     this.clipPlaneEquationLocation[clipPlaneId] = GLctx.getUniformLocation(this.program, "u_clipPlaneEquation" + clipPlaneId);
     this.hasClipPlane = this.hasClipPlane || this.clipPlaneEquationLocation[clipPlaneId];
    }
    this.hasLighting = GLEmulation.lightingEnabled;
    this.lightModelAmbientLocation = GLctx.getUniformLocation(this.program, "u_lightModelAmbient");
    this.materialAmbientLocation = GLctx.getUniformLocation(this.program, "u_materialAmbient");
    this.materialDiffuseLocation = GLctx.getUniformLocation(this.program, "u_materialDiffuse");
    this.materialSpecularLocation = GLctx.getUniformLocation(this.program, "u_materialSpecular");
    this.materialShininessLocation = GLctx.getUniformLocation(this.program, "u_materialShininess");
    this.materialEmissionLocation = GLctx.getUniformLocation(this.program, "u_materialEmission");
    this.lightAmbientLocation = [];
    this.lightDiffuseLocation = [];
    this.lightSpecularLocation = [];
    this.lightPositionLocation = [];
    for (var lightId = 0; lightId < GLEmulation.MAX_LIGHTS; lightId++) {
     this.lightAmbientLocation[lightId] = GLctx.getUniformLocation(this.program, "u_lightAmbient" + lightId);
     this.lightDiffuseLocation[lightId] = GLctx.getUniformLocation(this.program, "u_lightDiffuse" + lightId);
     this.lightSpecularLocation[lightId] = GLctx.getUniformLocation(this.program, "u_lightSpecular" + lightId);
     this.lightPositionLocation[lightId] = GLctx.getUniformLocation(this.program, "u_lightPosition" + lightId);
    }
    this.hasAlphaTest = GLEmulation.alphaTestEnabled;
    this.alphaTestRefLocation = GLctx.getUniformLocation(this.program, "u_alphaTestRef");
   };
   this.prepare = function() {
    var arrayBuffer;
    if (!GLctx.currentArrayBufferBinding) {
     var start = GLImmediate.firstVertex * GLImmediate.stride;
     var end = GLImmediate.lastVertex * GLImmediate.stride;
     arrayBuffer = GL.getTempVertexBuffer(end);
    } else {
     arrayBuffer = GLctx.currentArrayBufferBinding;
    }
    if (!GLctx.currentArrayBufferBinding) {
     if (arrayBuffer != GLImmediate.lastArrayBuffer) {
      GLctx.bindBuffer(GLctx.ARRAY_BUFFER, arrayBuffer);
      GLImmediate.lastArrayBuffer = arrayBuffer;
     }
     GLctx.bufferSubData(GLctx.ARRAY_BUFFER, start, GLImmediate.vertexData.subarray(start >> 2, end >> 2));
    }
    if (!GL.currProgram) {
     if (GLImmediate.fixedFunctionProgram != this.program) {
      GLctx.useProgram(this.program);
      GLImmediate.fixedFunctionProgram = this.program;
     }
    }
    if (this.modelViewLocation && this.modelViewMatrixVersion != GLImmediate.matrixVersion[0]) {
     this.modelViewMatrixVersion = GLImmediate.matrixVersion[0];
     GLctx.uniformMatrix4fv(this.modelViewLocation, false, GLImmediate.matrix[0]);
     if (GLEmulation.lightEnabled) {
      var tmpMVinv = GLImmediate.matrixLib.mat4.create(GLImmediate.matrix[0]);
      GLImmediate.matrixLib.mat4.inverse(tmpMVinv);
      GLImmediate.matrixLib.mat4.transpose(tmpMVinv);
      GLctx.uniformMatrix3fv(this.normalMatrixLocation, false, GLImmediate.matrixLib.mat4.toMat3(tmpMVinv));
     }
    }
    if (this.projectionLocation && this.projectionMatrixVersion != GLImmediate.matrixVersion[1]) {
     this.projectionMatrixVersion = GLImmediate.matrixVersion[1];
     GLctx.uniformMatrix4fv(this.projectionLocation, false, GLImmediate.matrix[1]);
    }
    var clientAttributes = GLImmediate.clientAttributes;
    var posAttr = clientAttributes[GLImmediate.VERTEX];
    GLctx.vertexAttribPointer(this.positionLocation, posAttr.size, posAttr.type, false, GLImmediate.stride, posAttr.offset);
    GLctx.enableVertexAttribArray(this.positionLocation);
    if (this.hasNormal) {
     var normalAttr = clientAttributes[GLImmediate.NORMAL];
     GLctx.vertexAttribPointer(this.normalLocation, normalAttr.size, normalAttr.type, true, GLImmediate.stride, normalAttr.offset);
     GLctx.enableVertexAttribArray(this.normalLocation);
    }
    if (this.hasTextures) {
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      var attribLoc = this.texCoordLocations[i];
      if (attribLoc === undefined || attribLoc < 0) continue;
      var texAttr = clientAttributes[GLImmediate.TEXTURE0 + i];
      if (texAttr.size) {
       GLctx.vertexAttribPointer(attribLoc, texAttr.size, texAttr.type, false, GLImmediate.stride, texAttr.offset);
       GLctx.enableVertexAttribArray(attribLoc);
      } else {
       GLctx.vertexAttrib4f(attribLoc, 0, 0, 0, 1);
       GLctx.disableVertexAttribArray(attribLoc);
      }
      var t = 2 + i;
      if (this.textureMatrixLocations[i] && this.textureMatrixVersion[t] != GLImmediate.matrixVersion[t]) {
       this.textureMatrixVersion[t] = GLImmediate.matrixVersion[t];
       GLctx.uniformMatrix4fv(this.textureMatrixLocations[i], false, GLImmediate.matrix[t]);
      }
     }
    }
    if (GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
     var colorAttr = clientAttributes[GLImmediate.COLOR];
     GLctx.vertexAttribPointer(this.colorLocation, colorAttr.size, colorAttr.type, true, GLImmediate.stride, colorAttr.offset);
     GLctx.enableVertexAttribArray(this.colorLocation);
    } else if (this.hasColor) {
     GLctx.disableVertexAttribArray(this.colorLocation);
     GLctx.vertexAttrib4fv(this.colorLocation, GLImmediate.clientColor);
    }
    if (this.hasFog) {
     if (this.fogColorLocation) GLctx.uniform4fv(this.fogColorLocation, GLEmulation.fogColor);
     if (this.fogEndLocation) GLctx.uniform1f(this.fogEndLocation, GLEmulation.fogEnd);
     if (this.fogScaleLocation) GLctx.uniform1f(this.fogScaleLocation, 1 / (GLEmulation.fogEnd - GLEmulation.fogStart));
     if (this.fogDensityLocation) GLctx.uniform1f(this.fogDensityLocation, GLEmulation.fogDensity);
    }
    if (this.hasClipPlane) {
     for (var clipPlaneId = 0; clipPlaneId < GLEmulation.MAX_CLIP_PLANES; clipPlaneId++) {
      if (this.clipPlaneEquationLocation[clipPlaneId]) GLctx.uniform4fv(this.clipPlaneEquationLocation[clipPlaneId], GLEmulation.clipPlaneEquation[clipPlaneId]);
     }
    }
    if (this.hasLighting) {
     if (this.lightModelAmbientLocation) GLctx.uniform4fv(this.lightModelAmbientLocation, GLEmulation.lightModelAmbient);
     if (this.materialAmbientLocation) GLctx.uniform4fv(this.materialAmbientLocation, GLEmulation.materialAmbient);
     if (this.materialDiffuseLocation) GLctx.uniform4fv(this.materialDiffuseLocation, GLEmulation.materialDiffuse);
     if (this.materialSpecularLocation) GLctx.uniform4fv(this.materialSpecularLocation, GLEmulation.materialSpecular);
     if (this.materialShininessLocation) GLctx.uniform1f(this.materialShininessLocation, GLEmulation.materialShininess[0]);
     if (this.materialEmissionLocation) GLctx.uniform4fv(this.materialEmissionLocation, GLEmulation.materialEmission);
     for (var lightId = 0; lightId < GLEmulation.MAX_LIGHTS; lightId++) {
      if (this.lightAmbientLocation[lightId]) GLctx.uniform4fv(this.lightAmbientLocation[lightId], GLEmulation.lightAmbient[lightId]);
      if (this.lightDiffuseLocation[lightId]) GLctx.uniform4fv(this.lightDiffuseLocation[lightId], GLEmulation.lightDiffuse[lightId]);
      if (this.lightSpecularLocation[lightId]) GLctx.uniform4fv(this.lightSpecularLocation[lightId], GLEmulation.lightSpecular[lightId]);
      if (this.lightPositionLocation[lightId]) GLctx.uniform4fv(this.lightPositionLocation[lightId], GLEmulation.lightPosition[lightId]);
     }
    }
    if (this.hasAlphaTest) {
     if (this.alphaTestRefLocation) GLctx.uniform1f(this.alphaTestRefLocation, GLEmulation.alphaTestRef);
    }
    if (GLImmediate.mode == GLctx.POINTS) {
     if (this.pointSizeLocation) {
      GLctx.uniform1f(this.pointSizeLocation, GLEmulation.pointSize);
     }
    }
   };
   this.cleanup = function() {
    GLctx.disableVertexAttribArray(this.positionLocation);
    if (this.hasTextures) {
     for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
      if (GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i] && this.texCoordLocations[i] >= 0) {
       GLctx.disableVertexAttribArray(this.texCoordLocations[i]);
      }
     }
    }
    if (this.hasColor) {
     GLctx.disableVertexAttribArray(this.colorLocation);
    }
    if (this.hasNormal) {
     GLctx.disableVertexAttribArray(this.normalLocation);
    }
    if (!GL.currProgram) {
     GLctx.useProgram(null);
     GLImmediate.fixedFunctionProgram = 0;
    }
    if (!GLctx.currentArrayBufferBinding) {
     GLctx.bindBuffer(GLctx.ARRAY_BUFFER, null);
     GLImmediate.lastArrayBuffer = null;
    }
    GLImmediate.matricesModified = true;
   };
   this.init();
  }
  return new Renderer();
 },
 setupFuncs: function() {
  GLImmediate.MapTreeLib = GLImmediate.spawnMapTreeLib();
  GLImmediate.spawnMapTreeLib = null;
  GLImmediate.TexEnvJIT = GLImmediate.spawnTexEnvJIT();
  GLImmediate.spawnTexEnvJIT = null;
  GLImmediate.setupHooks();
 },
 setupHooks: function() {
  if (!GLEmulation.hasRunInit) {
   GLEmulation.init();
  }
  var glActiveTexture = _glActiveTexture;
  _glActiveTexture = _emscripten_glActiveTexture = (texture => {
   GLImmediate.TexEnvJIT.hook_activeTexture(texture);
   glActiveTexture(texture);
  });
  var glEnable = _glEnable;
  _glEnable = _emscripten_glEnable = (cap => {
   GLImmediate.TexEnvJIT.hook_enable(cap);
   glEnable(cap);
  });
  var glDisable = _glDisable;
  _glDisable = _emscripten_glDisable = (cap => {
   GLImmediate.TexEnvJIT.hook_disable(cap);
   glDisable(cap);
  });
  _glTexEnvf = _emscripten_glTexEnvf = ((target, pname, param) => {
   GLImmediate.TexEnvJIT.hook_texEnvf(target, pname, param);
  });
  _glTexEnvi = _emscripten_glTexEnvi = ((target, pname, param) => {
   GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param);
  });
  _glTexEnvfv = _emscripten_glTexEnvfv = ((target, pname, param) => {
   GLImmediate.TexEnvJIT.hook_texEnvfv(target, pname, param);
  });
  _glGetTexEnviv = ((target, pname, param) => {
   GLImmediate.TexEnvJIT.hook_getTexEnviv(target, pname, param);
  });
  _glGetTexEnvfv = ((target, pname, param) => {
   GLImmediate.TexEnvJIT.hook_getTexEnvfv(target, pname, param);
  });
  var glGetIntegerv = _glGetIntegerv;
  _glGetIntegerv = _emscripten_glGetIntegerv = ((pname, params) => {
   switch (pname) {
   case 35725:
    {
     var cur = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
     if (cur == GLImmediate.fixedFunctionProgram) {
      HEAP32[params >> 2] = 0;
      return;
     }
     break;
    }
   }
   glGetIntegerv(pname, params);
  });
 },
 initted: false,
 init: function() {
  err("WARNING: using emscripten GL immediate mode emulation. This is very limited in what it supports");
  GLImmediate.initted = true;
  if (!Module.useWebGL) return;
  GLImmediate.MAX_TEXTURES = Math.max(Module["GL_MAX_TEXTURE_IMAGE_UNITS"] || GLctx.getParameter(GLctx.MAX_TEXTURE_IMAGE_UNITS), 28);
  GLImmediate.TexEnvJIT.init(GLctx, GLImmediate.MAX_TEXTURES);
  GLImmediate.NUM_ATTRIBUTES = 3 + GLImmediate.MAX_TEXTURES;
  GLImmediate.clientAttributes = [];
  GLEmulation.enabledClientAttribIndices = [];
  for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
   GLImmediate.clientAttributes.push({});
   GLEmulation.enabledClientAttribIndices.push(false);
  }
  GLImmediate.matrix = [];
  GLImmediate.matrixStack = [];
  GLImmediate.matrixVersion = [];
  for (var i = 0; i < 2 + GLImmediate.MAX_TEXTURES; i++) {
   GLImmediate.matrixStack.push([]);
   GLImmediate.matrixVersion.push(0);
   GLImmediate.matrix.push(GLImmediate.matrixLib.mat4.create());
   GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[i]);
  }
  GLImmediate.rendererCache = GLImmediate.MapTreeLib.create();
  GLImmediate.tempData = new Float32Array(GL.MAX_TEMP_BUFFER_SIZE >> 2);
  GLImmediate.indexData = new Uint16Array(GL.MAX_TEMP_BUFFER_SIZE >> 1);
  GLImmediate.vertexDataU8 = new Uint8Array(GLImmediate.tempData.buffer);
  GL.generateTempBuffers(true, GL.currentContext);
  GLImmediate.clientColor = new Float32Array([ 1, 1, 1, 1 ]);
 },
 prepareClientAttributes: function prepareClientAttributes(count, beginEnd) {
  if (!GLImmediate.modifiedClientAttributes) {
   GLImmediate.vertexCounter = GLImmediate.stride * count / 4;
   return;
  }
  GLImmediate.modifiedClientAttributes = false;
  var clientStartPointer = 2147483647;
  var bytes = 0;
  var minStride = 2147483647;
  var maxStride = 0;
  var attributes = GLImmediate.liveClientAttributes;
  attributes.length = 0;
  for (var i = 0; i < 3 + GLImmediate.MAX_TEXTURES; i++) {
   if (GLImmediate.enabledClientAttributes[i]) {
    var attr = GLImmediate.clientAttributes[i];
    attributes.push(attr);
    clientStartPointer = Math.min(clientStartPointer, attr.pointer);
    attr.sizeBytes = attr.size * GL.byteSizeByType[attr.type - GL.byteSizeByTypeRoot];
    bytes += attr.sizeBytes;
    minStride = Math.min(minStride, attr.stride);
    maxStride = Math.max(maxStride, attr.stride);
   }
  }
  if ((minStride != maxStride || maxStride < bytes) && !beginEnd) {
   if (!GLImmediate.restrideBuffer) GLImmediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
   var start = GLImmediate.restrideBuffer;
   bytes = 0;
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    var size = attr.sizeBytes;
    if (size % 4 != 0) size += 4 - size % 4;
    attr.offset = bytes;
    bytes += size;
   }
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    var srcStride = Math.max(attr.sizeBytes, attr.stride);
    if ((srcStride & 3) == 0 && (attr.sizeBytes & 3) == 0) {
     var size4 = attr.sizeBytes >> 2;
     var srcStride4 = Math.max(attr.sizeBytes, attr.stride) >> 2;
     for (var j = 0; j < count; j++) {
      for (var k = 0; k < size4; k++) {
       HEAP32[(start + attr.offset + bytes * j >> 2) + k] = HEAP32[(attr.pointer >> 2) + j * srcStride4 + k];
      }
     }
    } else {
     for (var j = 0; j < count; j++) {
      for (var k = 0; k < attr.sizeBytes; k++) {
       HEAP8[start + attr.offset + bytes * j + k] = HEAP8[attr.pointer + j * srcStride + k];
      }
     }
    }
    attr.pointer = start + attr.offset;
   }
   GLImmediate.stride = bytes;
   GLImmediate.vertexPointer = start;
  } else {
   if (GLctx.currentArrayBufferBinding) {
    GLImmediate.vertexPointer = 0;
   } else {
    GLImmediate.vertexPointer = clientStartPointer;
   }
   for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    attr.offset = attr.pointer - GLImmediate.vertexPointer;
   }
   GLImmediate.stride = Math.max(maxStride, bytes);
  }
  if (!beginEnd) {
   GLImmediate.vertexCounter = GLImmediate.stride * count / 4;
  }
 },
 flush: function flush(numProvidedIndexes, startIndex, ptr) {
  startIndex = startIndex || 0;
  ptr = ptr || 0;
  var renderer = GLImmediate.getRenderer();
  var numVertexes = 4 * GLImmediate.vertexCounter / GLImmediate.stride;
  if (!numVertexes) return;
  var emulatedElementArrayBuffer = false;
  var numIndexes = 0;
  if (numProvidedIndexes) {
   numIndexes = numProvidedIndexes;
   if (!GLctx.currentArrayBufferBinding && GLImmediate.firstVertex > GLImmediate.lastVertex) {
    for (var i = 0; i < numProvidedIndexes; i++) {
     var currIndex = HEAPU16[ptr + i * 2 >> 1];
     GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
     GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex + 1);
    }
   }
   if (!GLctx.currentElementArrayBufferBinding) {
    var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes << 1);
    GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray(ptr >> 1, ptr + (numProvidedIndexes << 1) >> 1));
    ptr = 0;
    emulatedElementArrayBuffer = true;
   }
  } else if (GLImmediate.mode > 6) {
   if (GLImmediate.mode != 7) throw "unsupported immediate mode " + GLImmediate.mode;
   ptr = GLImmediate.firstVertex * 3;
   var numQuads = numVertexes / 4;
   numIndexes = numQuads * 6;
   GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempQuadIndexBuffer);
   emulatedElementArrayBuffer = true;
   GLImmediate.mode = GLctx.TRIANGLES;
  }
  renderer.prepare();
  if (numIndexes) {
   GLctx.drawElements(GLImmediate.mode, numIndexes, GLctx.UNSIGNED_SHORT, ptr);
  } else {
   GLctx.drawArrays(GLImmediate.mode, startIndex, numVertexes);
  }
  if (emulatedElementArrayBuffer) {
   GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.buffers[GLctx.currentElementArrayBufferBinding] || null);
  }
  renderer.cleanup();
 }
};

GLImmediate.matrixLib = function() {
 var vec3 = {};
 var mat3 = {};
 var mat4 = {};
 var quat4 = {};
 var MatrixArray = Float32Array;
 vec3.create = function(vec) {
  var dest = new MatrixArray(3);
  if (vec) {
   dest[0] = vec[0];
   dest[1] = vec[1];
   dest[2] = vec[2];
  } else {
   dest[0] = dest[1] = dest[2] = 0;
  }
  return dest;
 };
 vec3.set = function(vec, dest) {
  dest[0] = vec[0];
  dest[1] = vec[1];
  dest[2] = vec[2];
  return dest;
 };
 vec3.add = function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] += vec2[0];
   vec[1] += vec2[1];
   vec[2] += vec2[2];
   return vec;
  }
  dest[0] = vec[0] + vec2[0];
  dest[1] = vec[1] + vec2[1];
  dest[2] = vec[2] + vec2[2];
  return dest;
 };
 vec3.subtract = function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] -= vec2[0];
   vec[1] -= vec2[1];
   vec[2] -= vec2[2];
   return vec;
  }
  dest[0] = vec[0] - vec2[0];
  dest[1] = vec[1] - vec2[1];
  dest[2] = vec[2] - vec2[2];
  return dest;
 };
 vec3.multiply = function(vec, vec2, dest) {
  if (!dest || vec === dest) {
   vec[0] *= vec2[0];
   vec[1] *= vec2[1];
   vec[2] *= vec2[2];
   return vec;
  }
  dest[0] = vec[0] * vec2[0];
  dest[1] = vec[1] * vec2[1];
  dest[2] = vec[2] * vec2[2];
  return dest;
 };
 vec3.negate = function(vec, dest) {
  if (!dest) {
   dest = vec;
  }
  dest[0] = -vec[0];
  dest[1] = -vec[1];
  dest[2] = -vec[2];
  return dest;
 };
 vec3.scale = function(vec, val, dest) {
  if (!dest || vec === dest) {
   vec[0] *= val;
   vec[1] *= val;
   vec[2] *= val;
   return vec;
  }
  dest[0] = vec[0] * val;
  dest[1] = vec[1] * val;
  dest[2] = vec[2] * val;
  return dest;
 };
 vec3.normalize = function(vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], len = Math.sqrt(x * x + y * y + z * z);
  if (!len) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   return dest;
  } else if (len === 1) {
   dest[0] = x;
   dest[1] = y;
   dest[2] = z;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  return dest;
 };
 vec3.cross = function(vec, vec2, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
  dest[0] = y * z2 - z * y2;
  dest[1] = z * x2 - x * z2;
  dest[2] = x * y2 - y * x2;
  return dest;
 };
 vec3.length = function(vec) {
  var x = vec[0], y = vec[1], z = vec[2];
  return Math.sqrt(x * x + y * y + z * z);
 };
 vec3.dot = function(vec, vec2) {
  return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
 };
 vec3.direction = function(vec, vec2, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0] - vec2[0], y = vec[1] - vec2[1], z = vec[2] - vec2[2], len = Math.sqrt(x * x + y * y + z * z);
  if (!len) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  return dest;
 };
 vec3.lerp = function(vec, vec2, lerp, dest) {
  if (!dest) {
   dest = vec;
  }
  dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
  dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
  dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
  return dest;
 };
 vec3.dist = function(vec, vec2) {
  var x = vec2[0] - vec[0], y = vec2[1] - vec[1], z = vec2[2] - vec[2];
  return Math.sqrt(x * x + y * y + z * z);
 };
 vec3.unproject = function(vec, view, proj, viewport, dest) {
  if (!dest) {
   dest = vec;
  }
  var m = mat4.create();
  var v = new MatrixArray(4);
  v[0] = (vec[0] - viewport[0]) * 2 / viewport[2] - 1;
  v[1] = (vec[1] - viewport[1]) * 2 / viewport[3] - 1;
  v[2] = 2 * vec[2] - 1;
  v[3] = 1;
  mat4.multiply(proj, view, m);
  if (!mat4.inverse(m)) {
   return null;
  }
  mat4.multiplyVec4(m, v);
  if (v[3] === 0) {
   return null;
  }
  dest[0] = v[0] / v[3];
  dest[1] = v[1] / v[3];
  dest[2] = v[2] / v[3];
  return dest;
 };
 vec3.str = function(vec) {
  return "[" + vec[0] + ", " + vec[1] + ", " + vec[2] + "]";
 };
 mat3.create = function(mat) {
  var dest = new MatrixArray(9);
  if (mat) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[8] = mat[8];
  }
  return dest;
 };
 mat3.set = function(mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  return dest;
 };
 mat3.identity = function(dest) {
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 1;
  dest[5] = 0;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 1;
  return dest;
 };
 mat3.transpose = function(mat, dest) {
  if (!dest || mat === dest) {
   var a01 = mat[1], a02 = mat[2], a12 = mat[5];
   mat[1] = mat[3];
   mat[2] = mat[6];
   mat[3] = a01;
   mat[5] = mat[7];
   mat[6] = a02;
   mat[7] = a12;
   return mat;
  }
  dest[0] = mat[0];
  dest[1] = mat[3];
  dest[2] = mat[6];
  dest[3] = mat[1];
  dest[4] = mat[4];
  dest[5] = mat[7];
  dest[6] = mat[2];
  dest[7] = mat[5];
  dest[8] = mat[8];
  return dest;
 };
 mat3.toMat4 = function(mat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[15] = 1;
  dest[14] = 0;
  dest[13] = 0;
  dest[12] = 0;
  dest[11] = 0;
  dest[10] = mat[8];
  dest[9] = mat[7];
  dest[8] = mat[6];
  dest[7] = 0;
  dest[6] = mat[5];
  dest[5] = mat[4];
  dest[4] = mat[3];
  dest[3] = 0;
  dest[2] = mat[2];
  dest[1] = mat[1];
  dest[0] = mat[0];
  return dest;
 };
 mat3.str = function(mat) {
  return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + "]";
 };
 mat4.create = function(mat) {
  var dest = new MatrixArray(16);
  if (mat) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[8] = mat[8];
   dest[9] = mat[9];
   dest[10] = mat[10];
   dest[11] = mat[11];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  return dest;
 };
 mat4.set = function(mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
 };
 mat4.identity = function(dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 1;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = 1;
  dest[11] = 0;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 };
 mat4.transpose = function(mat, dest) {
  if (!dest || mat === dest) {
   var a01 = mat[1], a02 = mat[2], a03 = mat[3], a12 = mat[6], a13 = mat[7], a23 = mat[11];
   mat[1] = mat[4];
   mat[2] = mat[8];
   mat[3] = mat[12];
   mat[4] = a01;
   mat[6] = mat[9];
   mat[7] = mat[13];
   mat[8] = a02;
   mat[9] = a12;
   mat[11] = mat[14];
   mat[12] = a03;
   mat[13] = a13;
   mat[14] = a23;
   return mat;
  }
  dest[0] = mat[0];
  dest[1] = mat[4];
  dest[2] = mat[8];
  dest[3] = mat[12];
  dest[4] = mat[1];
  dest[5] = mat[5];
  dest[6] = mat[9];
  dest[7] = mat[13];
  dest[8] = mat[2];
  dest[9] = mat[6];
  dest[10] = mat[10];
  dest[11] = mat[14];
  dest[12] = mat[3];
  dest[13] = mat[7];
  dest[14] = mat[11];
  dest[15] = mat[15];
  return dest;
 };
 mat4.determinant = function(mat) {
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
  return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 + a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 + a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 + a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 + a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 + a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33;
 };
 mat4.inverse = function(mat, dest) {
  if (!dest) {
   dest = mat;
  }
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06, invDet;
  if (!d) {
   return null;
  }
  invDet = 1 / d;
  dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
  dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
  dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
  dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
  dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
  dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
  dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
  dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
  dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
  return dest;
 };
 mat4.toRotationMat = function(mat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 };
 mat4.toMat3 = function(mat, dest) {
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[4];
  dest[4] = mat[5];
  dest[5] = mat[6];
  dest[6] = mat[8];
  dest[7] = mat[9];
  dest[8] = mat[10];
  return dest;
 };
 mat4.toInverseMat3 = function(mat, dest) {
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a10 = mat[4], a11 = mat[5], a12 = mat[6], a20 = mat[8], a21 = mat[9], a22 = mat[10], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20, d = a00 * b01 + a01 * b11 + a02 * b21, id;
  if (!d) {
   return null;
  }
  id = 1 / d;
  if (!dest) {
   dest = mat3.create();
  }
  dest[0] = b01 * id;
  dest[1] = (-a22 * a01 + a02 * a21) * id;
  dest[2] = (a12 * a01 - a02 * a11) * id;
  dest[3] = b11 * id;
  dest[4] = (a22 * a00 - a02 * a20) * id;
  dest[5] = (-a12 * a00 + a02 * a10) * id;
  dest[6] = b21 * id;
  dest[7] = (-a21 * a00 + a01 * a20) * id;
  dest[8] = (a11 * a00 - a01 * a10) * id;
  return dest;
 };
 mat4.multiply = function(mat, mat2, dest) {
  if (!dest) {
   dest = mat;
  }
  var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3], b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7], b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11], b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
  dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
  dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
  dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
  dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
  dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
  dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
  dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
  dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
  dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
  dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
  dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
  dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
  dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
  dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
  dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
  dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
  return dest;
 };
 mat4.multiplyVec3 = function(mat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2];
  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
  return dest;
 };
 mat4.multiplyVec4 = function(mat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
  dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
  return dest;
 };
 mat4.translate = function(mat, vec, dest) {
  var x = vec[0], y = vec[1], z = vec[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
  if (!dest || mat === dest) {
   mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
   mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
   mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
   mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
   return mat;
  }
  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];
  dest[0] = a00;
  dest[1] = a01;
  dest[2] = a02;
  dest[3] = a03;
  dest[4] = a10;
  dest[5] = a11;
  dest[6] = a12;
  dest[7] = a13;
  dest[8] = a20;
  dest[9] = a21;
  dest[10] = a22;
  dest[11] = a23;
  dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
  dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
  dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
  dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
  return dest;
 };
 mat4.scale = function(mat, vec, dest) {
  var x = vec[0], y = vec[1], z = vec[2];
  if (!dest || mat === dest) {
   mat[0] *= x;
   mat[1] *= x;
   mat[2] *= x;
   mat[3] *= x;
   mat[4] *= y;
   mat[5] *= y;
   mat[6] *= y;
   mat[7] *= y;
   mat[8] *= z;
   mat[9] *= z;
   mat[10] *= z;
   mat[11] *= z;
   return mat;
  }
  dest[0] = mat[0] * x;
  dest[1] = mat[1] * x;
  dest[2] = mat[2] * x;
  dest[3] = mat[3] * x;
  dest[4] = mat[4] * y;
  dest[5] = mat[5] * y;
  dest[6] = mat[6] * y;
  dest[7] = mat[7] * y;
  dest[8] = mat[8] * z;
  dest[9] = mat[9] * z;
  dest[10] = mat[10] * z;
  dest[11] = mat[11] * z;
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
 };
 mat4.rotate = function(mat, angle, axis, dest) {
  var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
  if (!len) {
   return null;
  }
  if (len !== 1) {
   len = 1 / len;
   x *= len;
   y *= len;
   z *= len;
  }
  s = Math.sin(angle);
  c = Math.cos(angle);
  t = 1 - c;
  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
  dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
  dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
  dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
  dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
  dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
  dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
  dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
  dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
  dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
  dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
  dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
  return dest;
 };
 mat4.rotateX = function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[0] = mat[0];
   dest[1] = mat[1];
   dest[2] = mat[2];
   dest[3] = mat[3];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[4] = a10 * c + a20 * s;
  dest[5] = a11 * c + a21 * s;
  dest[6] = a12 * c + a22 * s;
  dest[7] = a13 * c + a23 * s;
  dest[8] = a10 * -s + a20 * c;
  dest[9] = a11 * -s + a21 * c;
  dest[10] = a12 * -s + a22 * c;
  dest[11] = a13 * -s + a23 * c;
  return dest;
 };
 mat4.rotateY = function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[4] = mat[4];
   dest[5] = mat[5];
   dest[6] = mat[6];
   dest[7] = mat[7];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * c + a20 * -s;
  dest[1] = a01 * c + a21 * -s;
  dest[2] = a02 * c + a22 * -s;
  dest[3] = a03 * c + a23 * -s;
  dest[8] = a00 * s + a20 * c;
  dest[9] = a01 * s + a21 * c;
  dest[10] = a02 * s + a22 * c;
  dest[11] = a03 * s + a23 * c;
  return dest;
 };
 mat4.rotateZ = function(mat, angle, dest) {
  var s = Math.sin(angle), c = Math.cos(angle), a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
  if (!dest) {
   dest = mat;
  } else if (mat !== dest) {
   dest[8] = mat[8];
   dest[9] = mat[9];
   dest[10] = mat[10];
   dest[11] = mat[11];
   dest[12] = mat[12];
   dest[13] = mat[13];
   dest[14] = mat[14];
   dest[15] = mat[15];
  }
  dest[0] = a00 * c + a10 * s;
  dest[1] = a01 * c + a11 * s;
  dest[2] = a02 * c + a12 * s;
  dest[3] = a03 * c + a13 * s;
  dest[4] = a00 * -s + a10 * c;
  dest[5] = a01 * -s + a11 * c;
  dest[6] = a02 * -s + a12 * c;
  dest[7] = a03 * -s + a13 * c;
  return dest;
 };
 mat4.frustum = function(left, right, bottom, top, near, far, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var rl = right - left, tb = top - bottom, fn = far - near;
  dest[0] = near * 2 / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = near * 2 / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = (right + left) / rl;
  dest[9] = (top + bottom) / tb;
  dest[10] = -(far + near) / fn;
  dest[11] = -1;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = -(far * near * 2) / fn;
  dest[15] = 0;
  return dest;
 };
 mat4.perspective = function(fovy, aspect, near, far, dest) {
  var top = near * Math.tan(fovy * Math.PI / 360), right = top * aspect;
  return mat4.frustum(-right, right, -top, top, near, far, dest);
 };
 mat4.ortho = function(left, right, bottom, top, near, far, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var rl = right - left, tb = top - bottom, fn = far - near;
  dest[0] = 2 / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 2 / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = -2 / fn;
  dest[11] = 0;
  dest[12] = -(left + right) / rl;
  dest[13] = -(top + bottom) / tb;
  dest[14] = -(far + near) / fn;
  dest[15] = 1;
  return dest;
 };
 mat4.lookAt = function(eye, center, up, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len, eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
  if (eyex === centerx && eyey === centery && eyez === centerz) {
   return mat4.identity(dest);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
   x0 = 0;
   x1 = 0;
   x2 = 0;
  } else {
   len = 1 / len;
   x0 *= len;
   x1 *= len;
   x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
   y0 = 0;
   y1 = 0;
   y2 = 0;
  } else {
   len = 1 / len;
   y0 *= len;
   y1 *= len;
   y2 *= len;
  }
  dest[0] = x0;
  dest[1] = y0;
  dest[2] = z0;
  dest[3] = 0;
  dest[4] = x1;
  dest[5] = y1;
  dest[6] = z1;
  dest[7] = 0;
  dest[8] = x2;
  dest[9] = y2;
  dest[10] = z2;
  dest[11] = 0;
  dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  dest[15] = 1;
  return dest;
 };
 mat4.fromRotationTranslation = function(quat, vec, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = 0;
  dest[4] = xy - wz;
  dest[5] = 1 - (xx + zz);
  dest[6] = yz + wx;
  dest[7] = 0;
  dest[8] = xz + wy;
  dest[9] = yz - wx;
  dest[10] = 1 - (xx + yy);
  dest[11] = 0;
  dest[12] = vec[0];
  dest[13] = vec[1];
  dest[14] = vec[2];
  dest[15] = 1;
  return dest;
 };
 mat4.str = function(mat) {
  return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + ", " + mat[9] + ", " + mat[10] + ", " + mat[11] + ", " + mat[12] + ", " + mat[13] + ", " + mat[14] + ", " + mat[15] + "]";
 };
 quat4.create = function(quat) {
  var dest = new MatrixArray(4);
  if (quat) {
   dest[0] = quat[0];
   dest[1] = quat[1];
   dest[2] = quat[2];
   dest[3] = quat[3];
  }
  return dest;
 };
 quat4.set = function(quat, dest) {
  dest[0] = quat[0];
  dest[1] = quat[1];
  dest[2] = quat[2];
  dest[3] = quat[3];
  return dest;
 };
 quat4.calculateW = function(quat, dest) {
  var x = quat[0], y = quat[1], z = quat[2];
  if (!dest || quat === dest) {
   quat[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
   return quat;
  }
  dest[0] = x;
  dest[1] = y;
  dest[2] = z;
  dest[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return dest;
 };
 quat4.dot = function(quat, quat2) {
  return quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3];
 };
 quat4.inverse = function(quat, dest) {
  var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3], dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3, invDot = dot ? 1 / dot : 0;
  if (!dest || quat === dest) {
   quat[0] *= -invDot;
   quat[1] *= -invDot;
   quat[2] *= -invDot;
   quat[3] *= invDot;
   return quat;
  }
  dest[0] = -quat[0] * invDot;
  dest[1] = -quat[1] * invDot;
  dest[2] = -quat[2] * invDot;
  dest[3] = quat[3] * invDot;
  return dest;
 };
 quat4.conjugate = function(quat, dest) {
  if (!dest || quat === dest) {
   quat[0] *= -1;
   quat[1] *= -1;
   quat[2] *= -1;
   return quat;
  }
  dest[0] = -quat[0];
  dest[1] = -quat[1];
  dest[2] = -quat[2];
  dest[3] = quat[3];
  return dest;
 };
 quat4.length = function(quat) {
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
 };
 quat4.normalize = function(quat, dest) {
  if (!dest) {
   dest = quat;
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], len = Math.sqrt(x * x + y * y + z * z + w * w);
  if (len === 0) {
   dest[0] = 0;
   dest[1] = 0;
   dest[2] = 0;
   dest[3] = 0;
   return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  dest[3] = w * len;
  return dest;
 };
 quat4.add = function(quat, quat2, dest) {
  if (!dest || quat === dest) {
   quat[0] += quat2[0];
   quat[1] += quat2[1];
   quat[2] += quat2[2];
   quat[3] += quat2[3];
   return quat;
  }
  dest[0] = quat[0] + quat2[0];
  dest[1] = quat[1] + quat2[1];
  dest[2] = quat[2] + quat2[2];
  dest[3] = quat[3] + quat2[3];
  return dest;
 };
 quat4.multiply = function(quat, quat2, dest) {
  if (!dest) {
   dest = quat;
  }
  var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3], qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];
  dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
  return dest;
 };
 quat4.multiplyVec3 = function(quat, vec, dest) {
  if (!dest) {
   dest = vec;
  }
  var x = vec[0], y = vec[1], z = vec[2], qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3], ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
  dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return dest;
 };
 quat4.scale = function(quat, val, dest) {
  if (!dest || quat === dest) {
   quat[0] *= val;
   quat[1] *= val;
   quat[2] *= val;
   quat[3] *= val;
   return quat;
  }
  dest[0] = quat[0] * val;
  dest[1] = quat[1] * val;
  dest[2] = quat[2] * val;
  dest[3] = quat[3] * val;
  return dest;
 };
 quat4.toMat3 = function(quat, dest) {
  if (!dest) {
   dest = mat3.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = xy - wz;
  dest[4] = 1 - (xx + zz);
  dest[5] = yz + wx;
  dest[6] = xz + wy;
  dest[7] = yz - wx;
  dest[8] = 1 - (xx + yy);
  return dest;
 };
 quat4.toMat4 = function(quat, dest) {
  if (!dest) {
   dest = mat4.create();
  }
  var x = quat[0], y = quat[1], z = quat[2], w = quat[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = 0;
  dest[4] = xy - wz;
  dest[5] = 1 - (xx + zz);
  dest[6] = yz + wx;
  dest[7] = 0;
  dest[8] = xz + wy;
  dest[9] = yz - wx;
  dest[10] = 1 - (xx + yy);
  dest[11] = 0;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
 };
 quat4.slerp = function(quat, quat2, slerp, dest) {
  if (!dest) {
   dest = quat;
  }
  var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3], halfTheta, sinHalfTheta, ratioA, ratioB;
  if (Math.abs(cosHalfTheta) >= 1) {
   if (dest !== quat) {
    dest[0] = quat[0];
    dest[1] = quat[1];
    dest[2] = quat[2];
    dest[3] = quat[3];
   }
   return dest;
  }
  halfTheta = Math.acos(cosHalfTheta);
  sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
  if (Math.abs(sinHalfTheta) < .001) {
   dest[0] = quat[0] * .5 + quat2[0] * .5;
   dest[1] = quat[1] * .5 + quat2[1] * .5;
   dest[2] = quat[2] * .5 + quat2[2] * .5;
   dest[3] = quat[3] * .5 + quat2[3] * .5;
   return dest;
  }
  ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
  ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
  dest[0] = quat[0] * ratioA + quat2[0] * ratioB;
  dest[1] = quat[1] * ratioA + quat2[1] * ratioB;
  dest[2] = quat[2] * ratioA + quat2[2] * ratioB;
  dest[3] = quat[3] * ratioA + quat2[3] * ratioB;
  return dest;
 };
 quat4.str = function(quat) {
  return "[" + quat[0] + ", " + quat[1] + ", " + quat[2] + ", " + quat[3] + "]";
 };
 return {
  vec3: vec3,
  mat3: mat3,
  mat4: mat4,
  quat4: quat4
 };
}();

function _emscripten_glBegin(mode) {
 GLImmediate.enabledClientAttributes_preBegin = GLImmediate.enabledClientAttributes;
 GLImmediate.enabledClientAttributes = [];
 GLImmediate.clientAttributes_preBegin = GLImmediate.clientAttributes;
 GLImmediate.clientAttributes = [];
 for (var i = 0; i < GLImmediate.clientAttributes_preBegin.length; i++) {
  GLImmediate.clientAttributes.push({});
 }
 GLImmediate.mode = mode;
 GLImmediate.vertexCounter = 0;
 var components = GLImmediate.rendererComponents = [];
 for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
  components[i] = 0;
 }
 GLImmediate.rendererComponentPointer = 0;
 GLImmediate.vertexData = GLImmediate.tempData;
}

function _emscripten_glBeginQuery(target, id) {
 GLctx["beginQuery"](target, GL.queries[id]);
}

function _emscripten_glBeginQueryEXT(target, id) {
 GLctx.disjointTimerQueryExt["beginQueryEXT"](target, GL.queries[id]);
}

function _emscripten_glBeginTransformFeedback(x0) {
 GLctx["beginTransformFeedback"](x0);
}

function _emscripten_glBindAttribLocation(program, index, name) {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}

function _emscripten_glBindBuffer(target, buffer) {
 if (target == 34962) {
  GLctx.currentArrayBufferBinding = buffer;
  GLImmediate.lastArrayBuffer = buffer;
 } else if (target == 34963) {
  GLctx.currentElementArrayBufferBinding = buffer;
 }
 if (target == 35051) {
  GLctx.currentPixelPackBufferBinding = buffer;
 } else if (target == 35052) {
  GLctx.currentPixelUnpackBufferBinding = buffer;
 }
 GLctx.bindBuffer(target, GL.buffers[buffer]);
}

function _emscripten_glBindBufferBase(target, index, buffer) {
 GLctx["bindBufferBase"](target, index, GL.buffers[buffer]);
}

function _emscripten_glBindBufferRange(target, index, buffer, offset, ptrsize) {
 GLctx["bindBufferRange"](target, index, GL.buffers[buffer], offset, ptrsize);
}

function _emscripten_glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}

function _emscripten_glBindProgram(type, id) {}

function _emscripten_glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}

function _emscripten_glBindSampler(unit, sampler) {
 GLctx["bindSampler"](unit, GL.samplers[sampler]);
}

function _emscripten_glBindTexture(target, texture) {
 GLctx.bindTexture(target, GL.textures[texture]);
}

function _emscripten_glBindTransformFeedback(target, id) {
 GLctx["bindTransformFeedback"](target, GL.transformFeedbacks[id]);
}

function _glEnableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (!GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = true;
  GLImmediate.totalEnabledClientAttributes++;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
  GLImmediate.modifiedClientAttributes = true;
 }
}

function _emulGlBindVertexArray(vao) {
 GLEmulation.currentVao = null;
 if (GLImmediate.lastRenderer) GLImmediate.lastRenderer.cleanup();
 _glBindBuffer(GLctx.ARRAY_BUFFER, 0);
 _glBindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, 0);
 for (var vaa in GLEmulation.enabledVertexAttribArrays) {
  GLctx.disableVertexAttribArray(vaa);
 }
 GLEmulation.enabledVertexAttribArrays = {};
 GLImmediate.enabledClientAttributes = [ 0, 0 ];
 GLImmediate.totalEnabledClientAttributes = 0;
 GLImmediate.modifiedClientAttributes = true;
 if (vao) {
  var info = GLEmulation.vaos[vao];
  _glBindBuffer(GLctx.ARRAY_BUFFER, info.arrayBuffer);
  _glBindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, info.elementArrayBuffer);
  for (var vaa in info.enabledVertexAttribArrays) {
   _glEnableVertexAttribArray(vaa);
  }
  for (var vaa in info.vertexAttribPointers) {
   _glVertexAttribPointer.apply(null, info.vertexAttribPointers[vaa]);
  }
  for (var attrib in info.enabledClientStates) {
   _glEnableClientState(attrib | 0);
  }
  GLEmulation.currentVao = info;
 }
}

function _emscripten_glBindVertexArray(vao) {
 _emulGlBindVertexArray(vao);
 var ibo = GLctx.getParameter(34965);
 GLctx.currentElementArrayBufferBinding = ibo ? ibo.name | 0 : 0;
}

function _emscripten_glBindVertexArrayOES(vao) {
 _emulGlBindVertexArray(vao);
 var ibo = GLctx.getParameter(34965);
 GLctx.currentElementArrayBufferBinding = ibo ? ibo.name | 0 : 0;
}

function _emscripten_glBlendColor(x0, x1, x2, x3) {
 GLctx["blendColor"](x0, x1, x2, x3);
}

function _emscripten_glBlendEquation(x0) {
 GLctx["blendEquation"](x0);
}

function _emscripten_glBlendEquationSeparate(x0, x1) {
 GLctx["blendEquationSeparate"](x0, x1);
}

function _emscripten_glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}

function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx["blendFuncSeparate"](x0, x1, x2, x3);
}

function _emscripten_glBlitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) {
 GLctx["blitFramebuffer"](x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
}

function _emscripten_glBufferData(target, size, data, usage) {
 switch (usage) {
 case 35041:
 case 35042:
  usage = 35040;
  break;

 case 35045:
 case 35046:
  usage = 35044;
  break;

 case 35049:
 case 35050:
  usage = 35048;
  break;
 }
 if (true) {
  if (data) {
   GLctx.bufferData(target, HEAPU8, usage, data, size);
  } else {
   GLctx.bufferData(target, size, usage);
  }
 } else {
  GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
 }
}

function _emscripten_glBufferSubData(target, offset, size, data) {
 if (true) {
  GLctx.bufferSubData(target, offset, HEAPU8, data, size);
  return;
 }
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}

function _emscripten_glCheckFramebufferStatus(x0) {
 return GLctx["checkFramebufferStatus"](x0);
}

function _emscripten_glClear(x0) {
 GLctx["clear"](x0);
}

function _emscripten_glClearBufferfi(x0, x1, x2, x3) {
 GLctx["clearBufferfi"](x0, x1, x2, x3);
}

function _emscripten_glClearBufferfv(buffer, drawbuffer, value) {
 GLctx["clearBufferfv"](buffer, drawbuffer, HEAPF32, value >> 2);
}

function _emscripten_glClearBufferiv(buffer, drawbuffer, value) {
 GLctx["clearBufferiv"](buffer, drawbuffer, HEAP32, value >> 2);
}

function _emscripten_glClearBufferuiv(buffer, drawbuffer, value) {
 GLctx["clearBufferuiv"](buffer, drawbuffer, HEAPU32, value >> 2);
}

function _emscripten_glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}

function _emscripten_glClearDepthf(x0) {
 GLctx["clearDepth"](x0);
}

function _emscripten_glClearStencil(x0) {
 GLctx["clearStencil"](x0);
}

function _emscripten_glClientActiveTexture(texture) {
 GLImmediate.clientActiveTexture = texture - 33984;
}

function convertI32PairToI53(lo, hi) {
 return (lo >>> 0) + hi * 4294967296;
}

function _emscripten_glClientWaitSync(sync, flags, timeoutLo, timeoutHi) {
 return GLctx.clientWaitSync(GL.syncs[sync], flags, convertI32PairToI53(timeoutLo, timeoutHi));
}

function _emscripten_glClipPlane(pname, param) {
 if (pname >= 12288 && pname < 12294) {
  var clipPlaneId = pname - 12288;
  GLEmulation.clipPlaneEquation[clipPlaneId][0] = Number(HEAPF64[param >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][1] = Number(HEAPF64[param + 8 >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][2] = Number(HEAPF64[param + 16 >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][3] = Number(HEAPF64[param + 24 >> 3]);
  var tmpMV = GLImmediate.matrixLib.mat4.create(GLImmediate.matrix[0]);
  GLImmediate.matrixLib.mat4.inverse(tmpMV);
  GLImmediate.matrixLib.mat4.transpose(tmpMV);
  GLImmediate.matrixLib.mat4.multiplyVec4(tmpMV, GLEmulation.clipPlaneEquation[clipPlaneId]);
 }
}

function _emscripten_glColor4f(r, g, b, a) {
 r = Math.max(Math.min(r, 1), 0);
 g = Math.max(Math.min(g, 1), 0);
 b = Math.max(Math.min(b, 1), 0);
 a = Math.max(Math.min(a, 1), 0);
 if (GLImmediate.mode >= 0) {
  var start = GLImmediate.vertexCounter << 2;
  GLImmediate.vertexDataU8[start + 0] = r * 255;
  GLImmediate.vertexDataU8[start + 1] = g * 255;
  GLImmediate.vertexDataU8[start + 2] = b * 255;
  GLImmediate.vertexDataU8[start + 3] = a * 255;
  GLImmediate.vertexCounter++;
  GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
 } else {
  GLImmediate.clientColor[0] = r;
  GLImmediate.clientColor[1] = g;
  GLImmediate.clientColor[2] = b;
  GLImmediate.clientColor[3] = a;
 }
}

function _emscripten_glColor3d(r, g, b) {
 _emscripten_glColor4f(r, g, b, 1);
}

function _emscripten_glColor3f(r, g, b) {
 _emscripten_glColor4f(r, g, b, 1);
}

function _emscripten_glColor3fv(p) {
 _emscripten_glColor3f(HEAPF32[p >> 2], HEAPF32[p + 4 >> 2], HEAPF32[p + 8 >> 2]);
}

function _emscripten_glColor4ub(r, g, b, a) {
 _emscripten_glColor4f((r & 255) / 255, (g & 255) / 255, (b & 255) / 255, (a & 255) / 255);
}

function _emscripten_glColor3ub(r, g, b) {
 _emscripten_glColor4ub(r, g, b, 255);
}

function _emscripten_glColor3ubv(p) {
 _emscripten_glColor3ub(HEAP8[p >> 0], HEAP8[p + 1 >> 0], HEAP8[p + 2 >> 0]);
}

function _emscripten_glColor4ui(r, g, b, a) {
 _emscripten_glColor4f((r >>> 0) / 4294967295, (g >>> 0) / 4294967295, (b >>> 0) / 4294967295, (a >>> 0) / 4294967295);
}

function _emscripten_glColor3ui(r, g, b) {
 _emscripten_glColor4ui(r, g, b, 4294967295);
}

function _emscripten_glColor3uiv(p) {
 _emscripten_glColor3ui(HEAP32[p >> 2], HEAP32[p + 4 >> 2], HEAP32[p + 8 >> 2]);
}

function _emscripten_glColor4us(r, g, b, a) {
 _emscripten_glColor4f((r & 65535) / 65535, (g & 65535) / 65535, (b & 65535) / 65535, (a & 65535) / 65535);
}

function _emscripten_glColor3us(r, g, b) {
 _emscripten_glColor4us(r, g, b, 65535);
}

function _emscripten_glColor3usv(p) {
 _emscripten_glColor3us(HEAP16[p >> 1], HEAP16[p + 2 >> 1], HEAP16[p + 4 >> 1]);
}

function _emscripten_glColor4d(r, g, b, a) {
 r = Math.max(Math.min(r, 1), 0);
 g = Math.max(Math.min(g, 1), 0);
 b = Math.max(Math.min(b, 1), 0);
 a = Math.max(Math.min(a, 1), 0);
 if (GLImmediate.mode >= 0) {
  var start = GLImmediate.vertexCounter << 2;
  GLImmediate.vertexDataU8[start + 0] = r * 255;
  GLImmediate.vertexDataU8[start + 1] = g * 255;
  GLImmediate.vertexDataU8[start + 2] = b * 255;
  GLImmediate.vertexDataU8[start + 3] = a * 255;
  GLImmediate.vertexCounter++;
  GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
 } else {
  GLImmediate.clientColor[0] = r;
  GLImmediate.clientColor[1] = g;
  GLImmediate.clientColor[2] = b;
  GLImmediate.clientColor[3] = a;
 }
}

function _emscripten_glColor4fv(p) {
 _emscripten_glColor4f(HEAPF32[p >> 2], HEAPF32[p + 4 >> 2], HEAPF32[p + 8 >> 2], HEAPF32[p + 12 >> 2]);
}

function _emscripten_glColor4ubv(p) {
 _emscripten_glColor4ub(HEAP8[p >> 0], HEAP8[p + 1 >> 0], HEAP8[p + 2 >> 0], HEAP8[p + 3 >> 0]);
}

function _emscripten_glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}

function _emscripten_glColorPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.COLOR, size, type, stride, pointer);
}

function _emscripten_glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}

function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, imageSize, data);
  } else {
   GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, HEAPU8, data, imageSize);
  }
  return;
 }
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

function _emscripten_glCompressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data) {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx["compressedTexImage3D"](target, level, internalFormat, width, height, depth, border, imageSize, data);
 } else {
  GLctx["compressedTexImage3D"](target, level, internalFormat, width, height, depth, border, HEAPU8, data, imageSize);
 }
}

function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, imageSize, data);
  } else {
   GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, HEAPU8, data, imageSize);
  }
  return;
 }
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

function _emscripten_glCompressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx["compressedTexSubImage3D"](target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
 } else {
  GLctx["compressedTexSubImage3D"](target, level, xoffset, yoffset, zoffset, width, height, depth, format, HEAPU8, data, imageSize);
 }
}

function _emscripten_glCopyBufferSubData(x0, x1, x2, x3, x4) {
 GLctx["copyBufferSubData"](x0, x1, x2, x3, x4);
}

function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

function _emscripten_glCopyTexSubImage3D(x0, x1, x2, x3, x4, x5, x6, x7, x8) {
 GLctx["copyTexSubImage3D"](x0, x1, x2, x3, x4, x5, x6, x7, x8);
}

function _emscripten_glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
 program.uniformIdCounter = 1;
 GL.programs[id] = program;
 return id;
}

function _emscripten_glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}

function _emscripten_glCullFace(x0) {
 GLctx["cullFace"](x0);
}

function _emscripten_glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GLctx.currentArrayBufferBinding) GLctx.currentArrayBufferBinding = 0;
  if (id == GLctx.currentElementArrayBufferBinding) GLctx.currentElementArrayBufferBinding = 0;
  if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
  if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
 }
}

function _emscripten_glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}

function _glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}

function _emscripten_glDeleteObject(id) {
 if (GL.programs[id]) {
  _glDeleteProgram(id);
 } else if (GL.shaders[id]) {
  _glDeleteShader(id);
 } else {
  err("WARNING: deleteObject received invalid id: " + id);
 }
}

function _emscripten_glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
}

function _emscripten_glDeleteQueries(n, ids) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[ids + i * 4 >> 2];
  var query = GL.queries[id];
  if (!query) continue;
  GLctx["deleteQuery"](query);
  GL.queries[id] = null;
 }
}

function _emscripten_glDeleteQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[ids + i * 4 >> 2];
  var query = GL.queries[id];
  if (!query) continue;
  GLctx.disjointTimerQueryExt["deleteQueryEXT"](query);
  GL.queries[id] = null;
 }
}

function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}

function _emscripten_glDeleteSamplers(n, samplers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[samplers + i * 4 >> 2];
  var sampler = GL.samplers[id];
  if (!sampler) continue;
  GLctx["deleteSampler"](sampler);
  sampler.name = 0;
  GL.samplers[id] = null;
 }
}

function _emscripten_glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}

function _emscripten_glDeleteSync(id) {
 if (!id) return;
 var sync = GL.syncs[id];
 if (!sync) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteSync(sync);
 sync.name = 0;
 GL.syncs[id] = null;
}

function _emscripten_glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}

function _emscripten_glDeleteTransformFeedbacks(n, ids) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[ids + i * 4 >> 2];
  var transformFeedback = GL.transformFeedbacks[id];
  if (!transformFeedback) continue;
  GLctx["deleteTransformFeedback"](transformFeedback);
  transformFeedback.name = 0;
  GL.transformFeedbacks[id] = null;
 }
}

function _emulGlDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLEmulation.vaos[id] = null;
  if (GLEmulation.currentVao && GLEmulation.currentVao.id == id) GLEmulation.currentVao = null;
 }
}

function _emscripten_glDeleteVertexArrays(n, vaos) {
 _emulGlDeleteVertexArrays(n, vaos);
}

function _emscripten_glDeleteVertexArraysOES(n, vaos) {
 _emulGlDeleteVertexArrays(n, vaos);
}

function _emscripten_glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}

function _emscripten_glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}

function _emscripten_glDepthRangef(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

function _emscripten_glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}

function _emscripten_glDisable(x0) {
 GLctx["disable"](x0);
}

function _emscripten_glDisableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = false;
  GLImmediate.totalEnabledClientAttributes--;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledClientStates[cap];
  GLImmediate.modifiedClientAttributes = true;
 }
}

function _emscripten_glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}

function _emscripten_glDrawArrays(mode, first, count) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6) {
  GLctx.drawArrays(mode, first, count);
  return;
 }
 GLImmediate.prepareClientAttributes(count, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, GLImmediate.vertexPointer + (first + count) * GLImmediate.stride >> 2);
  GLImmediate.firstVertex = first;
  GLImmediate.lastVertex = first + count;
 }
 GLImmediate.flush(null, first);
 GLImmediate.mode = -1;
}

function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

function _emscripten_glDrawArraysInstancedANGLE(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

function _emscripten_glDrawArraysInstancedARB(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

function _emscripten_glDrawArraysInstancedEXT(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

function _emscripten_glDrawArraysInstancedNV(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

function _emscripten_glDrawBuffer() {
}

var tempFixedLengthArray = [];

function _emscripten_glDrawBuffers(n, bufs) {
 var bufArray = tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

function _emscripten_glDrawBuffersEXT(n, bufs) {
 var bufArray = tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

function _emscripten_glDrawBuffersWEBGL(n, bufs) {
 var bufArray = tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

function _emscripten_glDrawElements(mode, count, type, indices, start, end) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GLctx.currentElementArrayBufferBinding) {
  GLctx.drawElements(mode, count, type, indices);
  return;
 }
 GLImmediate.prepareClientAttributes(count, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.firstVertex = end ? start : HEAP8.length;
  GLImmediate.lastVertex = end ? end + 1 : 0;
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, end ? GLImmediate.vertexPointer + (end + 1) * GLImmediate.stride >> 2 : undefined);
 }
 GLImmediate.flush(count, 0, indices);
 GLImmediate.mode = -1;
}

function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawElementsInstancedANGLE(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawElementsInstancedARB(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawElementsInstancedEXT(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawElementsInstancedNV(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawRangeElements(mode, start, end, count, type, indices) {
 _emscripten_glDrawElements(mode, count, type, indices, start, end);
}

function _emscripten_glEnable(x0) {
 GLctx["enable"](x0);
}

function _emscripten_glEnableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (!GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = true;
  GLImmediate.totalEnabledClientAttributes++;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) GLEmulation.currentVao.enabledClientStates[cap] = 1;
  GLImmediate.modifiedClientAttributes = true;
 }
}

function _emscripten_glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}

function _emscripten_glEnd() {
 GLImmediate.prepareClientAttributes(GLImmediate.rendererComponents[GLImmediate.VERTEX], true);
 GLImmediate.firstVertex = 0;
 GLImmediate.lastVertex = GLImmediate.vertexCounter / (GLImmediate.stride >> 2);
 GLImmediate.flush();
 GLImmediate.disableBeginEndClientAttributes();
 GLImmediate.mode = -1;
 GLImmediate.enabledClientAttributes = GLImmediate.enabledClientAttributes_preBegin;
 GLImmediate.clientAttributes = GLImmediate.clientAttributes_preBegin;
 GLImmediate.currentRenderer = null;
 GLImmediate.modifiedClientAttributes = true;
}

function _emscripten_glEndQuery(x0) {
 GLctx["endQuery"](x0);
}

function _emscripten_glEndQueryEXT(target) {
 GLctx.disjointTimerQueryExt["endQueryEXT"](target);
}

function _emscripten_glEndTransformFeedback() {
 GLctx["endTransformFeedback"]();
}

function _emscripten_glFenceSync(condition, flags) {
 var sync = GLctx.fenceSync(condition, flags);
 if (sync) {
  var id = GL.getNewId(GL.syncs);
  sync.name = id;
  GL.syncs[id] = sync;
  return id;
 } else {
  return 0;
 }
}

function _emscripten_glFinish() {
 GLctx["finish"]();
}

function _emscripten_glFlush() {
 GLctx["flush"]();
}

function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}

function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}

function _emscripten_glFramebufferTextureLayer(target, attachment, texture, level, layer) {
 GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
}

function _emscripten_glFrontFace(x0) {
 GLctx["frontFace"](x0);
}

function _emscripten_glFrustum(left, right, bottom, top_, nearVal, farVal) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.frustum(left, right, bottom, top_, nearVal, farVal));
}

function __glGenObject(n, buffers, createFunction, objectTable) {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx[createFunction]();
  var id = buffer && GL.getNewId(objectTable);
  if (buffer) {
   buffer.name = id;
   objectTable[id] = buffer;
  } else {
   GL.recordError(1282);
  }
  HEAP32[buffers + i * 4 >> 2] = id;
 }
}

function _emscripten_glGenBuffers(n, buffers) {
 __glGenObject(n, buffers, "createBuffer", GL.buffers);
}

function _emscripten_glGenFramebuffers(n, ids) {
 __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}

function _emscripten_glGenQueries(n, ids) {
 __glGenObject(n, ids, "createQuery", GL.queries);
}

function _emscripten_glGenQueriesEXT(n, ids) {
 for (var i = 0; i < n; i++) {
  var query = GLctx.disjointTimerQueryExt["createQueryEXT"]();
  if (!query) {
   GL.recordError(1282);
   while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
   return;
  }
  var id = GL.getNewId(GL.queries);
  query.name = id;
  GL.queries[id] = query;
  HEAP32[ids + i * 4 >> 2] = id;
 }
}

function _emscripten_glGenRenderbuffers(n, renderbuffers) {
 __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

function _emscripten_glGenSamplers(n, samplers) {
 __glGenObject(n, samplers, "createSampler", GL.samplers);
}

function _emscripten_glGenTextures(n, textures) {
 __glGenObject(n, textures, "createTexture", GL.textures);
}

function _emscripten_glGenTransformFeedbacks(n, ids) {
 __glGenObject(n, ids, "createTransformFeedback", GL.transformFeedbacks);
}

function _emulGlGenVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = GL.getNewId(GLEmulation.vaos);
  GLEmulation.vaos[id] = {
   id: id,
   arrayBuffer: 0,
   elementArrayBuffer: 0,
   enabledVertexAttribArrays: {},
   vertexAttribPointers: {},
   enabledClientStates: {}
  };
  HEAP32[vaos + i * 4 >> 2] = id;
 }
}

function _emscripten_glGenVertexArrays(n, arrays) {
 _emulGlGenVertexArrays(n, arrays);
}

function _emscripten_glGenVertexArraysOES(n, arrays) {
 _emulGlGenVertexArrays(n, arrays);
}

function _emscripten_glGenerateMipmap(x0) {
 GLctx["generateMipmap"](x0);
}

function __glGetActiveAttribOrUniform(funcName, program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx[funcName](program, index);
 if (info) {
  var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
  if (size) HEAP32[size >> 2] = info.size;
  if (type) HEAP32[type >> 2] = info.type;
 }
}

function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);
}

function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);
}

function _emscripten_glGetActiveUniformBlockName(program, uniformBlockIndex, bufSize, length, uniformBlockName) {
 program = GL.programs[program];
 var result = GLctx["getActiveUniformBlockName"](program, uniformBlockIndex);
 if (!result) return;
 if (uniformBlockName && bufSize > 0) {
  var numBytesWrittenExclNull = stringToUTF8(result, uniformBlockName, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}

function _emscripten_glGetActiveUniformBlockiv(program, uniformBlockIndex, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 if (pname == 35393) {
  var name = GLctx["getActiveUniformBlockName"](program, uniformBlockIndex);
  HEAP32[params >> 2] = name.length + 1;
  return;
 }
 var result = GLctx["getActiveUniformBlockParameter"](program, uniformBlockIndex, pname);
 if (result === null) return;
 if (pname == 35395) {
  for (var i = 0; i < result.length; i++) {
   HEAP32[params + i * 4 >> 2] = result[i];
  }
 } else {
  HEAP32[params >> 2] = result;
 }
}

function _emscripten_glGetActiveUniformsiv(program, uniformCount, uniformIndices, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 if (uniformCount > 0 && uniformIndices == 0) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 var ids = [];
 for (var i = 0; i < uniformCount; i++) {
  ids.push(HEAP32[uniformIndices + i * 4 >> 2]);
 }
 var result = GLctx["getActiveUniforms"](program, ids, pname);
 if (!result) return;
 var len = result.length;
 for (var i = 0; i < len; i++) {
  HEAP32[params + i * 4 >> 2] = result[i];
 }
}

function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}

function _emscripten_glGetAttribLocation(program, name) {
 return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

function _emscripten_glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, 4);
}

function _emscripten_glGetBufferParameteri64v(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 writeI53ToI64(data, GLctx.getBufferParameter(target, value));
}

function _emscripten_glGetBufferParameteriv(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}

function _emscripten_glGetError() {
 var error = GLctx.getError() || GL.lastError;
 GL.lastError = 0;
 return error;
}

function _emscripten_glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, 2);
}

function _emscripten_glGetFragDataLocation(program, name) {
 return GLctx["getFragDataLocation"](GL.programs[program], UTF8ToString(name));
}

function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
  result = result.name | 0;
 }
 HEAP32[params >> 2] = result;
}

function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _emscripten_glGetInfoLog(id, maxLength, length, infoLog) {
 if (GL.programs[id]) {
  _glGetProgramInfoLog(id, maxLength, length, infoLog);
 } else if (GL.shaders[id]) {
  _glGetShaderInfoLog(id, maxLength, length, infoLog);
 } else {
  err("WARNING: glGetInfoLog received invalid id: " + id);
 }
}

function emscriptenWebGLGetIndexed(target, index, data, type) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 var result = GLctx["getIndexedParameter"](target, index);
 var ret;
 switch (typeof result) {
 case "boolean":
  ret = result ? 1 : 0;
  break;

 case "number":
  ret = result;
  break;

 case "object":
  if (result === null) {
   switch (target) {
   case 35983:
   case 35368:
    ret = 0;
    break;

   default:
    {
     GL.recordError(1280);
     return;
    }
   }
  } else if (result instanceof WebGLBuffer) {
   ret = result.name | 0;
  } else {
   GL.recordError(1280);
   return;
  }
  break;

 default:
  GL.recordError(1280);
  return;
 }
 switch (type) {
 case 1:
  writeI53ToI64(data, ret);
  break;

 case 0:
  HEAP32[data >> 2] = ret;
  break;

 case 2:
  HEAPF32[data >> 2] = ret;
  break;

 case 4:
  HEAP8[data >> 0] = ret ? 1 : 0;
  break;

 default:
  throw "internal emscriptenWebGLGetIndexed() error, bad type: " + type;
 }
}

function _emscripten_glGetInteger64i_v(target, index, data) {
 emscriptenWebGLGetIndexed(target, index, data, 1);
}

function _emscripten_glGetInteger64v(name_, p) {
 emscriptenWebGLGet(name_, p, 1);
}

function _emscripten_glGetIntegeri_v(target, index, data) {
 emscriptenWebGLGetIndexed(target, index, data, 0);
}

function _emscripten_glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, 0);
}

function _emscripten_glGetInternalformativ(target, internalformat, pname, bufSize, params) {
 if (bufSize < 0) {
  GL.recordError(1281);
  return;
 }
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var ret = GLctx["getInternalformatParameter"](target, internalformat, pname);
 if (ret === null) return;
 for (var i = 0; i < ret.length && i < bufSize; ++i) {
  HEAP32[params + i * 4 >> 2] = ret[i];
 }
}

function _glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(program);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  if (!program.maxUniformLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxUniformLength;
 } else if (pname == 35722) {
  if (!program.maxAttributeLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxAttributeLength;
 } else if (pname == 35381) {
  if (!program.maxUniformBlockNameLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
 }
}

function _glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var logLength = log ? log.length + 1 : 0;
  HEAP32[p >> 2] = logLength;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source ? source.length + 1 : 0;
  HEAP32[p >> 2] = sourceLength;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}

function _emscripten_glGetObjectParameteriv(id, type, result) {
 if (GL.programs[id]) {
  if (type == 35716) {
   var log = GLctx.getProgramInfoLog(GL.programs[id]);
   if (log === null) log = "(unknown error)";
   HEAP32[result >> 2] = log.length;
   return;
  }
  _glGetProgramiv(id, type, result);
 } else if (GL.shaders[id]) {
  if (type == 35716) {
   var log = GLctx.getShaderInfoLog(GL.shaders[id]);
   if (log === null) log = "(unknown error)";
   HEAP32[result >> 2] = log.length;
   return;
  } else if (type == 35720) {
   var source = GLctx.getShaderSource(GL.shaders[id]);
   if (source === null) return;
   HEAP32[result >> 2] = source.length;
   return;
  }
  _glGetShaderiv(id, type, result);
 } else {
  err("WARNING: getObjectParameteriv received invalid id: " + id);
 }
}

function _emscripten_glGetPointerv(name, p) {
 var attribute;
 switch (name) {
 case 32910:
  attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
  break;

 case 32912:
  attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
  break;

 case 32914:
  attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
  break;

 default:
  GL.recordError(1280);
  return;
 }
 HEAP32[p >> 2] = attribute ? attribute.pointer : 0;
}

function _emscripten_glGetProgramBinary(program, bufSize, length, binaryFormat, binary) {
 GL.recordError(1282);
}

function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _emscripten_glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(program);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  if (!program.maxUniformLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxUniformLength;
 } else if (pname == 35722) {
  if (!program.maxAttributeLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxAttributeLength;
 } else if (pname == 35381) {
  if (!program.maxUniformBlockNameLength) {
   for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
   }
  }
  HEAP32[p >> 2] = program.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
 }
}

function _emscripten_glGetQueryObjecti64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.queries[id];
 var param;
 if (GL.currentContext.version < 2) {
  param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 } else {
  param = GLctx["getQueryParameter"](query, pname);
 }
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 writeI53ToI64(params, ret);
}

function _emscripten_glGetQueryObjectivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.queries[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

function _emscripten_glGetQueryObjectui64vEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.queries[id];
 var param;
 if (GL.currentContext.version < 2) {
  param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 } else {
  param = GLctx["getQueryParameter"](query, pname);
 }
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 writeI53ToI64(params, ret);
}

function _emscripten_glGetQueryObjectuiv(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.queries[id];
 var param = GLctx["getQueryParameter"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

function _emscripten_glGetQueryObjectuivEXT(id, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var query = GL.queries[id];
 var param = GLctx.disjointTimerQueryExt["getQueryObjectEXT"](query, pname);
 var ret;
 if (typeof param == "boolean") {
  ret = param ? 1 : 0;
 } else {
  ret = param;
 }
 HEAP32[params >> 2] = ret;
}

function _emscripten_glGetQueryiv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx["getQuery"](target, pname);
}

function _emscripten_glGetQueryivEXT(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.disjointTimerQueryExt["getQueryEXT"](target, pname);
}

function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}

function _emscripten_glGetSamplerParameterfv(sampler, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx["getSamplerParameter"](GL.samplers[sampler], pname);
}

function _emscripten_glGetSamplerParameteriv(sampler, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx["getSamplerParameter"](GL.samplers[sampler], pname);
}

function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 HEAP32[range >> 2] = result.rangeMin;
 HEAP32[range + 4 >> 2] = result.rangeMax;
 HEAP32[precision >> 2] = result.precision;
}

function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0;
 if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
}

function _emscripten_glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var logLength = log ? log.length + 1 : 0;
  HEAP32[p >> 2] = logLength;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source ? source.length + 1 : 0;
  HEAP32[p >> 2] = sourceLength;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}

function _emscripten_glGetString(name_) {
 var ret = GL.stringCache[name_];
 if (!ret) {
  switch (name_) {
  case 7939:
   var exts = GLctx.getSupportedExtensions() || [];
   exts = exts.concat(exts.map(function(e) {
    return "GL_" + e;
   }));
   ret = stringToNewUTF8(exts.join(" "));
   break;

  case 7936:
  case 7937:
  case 37445:
  case 37446:
   var s = GLctx.getParameter(name_);
   if (!s) {
    GL.recordError(1280);
   }
   ret = s && stringToNewUTF8(s);
   break;

  case 7938:
   var glVersion = GLctx.getParameter(7938);
   if (true) glVersion = "OpenGL ES 3.0 (" + glVersion + ")"; else {
    glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
   }
   ret = stringToNewUTF8(glVersion);
   break;

  case 35724:
   var glslVersion = GLctx.getParameter(35724);
   var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
   var ver_num = glslVersion.match(ver_re);
   if (ver_num !== null) {
    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
    glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
   }
   ret = stringToNewUTF8(glslVersion);
   break;

  default:
   GL.recordError(1280);
  }
  GL.stringCache[name_] = ret;
 }
 return ret;
}

function _emscripten_glGetStringi(name, index) {
 if (GL.currentContext.version < 2) {
  GL.recordError(1282);
  return 0;
 }
 var stringiCache = GL.stringiCache[name];
 if (stringiCache) {
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   return 0;
  }
  return stringiCache[index];
 }
 switch (name) {
 case 7939:
  var exts = GLctx.getSupportedExtensions() || [];
  exts = exts.concat(exts.map(function(e) {
   return "GL_" + e;
  }));
  exts = exts.map(function(e) {
   return stringToNewUTF8(e);
  });
  stringiCache = GL.stringiCache[name] = exts;
  if (index < 0 || index >= stringiCache.length) {
   GL.recordError(1281);
   return 0;
  }
  return stringiCache[index];

 default:
  GL.recordError(1280);
  return 0;
 }
}

function _emscripten_glGetSynciv(sync, pname, bufSize, length, values) {
 if (bufSize < 0) {
  GL.recordError(1281);
  return;
 }
 if (!values) {
  GL.recordError(1281);
  return;
 }
 var ret = GLctx.getSyncParameter(GL.syncs[sync], pname);
 if (ret !== null) {
  HEAP32[values >> 2] = ret;
  if (length) HEAP32[length >> 2] = 1;
 }
}

function _emscripten_glGetTexEnvfv(target, pname, param) {
 throw "GL emulation not initialized!";
}

function _emscripten_glGetTexEnviv(target, pname, param) {
 throw "GL emulation not initialized!";
}

function _emscripten_glGetTexLevelParameteriv() {
 throw "glGetTexLevelParameteriv: TODO";
}

function _emscripten_glGetTexParameterfv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}

function _emscripten_glGetTexParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}

function _emscripten_glGetTransformFeedbackVarying(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx["getTransformFeedbackVarying"](program, index);
 if (!info) return;
 if (name && bufSize > 0) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

function _emscripten_glGetUniformBlockIndex(program, uniformBlockName) {
 return GLctx["getUniformBlockIndex"](GL.programs[program], UTF8ToString(uniformBlockName));
}

function _emscripten_glGetUniformIndices(program, uniformCount, uniformNames, uniformIndices) {
 if (!uniformIndices) {
  GL.recordError(1281);
  return;
 }
 if (uniformCount > 0 && (uniformNames == 0 || uniformIndices == 0)) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 var names = [];
 for (var i = 0; i < uniformCount; i++) names.push(UTF8ToString(HEAP32[uniformNames + i * 4 >> 2]));
 var result = GLctx["getUniformIndices"](program, names);
 if (!result) return;
 var len = result.length;
 for (var i = 0; i < len; i++) {
  HEAP32[uniformIndices + i * 4 >> 2] = result[i];
 }
}

function webglGetLeftBracePos(name) {
 return name.slice(-1) == "]" && name.lastIndexOf("[");
}

function webglPrepareUniformLocationsBeforeFirstUse(program) {
 var uniformLocsById = program.uniformLocsById, uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, i, j;
 if (!uniformLocsById) {
  program.uniformLocsById = uniformLocsById = {};
  program.uniformArrayNamesById = {};
  for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
   var u = GLctx.getActiveUniform(program, i);
   var nm = u.name;
   var sz = u.size;
   var lb = webglGetLeftBracePos(nm);
   var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
   var id = program.uniformIdCounter;
   program.uniformIdCounter += sz;
   uniformSizeAndIdsByName[arrayName] = [ sz, id ];
   for (j = 0; j < sz; ++j) {
    uniformLocsById[id] = j;
    program.uniformArrayNamesById[id++] = arrayName;
   }
  }
 }
}

function _emscripten_glGetUniformLocation(program, name) {
 name = UTF8ToString(name);
 if (program = GL.programs[program]) {
  webglPrepareUniformLocationsBeforeFirstUse(program);
  var uniformLocsById = program.uniformLocsById;
  var arrayIndex = 0;
  var uniformBaseName = name;
  var leftBrace = webglGetLeftBracePos(name);
  if (leftBrace > 0) {
   arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
   uniformBaseName = name.slice(0, leftBrace);
  }
  var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
  if (sizeAndId && arrayIndex < sizeAndId[0]) {
   arrayIndex += sizeAndId[1];
   if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
    return arrayIndex;
   }
  }
 } else {
  GL.recordError(1281);
 }
 return -1;
}

function webglGetUniformLocation(location) {
 var p = GLctx.currentProgram;
 if (p) {
  var webglLoc = p.uniformLocsById[location];
  if (typeof webglLoc == "number") {
   p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? "[" + webglLoc + "]" : ""));
  }
  return webglLoc;
 } else {
  GL.recordError(1282);
 }
}

function emscriptenWebGLGetUniform(program, location, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 program = GL.programs[program];
 webglPrepareUniformLocationsBeforeFirstUse(program);
 var data = GLctx.getUniform(program, webglGetUniformLocation(location));
 if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   HEAP32[params >> 2] = data;
   break;

  case 2:
   HEAPF32[params >> 2] = data;
   break;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case 2:
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;
   }
  }
 }
}

function _emscripten_glGetUniformfv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 2);
}

function _emscripten_glGetUniformiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 0);
}

function _emscripten_glGetUniformuiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, 0);
}

function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getVertexAttrib(index, pname);
 if (pname == 34975) {
  HEAP32[params >> 2] = data && data["name"];
 } else if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case 0:
   HEAP32[params >> 2] = data;
   break;

  case 2:
   HEAPF32[params >> 2] = data;
   break;

  case 5:
   HEAP32[params >> 2] = Math.fround(data);
   break;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case 0:
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case 2:
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;

   case 5:
    HEAP32[params + i * 4 >> 2] = Math.fround(data[i]);
    break;
   }
  }
 }
}

function _emscripten_glGetVertexAttribIiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 0);
}

function _emscripten_glGetVertexAttribIuiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 0);
}

function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
 if (!pointer) {
  GL.recordError(1281);
  return;
 }
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}

function _emscripten_glGetVertexAttribfv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 2);
}

function _emscripten_glGetVertexAttribiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, 5);
}

function _emscripten_glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}

function _emscripten_glInvalidateFramebuffer(target, numAttachments, attachments) {
 var list = tempFixedLengthArray[numAttachments];
 for (var i = 0; i < numAttachments; i++) {
  list[i] = HEAP32[attachments + i * 4 >> 2];
 }
 GLctx["invalidateFramebuffer"](target, list);
}

function _emscripten_glInvalidateSubFramebuffer(target, numAttachments, attachments, x, y, width, height) {
 var list = tempFixedLengthArray[numAttachments];
 for (var i = 0; i < numAttachments; i++) {
  list[i] = HEAP32[attachments + i * 4 >> 2];
 }
 GLctx["invalidateSubFramebuffer"](target, list, x, y, width, height);
}

function _emscripten_glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}

function _emscripten_glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}

function _emscripten_glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}

function _emscripten_glIsProgram(program) {
 program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}

function _emscripten_glIsQuery(id) {
 var query = GL.queries[id];
 if (!query) return 0;
 return GLctx["isQuery"](query);
}

function _emscripten_glIsQueryEXT(id) {
 var query = GL.queries[id];
 if (!query) return 0;
 return GLctx.disjointTimerQueryExt["isQueryEXT"](query);
}

function _emscripten_glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}

function _emscripten_glIsSampler(id) {
 var sampler = GL.samplers[id];
 if (!sampler) return 0;
 return GLctx["isSampler"](sampler);
}

function _emscripten_glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}

function _emscripten_glIsSync(sync) {
 return GLctx.isSync(GL.syncs[sync]);
}

function _emscripten_glIsTexture(id) {
 var texture = GL.textures[id];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}

function _emscripten_glIsTransformFeedback(id) {
 return GLctx["isTransformFeedback"](GL.transformFeedbacks[id]);
}

function _emulGlIsVertexArray(array) {
 var vao = GLEmulation.vaos[array];
 if (!vao) return 0;
 return 1;
}

function _emscripten_glIsVertexArray(array) {
 return _emulGlIsVertexArray(array);
}

function _emscripten_glIsVertexArrayOES(array) {
 return _emulGlIsVertexArray(array);
}

function _emscripten_glLightModelf(pname, param) {
 if (pname == 2898) {
  GLEmulation.lightModelTwoSide = param != 0 ? true : false;
 } else {
  throw "glLightModelf: TODO: " + pname;
 }
}

function _emscripten_glLightModelfv(pname, param) {
 if (pname == 2899) {
  GLEmulation.lightModelAmbient[0] = HEAPF32[param >> 2];
  GLEmulation.lightModelAmbient[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.lightModelAmbient[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.lightModelAmbient[3] = HEAPF32[param + 12 >> 2];
 } else {
  throw "glLightModelfv: TODO: " + pname;
 }
}

function _emscripten_glLightfv(light, pname, param) {
 if (light >= 16384 && light < 16392) {
  var lightId = light - 16384;
  if (pname == 4608) {
   GLEmulation.lightAmbient[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightAmbient[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightAmbient[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightAmbient[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4609) {
   GLEmulation.lightDiffuse[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightDiffuse[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightDiffuse[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightDiffuse[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4610) {
   GLEmulation.lightSpecular[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightSpecular[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightSpecular[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightSpecular[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4611) {
   GLEmulation.lightPosition[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightPosition[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightPosition[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightPosition[lightId][3] = HEAPF32[param + 12 >> 2];
   GLImmediate.matrixLib.mat4.multiplyVec4(GLImmediate.matrix[0], GLEmulation.lightPosition[lightId]);
  } else {
   throw "glLightfv: TODO: " + pname;
  }
 }
}

function _emscripten_glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}

function _emscripten_glLinkProgram(program) {
 program = GL.programs[program];
 GLctx.linkProgram(program);
 program.uniformLocsById = 0;
 program.uniformSizeAndIdsByName = {};
}

function _emscripten_glLoadIdentity() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _emscripten_glLoadMatrixd(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF64.subarray(matrix >> 3, matrix + 128 >> 3), GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _emscripten_glLoadMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2), GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _emscripten_glLoadTransposeMatrixd(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF64.subarray(matrix >> 3, matrix + 128 >> 3), GLImmediate.matrix[GLImmediate.currentMatrix]);
 GLImmediate.matrixLib.mat4.transpose(GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _emscripten_glLoadTransposeMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2), GLImmediate.matrix[GLImmediate.currentMatrix]);
 GLImmediate.matrixLib.mat4.transpose(GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _emscripten_glMaterialfv(face, pname, param) {
 if (face != 1028 && face != 1032) {
  throw "glMaterialfv: TODO" + face;
 }
 if (pname == 4608) {
  GLEmulation.materialAmbient[0] = HEAPF32[param >> 2];
  GLEmulation.materialAmbient[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialAmbient[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialAmbient[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 4609) {
  GLEmulation.materialDiffuse[0] = HEAPF32[param >> 2];
  GLEmulation.materialDiffuse[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialDiffuse[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialDiffuse[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 4610) {
  GLEmulation.materialSpecular[0] = HEAPF32[param >> 2];
  GLEmulation.materialSpecular[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialSpecular[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialSpecular[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 5633) {
  GLEmulation.materialShininess[0] = HEAPF32[param >> 2];
 } else {
  throw "glMaterialfv: TODO: " + pname;
 }
}

function _emscripten_glMatrixMode(mode) {
 if (mode == 5888) {
  GLImmediate.currentMatrix = 0;
 } else if (mode == 5889) {
  GLImmediate.currentMatrix = 1;
 } else if (mode == 5890) {
  GLImmediate.useTextureMatrix = true;
  GLImmediate.currentMatrix = 2 + GLImmediate.TexEnvJIT.getActiveTexture();
 } else {
  throw "Wrong mode " + mode + " passed to glMatrixMode";
 }
}

function _emscripten_glMultMatrixd(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], HEAPF64.subarray(matrix >> 3, matrix + 128 >> 3));
}

function _emscripten_glMultMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2));
}

function _emscripten_glMultTransposeMatrixd(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 var colMajor = GLImmediate.matrixLib.mat4.create();
 GLImmediate.matrixLib.mat4.set(HEAPF64.subarray(matrix >> 3, matrix + 128 >> 3), colMajor);
 GLImmediate.matrixLib.mat4.transpose(colMajor);
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], colMajor);
}

function _emscripten_glMultTransposeMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 var colMajor = GLImmediate.matrixLib.mat4.create();
 GLImmediate.matrixLib.mat4.set(HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2), colMajor);
 GLImmediate.matrixLib.mat4.transpose(colMajor);
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], colMajor);
}

function _emscripten_glNormal3f(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.addRendererComponent(GLImmediate.NORMAL, 3, GLctx.FLOAT);
}

function _emscripten_glNormalPointer(type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.NORMAL, 3, type, stride, pointer);
}

function _emscripten_glOrtho(left, right, bottom, top_, nearVal, farVal) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.ortho(left, right, bottom, top_, nearVal, farVal));
}

function _emscripten_glPauseTransformFeedback() {
 GLctx["pauseTransformFeedback"]();
}

function _emscripten_glPixelStorei(pname, param) {
 if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}

function _emscripten_glPolygonMode() {}

function _emscripten_glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}

function _emscripten_glPopMatrix() {
 if (GLImmediate.matrixStack[GLImmediate.currentMatrix].length == 0) {
  GL.recordError(1284);
  return;
 }
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop();
}

function _emscripten_glProgramBinary(program, binaryFormat, binary, length) {
 GL.recordError(1280);
}

function _emscripten_glProgramParameteri(program, pname, value) {
 GL.recordError(1280);
}

function _emscripten_glPushMatrix() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixStack[GLImmediate.currentMatrix].push(Array.prototype.slice.call(GLImmediate.matrix[GLImmediate.currentMatrix]));
}

function _emscripten_glQueryCounterEXT(id, target) {
 GLctx.disjointTimerQueryExt["queryCounterEXT"](GL.queries[id], target);
}

function _emscripten_glReadBuffer(x0) {
 GLctx["readBuffer"](x0);
}

function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
 function roundedToNextMultipleOf(x, y) {
  return x + y - 1 & -y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height * alignedRowSize;
}

function __colorChannelsInGlTextureFormat(format) {
 var colorChannels = {
  5: 3,
  6: 4,
  8: 2,
  29502: 3,
  29504: 4,
  26917: 2,
  26918: 2,
  29846: 3,
  29847: 4
 };
 return colorChannels[format - 6402] || 1;
}

function heapObjectForWebGLType(type) {
 type -= 5120;
 if (type == 0) return HEAP8;
 if (type == 1) return HEAPU8;
 if (type == 2) return HEAP16;
 if (type == 4) return HEAP32;
 if (type == 6) return HEAPF32;
 if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return HEAPU32;
 return HEAPU16;
}

function heapAccessShiftForWebGLHeap(heap) {
 return 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
}

function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
 var heap = heapObjectForWebGLType(type);
 var shift = heapAccessShiftForWebGLHeap(heap);
 var byteSize = 1 << shift;
 var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize;
 var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 return heap.subarray(pixels >> shift, pixels + bytes >> shift);
}

function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelPackBufferBinding) {
   GLctx.readPixels(x, y, width, height, format, type, pixels);
  } else {
   var heap = heapObjectForWebGLType(type);
   GLctx.readPixels(x, y, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  }
  return;
 }
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

function _emscripten_glReleaseShaderCompiler() {}

function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx["renderbufferStorage"](x0, x1, x2, x3);
}

function _emscripten_glRenderbufferStorageMultisample(x0, x1, x2, x3, x4) {
 GLctx["renderbufferStorageMultisample"](x0, x1, x2, x3, x4);
}

function _emscripten_glResumeTransformFeedback() {
 GLctx["resumeTransformFeedback"]();
}

function _emscripten_glRotated(angle, x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.rotate(GLImmediate.matrix[GLImmediate.currentMatrix], angle * Math.PI / 180, [ x, y, z ]);
}

function _emscripten_glRotatef(angle, x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.rotate(GLImmediate.matrix[GLImmediate.currentMatrix], angle * Math.PI / 180, [ x, y, z ]);
}

function _emscripten_glSampleCoverage(value, invert) {
 GLctx.sampleCoverage(value, !!invert);
}

function _emscripten_glSamplerParameterf(sampler, pname, param) {
 GLctx["samplerParameterf"](GL.samplers[sampler], pname, param);
}

function _emscripten_glSamplerParameterfv(sampler, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx["samplerParameterf"](GL.samplers[sampler], pname, param);
}

function _emscripten_glSamplerParameteri(sampler, pname, param) {
 GLctx["samplerParameteri"](GL.samplers[sampler], pname, param);
}

function _emscripten_glSamplerParameteriv(sampler, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx["samplerParameteri"](GL.samplers[sampler], pname, param);
}

function _emscripten_glScaled(x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.scale(GLImmediate.matrix[GLImmediate.currentMatrix], [ x, y, z ]);
}

function _emscripten_glScalef(x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.scale(GLImmediate.matrix[GLImmediate.currentMatrix], [ x, y, z ]);
}

function _emscripten_glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}

function _emscripten_glShadeModel() {
 warnOnce("TODO: glShadeModel");
}

function _emscripten_glShaderBinary() {
 GL.recordError(1280);
}

function _emscripten_glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}

function _emscripten_glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}

function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
}

function _emscripten_glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}

function _emscripten_glStencilMaskSeparate(x0, x1) {
 GLctx["stencilMaskSeparate"](x0, x1);
}

function _emscripten_glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}

function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx["stencilOpSeparate"](x0, x1, x2, x3);
}

function _emscripten_glTexCoord2f(u, v) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = u;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = v;
 GLImmediate.addRendererComponent(GLImmediate.TEXTURE0, 2, GLctx.FLOAT);
}

function _emscripten_glTexCoord2i(u, v) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = u;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = v;
 GLImmediate.addRendererComponent(GLImmediate.TEXTURE0, 2, GLctx.FLOAT);
}

function _emscripten_glTexCoord2fv(v) {
 _emscripten_glTexCoord2i(HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}

function _emscripten_glTexCoord3f() {
 throw "glTexCoord3f: TODO";
}

function _emscripten_glTexCoord4f() {
 throw "glTexCoord4f: TODO";
}

function _emscripten_glTexCoordPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
}

function _emscripten_glTexGenfv() {
}

function _emscripten_glTexGeni(coord, pname, param) {
 if (pname != 9472) return;
 var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
 if (coord == 8192) GLImmediate.textureGenModeS[texUnit] = param;
 else if (coord == 8193) GLImmediate.textureGenModeT[texUnit] = param;
 GLImmediate.currentRenderer = null;
}

function _emscripten_glTexImage1D() {
 throw "glTexImage1D: TODO";
}

function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null);
  }
  return;
 }
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
}

function _emscripten_glTexImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels) {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx["texImage3D"](target, level, internalFormat, width, height, depth, border, format, type, pixels);
 } else if (pixels) {
  var heap = heapObjectForWebGLType(type);
  GLctx["texImage3D"](target, level, internalFormat, width, height, depth, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
 } else {
  GLctx["texImage3D"](target, level, internalFormat, width, height, depth, border, format, type, null);
 }
}

function _emscripten_glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}

function _emscripten_glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}

function _emscripten_glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}

function _emscripten_glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}

function _emscripten_glTexStorage2D(x0, x1, x2, x3, x4) {
 GLctx["texStorage2D"](x0, x1, x2, x3, x4);
}

function _emscripten_glTexStorage3D(x0, x1, x2, x3, x4, x5) {
 GLctx["texStorage3D"](x0, x1, x2, x3, x4, x5);
}

function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, null);
  }
  return;
 }
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

function _emscripten_glTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) {
 if (GLctx.currentPixelUnpackBufferBinding) {
  GLctx["texSubImage3D"](target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
 } else if (pixels) {
  var heap = heapObjectForWebGLType(type);
  GLctx["texSubImage3D"](target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
 } else {
  GLctx["texSubImage3D"](target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
 }
}

function _emscripten_glTransformFeedbackVaryings(program, count, varyings, bufferMode) {
 program = GL.programs[program];
 var vars = [];
 for (var i = 0; i < count; i++) vars.push(UTF8ToString(HEAP32[varyings + i * 4 >> 2]));
 GLctx["transformFeedbackVaryings"](program, vars, bufferMode);
}

function _emscripten_glTranslated(x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.translate(GLImmediate.matrix[GLImmediate.currentMatrix], [ x, y, z ]);
}

function _emscripten_glTranslatef(x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.translate(GLImmediate.matrix[GLImmediate.currentMatrix], [ x, y, z ]);
}

function _emscripten_glUniform1f(location, v0) {
 GLctx.uniform1f(webglGetUniformLocation(location), v0);
}

function _emscripten_glUniform1fv(location, count, value) {
 GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count);
}

function _emscripten_glUniform1i(location, v0) {
 GLctx.uniform1i(webglGetUniformLocation(location), v0);
}

function _emscripten_glUniform1iv(location, count, value) {
 GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, value >> 2, count);
}

function _emscripten_glUniform1ui(location, v0) {
 GLctx.uniform1ui(webglGetUniformLocation(location), v0);
}

function _emscripten_glUniform1uiv(location, count, value) {
 GLctx.uniform1uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count);
}

function _emscripten_glUniform2f(location, v0, v1) {
 GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
}

function _emscripten_glUniform2fv(location, count, value) {
 GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 2);
}

function _emscripten_glUniform2i(location, v0, v1) {
 GLctx.uniform2i(webglGetUniformLocation(location), v0, v1);
}

function _emscripten_glUniform2iv(location, count, value) {
 GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 2);
}

function _emscripten_glUniform2ui(location, v0, v1) {
 GLctx.uniform2ui(webglGetUniformLocation(location), v0, v1);
}

function _emscripten_glUniform2uiv(location, count, value) {
 GLctx.uniform2uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 2);
}

function _emscripten_glUniform3f(location, v0, v1, v2) {
 GLctx.uniform3f(webglGetUniformLocation(location), v0, v1, v2);
}

function _emscripten_glUniform3fv(location, count, value) {
 GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 3);
}

function _emscripten_glUniform3i(location, v0, v1, v2) {
 GLctx.uniform3i(webglGetUniformLocation(location), v0, v1, v2);
}

function _emscripten_glUniform3iv(location, count, value) {
 GLctx.uniform3iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 3);
}

function _emscripten_glUniform3ui(location, v0, v1, v2) {
 GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2);
}

function _emscripten_glUniform3uiv(location, count, value) {
 GLctx.uniform3uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 3);
}

function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
 GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
}

function _emscripten_glUniform4fv(location, count, value) {
 GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 4);
}

function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
 GLctx.uniform4i(webglGetUniformLocation(location), v0, v1, v2, v3);
}

function _emscripten_glUniform4iv(location, count, value) {
 GLctx.uniform4iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 4);
}

function _emscripten_glUniform4ui(location, v0, v1, v2, v3) {
 GLctx.uniform4ui(webglGetUniformLocation(location), v0, v1, v2, v3);
}

function _emscripten_glUniform4uiv(location, count, value) {
 GLctx.uniform4uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count * 4);
}

function _emscripten_glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding) {
 program = GL.programs[program];
 GLctx["uniformBlockBinding"](program, uniformBlockIndex, uniformBlockBinding);
}

function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
 GLctx.uniformMatrix2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 4);
}

function _emscripten_glUniformMatrix2x3fv(location, count, transpose, value) {
 GLctx.uniformMatrix2x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6);
}

function _emscripten_glUniformMatrix2x4fv(location, count, transpose, value) {
 GLctx.uniformMatrix2x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8);
}

function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
 GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 9);
}

function _emscripten_glUniformMatrix3x2fv(location, count, transpose, value) {
 GLctx.uniformMatrix3x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 6);
}

function _emscripten_glUniformMatrix3x4fv(location, count, transpose, value) {
 GLctx.uniformMatrix3x4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12);
}

function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
 GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 16);
}

function _emscripten_glUniformMatrix4x2fv(location, count, transpose, value) {
 GLctx.uniformMatrix4x2fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 8);
}

function _emscripten_glUniformMatrix4x3fv(location, count, transpose, value) {
 GLctx.uniformMatrix4x3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 12);
}

function _emscripten_glUseProgram(program) {
 program = GL.programs[program];
 GLctx.useProgram(program);
 GLctx.currentProgram = program;
}

function _emscripten_glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}

function _emscripten_glVertex2f(x, y) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 0;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertex2fv(p) {
 _emscripten_glVertex2f(HEAPF32[p >> 2], HEAPF32[p + 4 >> 2]);
}

function _emscripten_glVertex2i(x, y) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 0;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertex3f(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertex3fv(p) {
 _emscripten_glVertex3f(HEAPF32[p >> 2], HEAPF32[p + 4 >> 2], HEAPF32[p + 8 >> 2]);
}

function _emscripten_glVertex3i(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertex4f(x, y, z, w) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = w;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertex4fv(p) {
 _emscripten_glVertex4f(HEAPF32[p >> 2], HEAPF32[p + 4 >> 2], HEAPF32[p + 8 >> 2], HEAPF32[p + 12 >> 2]);
}

function _emscripten_glVertex4i(x, y, z, w) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = w;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _emscripten_glVertexAttrib1f(x0, x1) {
 GLctx["vertexAttrib1f"](x0, x1);
}

function _emscripten_glVertexAttrib1fv(index, v) {
 GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}

function _emscripten_glVertexAttrib2f(x0, x1, x2) {
 GLctx["vertexAttrib2f"](x0, x1, x2);
}

function _emscripten_glVertexAttrib2fv(index, v) {
 GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}

function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx["vertexAttrib3f"](x0, x1, x2, x3);
}

function _emscripten_glVertexAttrib3fv(index, v) {
 GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
}

function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
}

function _emscripten_glVertexAttrib4fv(index, v) {
 GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
}

function _emscripten_glVertexAttribDivisor(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribDivisorANGLE(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribDivisorARB(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribDivisorEXT(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribDivisorNV(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribI4i(x0, x1, x2, x3, x4) {
 GLctx["vertexAttribI4i"](x0, x1, x2, x3, x4);
}

function _emscripten_glVertexAttribI4iv(index, v) {
 GLctx.vertexAttribI4i(index, HEAP32[v >> 2], HEAP32[v + 4 >> 2], HEAP32[v + 8 >> 2], HEAP32[v + 12 >> 2]);
}

function _emscripten_glVertexAttribI4ui(x0, x1, x2, x3, x4) {
 GLctx["vertexAttribI4ui"](x0, x1, x2, x3, x4);
}

function _emscripten_glVertexAttribI4uiv(index, v) {
 GLctx.vertexAttribI4ui(index, HEAPU32[v >> 2], HEAPU32[v + 4 >> 2], HEAPU32[v + 8 >> 2], HEAPU32[v + 12 >> 2]);
}

function _emscripten_glVertexAttribIPointer(index, size, type, stride, ptr) {
 GLctx["vertexAttribIPointer"](index, size, type, stride, ptr);
}

function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

function _emscripten_glVertexPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.VERTEX, size, type, stride, pointer);
}

function _emscripten_glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}

function _emscripten_glWaitSync(sync, flags, timeoutLo, timeoutHi) {
 GLctx.waitSync(GL.syncs[sync], flags, convertI32PairToI53(timeoutLo, timeoutHi));
}

function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.copyWithin(dest, src, src + num);
}

function emscripten_realloc_buffer(size) {
 try {
  wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
  updateGlobalBufferAndViews(wasmMemory.buffer);
  return 1;
 } catch (e) {}
}

function _emscripten_resize_heap(requestedSize) {
 var oldSize = HEAPU8.length;
 requestedSize = requestedSize >>> 0;
 var maxHeapSize = _emscripten_get_heap_max();
 if (requestedSize > maxHeapSize) {
  return false;
 }
 let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
 for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
  var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
  overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
  var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  var replacement = emscripten_realloc_buffer(newSize);
  if (replacement) {
   return true;
  }
 }
 return false;
}

function _emscripten_set_main_loop_arg(func, arg, fps, simulateInfiniteLoop) {
 var browserIterationFunc = function() {
  getWasmTableEntry(func)(arg);
 };
 setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg);
}

var ENV = {};

function getExecutableName() {
 return thisProgram || "./this.program";
}

function getEnvStrings() {
 if (!getEnvStrings.strings) {
  var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(x + "=" + env[x]);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
}

function _environ_get(__environ, environ_buf) {
 var bufSize = 0;
 getEnvStrings().forEach(function(string, i) {
  var ptr = environ_buf + bufSize;
  HEAP32[__environ + i * 4 >> 2] = ptr;
  writeAsciiToMemory(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
}

function _environ_sizes_get(penviron_count, penviron_buf_size) {
 var strings = getEnvStrings();
 HEAP32[penviron_count >> 2] = strings.length;
 var bufSize = 0;
 strings.forEach(function(string) {
  bufSize += string.length + 1;
 });
 HEAP32[penviron_buf_size >> 2] = bufSize;
 return 0;
}

function _fd_close(fd) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

function _fd_read(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doReadv(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var HIGH_OFFSET = 4294967296;
  var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  var DOUBLE_LIMIT = 9007199254740992;
  if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
   return -61;
  }
  FS.llseek(stream, offset, whence);
  tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

function _fd_write(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = SYSCALLS.doWritev(stream, iov, iovcnt);
  HEAP32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
  return e.errno;
 }
}

function _getTempRet0() {
 return getTempRet0();
}

function getHostByName(name) {
 var ret = _malloc(20);
 var nameBuf = _malloc(name.length + 1);
 stringToUTF8(name, nameBuf, name.length + 1);
 HEAP32[ret >> 2] = nameBuf;
 var aliasesBuf = _malloc(4);
 HEAP32[aliasesBuf >> 2] = 0;
 HEAP32[ret + 4 >> 2] = aliasesBuf;
 var afinet = 2;
 HEAP32[ret + 8 >> 2] = afinet;
 HEAP32[ret + 12 >> 2] = 4;
 var addrListBuf = _malloc(12);
 HEAP32[addrListBuf >> 2] = addrListBuf + 8;
 HEAP32[addrListBuf + 4 >> 2] = 0;
 HEAP32[addrListBuf + 8 >> 2] = inetPton4(DNS.lookup_name(name));
 HEAP32[ret + 16 >> 2] = addrListBuf;
 return ret;
}

function _gethostbyname(name) {
 return getHostByName(UTF8ToString(name));
}

function _gettimeofday(ptr) {
 var now = Date.now();
 HEAP32[ptr >> 2] = now / 1e3 | 0;
 HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
 return 0;
}

function _glAlphaFunc(func, ref) {
 switch (func) {
 case 512:
 case 513:
 case 514:
 case 515:
 case 516:
 case 517:
 case 518:
 case 519:
  GLEmulation.alphaTestRef = ref;
  if (GLEmulation.alphaTestFunc != func) {
   GLEmulation.alphaTestFunc = func;
   GLImmediate.currentRenderer = null;
  }
  break;

 default:
  break;
 }
}

function _glBegin(mode) {
 GLImmediate.enabledClientAttributes_preBegin = GLImmediate.enabledClientAttributes;
 GLImmediate.enabledClientAttributes = [];
 GLImmediate.clientAttributes_preBegin = GLImmediate.clientAttributes;
 GLImmediate.clientAttributes = [];
 for (var i = 0; i < GLImmediate.clientAttributes_preBegin.length; i++) {
  GLImmediate.clientAttributes.push({});
 }
 GLImmediate.mode = mode;
 GLImmediate.vertexCounter = 0;
 var components = GLImmediate.rendererComponents = [];
 for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
  components[i] = 0;
 }
 GLImmediate.rendererComponentPointer = 0;
 GLImmediate.vertexData = GLImmediate.tempData;
}

function _glBindTexture(target, texture) {
 GLctx.bindTexture(target, GL.textures[texture]);
}

function _glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}

function _glClear(x0) {
 GLctx["clear"](x0);
}

function _glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}

function _glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}

function _glClipPlane(pname, param) {
 if (pname >= 12288 && pname < 12294) {
  var clipPlaneId = pname - 12288;
  GLEmulation.clipPlaneEquation[clipPlaneId][0] = Number(HEAPF64[param >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][1] = Number(HEAPF64[param + 8 >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][2] = Number(HEAPF64[param + 16 >> 3]);
  GLEmulation.clipPlaneEquation[clipPlaneId][3] = Number(HEAPF64[param + 24 >> 3]);
  var tmpMV = GLImmediate.matrixLib.mat4.create(GLImmediate.matrix[0]);
  GLImmediate.matrixLib.mat4.inverse(tmpMV);
  GLImmediate.matrixLib.mat4.transpose(tmpMV);
  GLImmediate.matrixLib.mat4.multiplyVec4(tmpMV, GLEmulation.clipPlaneEquation[clipPlaneId]);
 }
}

function _glColor4f(r, g, b, a) {
 r = Math.max(Math.min(r, 1), 0);
 g = Math.max(Math.min(g, 1), 0);
 b = Math.max(Math.min(b, 1), 0);
 a = Math.max(Math.min(a, 1), 0);
 if (GLImmediate.mode >= 0) {
  var start = GLImmediate.vertexCounter << 2;
  GLImmediate.vertexDataU8[start + 0] = r * 255;
  GLImmediate.vertexDataU8[start + 1] = g * 255;
  GLImmediate.vertexDataU8[start + 2] = b * 255;
  GLImmediate.vertexDataU8[start + 3] = a * 255;
  GLImmediate.vertexCounter++;
  GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE);
 } else {
  GLImmediate.clientColor[0] = r;
  GLImmediate.clientColor[1] = g;
  GLImmediate.clientColor[2] = b;
  GLImmediate.clientColor[3] = a;
 }
}

function _glColor4ub(r, g, b, a) {
 _emscripten_glColor4f((r & 255) / 255, (g & 255) / 255, (b & 255) / 255, (a & 255) / 255);
}

function _glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}

function _glColorPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.COLOR, size, type, stride, pointer);
}

function _glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

function _glCullFace(x0) {
 GLctx["cullFace"](x0);
}

function _glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}

function _glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}

function _glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}

function _glDisableClientState(cap) {
 var attrib = GLEmulation.getAttributeFromCapability(cap);
 if (attrib === null) {
  return;
 }
 if (GLImmediate.enabledClientAttributes[attrib]) {
  GLImmediate.enabledClientAttributes[attrib] = false;
  GLImmediate.totalEnabledClientAttributes--;
  GLImmediate.currentRenderer = null;
  if (GLEmulation.currentVao) delete GLEmulation.currentVao.enabledClientStates[cap];
  GLImmediate.modifiedClientAttributes = true;
 }
}

function _glDrawArrays(mode, first, count) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6) {
  GLctx.drawArrays(mode, first, count);
  return;
 }
 GLImmediate.prepareClientAttributes(count, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, GLImmediate.vertexPointer + (first + count) * GLImmediate.stride >> 2);
  GLImmediate.firstVertex = first;
  GLImmediate.lastVertex = first + count;
 }
 GLImmediate.flush(null, first);
 GLImmediate.mode = -1;
}

function _glDrawBuffer() {
}

function _glDrawElements(mode, count, type, indices, start, end) {
 if (GLImmediate.totalEnabledClientAttributes == 0 && mode <= 6 && GLctx.currentElementArrayBufferBinding) {
  GLctx.drawElements(mode, count, type, indices);
  return;
 }
 GLImmediate.prepareClientAttributes(count, false);
 GLImmediate.mode = mode;
 if (!GLctx.currentArrayBufferBinding) {
  GLImmediate.firstVertex = end ? start : HEAP8.length;
  GLImmediate.lastVertex = end ? end + 1 : 0;
  GLImmediate.vertexData = HEAPF32.subarray(GLImmediate.vertexPointer >> 2, end ? GLImmediate.vertexPointer + (end + 1) * GLImmediate.stride >> 2 : undefined);
 }
 GLImmediate.flush(count, 0, indices);
 GLImmediate.mode = -1;
}

function _glEnd() {
 GLImmediate.prepareClientAttributes(GLImmediate.rendererComponents[GLImmediate.VERTEX], true);
 GLImmediate.firstVertex = 0;
 GLImmediate.lastVertex = GLImmediate.vertexCounter / (GLImmediate.stride >> 2);
 GLImmediate.flush();
 GLImmediate.disableBeginEndClientAttributes();
 GLImmediate.mode = -1;
 GLImmediate.enabledClientAttributes = GLImmediate.enabledClientAttributes_preBegin;
 GLImmediate.clientAttributes = GLImmediate.clientAttributes_preBegin;
 GLImmediate.currentRenderer = null;
 GLImmediate.modifiedClientAttributes = true;
}

function _glFlush() {
 GLctx["flush"]();
}

function _glFogf(pname, param) {
 switch (pname) {
 case 2915:
  GLEmulation.fogStart = param;
  break;

 case 2916:
  GLEmulation.fogEnd = param;
  break;

 case 2914:
  GLEmulation.fogDensity = param;
  break;

 case 2917:
  switch (param) {
  case 2049:
  case 9729:
   if (GLEmulation.fogMode != param) {
    GLImmediate.currentRenderer = null;
    GLEmulation.fogMode = param;
   }
   break;

  default:
   if (GLEmulation.fogMode != 2048) {
    GLImmediate.currentRenderer = null;
    GLEmulation.fogMode = 2048;
   }
   break;
  }
  break;
 }
}

function _emscripten_glFogf(pname, param) {
 switch (pname) {
 case 2915:
  GLEmulation.fogStart = param;
  break;

 case 2916:
  GLEmulation.fogEnd = param;
  break;

 case 2914:
  GLEmulation.fogDensity = param;
  break;

 case 2917:
  switch (param) {
  case 2049:
  case 9729:
   if (GLEmulation.fogMode != param) {
    GLImmediate.currentRenderer = null;
    GLEmulation.fogMode = param;
   }
   break;

  default:
   if (GLEmulation.fogMode != 2048) {
    GLImmediate.currentRenderer = null;
    GLEmulation.fogMode = 2048;
   }
   break;
  }
  break;
 }
}

function _glFogfv(pname, param) {
 switch (pname) {
 case 2918:
  GLEmulation.fogColor[0] = HEAPF32[param >> 2];
  GLEmulation.fogColor[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.fogColor[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.fogColor[3] = HEAPF32[param + 12 >> 2];
  break;

 case 2915:
 case 2916:
  _emscripten_glFogf(pname, HEAPF32[param >> 2]);
  break;
 }
}

function _glFogi(pname, param) {
 return _emscripten_glFogf(pname, param);
}

function _glFrontFace(x0) {
 GLctx["frontFace"](x0);
}

function _glGenTextures(n, textures) {
 __glGenObject(n, textures, "createTexture", GL.textures);
}

function _glGetError() {
 var error = GLctx.getError() || GL.lastError;
 GL.lastError = 0;
 return error;
}

function _glLightModelfv(pname, param) {
 if (pname == 2899) {
  GLEmulation.lightModelAmbient[0] = HEAPF32[param >> 2];
  GLEmulation.lightModelAmbient[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.lightModelAmbient[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.lightModelAmbient[3] = HEAPF32[param + 12 >> 2];
 } else {
  throw "glLightModelfv: TODO: " + pname;
 }
}

function _glLightfv(light, pname, param) {
 if (light >= 16384 && light < 16392) {
  var lightId = light - 16384;
  if (pname == 4608) {
   GLEmulation.lightAmbient[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightAmbient[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightAmbient[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightAmbient[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4609) {
   GLEmulation.lightDiffuse[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightDiffuse[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightDiffuse[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightDiffuse[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4610) {
   GLEmulation.lightSpecular[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightSpecular[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightSpecular[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightSpecular[lightId][3] = HEAPF32[param + 12 >> 2];
  } else if (pname == 4611) {
   GLEmulation.lightPosition[lightId][0] = HEAPF32[param >> 2];
   GLEmulation.lightPosition[lightId][1] = HEAPF32[param + 4 >> 2];
   GLEmulation.lightPosition[lightId][2] = HEAPF32[param + 8 >> 2];
   GLEmulation.lightPosition[lightId][3] = HEAPF32[param + 12 >> 2];
   GLImmediate.matrixLib.mat4.multiplyVec4(GLImmediate.matrix[0], GLEmulation.lightPosition[lightId]);
  } else {
   throw "glLightfv: TODO: " + pname;
  }
 }
}

function _glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}

function _glLoadIdentity() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _glLoadMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.set(HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2), GLImmediate.matrix[GLImmediate.currentMatrix]);
}

function _glMaterialfv(face, pname, param) {
 if (face != 1028 && face != 1032) {
  throw "glMaterialfv: TODO" + face;
 }
 if (pname == 4608) {
  GLEmulation.materialAmbient[0] = HEAPF32[param >> 2];
  GLEmulation.materialAmbient[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialAmbient[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialAmbient[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 4609) {
  GLEmulation.materialDiffuse[0] = HEAPF32[param >> 2];
  GLEmulation.materialDiffuse[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialDiffuse[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialDiffuse[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 4610) {
  GLEmulation.materialSpecular[0] = HEAPF32[param >> 2];
  GLEmulation.materialSpecular[1] = HEAPF32[param + 4 >> 2];
  GLEmulation.materialSpecular[2] = HEAPF32[param + 8 >> 2];
  GLEmulation.materialSpecular[3] = HEAPF32[param + 12 >> 2];
 } else if (pname == 5633) {
  GLEmulation.materialShininess[0] = HEAPF32[param >> 2];
 } else {
  throw "glMaterialfv: TODO: " + pname;
 }
}

function _glMatrixMode(mode) {
 if (mode == 5888) {
  GLImmediate.currentMatrix = 0;
 } else if (mode == 5889) {
  GLImmediate.currentMatrix = 1;
 } else if (mode == 5890) {
  GLImmediate.useTextureMatrix = true;
  GLImmediate.currentMatrix = 2 + GLImmediate.TexEnvJIT.getActiveTexture();
 } else {
  throw "Wrong mode " + mode + " passed to glMatrixMode";
 }
}

function _glMultMatrixf(matrix) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], HEAPF32.subarray(matrix >> 2, matrix + 64 >> 2));
}

function _glNormalPointer(type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.NORMAL, 3, type, stride, pointer);
}

function _glPixelStorei(pname, param) {
 if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}

function _glPointSize(size) {
 GLEmulation.pointSize = size;
}

function _glPolygonMode() {}

function _glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}

function _glPopMatrix() {
 if (GLImmediate.matrixStack[GLImmediate.currentMatrix].length == 0) {
  GL.recordError(1284);
  return;
 }
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop();
}

function _glPushMatrix() {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixStack[GLImmediate.currentMatrix].push(Array.prototype.slice.call(GLImmediate.matrix[GLImmediate.currentMatrix]));
}

function _glReadBuffer(x0) {
 GLctx["readBuffer"](x0);
}

function _glReadPixels(x, y, width, height, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelPackBufferBinding) {
   GLctx.readPixels(x, y, width, height, format, type, pixels);
  } else {
   var heap = heapObjectForWebGLType(type);
   GLctx.readPixels(x, y, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  }
  return;
 }
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

function _glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}

function _glShadeModel() {
 warnOnce("TODO: glShadeModel");
}

function _glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}

function _glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}

function _glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}

function _glTexCoord2f(u, v) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = u;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = v;
 GLImmediate.addRendererComponent(GLImmediate.TEXTURE0, 2, GLctx.FLOAT);
}

function _glTexCoordPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture, size, type, stride, pointer);
}

function _glTexEnvf() {
 warnOnce("glTexEnvf: TODO");
}

function _glTexEnvi() {
 warnOnce("glTexEnvi: TODO");
}

function _glTexGeni(coord, pname, param) {
 if (pname != 9472) return;
 var texUnit = GLImmediate.TexEnvJIT.getActiveTexture();
 if (coord == 8192) GLImmediate.textureGenModeS[texUnit] = param;
 else if (coord == 8193) GLImmediate.textureGenModeT[texUnit] = param;
 GLImmediate.currentRenderer = null;
}

function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, null);
  }
  return;
 }
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
}

function _glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}

function _glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}

function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 if (true) {
  if (GLctx.currentPixelUnpackBufferBinding) {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
  } else if (pixels) {
   var heap = heapObjectForWebGLType(type);
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, pixels >> heapAccessShiftForWebGLHeap(heap));
  } else {
   GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, null);
  }
  return;
 }
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

function _glTranslatef(x, y, z) {
 GLImmediate.matricesModified = true;
 GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
 GLImmediate.matrixLib.mat4.translate(GLImmediate.matrix[GLImmediate.currentMatrix], [ x, y, z ]);
}

function _glVertex2f(x, y) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 0;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _glVertex2i(x, y) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 0;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _glVertex3f(x, y, z) {
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
 GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
 GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT);
}

function _glVertexPointer(size, type, stride, pointer) {
 GLImmediate.setClientAttribute(GLImmediate.VERTEX, size, type, stride, pointer);
}

function _glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}

function _llvm_eh_typeid_for(type) {
 return type;
}

function _setTempRet0(val) {
 setTempRet0(val);
}

function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
}

var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}

function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  },
  "%A": function(date) {
   return WEEKDAYS[date.tm_wday];
  },
  "%b": function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  },
  "%B": function(date) {
   return MONTHS[date.tm_mon];
  },
  "%C": function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  },
  "%d": function(date) {
   return leadingNulls(date.tm_mday, 2);
  },
  "%e": function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  },
  "%g": function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  },
  "%G": function(date) {
   return getWeekBasedYear(date);
  },
  "%H": function(date) {
   return leadingNulls(date.tm_hour, 2);
  },
  "%I": function(date) {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  },
  "%m": function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  },
  "%M": function(date) {
   return leadingNulls(date.tm_min, 2);
  },
  "%n": function() {
   return "\n";
  },
  "%p": function(date) {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   } else {
    return "PM";
   }
  },
  "%S": function(date) {
   return leadingNulls(date.tm_sec, 2);
  },
  "%t": function() {
   return "\t";
  },
  "%u": function(date) {
   return date.tm_wday || 7;
  },
  "%U": function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  },
  "%V": function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  },
  "%w": function(date) {
   return date.tm_wday;
  },
  "%W": function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  },
  "%y": function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  },
  "%Y": function(date) {
   return date.tm_year + 1900;
  },
  "%z": function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": function(date) {
   return date.tm_zone;
  },
  "%%": function() {
   return "%";
  }
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}

function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}

function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}

var FSNode = function(parent, name, mode, rdev) {
 if (!parent) {
  parent = this;
 }
 this.parent = parent;
 this.mount = parent.mount;
 this.mounted = null;
 this.id = FS.nextInode++;
 this.name = name;
 this.mode = mode;
 this.node_ops = {};
 this.stream_ops = {};
 this.rdev = rdev;
};

var readMode = 292 | 73;

var writeMode = 146;

Object.defineProperties(FSNode.prototype, {
 read: {
  get: function() {
   return (this.mode & readMode) === readMode;
  },
  set: function(val) {
   val ? this.mode |= readMode : this.mode &= ~readMode;
  }
 },
 write: {
  get: function() {
   return (this.mode & writeMode) === writeMode;
  },
  set: function(val) {
   val ? this.mode |= writeMode : this.mode &= ~writeMode;
  }
 },
 isFolder: {
  get: function() {
   return FS.isDir(this.mode);
  }
 },
 isDevice: {
  get: function() {
   return FS.isChrdev(this.mode);
  }
 }
});

FS.FSNode = FSNode;

FS.staticInit();

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

Module["FS_unlink"] = FS.unlink;

Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas) {
 Browser.requestFullscreen(lockPointer, resizeCanvas);
};

Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};

Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};

Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};

Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};

Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};

Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};

var GLctx;

GLImmediate.setupFuncs();

Browser.moduleContextCreatedCallbacks.push(function() {
 GLImmediate.init();
});

GLEmulation.init();

for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var asmLibraryArg = {
 "yk": _SDL_CreateRGBSurfaceFrom,
 "db": _SDL_Delay,
 "xk": _SDL_EnableKeyRepeat,
 "wk": _SDL_EnableUNICODE,
 "vk": _SDL_Flip,
 "uk": _SDL_FreeSurface,
 "R": _SDL_GL_SetAttribute,
 "tk": _SDL_GL_SwapBuffers,
 "sk": _SDL_GetError,
 "rk": _SDL_GetVideoInfo,
 "qk": _SDL_Init,
 "pk": _SDL_JoystickClose,
 "ok": _SDL_JoystickGetAxis,
 "nk": _SDL_JoystickGetButton,
 "mk": _SDL_JoystickGetHat,
 "lk": _SDL_JoystickName,
 "Xb": _SDL_JoystickNumAxes,
 "Wb": _SDL_JoystickNumButtons,
 "Vb": _SDL_JoystickNumHats,
 "kk": _SDL_JoystickOpen,
 "jk": _SDL_JoystickUpdate,
 "ik": _SDL_ListModes,
 "hk": _SDL_NumJoysticks,
 "gk": _SDL_PollEvent,
 "fk": _SDL_Quit,
 "ek": _SDL_SetAlpha,
 "dk": _SDL_SetColorKey,
 "na": _SDL_SetVideoMode,
 "ck": _SDL_ShowCursor,
 "Ub": _SDL_UpperBlit,
 "bk": _SDL_WM_IconifyWindow,
 "ak": _SDL_WM_SetCaption,
 "$j": _SDL_WarpMouse,
 "x": ___cxa_allocate_exception,
 "w": ___cxa_begin_catch,
 "Tb": ___cxa_call_unexpected,
 "C": ___cxa_end_catch,
 "b": ___cxa_find_matching_catch_2,
 "h": ___cxa_find_matching_catch_3,
 "B": ___cxa_find_matching_catch_4,
 "A": ___cxa_free_exception,
 "Sb": ___cxa_rethrow,
 "Q": ___cxa_throw,
 "_j": ___cxa_uncaught_exceptions,
 "g": ___resumeException,
 "Zj": ___syscall__newselect,
 "Yj": ___syscall_bind,
 "Xj": ___syscall_chdir,
 "Wj": ___syscall_faccessat,
 "Rb": ___syscall_fcntl64,
 "Vj": ___syscall_getcwd,
 "Uj": ___syscall_getdents64,
 "Qb": ___syscall_ioctl,
 "Tj": ___syscall_mkdir,
 "Pb": ___syscall_open,
 "Sj": ___syscall_readlink,
 "Rj": ___syscall_recvmsg,
 "Qj": ___syscall_rmdir,
 "Pj": ___syscall_sendmsg,
 "Oj": ___syscall_socket,
 "Nj": ___syscall_stat64,
 "Mj": ___syscall_unlink,
 "Ij": __emscripten_throw_longjmp,
 "Hj": __gmtime_js,
 "Gj": __localtime_js,
 "Fj": __mktime_js,
 "Ej": __tzset_js,
 "p": _abort,
 "Nb": _alBufferData,
 "Mb": _alDeleteBuffers,
 "Lb": _alDeleteSources,
 "Kb": _alGenBuffers,
 "Jb": _alGenSources,
 "aa": _alGetError,
 "Ja": _alGetSourcei,
 "Dj": _alIsBuffer,
 "Cj": _alListener3f,
 "Bj": _alListenerfv,
 "ma": _alSource3f,
 "Aj": _alSourcePause,
 "Ia": _alSourcePlay,
 "Ib": _alSourceQueueBuffers,
 "Hb": _alSourceStop,
 "Gb": _alSourceUnqueueBuffers,
 "S": _alSourcef,
 "wa": _alSourcei,
 "zj": _alcCloseDevice,
 "yj": _alcCreateContext,
 "xj": _alcDestroyContext,
 "wj": _alcGetContextsDevice,
 "vj": _alcGetCurrentContext,
 "uj": _alcMakeContextCurrent,
 "tj": _alcOpenDevice,
 "sj": _difftime,
 "Fb": _emscripten_asm_const_int,
 "rj": _emscripten_cancel_main_loop,
 "qj": _emscripten_get_heap_max,
 "Eb": _emscripten_get_now,
 "pj": _emscripten_glActiveTexture,
 "oj": _emscripten_glAlphaFunc,
 "nj": _emscripten_glAttachShader,
 "mj": _emscripten_glBegin,
 "lj": _emscripten_glBeginQuery,
 "kj": _emscripten_glBeginQueryEXT,
 "jj": _emscripten_glBeginTransformFeedback,
 "ij": _emscripten_glBindAttribLocation,
 "hj": _emscripten_glBindBuffer,
 "gj": _emscripten_glBindBufferBase,
 "fj": _emscripten_glBindBufferRange,
 "ej": _emscripten_glBindFramebuffer,
 "dj": _emscripten_glBindProgram,
 "cj": _emscripten_glBindRenderbuffer,
 "bj": _emscripten_glBindSampler,
 "aj": _emscripten_glBindTexture,
 "$i": _emscripten_glBindTransformFeedback,
 "_i": _emscripten_glBindVertexArray,
 "Zi": _emscripten_glBindVertexArrayOES,
 "Yi": _emscripten_glBlendColor,
 "Xi": _emscripten_glBlendEquation,
 "Wi": _emscripten_glBlendEquationSeparate,
 "Vi": _emscripten_glBlendFunc,
 "Ui": _emscripten_glBlendFuncSeparate,
 "Ti": _emscripten_glBlitFramebuffer,
 "Si": _emscripten_glBufferData,
 "Ri": _emscripten_glBufferSubData,
 "Qi": _emscripten_glCheckFramebufferStatus,
 "Pi": _emscripten_glClear,
 "Oi": _emscripten_glClearBufferfi,
 "Ni": _emscripten_glClearBufferfv,
 "Mi": _emscripten_glClearBufferiv,
 "Li": _emscripten_glClearBufferuiv,
 "Ki": _emscripten_glClearColor,
 "Ji": _emscripten_glClearDepthf,
 "Ii": _emscripten_glClearStencil,
 "Hi": _emscripten_glClientActiveTexture,
 "Gi": _emscripten_glClientWaitSync,
 "Fi": _emscripten_glClipPlane,
 "Ei": _emscripten_glColor3d,
 "Di": _emscripten_glColor3f,
 "Ci": _emscripten_glColor3fv,
 "Bi": _emscripten_glColor3ub,
 "Ai": _emscripten_glColor3ubv,
 "zi": _emscripten_glColor3ui,
 "yi": _emscripten_glColor3uiv,
 "xi": _emscripten_glColor3us,
 "wi": _emscripten_glColor3usv,
 "vi": _emscripten_glColor4d,
 "ui": _emscripten_glColor4f,
 "ti": _emscripten_glColor4fv,
 "si": _emscripten_glColor4ub,
 "ri": _emscripten_glColor4ubv,
 "qi": _emscripten_glColor4ui,
 "pi": _emscripten_glColor4us,
 "oi": _emscripten_glColorMask,
 "ni": _emscripten_glColorPointer,
 "mi": _emscripten_glCompileShader,
 "li": _emscripten_glCompressedTexImage2D,
 "ki": _emscripten_glCompressedTexImage3D,
 "ji": _emscripten_glCompressedTexSubImage2D,
 "ii": _emscripten_glCompressedTexSubImage3D,
 "hi": _emscripten_glCopyBufferSubData,
 "gi": _emscripten_glCopyTexImage2D,
 "fi": _emscripten_glCopyTexSubImage2D,
 "ei": _emscripten_glCopyTexSubImage3D,
 "di": _emscripten_glCreateProgram,
 "ci": _emscripten_glCreateShader,
 "bi": _emscripten_glCullFace,
 "ai": _emscripten_glDeleteBuffers,
 "$h": _emscripten_glDeleteFramebuffers,
 "_h": _emscripten_glDeleteObject,
 "Zh": _emscripten_glDeleteProgram,
 "Yh": _emscripten_glDeleteQueries,
 "Xh": _emscripten_glDeleteQueriesEXT,
 "Wh": _emscripten_glDeleteRenderbuffers,
 "Vh": _emscripten_glDeleteSamplers,
 "Uh": _emscripten_glDeleteShader,
 "Th": _emscripten_glDeleteSync,
 "Sh": _emscripten_glDeleteTextures,
 "Rh": _emscripten_glDeleteTransformFeedbacks,
 "Qh": _emscripten_glDeleteVertexArrays,
 "Ph": _emscripten_glDeleteVertexArraysOES,
 "Oh": _emscripten_glDepthFunc,
 "Nh": _emscripten_glDepthMask,
 "Mh": _emscripten_glDepthRangef,
 "Lh": _emscripten_glDetachShader,
 "Kh": _emscripten_glDisable,
 "Jh": _emscripten_glDisableClientState,
 "Ih": _emscripten_glDisableVertexAttribArray,
 "Hh": _emscripten_glDrawArrays,
 "Gh": _emscripten_glDrawArraysInstanced,
 "Fh": _emscripten_glDrawArraysInstancedANGLE,
 "Eh": _emscripten_glDrawArraysInstancedARB,
 "Dh": _emscripten_glDrawArraysInstancedEXT,
 "Ch": _emscripten_glDrawArraysInstancedNV,
 "Bh": _emscripten_glDrawBuffer,
 "Ah": _emscripten_glDrawBuffers,
 "zh": _emscripten_glDrawBuffersEXT,
 "yh": _emscripten_glDrawBuffersWEBGL,
 "xh": _emscripten_glDrawElements,
 "wh": _emscripten_glDrawElementsInstanced,
 "vh": _emscripten_glDrawElementsInstancedANGLE,
 "uh": _emscripten_glDrawElementsInstancedARB,
 "th": _emscripten_glDrawElementsInstancedEXT,
 "sh": _emscripten_glDrawElementsInstancedNV,
 "rh": _emscripten_glDrawRangeElements,
 "qh": _emscripten_glEnable,
 "ph": _emscripten_glEnableClientState,
 "oh": _emscripten_glEnableVertexAttribArray,
 "nh": _emscripten_glEnd,
 "mh": _emscripten_glEndQuery,
 "lh": _emscripten_glEndQueryEXT,
 "kh": _emscripten_glEndTransformFeedback,
 "jh": _emscripten_glFenceSync,
 "ih": _emscripten_glFinish,
 "hh": _emscripten_glFlush,
 "gh": _emscripten_glFramebufferRenderbuffer,
 "fh": _emscripten_glFramebufferTexture2D,
 "eh": _emscripten_glFramebufferTextureLayer,
 "dh": _emscripten_glFrontFace,
 "ch": _emscripten_glFrustum,
 "bh": _emscripten_glGenBuffers,
 "ah": _emscripten_glGenFramebuffers,
 "$g": _emscripten_glGenQueries,
 "_g": _emscripten_glGenQueriesEXT,
 "Zg": _emscripten_glGenRenderbuffers,
 "Yg": _emscripten_glGenSamplers,
 "Xg": _emscripten_glGenTextures,
 "Wg": _emscripten_glGenTransformFeedbacks,
 "Vg": _emscripten_glGenVertexArrays,
 "Ug": _emscripten_glGenVertexArraysOES,
 "Tg": _emscripten_glGenerateMipmap,
 "Sg": _emscripten_glGetActiveAttrib,
 "Rg": _emscripten_glGetActiveUniform,
 "Qg": _emscripten_glGetActiveUniformBlockName,
 "Pg": _emscripten_glGetActiveUniformBlockiv,
 "Og": _emscripten_glGetActiveUniformsiv,
 "Ng": _emscripten_glGetAttachedShaders,
 "Mg": _emscripten_glGetAttribLocation,
 "Lg": _emscripten_glGetBooleanv,
 "Kg": _emscripten_glGetBufferParameteri64v,
 "Jg": _emscripten_glGetBufferParameteriv,
 "Ig": _emscripten_glGetError,
 "Hg": _emscripten_glGetFloatv,
 "Gg": _emscripten_glGetFragDataLocation,
 "Fg": _emscripten_glGetFramebufferAttachmentParameteriv,
 "Eg": _emscripten_glGetInfoLog,
 "Dg": _emscripten_glGetInteger64i_v,
 "Cg": _emscripten_glGetInteger64v,
 "Bg": _emscripten_glGetIntegeri_v,
 "Ag": _emscripten_glGetIntegerv,
 "zg": _emscripten_glGetInternalformativ,
 "yg": _emscripten_glGetObjectParameteriv,
 "xg": _emscripten_glGetPointerv,
 "wg": _emscripten_glGetProgramBinary,
 "vg": _emscripten_glGetProgramInfoLog,
 "ug": _emscripten_glGetProgramiv,
 "tg": _emscripten_glGetQueryObjecti64vEXT,
 "sg": _emscripten_glGetQueryObjectivEXT,
 "rg": _emscripten_glGetQueryObjectui64vEXT,
 "qg": _emscripten_glGetQueryObjectuiv,
 "pg": _emscripten_glGetQueryObjectuivEXT,
 "og": _emscripten_glGetQueryiv,
 "ng": _emscripten_glGetQueryivEXT,
 "mg": _emscripten_glGetRenderbufferParameteriv,
 "lg": _emscripten_glGetSamplerParameterfv,
 "kg": _emscripten_glGetSamplerParameteriv,
 "jg": _emscripten_glGetShaderInfoLog,
 "ig": _emscripten_glGetShaderPrecisionFormat,
 "hg": _emscripten_glGetShaderSource,
 "gg": _emscripten_glGetShaderiv,
 "fg": _emscripten_glGetString,
 "eg": _emscripten_glGetStringi,
 "dg": _emscripten_glGetSynciv,
 "cg": _emscripten_glGetTexEnvfv,
 "bg": _emscripten_glGetTexEnviv,
 "ag": _emscripten_glGetTexLevelParameteriv,
 "$f": _emscripten_glGetTexParameterfv,
 "_f": _emscripten_glGetTexParameteriv,
 "Zf": _emscripten_glGetTransformFeedbackVarying,
 "Yf": _emscripten_glGetUniformBlockIndex,
 "Xf": _emscripten_glGetUniformIndices,
 "Wf": _emscripten_glGetUniformLocation,
 "Vf": _emscripten_glGetUniformfv,
 "Uf": _emscripten_glGetUniformiv,
 "Tf": _emscripten_glGetUniformuiv,
 "Sf": _emscripten_glGetVertexAttribIiv,
 "Rf": _emscripten_glGetVertexAttribIuiv,
 "Qf": _emscripten_glGetVertexAttribPointerv,
 "Pf": _emscripten_glGetVertexAttribfv,
 "Of": _emscripten_glGetVertexAttribiv,
 "Nf": _emscripten_glHint,
 "Mf": _emscripten_glInvalidateFramebuffer,
 "Lf": _emscripten_glInvalidateSubFramebuffer,
 "Kf": _emscripten_glIsBuffer,
 "Jf": _emscripten_glIsEnabled,
 "If": _emscripten_glIsFramebuffer,
 "Hf": _emscripten_glIsProgram,
 "Gf": _emscripten_glIsQuery,
 "Ff": _emscripten_glIsQueryEXT,
 "Ef": _emscripten_glIsRenderbuffer,
 "Df": _emscripten_glIsSampler,
 "Cf": _emscripten_glIsShader,
 "Bf": _emscripten_glIsSync,
 "Af": _emscripten_glIsTexture,
 "zf": _emscripten_glIsTransformFeedback,
 "yf": _emscripten_glIsVertexArray,
 "xf": _emscripten_glIsVertexArrayOES,
 "wf": _emscripten_glLightModelf,
 "vf": _emscripten_glLightModelfv,
 "uf": _emscripten_glLightfv,
 "tf": _emscripten_glLineWidth,
 "sf": _emscripten_glLinkProgram,
 "rf": _emscripten_glLoadIdentity,
 "qf": _emscripten_glLoadMatrixd,
 "pf": _emscripten_glLoadMatrixf,
 "of": _emscripten_glLoadTransposeMatrixd,
 "nf": _emscripten_glLoadTransposeMatrixf,
 "mf": _emscripten_glMaterialfv,
 "lf": _emscripten_glMatrixMode,
 "kf": _emscripten_glMultMatrixd,
 "jf": _emscripten_glMultMatrixf,
 "hf": _emscripten_glMultTransposeMatrixd,
 "gf": _emscripten_glMultTransposeMatrixf,
 "ff": _emscripten_glNormal3f,
 "ef": _emscripten_glNormalPointer,
 "df": _emscripten_glOrtho,
 "cf": _emscripten_glPauseTransformFeedback,
 "bf": _emscripten_glPixelStorei,
 "af": _emscripten_glPolygonMode,
 "$e": _emscripten_glPolygonOffset,
 "_e": _emscripten_glPopMatrix,
 "Ze": _emscripten_glProgramBinary,
 "Ye": _emscripten_glProgramParameteri,
 "Xe": _emscripten_glPushMatrix,
 "We": _emscripten_glQueryCounterEXT,
 "Ve": _emscripten_glReadBuffer,
 "Ue": _emscripten_glReadPixels,
 "Te": _emscripten_glReleaseShaderCompiler,
 "Se": _emscripten_glRenderbufferStorage,
 "Re": _emscripten_glRenderbufferStorageMultisample,
 "Qe": _emscripten_glResumeTransformFeedback,
 "Pe": _emscripten_glRotated,
 "Oe": _emscripten_glRotatef,
 "Ne": _emscripten_glSampleCoverage,
 "Me": _emscripten_glSamplerParameterf,
 "Le": _emscripten_glSamplerParameterfv,
 "Ke": _emscripten_glSamplerParameteri,
 "Je": _emscripten_glSamplerParameteriv,
 "Ie": _emscripten_glScaled,
 "He": _emscripten_glScalef,
 "Ge": _emscripten_glScissor,
 "Fe": _emscripten_glShadeModel,
 "Ee": _emscripten_glShaderBinary,
 "De": _emscripten_glShaderSource,
 "Ce": _emscripten_glStencilFunc,
 "Be": _emscripten_glStencilFuncSeparate,
 "Ae": _emscripten_glStencilMask,
 "ze": _emscripten_glStencilMaskSeparate,
 "ye": _emscripten_glStencilOp,
 "xe": _emscripten_glStencilOpSeparate,
 "we": _emscripten_glTexCoord2f,
 "ve": _emscripten_glTexCoord2fv,
 "ue": _emscripten_glTexCoord2i,
 "te": _emscripten_glTexCoord3f,
 "se": _emscripten_glTexCoord4f,
 "re": _emscripten_glTexCoordPointer,
 "qe": _emscripten_glTexGenfv,
 "pe": _emscripten_glTexGeni,
 "oe": _emscripten_glTexImage1D,
 "ne": _emscripten_glTexImage2D,
 "me": _emscripten_glTexImage3D,
 "le": _emscripten_glTexParameterf,
 "ke": _emscripten_glTexParameterfv,
 "je": _emscripten_glTexParameteri,
 "ie": _emscripten_glTexParameteriv,
 "he": _emscripten_glTexStorage2D,
 "ge": _emscripten_glTexStorage3D,
 "fe": _emscripten_glTexSubImage2D,
 "ee": _emscripten_glTexSubImage3D,
 "de": _emscripten_glTransformFeedbackVaryings,
 "ce": _emscripten_glTranslated,
 "be": _emscripten_glTranslatef,
 "ae": _emscripten_glUniform1f,
 "$d": _emscripten_glUniform1fv,
 "_d": _emscripten_glUniform1i,
 "Zd": _emscripten_glUniform1iv,
 "Yd": _emscripten_glUniform1ui,
 "Xd": _emscripten_glUniform1uiv,
 "Wd": _emscripten_glUniform2f,
 "Vd": _emscripten_glUniform2fv,
 "Ud": _emscripten_glUniform2i,
 "Td": _emscripten_glUniform2iv,
 "Sd": _emscripten_glUniform2ui,
 "Rd": _emscripten_glUniform2uiv,
 "Qd": _emscripten_glUniform3f,
 "Pd": _emscripten_glUniform3fv,
 "Od": _emscripten_glUniform3i,
 "Nd": _emscripten_glUniform3iv,
 "Md": _emscripten_glUniform3ui,
 "Ld": _emscripten_glUniform3uiv,
 "Kd": _emscripten_glUniform4f,
 "Jd": _emscripten_glUniform4fv,
 "Id": _emscripten_glUniform4i,
 "Hd": _emscripten_glUniform4iv,
 "Gd": _emscripten_glUniform4ui,
 "Fd": _emscripten_glUniform4uiv,
 "Ed": _emscripten_glUniformBlockBinding,
 "Dd": _emscripten_glUniformMatrix2fv,
 "Cd": _emscripten_glUniformMatrix2x3fv,
 "Bd": _emscripten_glUniformMatrix2x4fv,
 "Ad": _emscripten_glUniformMatrix3fv,
 "zd": _emscripten_glUniformMatrix3x2fv,
 "yd": _emscripten_glUniformMatrix3x4fv,
 "xd": _emscripten_glUniformMatrix4fv,
 "wd": _emscripten_glUniformMatrix4x2fv,
 "vd": _emscripten_glUniformMatrix4x3fv,
 "ud": _emscripten_glUseProgram,
 "td": _emscripten_glValidateProgram,
 "sd": _emscripten_glVertex2f,
 "rd": _emscripten_glVertex2fv,
 "qd": _emscripten_glVertex2i,
 "pd": _emscripten_glVertex3f,
 "od": _emscripten_glVertex3fv,
 "nd": _emscripten_glVertex3i,
 "md": _emscripten_glVertex4f,
 "ld": _emscripten_glVertex4fv,
 "kd": _emscripten_glVertex4i,
 "jd": _emscripten_glVertexAttrib1f,
 "id": _emscripten_glVertexAttrib1fv,
 "hd": _emscripten_glVertexAttrib2f,
 "gd": _emscripten_glVertexAttrib2fv,
 "fd": _emscripten_glVertexAttrib3f,
 "ed": _emscripten_glVertexAttrib3fv,
 "dd": _emscripten_glVertexAttrib4f,
 "cd": _emscripten_glVertexAttrib4fv,
 "bd": _emscripten_glVertexAttribDivisor,
 "ad": _emscripten_glVertexAttribDivisorANGLE,
 "$c": _emscripten_glVertexAttribDivisorARB,
 "_c": _emscripten_glVertexAttribDivisorEXT,
 "Zc": _emscripten_glVertexAttribDivisorNV,
 "Yc": _emscripten_glVertexAttribI4i,
 "Xc": _emscripten_glVertexAttribI4iv,
 "Wc": _emscripten_glVertexAttribI4ui,
 "Vc": _emscripten_glVertexAttribI4uiv,
 "Uc": _emscripten_glVertexAttribIPointer,
 "Tc": _emscripten_glVertexAttribPointer,
 "Sc": _emscripten_glVertexPointer,
 "Rc": _emscripten_glViewport,
 "Qc": _emscripten_glWaitSync,
 "Pc": _emscripten_memcpy_big,
 "Oc": _emscripten_resize_heap,
 "Nc": _emscripten_set_main_loop_arg,
 "Lj": _environ_get,
 "Kj": _environ_sizes_get,
 "N": _exit,
 "Ta": _fd_close,
 "Jj": _fd_read,
 "bc": _fd_seek,
 "Ob": _fd_write,
 "a": _getTempRet0,
 "Mc": _gethostbyname,
 "G": _gettimeofday,
 "Ha": _glAlphaFunc,
 "$": _glBegin,
 "cb": _glBindTexture,
 "ca": _glBlendFunc,
 "va": _glClear,
 "Sa": _glClearColor,
 "Lc": _glClearDepth,
 "Db": _glClipPlane,
 "Kc": _glColor4f,
 "M": _glColor4ub,
 "bb": _glColorMask,
 "U": _glColorPointer,
 "Jc": _glCopyTexSubImage2D,
 "la": _glCullFace,
 "ha": _glDeleteTextures,
 "fa": _glDepthFunc,
 "ga": _glDepthMask,
 "v": _glDisable,
 "_": _glDisableClientState,
 "Ra": _glDrawArrays,
 "Qa": _glDrawBuffer,
 "ea": _glDrawElements,
 "z": _glEnable,
 "T": _glEnableClientState,
 "Z": _glEnd,
 "Ic": _glFlush,
 "Pa": _glFogf,
 "Hc": _glFogfv,
 "Cb": _glFogi,
 "Bb": _glFrontFace,
 "Oa": _glGenTextures,
 "Y": _glGetError,
 "Gc": _glGetFloatv,
 "da": _glGetIntegerv,
 "ua": _glGetString,
 "Fc": _glIsEnabled,
 "Ec": _glLightModelfv,
 "Ga": _glLightfv,
 "Dc": _glLineWidth,
 "Na": _glLoadIdentity,
 "ta": _glLoadMatrixf,
 "Fa": _glMaterialfv,
 "ba": _glMatrixMode,
 "Cc": _glMultMatrixf,
 "sa": _glNormalPointer,
 "ab": _glPixelStorei,
 "Ab": _glPointSize,
 "$a": _glPolygonMode,
 "zb": _glPolygonOffset,
 "yb": _glPopMatrix,
 "xb": _glPushMatrix,
 "wb": _glReadBuffer,
 "Bc": _glReadPixels,
 "vb": _glScissor,
 "Ac": _glShadeModel,
 "ub": _glStencilFunc,
 "zc": _glStencilMask,
 "Ea": _glStencilOp,
 "P": _glTexCoord2f,
 "I": _glTexCoordPointer,
 "_a": _glTexEnvf,
 "s": _glTexEnvi,
 "ra": _glTexGeni,
 "qa": _glTexImage2D,
 "Da": _glTexParameterf,
 "O": _glTexParameteri,
 "yc": _glTexSubImage2D,
 "xc": _glTranslatef,
 "H": _glVertex2f,
 "wc": _glVertex2i,
 "ka": _glVertex3f,
 "W": _glVertexPointer,
 "Ca": _glViewport,
 "vc": invoke_dii,
 "tb": invoke_diii,
 "E": invoke_fi,
 "sb": invoke_fif,
 "uc": invoke_fiff,
 "rb": invoke_fii,
 "Ba": invoke_fiii,
 "tc": invoke_fiiifii,
 "sc": invoke_fiiiiiff,
 "Za": invoke_fiiiiiiiiii,
 "rc": invoke_fiiiiiiiiiii,
 "q": invoke_i,
 "d": invoke_ii,
 "qb": invoke_iid,
 "Aa": invoke_iif,
 "za": invoke_iiff,
 "pb": invoke_iiffi,
 "ob": invoke_iifi,
 "nb": invoke_iifiii,
 "e": invoke_iii,
 "qc": invoke_iiidd,
 "pc": invoke_iiif,
 "Ma": invoke_iiiff,
 "oc": invoke_iiifff,
 "mb": invoke_iiiffi,
 "ja": invoke_iiifi,
 "f": invoke_iiii,
 "nc": invoke_iiiif,
 "Ya": invoke_iiiifff,
 "lb": invoke_iiiifi,
 "r": invoke_iiiii,
 "mc": invoke_iiiiid,
 "lc": invoke_iiiiiff,
 "kc": invoke_iiiiifffi,
 "ya": invoke_iiiiifi,
 "k": invoke_iiiiii,
 "La": invoke_iiiiiiff,
 "y": invoke_iiiiiii,
 "kb": invoke_iiiiiiif,
 "L": invoke_iiiiiiii,
 "X": invoke_iiiiiiiii,
 "Xa": invoke_iiiiiiiiii,
 "V": invoke_iiiiiiiiiiii,
 "jc": invoke_iiiiiiiiiiiiiiiiii,
 "ac": invoke_iiiiij,
 "$b": invoke_iij,
 "_b": invoke_jiiii,
 "m": invoke_v,
 "j": invoke_vi,
 "jb": invoke_vidd,
 "F": invoke_vif,
 "ib": invoke_viff,
 "hb": invoke_vifffif,
 "pa": invoke_vifiiffiii,
 "gb": invoke_vifiii,
 "c": invoke_vii,
 "oa": invoke_viif,
 "ic": invoke_viiff,
 "fb": invoke_viiffi,
 "hc": invoke_viifi,
 "gc": invoke_viifii,
 "i": invoke_viii,
 "Wa": invoke_viiif,
 "Va": invoke_viiifffii,
 "J": invoke_viiifiii,
 "n": invoke_viiii,
 "eb": invoke_viiiiffi,
 "Ua": invoke_viiiifii,
 "t": invoke_viiiii,
 "fc": invoke_viiiiif,
 "ec": invoke_viiiiiffi,
 "l": invoke_viiiiii,
 "u": invoke_viiiiiii,
 "dc": invoke_viiiiiiif,
 "K": invoke_viiiiiiii,
 "cc": invoke_viiiiiiiii,
 "ia": invoke_viiiiiiiiii,
 "Ka": invoke_viiiiiiiiiiiiiii,
 "D": _llvm_eh_typeid_for,
 "o": _setTempRet0,
 "Zb": _strftime,
 "Yb": _strftime_l,
 "xa": _time
};

var asm = createWasm();

var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
 return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["Ak"]).apply(null, arguments);
};

var _memcpy = Module["_memcpy"] = function() {
 return (_memcpy = Module["_memcpy"] = Module["asm"]["Bk"]).apply(null, arguments);
};

var _malloc = Module["_malloc"] = function() {
 return (_malloc = Module["_malloc"] = Module["asm"]["Dk"]).apply(null, arguments);
};

var _free = Module["_free"] = function() {
 return (_free = Module["_free"] = Module["asm"]["Ek"]).apply(null, arguments);
};

var _stkSaveConfig = Module["_stkSaveConfig"] = function() {
 return (_stkSaveConfig = Module["_stkSaveConfig"] = Module["asm"]["Fk"]).apply(null, arguments);
};

var _main = Module["_main"] = function() {
 return (_main = Module["_main"] = Module["asm"]["Gk"]).apply(null, arguments);
};

var _htons = Module["_htons"] = function() {
 return (_htons = Module["_htons"] = Module["asm"]["Hk"]).apply(null, arguments);
};

var _ntohs = Module["_ntohs"] = function() {
 return (_ntohs = Module["_ntohs"] = Module["asm"]["Ik"]).apply(null, arguments);
};

var ___errno_location = Module["___errno_location"] = function() {
 return (___errno_location = Module["___errno_location"] = Module["asm"]["Jk"]).apply(null, arguments);
};

var _setThrew = Module["_setThrew"] = function() {
 return (_setThrew = Module["_setThrew"] = Module["asm"]["Kk"]).apply(null, arguments);
};

var stackSave = Module["stackSave"] = function() {
 return (stackSave = Module["stackSave"] = Module["asm"]["Lk"]).apply(null, arguments);
};

var stackRestore = Module["stackRestore"] = function() {
 return (stackRestore = Module["stackRestore"] = Module["asm"]["Mk"]).apply(null, arguments);
};

var stackAlloc = Module["stackAlloc"] = function() {
 return (stackAlloc = Module["stackAlloc"] = Module["asm"]["Nk"]).apply(null, arguments);
};

var ___cxa_can_catch = Module["___cxa_can_catch"] = function() {
 return (___cxa_can_catch = Module["___cxa_can_catch"] = Module["asm"]["Ok"]).apply(null, arguments);
};

var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = function() {
 return (___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = Module["asm"]["Pk"]).apply(null, arguments);
};

var dynCall_iij = Module["dynCall_iij"] = function() {
 return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["Qk"]).apply(null, arguments);
};

var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
 return (dynCall_iiiiij = Module["dynCall_iiiiij"] = Module["asm"]["Rk"]).apply(null, arguments);
};

var dynCall_jiiii = Module["dynCall_jiiii"] = function() {
 return (dynCall_jiiii = Module["dynCall_jiiii"] = Module["asm"]["Sk"]).apply(null, arguments);
};

function invoke_ii(index, a1) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iii(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vii(index, a1, a2) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vi(index, a1) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_v(index) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)();
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_i(index) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)();
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiifi(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifi(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vif(index, a1, a2) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiifffi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiifff(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiifi(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fi(index, a1) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iifiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiif(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iif(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiifiii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiifi(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiif(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viff(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fii(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiff(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifiiffiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fif(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiifffii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viif(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifiii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiff(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viifii(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiif(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiffi(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiif(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iid(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_dii(index, a1, a2) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiff(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiffi(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiffi(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vifffif(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiidd(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiff(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iifi(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiifii(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiifff(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiiff(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiif(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiif(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiffi(index, a1, a2, a3, a4, a5, a6, a7, a8) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiffi(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiiiiiff(index, a1, a2, a3, a4, a5, a6, a7) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiiifii(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_fiff(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_vidd(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3, a4, a5);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_diii(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return getWasmTableEntry(index)(a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_viiiiiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
 var sp = stackSave();
 try {
  getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iij(index, a1, a2, a3) {
 var sp = stackSave();
 try {
  return dynCall_iij(index, a1, a2, a3);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
 var sp = stackSave();
 try {
  return dynCall_iiiiij(index, a1, a2, a3, a4, a5, a6);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

function invoke_jiiii(index, a1, a2, a3, a4) {
 var sp = stackSave();
 try {
  return dynCall_jiiii(index, a1, a2, a3, a4);
 } catch (e) {
  stackRestore(sp);
  if (e !== e + 0) throw e;
  _setThrew(1, 0);
 }
}

Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createDevice"] = FS.createDevice;

Module["FS_unlink"] = FS.unlink;

Module["FS"] = FS;

Module["IDBFS"] = IDBFS;

var calledRun;

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function callMain(args) {
 var entryFunction = Module["_main"];
 args = args || [];
 var argc = args.length + 1;
 var argv = stackAlloc((argc + 1) * 4);
 HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
 for (var i = 1; i < argc; i++) {
  HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
 }
 HEAP32[(argv >> 2) + argc] = 0;
 try {
  var ret = entryFunction(argc, argv);
  exit(ret, true);
  return ret;
 } catch (e) {
  return handleException(e);
 } finally {
  calledMain = true;
 }
}

function run(args) {
 args = args || arguments_;
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (shouldRunNow) callMain(args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
}

Module["run"] = run;

function exit(status, implicit) {
 EXITSTATUS = status;
 if (keepRuntimeAlive()) {} else {
  exitRuntime();
 }
 procExit(status);
}

function procExit(code) {
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  if (Module["onExit"]) Module["onExit"](code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

var shouldRunNow = true;

if (Module["noInitialRun"]) shouldRunNow = false;

run();
