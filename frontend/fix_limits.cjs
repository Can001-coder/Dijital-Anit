const fs = require('fs');
const files = [
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/AddMemorialPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/DashboardPage.jsx'
];

for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove the flash warning from handleChange
    content = content.replace(/if\s*\(maxLength\s*&&\s*maxLength\s*>\s*0\s*&&\s*typeof\s*finalValue\s*===\s*'string'\)\s*\{\s*if\s*\(finalValue\.length\s*>=\s*maxLength\s*&&\s*\(form\[id\]\?\.length\s*\|\|\s*0\)\s*<\s*maxLength\)\s*\{\s*showFlash\(`[^`]+`,\s*'error'\);\s*\}\s*\}/g, '');

    // 2. Add renderLimitWarning function after handleSave
    if (!content.includes('const renderLimitWarning =')) {
        const helperFunc = `
  const renderLimitWarning = (id, max) => {
    if (form[id] && form[id].length >= max) {
      return <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>Maksimum karakter sınırına ({max}) ulaştınız.</span>;
    }
    return null;
  };
`;
        content = content.replace(/(const handleSave =.*?};)/s, `$1\n${helperFunc}`);
    }

    // 3. Inject `{renderLimitWarning('id', max)}` after inputs
    // We want to avoid matching if we already appended it.
    let updated = '';
    let offset = 0;
    const regex = /(<(?:input|textarea)[^>]+id="([^"]+)"[^>]+maxLength=\{([0-9]+)\}[^>]*>(?:<\/textarea>)?)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        updated += content.substring(offset, match.index);
        let tag = match[1];
        let id = match[2];
        let max = match[3];
        
        updated += tag;
        // avoid duplication
        if (!content.substring(match.index + match[0].length).startsWith('{renderLimitWarning')) {
            updated += `{renderLimitWarning('${id}', ${max})}`;
        }
        offset = match.index + match[0].length;
    }
    updated += content.substring(offset);
    content = updated;

    // Special cases: workName and timelineEvent are not in `form`, they are separate states!
    content = content.replace(/(<input[^>]+value=\{workName\}[^>]+maxLength=\{([0-9]+)\}[^>]*>)(?!\{workName\.length)/g, (match, tag, max) => {
        return tag + `{workName.length >= ${max} ? <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>Maksimum sınır aşıldı.</span> : null}`;
    });

    content = content.replace(/(<input[^>]+value=\{timelineEvent\}[^>]+maxLength=\{([0-9]+)\}[^>]*>)(?!\{timelineEvent\.length)/g, (match, tag, max) => {
        return tag + `{timelineEvent.length >= ${max} ? <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>Maksimum sınır aşıldı.</span> : null}`;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
}
