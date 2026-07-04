const fs = require('fs');
const files = ['/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/AddMemorialPage.jsx', '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/DashboardPage.jsx'];

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

    // 3. Inject `{renderLimitWarning('id', max)}` before closing `</div>` of the `.form-group` or directly after the input
    // We'll replace <input ... id="x" ... maxLength={y} /></div> with <input ... />{renderLimitWarning('x', y)}</div>
    // Let's use a regex to find input/textarea with id and maxLength that don't already have the warning
    
    // For inputs
    content = content.replace(/(<(?:input|textarea)[^>]+id="([^"]+)"[^>]+maxLength=\{([0-9]+)\}[^>]*>(?:<\/textarea>)?)/g, (match, tag, id, max) => {
        // If it's already followed by renderLimitWarning, skip
        return tag + `{renderLimitWarning('${id}', ${max})}`;
    });

    // Special cases: workName and timelineEvent are not in `form`, they are separate states!
    // For workName
    content = content.replace(/(<input[^>]+value=\{workName\}[^>]+maxLength=\{([0-9]+)\}[^>]*>)/g, (match, tag, max) => {
        return tag + `{workName.length >= ${max} ? <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>Maksimum karakter sınırına ulaştınız.</span> : null}`;
    });

    // For timelineEvent
    content = content.replace(/(<input[^>]+value=\{timelineEvent\}[^>]+maxLength=\{([0-9]+)\}[^>]*>)/g, (match, tag, max) => {
        return tag + `{timelineEvent.length >= ${max} ? <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>Maksimum karakter sınırına ulaştınız.</span> : null}`;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
}
