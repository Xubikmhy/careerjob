import React from 'react';

const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
        {children}
    </div>
);

export default Card;
