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
            loadLocation(activeTribeAddress)
            activeTribe = web3.eth.contract(contracts.tribe.abi).at(String(result));
            getTribeDetails(activeTribe)
        } else {
            expiredTribeAlert()
        }
    });
}

function getTribeDetails(tribe) {
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
        });
    });

    tribe.cost.call(function (err, result) {
        activeTribeCost = result.toNumber()
        var prettyNumber = web3.fromWei(parseFloat(activeTribeCost).toFixed(4))
        $("#infoTribeCost").html( prettyNumber + " ETC");
        $("#buttonTribeCost").html(" ("+ prettyNumber + " ETC)");
        tribeReward = Number(web3.fromWei(activeTribeCost / buyPrice)).toFixed(1)
        $("#infoTribeReward").html( tribeReward + " P3C");
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
        alertify.error("Silakan membuat Tribe lebih dari 1 Member.")
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
    alertify.success('<h3>Tautan Tribe disalin </h3>', 2)
})

var address;
// CREATE GAME
function createTribe(tribeName, amountOfMembers, entryCost) {
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
                $('#tribeAddress').innerHTML = 'Tribe Created. ID is ' + result.toString()
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
                if(activeTribeSize - activeTribeWaiting == 1){
                    $.ajax({
                        type: "GET",
                        url: "https://api.commonwealth.gg/tribes/finished/" + tribeID,
                        crossDomain: true,
                    });
                    succesfulTribeAlert()
                } else {
                    $.ajax({
                        type: "GET",
                        url: "https://api.commonwealth.gg/tribes/join/" + tribeID + "/" + userAddress,
                        crossDomain: true,
                    });
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
                alertify.success(" Collecting Refund, please wait.")
            } else {
                console.log(error);
            }
            // $('#tribeAddress').innerHTML = 'Tribe Created. ID is ' + result.toString()
        }
    )
}

function loadLocation(address){
    checksum = web3.toChecksumAddress(address)
    $.getJSON("https://api.commonwealth.gg/planet/coord/"+checksum, function (data) {
        coord = data;
        url = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBjN9bBBMOM3j33HZYkueaV7akl8IMciE0&q=" + coord + "&center=" + coord + "&zoom=4&maptype=roadmap"
        // alert('WTF')
        $("#map").attr("src",url); 
    })
}

$('#copyTribeButton').on('click', function (){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Copied'});};
    var tribe = document.getElementById("createTribe")
    alertify.success('<h3>Link Tribe Disalin</h3>', 2)
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
    alertify.success("Bergabung sekarang! Untuk Hadiah " + tribeReward + " P3C")
    alertify.alert(
    "Bergabung",                        
    `
    <h2 style="text-align:center;">
    Berhasil! Anda di Tribe Dan menunggu Tribe lain untuk bergabung.
    </h2>
    <img id="loginLogo" src="img/tribes/piggy.gif" class="ui image etc-logo center-larger" />
    `
    )
}


function succesfulTribeAlert(){
    if (typeof gtag !== 'undefined'){gtag('event', 'Tribes', {'event_label': 'Usage', 'event_category': 'Filled'});};
    alertify.success("Berhasil! Hadiah " + tribeReward + " P3C")
    alertify.alert(
    "Hadiah Selesai",                        
    `
    <h2 style="text-align:center;">
    Berhasil! Klick OK dan kembali ke Dompet anda untuk melihat hadiah.
    </h2>
    <video class="ui image etc-logo center-larger" autoplay>
    <source src="img/tribes/chest.mp4" type="video/mp4">
    Browse anda tidak support dengan video.
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
    alertify.alert("Tribe Created",
    `
    <h2 style="text-align:center;">
    Tribe yang baru telah dibuat dan salin link! akan dialihkan dalam waktu 20 detik. 
    </h2>
    <img id="loginLogo" src="img/tribes/fire.gif" class="ui image etc-logo" />
    `,
    function() {window.location.href = newTribeLink;}
    )
}
