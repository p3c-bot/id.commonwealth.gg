// FOR ALL PURCHASED TO GO THROUGH SINGLE MASTERNODE - REPLACE THIS

var siteMasternode = "0x96D0248a38922014AFbf36b6fBe4D77f796CEab8"

///////////// and comment this out otherwise leave it

var masternode = getURL(window.location.search.substring(1)).ref;

///////////////////////////////////////////////////

if (masternode){
  localStorage.setItem("ref", masternode)
  } else {
  localStorage.setItem("ref", siteMasternode)
}

if (localStorage.getItem('ref')){
  if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'UsingRefAddress', 'value': localStorage.getItem('ref')});};
}

