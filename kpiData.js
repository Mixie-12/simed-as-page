// KPI Data Configuration for Simed AS
// This file contains mock data for demonstration purposes only

const kpiConfig = {
  kpis: [
    {
      id: 'avkastning',
      label: 'Avkastning',
      value: 24.7,
      unit: '%',
      trend: 'up',
      description: 'Årlig avkastning siste 12 mnd',
      sparklineData: [18, 19, 21, 20, 22, 23, 24, 25, 24, 26, 25, 24.7],
      color: '#6ee7ff'
    },
    {
      id: 'risiko',
      label: 'Volatilitet',
      value: 12.3,
      unit: '%',
      trend: 'stable',
      description: 'Årlig volatilitet (standardavvik)',
      sparklineData: [14, 13, 12.5, 13, 12, 12.5, 12, 13, 12.5, 12, 12.5, 12.3],
      color: '#a78bfa'
    },
    {
      id: 'eksponering',
      label: 'Eksponering',
      value: 87,
      unit: '%',
      trend: 'up',
      description: 'Aksjeandel av portefølje',
      sparklineData: [75, 78, 80, 82, 85, 84, 86, 85, 87, 86, 88, 87],
      color: '#6ee7ff'
    },
    {
      id: 'likviditet',
      label: 'Likviditet',
      value: 13,
      unit: '%',
      trend: 'stable',
      description: 'Kontanter og kortsiktige',
      sparklineData: [25, 22, 20, 18, 15, 16, 14, 15, 13, 14, 12, 13],
      color: '#a78bfa'
    }
  ],
  
  disclaimer: {
    title: 'Viktig informasjon',
    text: 'Historisk avkastning er ingen garanti for fremtidig avkastning. Alle tall er fiktive og kun til demonstrasjonsformål.',
    methodology: 'Avkastning beregnes som tidsveiet avkastning før kostnader. Volatilitet er årlig standardavvik basert på månedlige observasjoner.'
  },
  
  lastUpdated: '2024-12-25'
};

// Format number with locale
function formatNumber(value, decimals = 1) {
  return value.toFixed(decimals).replace('.', ',');
}

// Generate SVG sparkline path
function generateSparklinePath(data, width = 100, height = 30) {
  if (!data || data.length === 0) return '';
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });
  
  return `M ${points.join(' L ')}`;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { kpiConfig, formatNumber, generateSparklinePath };
}
