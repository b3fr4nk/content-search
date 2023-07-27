/* eslint-disable max-len */
const splitText = (str) => {
  const sentences = 3;
  const overlap = 1;

  str = str.replace(/(\r\n|\n|\r)/gm, ' ');
  str = str.replace(/([.?!])\s*/g, '$1|').split('|');

  console.log('string: ' + str);

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

const wordReader = async (path) => {
  const pizZip = require('pizzip');
  const Docxtemplater = require('docxtemplater');
  const fs = require('fs');

  // Load the .docx file content
  const content = fs.readFileSync(path, 'binary');

  const zip = pizZip(content);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
  doc.render({
    first_name: 'John',
    last_name: 'Doe',
    phone: '0652455478',
    description: 'New Website',
  });

  const text = doc.getFullText().replace(/\//g, ' ').replace(/\//g, '');

  return splitText(text);
};

const pptReader = async (doc) => {
  const officeParser = require('officeparser');
  return officeParser.parseOfficeAsync(doc)
      .then((data) => {
        return splitText(data);
      });
};

const excelReader = async (doc) => {
  const readXlsxFile = require('read-excel-file/node');

  console.log(doc);

  const data = await readXlsxFile(doc).then((rows) => {
    let text = '';
    rows.forEach((row) => {
      row.forEach((cell) => {
        text += ' ' + cell;
      });
      text += '.';
    });
    return (splitText(text));
  });

  console.log(data);

  return data;
};
module.exports = {text, pdfReader, wordReader, pptReader, excelReader};
