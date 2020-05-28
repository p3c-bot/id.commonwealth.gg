if (typeof web3 == 'undefined') {displayError(`Please install Saturn Wallet.`)}
var tribeID = getURL(window.location.search.substring(1)).id;

var lobby = web3.eth.contract(contracts.lobby.abi).at(contracts.lobby.address);
var p3cContract = web3.eth.contract(contracts.p3c.abi).at(contracts.p3c.address);
var userAddress = web3.eth.accounts[0]

var tribeNumber;
var buyPrice, tribeReward = 0;
var activeTribe, activeTribeName,activeTribeAddress;
var activeTribeCost,activeTribeSize,activeTribeWaiting = 0;
$("#refundArea").hide();

p3cContract.buyPrice(function (e, r) {
    buyPrice = web3.fromWei(r).toNumber()
})

lobby.tribeNumber.call(function (err, result) {
    tribeNumber = result.toNumber()
    $("#tribeNumber").text(tribeNumber);
    $("#tribeNumberMobile").text(tribeNumber);
});

// load tribe from address in URL, if it has one.
if (tribeID){
    lobby.tribes.call(tribeID, function (err, result) {
        $("#infoTribeId").html(tribeID);
        if (result != "0x0000000000000000000000000000000000000000"){
            var activeTribeAddress = result
            activeTribe = web3.eth.contract(contracts.tribe.abi).at(String(result));
            getTribeDetails(activeTribe, activeTribeAddress)
        } else {
            expiredTribeAlert()
        }
    });
}

function getTribeDetails(tribe,tribeAddress) {
    tribe.size.call(function (err, result) {
        activeTribeSize = result.toNumber()
        if (activeTribeSize == 0){
            expiredTribeAlert()
            return
        }
        $("#infoTribeSize").html(activeTribeSize);

        tribe.waitingMembers.call(function (err, result) {
            activeTribeWaiting = result.toNumber()
            $("#infoTribeWaiting").html(activeTribeWaiting);
            percentage = (activeTribeWaiting / activeTribeSize) * 100
            sizeString = (activeTribeWaiting + " / " + activeTribeSize)
            tribeString = (activeTribeWaiting + " Menunggu / " + activeTribeSize + " Total")
            $('#infoTribeSize').text(sizeString)
            $('#tribeSize').progress({percent: percentage});
            $("#tribeLabel").text(tribeString);

            tribe.cost.call(function (err, result) {
                activeTribeCost = result.toNumber()
                var prettyNumber = web3.fromWei(parseFloat(activeTribeCost).toFixed(4))
                $("#infoTribeCost").html( prettyNumber + " ETC");
                $("#buttonTribeCost").html(" ("+ prettyNumber + " ETC)");
                tribeReward = Number(web3.fromWei(activeTribeCost / buyPrice)).toFixed(1)
                $("#infoTribeReward").html( tribeReward + " Point");
                
                var power = (web3.fromWei(activeTribeCost) * activeTribeWaiting * 20000) 
                loadLocation(tribeAddress, power)
            }); 
        });
    });

    tribe.name.call(function (err, result) {
        activeTribeName = web3.toAscii(result).trim();
        $("#infoTribeName").text(activeTribeName);
     });

     tribe.time.call(function (err, result) {
        var activeTribeTime = timeSince(result.toNumber() * 1000)
        $("#infoTribeAge").html(activeTribeTime);
     });

    tribe.amIWaiting.call(function (err, result) {
        if (result == true){
            $( "#refundArea" ).show();
            $( "#join").hide();
        }
    });

    
    new ClipboardJS('.button');
    $("#copyTribeButton").attr("data-clipboard-text", 'https://id.commonwealth.gg/tribe.html?id=' + tribeID + "#");
}

var amount;
function setMarketCap(){
    p3cContract.totalEthereumBalance.call(function (err, result) {
        if (!err) {
            amount = web3.fromWei(result).toFixed(0)
            $("#etcInContract").replaceWith(numberWithCommas(amount) + " ETC")
        }
    })
}

playerAddress = web3.eth.accounts[0]


$("#createTribe").click(function () {
    name = $("#tribeName").val()
    amountOfMembers = $("#amountOfMembers").val()
    entryCost = $("#entryCost").val()
    if (entryCost != 0 && amountOfMembers > 1 && name.length < 32){
        createTribe(name, amountOfMembers, entryCost)
    } else {
        alertify.error("Harap buat Tribe dengan lebih dari 1 Anggota.")
    }
})

$("#getTribe").click(function () {
    id = $("#tribeId").val()
    getTribe(id)
})

$("#refund").click(function () {
    refund(activeTribe);
})

$("#join").click(function () {
    buyIn(activeTribe, activeTribeCost);
})


$('#copyTribeLink').on('click', function (){
    alertify.success('<h3>Tautan Tribe Disalin</h3>', 2)
})

var address;
// CREATE GAME
function createTribe(tribeName, amountOfMembers, entryCost) {
    if (Number(tribeNumber) == null || Number((entryCost / buyPrice).toFixed(1) == null)){
        alertify.error('Error: Harap konfirmasi dompet Anda telah masuk dan terhubung ke ETC')
        return
    } 
    amount = web3.toWei(entryCost)
    
    data = { 
        tribe: Number(tribeNumber), 
        age: Math.floor(Date.now()/1000), 
        cost: Number(entryCost), 
        waiting: 1, 
        size: Number(amountOfMembers),
        name: tribeName,
        flag: "",
        creator: web3.eth.accounts[0],
        players: [web3.eth.accounts[0]],
        reward: Number((entryCost / buyPrice).toFixed(1))
    }

    lobby.createTribe.sendTransaction(
        web3.fromAscii(tribeName),
        amountOfMembers, 
        amount, 
        {
            from: userAddress,
            value: amount,
            gasPrice: web3.toWei(5, 'gwei')
        },
        function (error, result) { //get callback from function which is your transaction key
            if (!error) {
                $.ajax({
                    type: "POST",
                    url: "https://api.commonwealth.gg/tribes/create",
                    data: JSON.stringify(data),
                    dataType: "json",
                    crossDomain: true,
                    contentType: 'application/json; charset=utf-8'
                });
                console.log(JSON.stringify(data))

                newTribeLink = 'https://id.commonwealth.gg/tribe.html?id=' + tribeNumber + "#"
                $('#tribeAddress').innerHTML = 'Tribe Dibuat. ID adalah ' + result.toString()
                tribeCreatedAlert()
                setTimeout(function () {
                    window.location.href = newTribeLink; //will redirect to your blog page (an ex: blog.html)
                }, 30000); //will call the function after 30 secs.
            } else {
                console.log(error);
            }
        }
    )
    // window.location.replace('https://id.commonwealth.gg/nodefornode.html?tribe=' + (int(tribeID) + 1) + '?');
}

function buyIn(tribe,activeTribeCost) {
    tribe.BuyIn.sendTransaction(
        userAddress, 
        {
            from: userAddress,
            value: activeTribeCost,
            gasPrice: web3.toWei(1, 'gwei')
        },
        function (error, result) { //get callback from function which is your transaction key
            if (!error) {
                $.ajax({
                        type: "GET",
                        url: "https://api.commonwealth.gg/tribes/join/" + tribeID + "/" + userAddress,
                        crossDomain: true,
                });
                if(activeTribeSize - activeTribeWaiting == 1){
                    succesfulTribeAlert()
                } else {
                    joinTribeAlert()
                }
            } else {
                console.log(error);
            }
        }
    )
}

function refund(tribe){
    tribe.Refund.sendTransaction(
        {
            from: userAddress,
            gasPrice: web3.toWei(1, 'gwei')
        },
        function (error, result) {
            if (!error) {
                $.ajax({
                    type: "GET",
                    url: "https://api.commonwealth.gg/tribes/leave/" + tribeID + "/" + userAddress,
                    crossDomain: true,
                });
                alertify.success(" Mengumpulkan Pengembalian Dana, harap tunggu.")
            } else {
                console.log(error);
            }
            // $('#tribeAddress').innerHTML = 'Tribe Dibuat. ID adalah ' + result.toString()
        }
    )
}


function loadLocation(address,power){
    var myIcon = L.icon({ iconUrl: 'https://id.commonwealth.gg/img/tribes/moai.png', iconSize: [25,35] });
    checksum = web3.toChecksumAddress(address)
    $.getJSON("https://api.commonwealth.gg/tribes/coord/"+checksum+"/"+tribeID, function (data) {
        var mymap = L.map('map').setView(data, 5);
        var marker = L.marker(data, {
      icon: myIcon}).addTo(mymap);
        var circle = L.circle(data, {
            className: 'pulse',
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: power
        }).addTo(mymap);

        marker.bindPopup("<a href='https://medium.com/@masterhax/introducing-commonwealth-tribes-5d206890e6a6'><img src='https://miro.medium.com/max/2000/1*pLAJNsr_pUeSrHDtPBJLog.jpeg' alt='Tafelsilber' width='100%'  class='alignnone size-full wp-image-952' /></a><br><strong>Commonwealth Tribes</strong><br>A tribe is an immutable smart contract that you deposit ETC into at a set price, with a name, and a membership capacity. Once you put your ETC into the tribe, you can pull out at any time. Your tribal membership is tied to your wallet address. You can be a part of multiple tribes.<br><em><a href='https://medium.com/@masterhax/introducing-commonwealth-tribes-5d206890e6a6'>Read All Here</a></em>"); 

  

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW50c2Fua292IiwiYSI6ImNrYWQwOWQxYzF6NTAyem96OWd5d2V1N2wifQ.IheYsirwEr5e_Sr06guSRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiYW50c2Fua292IiwiYSI6ImNrYWQwOWQxYzF6NTAyem96OWd5d2V1N2wifQ.IheYsirwEr5e_Sr06guSRQ'
        }).addTo(mymap);
    })
}


$('#copyTribeButton').on('click', function (){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Copied'});};
    var tribe = document.getElementById("createTribe")
    alertify.success('<h3>Tautan Tribe disalin</h3>', 2)
})

function expiredTribeAlert(){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Expired'});};
    alertify.error("Tribe Kadaluarsa. Silakan pergi ke tribe yang tersedia.")
    alertify.alert("Tribe Kadaluarsa",
    `
    <h2 style="text-align:center;">
    Tribe sudah kadaluarsa silakan membuat atau pergi ke Tribe yang baru! Click OK dan kembali.
    </h2>
    <img id="loginLogo" src="img/tribes/group.png" class="ui image etc-logo center-larger" />
    `,
    function() {window.location.href = "/tribes.html"}
    )
}
function joinTribeAlert(){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Joined'});};
    alertify.success("Bergabung sekarang! Untuk Hadiah " + tribeReward + " Point")
    alertify.alert(
    "Bergabung",                        
    `
    <h2 style="text-align:center;">
    Berhasil! Anda sudah berada di Tribe Dan menunggu Tribe lain untuk bergabung.
    </h2>
    <img id="loginLogo" src="img/tribes/piggy.gif" class="ui image etc-logo center-larger" />
    `
    )
}


function succesfulTribeAlert(){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Filled'});};
    alertify.success("Hadiah Berhasil " + tribeReward + " Point")
    alertify.alert(
    "Hadiah Selesai",                        
    `
    <h2 style="text-align:center;">
    Berhasil! Klick OK dan kembali ke Dompet anda untuk melihat hadiah.
    </h2>
    <video class="ui image etc-logo center-larger" autoplay>
    <source src="img/tribes/chest.mp4" type="video/mp4">
    Browser anda tidak support dengan video.
    </video>`,
    function() {window.location.href = "/use.html"}
    )
}

function tribeCreatedAlert(){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Created', 'value': address});};
    
    newTribeLink = 'https://id.commonwealth.gg/tribe.html?id=' + tribeNumber + "#"
    const el = document.createElement('textarea');
    el.value = newTribeLink;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    alertify.success("Pembuatan Tribe - Menunggu proses dari Blockchain. Anda akan di alihkan segera")    
    alertify.alert("Tribe Dibuat",
    `
    <h2 style="text-align:center;">
    Tribe yang baru telah dibuat dan salin link! akan dialihkan dalam waktu 20 detik. 
    </h2>
    <img id="loginLogo" src="img/tribes/fire.gif" class="ui image etc-logo" />
    `,
    function() {window.location.href = newTribeLink;}
    )
}

$("#dayak").click(function() {
    $('.ui.modal')
    .modal('show')
    
});
