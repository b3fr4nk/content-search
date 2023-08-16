if (document.querySelector('#upload')) {
  document.querySelector('#upload').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = document.getElementById('upload');
    const doc = new FormData(form);

    const fileType = document.getElementById('fileUp').value.split('.')[1];

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
    } else if (fileType === 'docx') {
      axios.post('upload/word', doc)
          .then(function(result) {
            window.location.replace('/docs/search');
          });
    } else if (fileType === 'pptx') {
      axios.post('/upload/ppt', doc)
          .then(function(result) {
            window.location.replace('/docs/search');
          });
    } else if (fileType === 'xlsx') {
      axios.post('/upload/excel', doc)
          .then(function(result) {
            window.location.replace('/docs/search');
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

if (document.querySelector('#urlUpload')) {
  document.querySelector('#urlUpload').addEventListener('submit', (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value;
    const form = document.getElementById('urlUpload');
    const doc = new FormData(form);

    if (url !== null) {
      const type = url.split('.')[1];

      if (type === 'youtube') {
        console.log(doc);
        axios.post('/upload/youtube', doc)
            .then(function(result) {
              window.location.replace('/docs/search');
            });
      }
    }
  });
}
