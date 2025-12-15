// Função para limpar tags HTML da descrição
export const cleanDescription = (html: string | undefined): string => {
  if (!html) return '';
  
  return html
    .replace(/<p>/gi, '') // Remove tags <p>
    .replace(/<\/p>/gi, '\n\n') // Substitui </p> por quebra de linha dupla
    .replace(/<br\s*\/?>/gi, '\n') // Substitui <br> por quebra de linha
    .replace(/<[^>]+>/g, '') // Remove todas as outras tags HTML
    .replace(/&nbsp;/g, ' ') // Substitui &nbsp; por espaço
    .replace(/&amp;/g, '&') // Substitui &amp; por &
    .replace(/&lt;/g, '<') // Substitui &lt; por <
    .replace(/&gt;/g, '>') // Substitui &gt; por >
    .replace(/&quot;/g, '"') // Substitui &quot; por "
    .trim(); // Remove espaços no início e fim
};

// Função para obter cor da categoria
export const getCategoryColor = (categoryName: string | undefined): string => {
  const colorMap: { [key: string]: string } = {
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

