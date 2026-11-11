Module.preRun = Module.preRun || [];
Module.preRun.push(function() {
  var mountPath = "/home/web_user";
  var fs = FS;
  var syncing = false;
  var syncAgain = false;

  fs.mkdirTree(mountPath);
  fs.mount(IDBFS, {}, mountPath);

  function sync(saveConfig) {
    if (saveConfig && typeof Module._stkSaveConfig === "function")
      Module._stkSaveConfig();

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
      Module.setStatus("IndexedDB error: " + error.message +
        ". Startup is blocked because persistent saves are required.");
      return;
    }
    removeRunDependency(dependency);
  });

  window.setInterval(function() { sync(true); }, 15000);
  window.addEventListener("pagehide", function() { sync(true); });
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden")
      sync(true);
  });
});
