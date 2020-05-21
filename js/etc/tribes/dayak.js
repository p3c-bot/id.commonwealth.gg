function getTribesInfo(){
    alertify.confirm(
        ' Commonwealth Tribes ',
        `
        <h2>Pertanyaan</h2>
        <h4 style="">Q: Bagaimana cara kerja game ini?</h4>
                                <h4 style="text-align: left">
                                    <h2>Tujuan Tribe adalah untuk mengurangi risiko berinvestasi di Commonwealth. Investasikan sebagai Tribe!</h2>
                                    <ul>
                                        <li>Ketika suatu tribe dibuat, setiap pengguna menempatkan ETC ke dalam kontrak. ETC dapat dikembalikan kapan saja.</li>
                                        <li>Setelah suku penuh, semua ETC digunakan untuk membeli Poin di Commonwealth. dan Point akan di bagikan merata di antara para pemain. </li>
                                        <li>Setiap pengguna menerima Point mereka serta bonus 3%!</li>
                                    </ul>
                                </h4>
        <img id="loginLogo" src="img/tribes/dayak.png" class="ui image center-small" />
        `,
      
        function () {},
    
        function () {}).set({
        labels: {
            ok: 'Ok',
            cancel: 'Close'
        }
    });
}

$( "#infoDayak" ).click(function() {
    getTribesInfo()
    if (typeof gtag !== 'undefined'){gtag('event', 'tribes', {'event_label': 'Usage', 'event_category': 'dayak'});};
});

