export const cleanDescription = (html) => {
  if (!html) return '';
  
  let text = html
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>(\n)?/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();

  text = text.replace(/\.{4,}$/g, '');

  return text;
};

export const getCategoryColor = (categoryName) => {
  const colorMap = {
    'Peito': '#FF6B6B',
    'Costas': '#4ECDC4',
    'Ombros': '#45B7D1',
    'Bíceps': '#FFA07A',
    'Tríceps': '#98D8C8',
    'Antebraços': '#F7DC6F',
    'Abdominais': '#BB8FCE',
    'Pernas': '#85C1E2',
    'Gémeos': '#F8B739',
    'Cardio': '#EC7063',
    'Braços': '#5DADE2',
    'Corpo inteiro': '#52BE80',
    'Core': '#F1948A',
    'Glúteos': '#F5B041',
    'Posteriores da coxa': '#7FB3D3',
    'Quadríceps': '#76D7C4',
    'Outros': '#95A5A6',
  };
  return colorMap[categoryName || ''] || '#95A5A6';
};
