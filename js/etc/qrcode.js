$("#qrImage").replaceWith('<img src="https://chart.googleapis.com/chart?chs=180x180&amp;cht=qr&amp;chl=' + myCropAddress + '&amp;choe=UTF-8" />');


function openQRCode(node) {
var reader = new FileReader();
reader.onload = function() {
node.value = "";
qrcode.callback = function(res) {
if(res instanceof Error) {
alert("No Crop QrCode found.");
} else {
node.parentNode.previousElementSibling.value = res;
}
};
qrcode.decode(reader.result);
};
reader.readAsDataURL(node.files[0]);
}
