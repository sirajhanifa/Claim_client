import React from 'react';

const InputBox = ({
    label,
    type = "text",
    name, value,
    onChange,
    placeholder,
    required = false,
    readOnly = false,
}) => {
    return (
        <div className="w-80 mb-5">
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-medium text-gray-700"
                >
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type} id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                className={`w-full px-4 py-2 border rounded-md text-sm shadow-sm transition
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
            />
        </div>
    );
};

export default InputBox;
