function save_options() {
  // Read settings from Options pop-up box:
  var enableMining = document.getElementById('enable-mining').checked;
  var miningAddress = document.getElementById('mining-address').value;
  var miningPool = document.getElementById('mining-pool').selectedIndex;
  var enableReddit = document.getElementById('enable-reddit').checked;
  var enableMarkets = document.getElementById('enable-markets').checked;
  
  // Save options in Chrome storage:
  chrome.storage.sync.set({
    enableMining: enableMining,
    miningAddress: miningAddress,
    miningPool: miningPool,
    enableReddit: enableReddit,
    enableMarkets: enableMarkets
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

function restore_options() {
  // Get saved options from Chrome storage:
  chrome.storage.sync.get({
    enableMining: false,
    miningAddress: '',
    miningPool: 0,
    enableReddit: true,
    enableMarkets: true
  }, function(items) {
    console.log(items);
    document.getElementById('enable-mining').checked = items.enableMining;
    document.getElementById('mining-address').value = items.miningAddress;
    document.getElementById('mining-pool').selectedIndex = items.miningPool;
    document.getElementById('enable-reddit').checked = items.enableReddit;
    document.getElementById('enable-markets').checked = items.enableMarkets;
  });
}

function clear_storage() {
  // Clear all saved options in Chrome storage:
  chrome.storage.sync.clear( function() {
    var status = document.getElementById('status')
    document.getElementById('enable-mining').checked = false;
    document.getElementById('mining-address').value = '';
    status.textContent = 'Options cleared';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_storage);