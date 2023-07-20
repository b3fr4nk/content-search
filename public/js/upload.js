if (document.querySelector('#upload')) {
  document.querySelector('#upload').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = document.getElementById('upload');
    const doc = new FormData(form);

    const fileType = document.getElementById('fileUp').value.split('.')[1];

    console.log(fileType);

    if (fileType === 'txt') {
      axios.post('/upload/text', doc)
          .then(function(response) {
            window.location.replace(`/docs/search`);
          });
    } else if ( fileType === 'pdf' ) {
      axios.post('upload/pdf', doc)
          .then(function(result) {
            window.location.replace(`/docs/search`);
          });
    } else {
      const alert = document.getElementById('alert');
      alert.classList.add('alert-warning');
      // eslint-disable-next-line max-len
      alert.textContent = 'Oops, looks like you tried to upload an unsupported file type';
      alert.style.display = 'block';
      setTimeout(() => {
        alert.style.display = 'none';
        alert.classList.remove('alert-warning');
      }, 3000);
    }
  });
}