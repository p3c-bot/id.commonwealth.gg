$('#statsContainer').hide();
setStats()
function setStats() {
    $.getJSON("https://api.commonwealth.gg/chart/info", function (data) {
		if (data !== null){
			// (New Number - Original Number) ÷ Original Number × 100.
			$('#statsContainer').show();
			P3CSupply = numberWithCommas(Number(data.P3CSupply).toFixed(0))
			SupplyPercentage = (data.P3CSupply / 204939005.8).toFixed(4) * 100 + "%"

			$("#tokenSupply").replaceWith(P3CSupply)
			$("#tokenSupplyPercentage").replaceWith(SupplyPercentage)

			Dividends = numberWithCommas(Number(data.TotalDividends).toFixed(2)) + " ETC"
			DividendsUSD = "$" + numberWithCommas(data.TotalDividendsUSD.toFixed(0))
			// SupplyPercentage = (data.P3CSupply / 204939005.8).toFixed(4) * 100 + "%"

			$("#totalDividends").replaceWith(Dividends)
			$("#dividendsUSD").replaceWith(DividendsUSD)

			PriceETC = data.PriceETC.toFixed(4) + " ETC"
			PriceUSD = "$" + data.PriceUSD.toFixed(4)

			$("#priceETC").replaceWith(PriceETC)
			$("#priceUSD").replaceWith(PriceUSD)

			SizeETC = numberWithCommas(data.SizeETC.toFixed(0)) + " ETC"
			SizeUSD = "$" + numberWithCommas(data.SizeUSD.toFixed(0))

			$("#sizeETC").replaceWith(SizeETC)
			$("#sizeUSD").replaceWith(SizeUSD)
			$("#etcPriceUSD").replaceWith(data.ETCPriceUSD.toFixed(2))

			// $('#createdStats').popup({
			// 	html: 'Token P3C bisa <b>Hanya</b> dibuat dengan mengirimkan Ethereum Classic (ETC) ke kontrak. Tidak ada otoritas pusat yang dapat mengembang P3C. Hard cap mengasumsikan setiap ETC yang memungkinkan (210.000.000) dalam kontrak.',
			// 	position: 'bottom center'
			// });
			// $('#priceStats').popup({
			// 	html: 'Harga saat ini dari token P3C baru. Semua token dalam denominasi ETC dan dimasukkan ke dalam dana yang terkunci.',
			// 	position: 'bottom center'
			// });
			// $('#sizeStats').popup({
			// 	html: 'P3C menggunakan peer-review <b>kurva ikatan</b> algoritma untuk mendistribusikan dana secara cerdas. Dana ini hanya dapat diakses oleh peserta P3C.',
			// 	position: 'bottom center'
			// });
			if (typeof gtag !== 'undefined'){gtag('event', 'Home', {'event_label': 'Usage', 'event_category': 'LoadStats'});};
		}
	});
}

$('#whitepaper').click(function() {
	if (typeof gtag !== 'undefined'){gtag('event', 'Home', {'event_label': 'Usage', 'event_category': 'Whitepaper'});};
});

function getURL(query) {
	var vars = query.split("&");
	var query_string = {};
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}


var masternode = getURL(window.location.search.substring(1)).ref;
if (masternode){
	 localStorage.setItem("ref", masternode)
}
