import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    // --- 正常系 ---

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 500));
        expect(result.current).toBe('hello');
    });

    it('should update value after delay has passed', async () => {
        vi.useFakeTimers();
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' },
        });

        rerender({ value: 'updated' });
        expect(result.current).toBe('initial');

        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('updated');
    });

    it('should not update value before delay has passed', async () => {
        vi.useFakeTimers();
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' },
        });

        rerender({ value: 'updated' });

        await act(async () => {
            vi.advanceTimersByTime(499);
        });

        expect(result.current).toBe('initial');
    });

    // --- 準正常系 ---

    it('should reset timer when value changes rapidly and reflect only the last value', async () => {
        vi.useFakeTimers();
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'first' },
        });

        rerender({ value: 'second' });
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        rerender({ value: 'third' });
        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('third');
    });

    it('should not cause timer leak when unmounted before delay', async () => {
        vi.useFakeTimers();
        const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'initial' },
        });

        rerender({ value: 'updated' });
        unmount();

        // アンマウント後にタイマーが発火しても例外が起きないこと
        await act(async () => {
            vi.advanceTimersByTime(500);
        });
    });
});
