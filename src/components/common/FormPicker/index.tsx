import React from 'react';
import { View, Text, Picker } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface FormPickerProps {
  label?: string;
  value: string;
  options: Array<{ label: string; value: string }> | string[];
  onChange: (value: string, index: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const FormPicker: React.FC<FormPickerProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = '请选择',
  required = false,
  disabled = false,
  error,
  className,
}) => {
  const isStringOptions = typeof options[0] === 'string';
  const optionLabels = isStringOptions ? options : options.map((o) => o.label);
  const optionValues = isStringOptions ? options : options.map((o) => o.value);
  const selectedIndex = optionValues.indexOf(value);
  const displayValue = selectedIndex >= 0 ? optionLabels[selectedIndex] : '';

  const handleChange = (e: any) => {
    const index = e.detail.value;
    const selectedValue = optionValues[index];
    onChange(selectedValue, index);
  };

  return (
    <View className={classnames(styles.formItem, className)}>
      {label && (
        <Text className={classnames(styles.formLabel, required && styles.formLabelRequired)}>
          {label}
        </Text>
      )}
      <Picker
        mode="selector"
        range={optionLabels}
        value={selectedIndex >= 0 ? selectedIndex : 0}
        onChange={handleChange}
        disabled={disabled}
      >
        <View
          className={classnames(
            styles.pickerWrapper,
            error && styles.error,
            disabled && styles.disabled
          )}
        >
          <Text
            className={classnames(
              styles.pickerValue,
              !displayValue && styles.placeholder
            )}
          >
            {displayValue || placeholder}
          </Text>
          <Text className={styles.pickerArrow}>▾</Text>
        </View>
      </Picker>
      {error && <Text className={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default FormPicker;
