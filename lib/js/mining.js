var xhrAddressPoll;
var addressTimeout;

function updateMiningStats() {
  var poolApi = '';
  var address = '';
  var mining = false;
  
  // Load mining settings from Chrome Storage, and then load mining stats:
  chrome.storage.sync.get({
    enableMining: false,
    miningAddress: '',
    miningPool: ''
  }, function(items) {
    mining = items.enableMining;
    address = items.miningAddress;
    if (items.miningPool == 0) {
      poolApi = 'http://stats.monero.net:8117';
    } else if (items.miningPool == 1) {
      poolApi = 'http://monero.crypto-pool.fr:8090';
    } else if (items.miningPool == 2) {
      poolApi = 'https://monerohash.com/api';
    } else if (items.miningPool == 3) {
      poolApi = 'https://api.moneropool.com';
    } else if (items.miningPool == 4) {
      poolApi = 'http://62.210.84.160:8117'; // hashinvest.net
    } else if (items.miningPool == 5) {
      poolApi = 'http://46.165.232.77:8117'; // cryptmonero.com
    }
    console.log(poolApi);
  
    if (mining == true && items.miningPool > 0) {
      if (xhrAddressPoll) xhrAddressPoll.abort();
      if (addressTimeout) clearTimeout(addressTimeout);
      
      function fetchAddressStats(longpoll){
        xhrAddressPoll = $.ajax({
          url: poolApi + '/stats_address',
          data: {
            address: address,
            longpoll: longpoll
          },
          dataType: 'json',
          cache: 'false',
          success: function(data){
            console.log(data);
            if (data.stats) {
              var addr_balance = coinsFromAtomic(data.stats.balance);
		      var addr_hashes = data.stats.hashes;
		      var addr_lastshare = data.stats.lastShare;
	  	      var addr_paid = coinsFromAtomic(data.stats.paid);
	  	      
	  	      if (data.payments) {
  				var t_current = new Date().getTime() / 1000;
	  	        var payment;
	  	        var paymentParts;
	  	        var t_payment;
	  	        var t_since_payment;
	  	        document.getElementById("paymentstable").innerHTML = '<tr class="paymentline"><td class="paymenttime" id="payment-time">Date:</td><td class="paymentamount" id="payment-amount">Amount</td><td class="paymentmixin" id="payment-mixin">Mixin</td></tr>';
	  	        for (i = 0; i < (data.payments.length/2); i++) {
	  	          payment = data.payments[2*i];
	  	          paymentParts = payment.split(':');
	  	          t_payment = data.payments[2*i+1];
	  	          t_since_payment = t_current - t_payment;
	  	          if ((i < 5) && (t_since_payment <= 7*86400)){
	  	            var link = 'http://chainradar.com/xmr/transaction/' + paymentParts[0];
	  	            var addRow = '<tr class="paymentline" id="payment-line-' +  i + '"><td class="paymenttime" id="payment-time-' +  i + '"><a target="_blank" class="marketlink" href="' + link + '">' + unixTimeToDate(t_payment) + '</a></td><td class="paymentamount" id="payment-amount-' +  i + '">' + coinsFromAtomic(paymentParts[1]).toFixed(12) + '</td><td class="paymentmixin" id="payment-mixin-' +  i + '">' + paymentParts[3] + '</td></tr>';
	  	            $('#paymentstable').append(addRow);
	  	          }
	  	        }
	  	      }
	  	      
	  	      if (data.stats.hashrate) {
		        var addr_hashrate = data.stats.hashrate;
	  	        if (addr_hashrate < 1000) {
	  	          document.getElementById('m-hashrate').textContent = addr_hashrate.toFixed(2) + ' H/sec';
  	  	        } else if (addr_hashrate < 3600) {
      	          var addr_khashrate = addr_hashrate / 1000;
	    	      document.getElementById('m-hashrate').textContent = addr_khashrate.toFixed(2) + ' kH/sec';
  	  	        } else {
      	          var addr_Mhashrate = addr_hashrate / 1000000;
	              document.getElementById('m-hashrate').textContent = addr_Mhashrate.toFixed(2) + ' MH/sec';
  	  	        }
  	  	      } else {
  	  	        document.getElementById('m-hashrate').textContent = '0 H/sec';
  	  	      }
	            
	          document.getElementById('m-address').textContent = address.substr(0,47) + ' ' + address.substr(48,95);
	          document.getElementById('m-balance').textContent = addr_balance.toFixed(12) + ' XMR';
	          document.getElementById('m-lastshare').textContent = unixTimeToDate(addr_lastshare);
	          document.getElementById('m-paid').textContent = addr_paid.toFixed(12) + ' XMR';
	          document.getElementById('m-hashes').textContent = numberWithCommas(addr_hashes);
              
              if (!data.stats){
                if (addressTimeout) clearTimeout(addressTimeout);
                addressTimeout = setTimeout(function(){
                  fetchAddressStats(false);
                }, 5000);
                return;
              }
              
              fetchAddressStats(true);
            } else {
              if (addressTimeout) clearTimeout(addressTimeout);
              addressTimeout = setTimeout(function(){
                fetchAddressStats(false);
              }, 5000);
              return;
            }
          },
          error: function(e){
	        document.getElementById('m-address').textContent = 'Unable to connect to pool. It may be offline.';
            document.getElementById('m-hashrate').textContent = '0 H/sec';
	        document.getElementById('m-balance').textContent = '0.00000000 XMR';
	        document.getElementById('m-lastshare').textContent = 'N/A';
	        document.getElementById('m-paid').textContent = '0.00000000 XMR';
	        document.getElementById('m-hashes').textContent = '0';
	          
            if (e.statusText === 'abort') return;
            if (addressTimeout) clearTimeout(addressTimeout);
            addressTimeout = setTimeout(function(){
              fetchAddressStats(false);
            }, 5000);
          }
        });
      }
    }
    fetchAddressStats(false);
  });
}