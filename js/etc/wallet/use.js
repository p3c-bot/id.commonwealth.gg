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
        displayError('<h3>Invalid Address</h3>')
    }
    if (amountToTransfer > parseInt(web3.fromWei(myCropTokens))){
        displayError('<h3>Token tidak sesuai.</h3>')
    } else {
        transferFromCrop(destination, amountToTransfer)
    }
})


$( "#transferAddress" ).on('input', function() {
    console.log( "Handler for .keypress() called." );
    destination = $("#transferAddress").val()
    if (web3.isAddress(destination) == true){
        cropAbi.at(destination).owner.call(function (err, owner) {
            if (owner != "0x"){
                alertify.success('<h3>Mengirim ke Crop</h3>')
            } else {
                alertify.warning('<h3>Periksa kembali Crop anda</h3>') 
            }
        });
    }
});

$('#infoButton')
    .popup({
        content: "Untuk menambah dividen Anda dengan imbalan bonus referensi Izinkan bot. Anda dapat menarik secara manual kapan saja, tetapi ini harus diaktifkan untuk menggunakannya. Untuk kontrol yang lebih besar, gunakan Pure Interface.",
        position: 'top center'
    });

$( "#transferOpen" ).click(function() {
    $('.ui.modal')
    .modal('show')
    
});



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

