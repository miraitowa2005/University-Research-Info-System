import React, { useRef, useState, useCallback, useEffect } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const lastValueRef = useRef(value || '');
  
  // 只在外部值真正变化时更新本地状态
  useEffect(() => {
    if (value !== lastValueRef.current && !composing.current) {
      setLocal(value || '');
      lastValueRef.current = value || '';
    }
  }, [value]);
  
  // 使用 useCallback 来稳定事件处理函数
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    
    // 只有在非输入法状态下才触发外部 onChange
    if (!composing.current) {
      onChange(v);
      lastValueRef.current = v;
    }
  }, [onChange]);

  const handleCompositionStart = useCallback(() => {
    composing.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    const v = (e.target as HTMLInputElement).value;
    setLocal(v);
    onChange(v);
    lastValueRef.current = v;
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (composing.current) {
      composing.current = false;
      onChange(local);
      lastValueRef.current = local;
    }
  }, [onChange, local]);

  return (
    <input
      ref={inputRef}
      type={type}
      disabled={disabled}
      className={className}
      value={local}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
      onBlur={handleBlur}
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
    />
  );
}
