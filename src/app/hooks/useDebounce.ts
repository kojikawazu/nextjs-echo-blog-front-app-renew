'use client';

import { useState, useEffect } from 'react';

/**
 * デバウンスフック
 * @param value 値
 * @param delay ディレイ
 * @returns デバウンス値
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
