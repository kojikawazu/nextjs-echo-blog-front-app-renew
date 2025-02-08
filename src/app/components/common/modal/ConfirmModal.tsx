'use client';

import React from 'react';
import ReactModal from 'react-modal';

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    btnClassName?: string;
}

/**
 * 確認モーダル
 * @param isOpen モーダルの表示状態
 * @param title モーダルのタイトル
 * @param message モーダルのメッセージ
 * @param confirmText 確認ボタンのテキスト
 * @param cancelText キャンセルボタンのテキスト
 * @param onConfirm 確認ボタンのクリック時の処理
 * @param onCancel キャンセルボタンのクリック時の処理
 * @param btnClassName ボタンのクラス名
 */
export function ConfirmModal({
    isOpen,
    title = '確認',
    message = '本当にこの操作を実行しますか？',
    confirmText = 'はい',
    cancelText = 'キャンセル',
    onConfirm,
    onCancel,
    btnClassName,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onCancel}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
            ariaHideApp={false}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-md ${btnClassName}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </ReactModal>
    );
}
