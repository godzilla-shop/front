"use client";

import React, { useState } from 'react';
import api from '@/lib/api';

const ImportExcel: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/import/excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(`Importación exitosa: ${response.data.count} contactos.`);
        } catch (error) {
            setMessage('Error al importar el archivo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-semibold">Importar Contactos (Excel)</h2>
            <div className="flex flex-col space-y-2">
                <label className="text-slate-400 text-sm">Selecciona tu archivo .xlsx o .csv</label>
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
            </div>
            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
                {loading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
            {message && (
                <p className={`text-sm ${message.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ImportExcel;
