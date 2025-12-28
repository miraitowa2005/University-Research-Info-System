import React, { useEffect, useRef, useState } from 'react';

export default function IMEInput({
  value,
  onChange,
  disabled,
  type = 'text',
  placeholder,
  className
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value || '');
  const composing = useRef(false);

  useEffect(() => {
    if (!composing.current) setLocal(value || '');
  }, [value]);

  return (
    <input
      type={type}
      disabled={disabled}
      className={className}
      value={local}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={e => { composing.current = false; const v = (e.target as HTMLInputElement).value; setLocal(v); onChange(v); }}
      onChange={e => {
        const v = (e.target as HTMLInputElement).value;
        setLocal(v);
        if (!composing.current) onChange(v);
      }}
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
    />
  );
}
