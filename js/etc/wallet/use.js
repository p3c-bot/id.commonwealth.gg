// $('#sponsor').load("https://api.commonwealth.gg/sponsor/");

// if saturn isn't installed 
if (typeof web3 == 'undefined') {
    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Issue', 'event_category': 'NoWeb3'});};
    displayError(
        `
        <div class="custom-computer only">Untuk Menggunakan, Instal sebuah <a target="_blank" style="color: white; text-decoration: underline;" href="https://www.youtube.com/watch?v=TUD-w5P_uAA&feature=youtu.be">Dompet ETC</a></div>
        <div class="mobile only">Untuk Menggunakan, Instal sebuah <a target="_blank" style="color: white; text-decoration: underline;" href="https://www.youtube.com/watch?v=xCyrjiF6f3E&feature=youtu.be">Dompet ETC</a></div>
        `
    )
}

getNetworkId(web3).then(function (res) {
    if (res !== "61") {
        if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Issue', 'event_category': 'EthereumWeb3'});};        
        displayError(
            `
            <div class="custom-computer only">Untuk Menggunakan, Instal sebuah <a target="_blank" style="color: white; text-decoration: underline;" href="https://www.youtube.com/watch?v=TUD-w5P_uAA&feature=youtu.be">Dompet ETC</a></div>
            <div class="mobile only">Untuk Menggunakan, Instal sebuah <a target="_blank" style="color: white; text-decoration: underline;" href="https://www.youtube.com/watch?v=xCyrjiF6f3E&feature=youtu.be">Dompet ETC</a></div>
            `
        )
    } else {
        // get the crop information initially and then every 2 seconds
        getCropInfo(true)
        setInterval(function () {
            getCropInfo(false)
        }, 2000);
    }
})

masternode = localStorage.getItem("ref")
if (masternode == null) {
    masternode = "0x0000000000000000000000000000000000000000";
}

$("#buy").click(function () {
    amountToBuy = $("#buyInput").val()
    buyFromCrop(amountToBuy, masternode)
})

if ((/Mobi|Android/i.test(navigator.userAgent)) == false) {
    $( "#buy" ).hover(function() {
        $( this ).transition({
            animation: 'pulse',
            duration: '.5s',
        });
      });    
}

$("#sell").click(function () {
    amountToSell = $("#sellInput").val()
    sellFromCrop(amountToSell)
})

$("#reinvest").click(function () {
    reinvestFromCrop(masternode)
})

$("#withdraw").click(function () {
    withdrawFromCrop()
})

$("#transfer").click(function () {
    destination = $("#transferAddress").val()
    amountToTransfer = $("#transferTokenCount").val()
    if (web3.isAddress(destination) != true){
        displayError('Invalid Address')
    }
    if (amountToTransfer > parseInt(web3.fromWei(myCropTokens))){
        displayError('Token tidak sesuai.')
    } else {
        transferFromCrop(destination, amountToTransfer)
    }
})

$('#infoButton')
    .popup({
        content: "Untuk menambah dividen Anda dengan imbalan bonus referensi Izinkan bot. Anda dapat menarik secara manual kapan saja, tetapi ini harus diaktifkan untuk menggunakannya. Untuk kontrol yang lebih besar, gunakan Pure Interface.",
        position: 'top center'
    });

$('#portfolioButton').hide();

$( "#refillButton" ).click(function() {
    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'RefillLinkClick'});};
});

$( "#buyWithCoinbase" ).click(function() {
    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'BuyWithCoinbase'});};
});

function setPortfolio(cropAddress) {
    $.getJSON("https://api.commonwealth.gg/price/crop/" + web3.toChecksumAddress(cropAddress), function (data) {
        if (data !== null){
            // (New Number - Original Number) ÷ Original Number × 100.
            $('#portfolioButton').show();
            performance = `
            Kinerja akun saya (in USD):
            <br>
            <b>Perubahan dalam 1 Hari</b>: {usd1}
            <br>
            <b>Perubahan dalam 7 Hari</b>: {usd7}
            <br>
            <b>Perubahan dalam 30 Hari</b>: {usd30}
            <br>
            <span class="ui text small eleven converted">Pertumbuhan masa lalu bukan jaminan hasil di masa depan. </span>
            `
            $.each(data, function (key, val) {
                if (key.includes('usd')) {
                    change = (((myUSDValue - val) / val) * 100).toFixed(0)
                } else {
                    change = (((myETCValue - val) / val) * 100).toFixed(1)
                    change = String(change).replace('0.', '.')
                }
                color = (change >= 0) ? "green" : "red"
                // TODO does this make sense?
                // if (key == "usd1"){
                //     $("#myDayChange").html("<span class='text small eleven'>  " + change + "%</span>")
                //     $("#myDayChange").css("color", color)
                // }
                performance = performance.replace('{' + key + '}', '<span class="' + color + '">' + change + '%</span>')
                if (color == "red" && key == 'usd7' && Math.abs(Number(change)) != 100){
                    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'BalanceDown','value': Number(change)});};
                    alertify.error('<h3>Saldo: <u>' + change + '</u>% Turun dalam 7 Hari terakhir.</h3>',5)
                }

                if (color == "green" && key == 'usd7' && Number(change) != 100){
                    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'BalanceUp','value': Number(change)});};
                    alertify.success('<h3>Saldo: <u>' + change + '</u>% Naik dalam 7 Hari terakhir.</h3>',7)
                }
            });
            $('#portfolioButton').popup({
                html: performance,
                position: 'right center'
            });
        }
    });
}

function copyAddress() {
    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'CopyAddress'});};

    var copyText = document.getElementById("myCropAddress");
    copyText.select();
    document.execCommand("copy");
}

new ClipboardJS('.button');
$('.ui.primary.basic.button.copy').on('click', function (){
  alertify.success('<h3>Disalin.</h3>', 2)
})

$('#copyMNButton').on('click', function (){
    var address = document.getElementById("myCropAddress")
    if (typeof gtag !== 'undefined'){gtag('event', 'Wallet', {'event_label': 'Usage', 'event_category': 'GenerateReferral', 'value': address});};
    alertify.success('<h3>Link Referal di salin</h3>', 2)
})

$(".home").click(function(){
    window.location.href = "/";
});


