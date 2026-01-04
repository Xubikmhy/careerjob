import React from 'react';

const TextArea = ({ label, className = "", ...props }: any) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <textarea
            className={`w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            rows={4}
            {...props}
        />
    </div>
);

export default TextArea;
