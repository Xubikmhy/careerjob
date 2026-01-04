import React from 'react';

const Select = ({ label, options, ...props }: any) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <select
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...props}
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default Select;
