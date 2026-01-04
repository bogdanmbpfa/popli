export const generateRandomNumericString = (length: number): string => {
  let code = '';
  const charset = '0123456789';
  for (let i = 0; i < length; i++) {
    code += charset[Math.floor(Math.random() * charset.length)];
  }
  return code;
};
