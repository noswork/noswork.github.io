const themes = {
    light: {
        bg: '#ffffff',
        wall: '#000000',
        start: '#4ade80',
        end: '#f87171',
        player: '#3b82f6',
        path: 'rgba(59, 130, 246, 0.2)',
        pathStroke: 'rgba(59, 130, 246, 0.4)'
    },
    dark: {
        bg: '#1a1a1a',
        wall: '#e0e0e0',
        start: '#22c55e',
        end: '#ef4444',
        player: '#60a5fa',
        path: 'rgba(96, 165, 250, 0.3)',
        pathStroke: 'rgba(96, 165, 250, 0.5)'
    },
    blue: {
        bg: '#dbeafe',
        wall: '#1e40af',
        start: '#10b981',
        end: '#dc2626',
        player: '#2563eb',
        path: 'rgba(37, 99, 235, 0.25)',
        pathStroke: 'rgba(37, 99, 235, 0.5)'
    },
    green: {
        bg: '#dcfce7',
        wall: '#14532d',
        start: '#84cc16',
        end: '#dc2626',
        player: '#16a34a',
        path: 'rgba(22, 163, 74, 0.25)',
        pathStroke: 'rgba(22, 163, 74, 0.5)'
    },
    purple: {
        bg: '#f3e8ff',
        wall: '#581c87',
        start: '#10b981',
        end: '#dc2626',
        player: '#9333ea',
        path: 'rgba(147, 51, 234, 0.25)',
        pathStroke: 'rgba(147, 51, 234, 0.5)'
    },
    sunset: {
        bg: '#fff7ed',
        wall: '#7c2d12',
        start: '#10b981',
        end: '#dc2626',
        player: '#ea580c',
        path: 'rgba(234, 88, 12, 0.25)',
        pathStroke: 'rgba(234, 88, 12, 0.5)'
    }
};

export const getThemeColors = (themeName) => themes[themeName] || themes.light;

