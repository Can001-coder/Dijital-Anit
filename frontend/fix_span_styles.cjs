const fs = require('fs');

const files = [
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/AddMemorialPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/DashboardPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/LoginPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/RegisterPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/ForgotPasswordPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/HomePage.jsx'
];

for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Replace in AddMemorialPage and DashboardPage renderLimitWarning function
    content = content.replace(/marginTop:\s*'4px'/g, "position: 'absolute', bottom: '-18px', left: '0'");
    content = content.replace(/marginTop:\s*'2px'/g, "position: 'absolute', bottom: '-18px', left: '0'");

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
}
