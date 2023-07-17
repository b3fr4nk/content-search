const fs = require('fs');

module.exports = (doc) => {
  const sentences = 3;
  const overlap = 1;
  try {
    let str = fs.readFileSync(doc, 'utf8');
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
  } catch (err) {
    console.log(err);
  };
};
