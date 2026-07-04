const fs = require('fs');

const modalJsx = `
      {infoModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999
        }}>
          <div style={{
            background: 'var(--card-bg)', color: 'var(--text-dark)',
            padding: '40px 50px', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            textAlign: 'center', maxWidth: '400px', width: '90%',
            border: '1px solid var(--gold-accent)'
          }}>
            <p style={{ marginBottom: '30px', fontSize: '18px', fontWeight: '500', color: 'var(--accent-color)', lineHeight: 1.6 }}>{infoModal.text}</p>
            <button 
              className="btn" 
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px' }}
              onClick={() => setInfoModal({ isOpen: false, text: '' })}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
`;

const files = [
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/AddMemorialPage.jsx',
  '/Users/melih/Desktop/Dijital-Anit-main/frontend/src/pages/DashboardPage.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Add state if not present
  if (!content.includes('const [infoModal, setInfoModal]')) {
    content = content.replace(/(const \[saving, setSaving\] = useState\(false\);)/, "$1\n  const [infoModal, setInfoModal] = useState({ isOpen: false, text: '' });");
  }

  // Replace showFlash
  content = content.replace(/showFlash\(([^,]+),\s*[^)]+\)/g, "setInfoModal({ isOpen: true, text: $1 })");
  // Some showFlash calls might not have 2 arguments, let's catch them too:
  content = content.replace(/showFlash\(([^,)]+)\)/g, "setInfoModal({ isOpen: true, text: $1 })");

  // Add the modal JSX before the final closing div/tag.
  // Both AddMemorialPage and DashboardPage end with:
  //       </form>
  //     </div>
  //   );
  if (!content.includes('infoModal.isOpen &&')) {
    content = content.replace(/(<\/form>\s*<\/div>\s*\);)/, modalJsx + "$1");
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed', file);
}
