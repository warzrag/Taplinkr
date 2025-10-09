// Script de redirection ultra-rapide - S'exécute AVANT React
(function(){
  var ua = navigator.userAgent || '';
  var isInApp = ua.indexOf('Instagram') > -1 || ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1 || ua.indexOf('TikTok') > -1;

  if (!isInApp) return;

  var isIOS = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /Android/.test(ua);
  var url = window.location.href;

  // Redirection immédiate
  if (isIOS) {
    window.location.href = 'x-safari-https://' + url.replace(/^https?:\/\//, '');
  } else if (isAndroid) {
    var host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    window.location.href = 'intent://' + host + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
  }
})();
