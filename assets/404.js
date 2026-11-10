try {
  var l = localStorage.getItem('lang') || ((navigator.language || 'vi').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'en');
  if (l === 'en') {
    document.documentElement.lang = 'en';
    document.getElementById('t').textContent = 'Page not found';
    document.getElementById('d').textContent = 'The link may have changed or never existed.';
    document.getElementById('h').textContent = 'Back home';
  }
} catch (e) {}
