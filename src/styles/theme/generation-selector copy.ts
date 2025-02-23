// src/styles/theme/generation-selector.ts

import { theme, cn } from '../theme';

export const generationSelectorTheme = {
    container: 'bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm',
    navigation: {
        backButton: 'flex items-center text-dark hover:text-[#F3522F] transition-colors mb-6',
        backIcon: 'h-5 w-5 mr-2'
    },
    header: {
        wrapper: 'flex justify-between items-center mb-6',
        text: `${theme.fonts.header} ${theme.text.sizes.h3} text-dark`,
        selectedText: 'font-medium text-[#F3522F] cursor-pointer hover:text-[#D13816] transition-colors',
        confidence: `${theme.fonts.body} ${theme.text.sizes.body} text-dark font-medium`
    },
    controls: {
        checkmark: 'h-6 w-6 text-success-DEFAULT',
        changeButton: 'flex items-center space-x-2 text-text-light hover:text-dark transition-colors',
        changeIcon: 'h-4 w-4'
    },
    selectionPanel: {
        wrapper: 'space-y-8',
        section: {
            title: `${theme.fonts.header} ${theme.text.sizes.subtitle} ${theme.text.weights.medium} text-dark mb-4`,
            grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        },
        option: {
            base: 'w-full p-4 rounded-lg border border-gray-200 hover:border-[#F3522F] transition-colors text-left',
            selected: 'border-[#F3522F] bg-[#FEF2F0]',
            alternative: 'border-[#F3522F] border-opacity-50',
            name: `${theme.fonts.header} ${theme.text.weights.medium} text-dark`,
            years: `${theme.text.sizes.small} text-text-light mt-1`,
            description: `${theme.text.sizes.small} text-text-light mt-2 italic`,
            confidence: `${theme.text.sizes.small} text-dark font-medium mt-2`
        }
    }
};