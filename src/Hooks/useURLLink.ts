import { useEffect } from 'react';
import { Alert } from 'react-native';

export const useURLLink = (URLLink: string) => {
    useEffect(() => {
        if (URLLink !== undefined && !URLLink?.includes('-')) Alert.alert('The URLLink does not contain hyphens.')
    }, [])

    const linkId = URLLink?.split('-')[0]
    const linkName = URLLink?.substring(URLLink.indexOf('-') + 1)

    const convertID_NameStringToURLFormat = (id: number, name: string) => {
        name = (name ?? '').replace(/[^a-zA-Z0-9\- ]/g, '').replace(/\s+/g, '-').toLowerCase();

        return `${id}-${name}`;
    }

    return {
        linkId,
        linkName,
        convertID_NameStringToURLFormat
    };
};
