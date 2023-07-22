/* eslint-disable max-len */
const splitText = (str) => {
  const sentences = 3;
  const overlap = 1;

  str = str.replace(/(\r\n|\n|\r)/gm, ' ');
  str = str.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');

  // splits string into number of sentences with number of overlap sentences
  const data = [];
  for (let i = sentences; i < str.length; i+=sentences) {
    let entry = '';
    // only does an overlap after the first set of sentences
    if (i === sentences) {
      for (let j = sentences; j > 0; j--) {
        entry = entry + str[i - j];
      }
    } else {
      for (let j = sentences + overlap; j > 0; j--) {
        entry = entry + str[i - j];
      }
    }
    data.push(entry);
  }


  return data;
};

const text = (doc) => {
  const fs = require('fs');

  try {
    const str = fs.readFileSync(doc, 'utf8');
    data = splitText(str);

    return data;
  } catch (err) {
    console.log(err);
  };
};

const extractText = (pdfUrl) => {
  const pdfjsLib = require('pdfjs-dist');
  const pdf = pdfjsLib.getDocument(pdfUrl);
  return pdf.promise.then(function(pdf) {
    const totalPageCount = pdf.numPages;
    const countPromises = [];
    for (
      let currentPage = 1;
      currentPage <= totalPageCount;
      currentPage++
    ) {
      const page = pdf.getPage(currentPage);
      countPromises.push(
          page.then(function(page) {
            const textContent = page.getTextContent();
            return textContent.then(function(text) {
              return text.items
                  .map(function(s) {
                    return s.str;
                  })
                  .join('');
            });
          }),
      );
    }

    return Promise.all(countPromises).then(function(texts) {
      return texts.join('');
    });
  });
};

const pdfReader = (doc) => {
  return extractText(doc).then(function(text) {
    return splitText(text);
  }, function(error) {
    console.log(error);
  });
};

module.exports = {text, pdfReader};
