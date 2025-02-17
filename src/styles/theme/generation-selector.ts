// src/styles/theme/generation-selector.ts
export const generationSelectorTheme = {
    container: 'space-y-4 w-full max-w-2xl mx-auto',
    header: {
        wrapper: 'flex items-center space-x-3',
        text: 'text-xl text-dark',
        selectedText: 'font-semibold text-accent hover:text-accent/80 cursor-pointer hover:underline',
    },
    controls: {
        checkmark: 'h-5 w-5 text-success-light',
        changeButton: 'text-steel hover:text-metal text-sm flex items-center',
        changeIcon: 'h-4 w-4 mr-1',
    },
    selectionPanel: {
        wrapper: 'bg-white rounded-lg shadow-lg p-6 space-y-6 border border-steel/20',
        section: {
            title: 'font-medium text-xl text-dark mb-4',
            grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
        },
        option: {
            base: `
                p-4 rounded-lg text-left w-full
                transition-all duration-200
                border border-steel/20
                hover:border-accent hover:shadow-md
            `,
            selected: `
                bg-accent/5 border-accent
                ring-2 ring-accent ring-opacity-50
            `,
            name: 'font-medium text-dark text-lg',
            years: 'text-sm text-text-light mt-1',
            description: 'text-sm text-steel mt-2',
        },
    },
};