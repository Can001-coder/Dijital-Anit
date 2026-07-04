export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  
  // XSS ve Kod Enjeksiyonu için tehlikeli karakterler listesi:
  // < > { } [ ] ; = ^ ~ | \ `
  // Normal yazım karakterlerine (. , ? ! - ' " vs.) dokunulmaz.
  return value.replace(/[<>{}\[\];=^~|\\`]/g, '');
};
