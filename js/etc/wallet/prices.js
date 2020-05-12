var p3cContract = web3.eth.contract(contracts.p3c.abi).at(contracts.p3c.address);

drawChart(90);

function setMarketCap(idrPrice) {
  p3cContract.totalEthereumBalance.call(function (err, result) {
    if (!err) {
      amount = web3.fromWei(result).toFixed(0)
      $("#etcInContract").replaceWith(numberWithCommas(amount) + " ETC")
      $('#etcInContractUSDPrice').text('(IDR' + numberWithCommas(Number((amount * idrPrice).toFixed(0)))+ ')')

    }
  })
};
setMarketCap(0)

p3cContract.totalSupply.call(function (err, result) {
  if (!err) {
    $("#tokensInCirculation").replaceWith(numberWithCommas(web3.fromWei(result).toFixed(0)))
  }
});

var sellPrice;
function setSellPrice(idrPrice) {
  p3cContract.sellPrice(function (e, r) {
    sellPrice = web3.fromWei(r)
    $('#tokenSellGet').text(sellPrice.toFixed(3) + ' ETC')
    $('#tokenUSDSellPrice').text('IDR' + (sellPrice * idrPrice).toFixed(2))
  })
}
setSellPrice(0)

var buyPrice;
function setBuyPrice(idrPrice) {
  p3cContract.buyPrice(function (e, r) {
    buyPrice = web3.fromWei(r)
    // alert((buyPrice * idrPrice).toFixed(2))
    $('#tokenBuyGet').text(buyPrice.toFixed(3) + ' ETC')
    $('#tokenUSDBuyPrice').text('IDR' + (buyPrice * idrPrice).toFixed(2))
  })
}
setBuyPrice(0)


var myUSDValue = 0
function setTokensPrice(idrPrice){
  value =  Number(myETCValue) * idrPrice
  $('#myTokensValue').text('IDR' + numberWithCommas(value.toFixed(2)))
  myUSDValue = Number(value.toFixed(2))
}

var myDividendUSDValue = 0
function setDividendsPrice(idrPrice){
  value =  Number($('#myCropDividends').text()) * idrPrice
  $('#myDividendsValue').text('IDR' + value.toFixed(5))
  myDividendUSDValue = value.toFixed(5)
}

function updateEtcPrice() {
  $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=ETC&tsyms=IDR', function (result) {
    if (result !== null){
      var idr = result.IDR
      idrPrice = parseFloat(idr)
      setBuyPrice(idrPrice)
      setSellPrice(idrPrice)
      setMarketCap(idrPrice)

      setTokensPrice(idrPrice)
      setDividendsPrice(idrPrice)
      
    }
  })
}

// get the etc price after 1.5s, and then every 10s
setTimeout(function(){
  updateEtcPrice()
}, 1400);
setInterval(function(){
  updateEtcPrice()
}, 8000);

$('#buyInput').on('input change', function () {
  var value = parseFloat($(this).val())
  if (value > 0) {
    buyAmount = numberWithCommas((value / buyPrice).toFixed(1))
    $('#buyAmount').text("Approx. " + buyAmount + " Point")
  } else {
    $('#buyAmount').hide()
  }
})

$('#sellInput').on('input change', function () {
  var value = parseFloat($(this).val())
  if (value > 0) {
    sellAmountUSD = numberWithCommas((value * sellPrice * idrPrice).toFixed(2))
    sellAmount = numberWithCommas((value * sellPrice).toFixed(2))
    $('#sellAmount').text("IDR" + sellAmountUSD + "/" + sellAmount + " ETC")
  } else {
    $('#sellAmount').hide()
  }
})

$('#buyAmount').hide();
$('#sellAmount').hide();

$('#buyInput').on('keyup change', function () {
  if (this.value.length > 0) {
    $('#buyAmount').show();
  }
});

$('#sellInput').on('keyup change', function () {
  if (this.value.length > 0) {
    $('#sellAmount').show();
  }
});
