import type { AlertButton, AlertOptions } from 'react-native';

export const Alert = {
    alert(title: string, message?: string, buttons?: AlertButton[], _options?: AlertOptions) {
        if (typeof window === 'undefined') return;
        const text = [title, message].filter(Boolean).join('\n\n');
        const action = buttons?.find(button => button.style !== 'cancel');
        const cancel = buttons?.find(button => button.style === 'cancel');
        if (cancel && action) {
            if (window.confirm(text)) action.onPress?.();
            else cancel.onPress?.();
        } else {
            window.alert(text);
            action?.onPress?.();
        }
    },
};
