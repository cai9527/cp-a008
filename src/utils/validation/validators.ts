import { REGEX, MESSAGES } from './rules';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export type ValidatorFn<T = any> = (value: T) => ValidationResult;

export const validateRequired = (value: string | number | any[] | null | undefined): ValidationResult => {
  if (value === null || value === undefined) return { valid: false, message: MESSAGES.required };
  if (typeof value === 'string' && !value.trim()) return { valid: false, message: MESSAGES.required };
  if (Array.isArray(value) && value.length === 0) return { valid: false, message: MESSAGES.required };
  return { valid: true };
};

export const validateRequiredSelect = <T>(value: T | null | undefined): ValidationResult => {
  if (value === null || value === undefined || value === '') return { valid: false, message: MESSAGES.requiredSelect };
  return { valid: true };
};

export const validatePhone = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.phone.test(value)) return { valid: false, message: MESSAGES.phone };
  return { valid: true };
};

export const validateMobile = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseMobile.test(value)) return { valid: false, message: MESSAGES.mobile };
  return { valid: true };
};

export const validateLandline = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseLandline.test(value)) return { valid: false, message: MESSAGES.landline };
  return { valid: true };
};

export const validateEmail = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.email.test(value)) return { valid: false, message: MESSAGES.email };
  return { valid: true };
};

export const validateIdCard = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.idCard.test(value)) return { valid: false, message: MESSAGES.idCard };
  return { valid: true };
};

export const validateIdCard15 = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseIdCard15.test(value)) return { valid: false, message: MESSAGES.idCard15 };
  return { valid: true };
};

export const validateIdCard18 = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseIdCard18.test(value)) return { valid: false, message: MESSAGES.idCard18 };
  return { valid: true };
};

export const validateSocialCredit = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseSocialCredit.test(value)) return { valid: false, message: MESSAGES.socialCredit };
  return { valid: true };
};

export const validateMinLength = (value: string, min: number): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (value.length < min) return { valid: false, message: MESSAGES.minLength(min) };
  return { valid: true };
};

export const validateMaxLength = (value: string, max: number): ValidationResult => {
  if (!value) return { valid: true };
  if (value.length > max) return { valid: false, message: MESSAGES.maxLength(max) };
  return { valid: true };
};

export const validateLength = (value: string, min: number, max: number): ValidationResult => {
  const minResult = validateMinLength(value, min);
  if (!minResult.valid) return minResult;
  return validateMaxLength(value, max);
};

export const validateExactLength = (value: string, length: number): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (value.length !== length) return { valid: false, message: MESSAGES.exactLength(length) };
  return { valid: true };
};

export const validateMin = (value: number, min: number): ValidationResult => {
  if (value === null || value === undefined) return { valid: false, message: MESSAGES.required };
  if (value < min) return { valid: false, message: MESSAGES.min(min) };
  return { valid: true };
};

export const validateMax = (value: number, max: number): ValidationResult => {
  if (value === null || value === undefined) return { valid: true };
  if (value > max) return { valid: false, message: MESSAGES.max(max) };
  return { valid: true };
};

export const validateRange = (value: number, min: number, max: number): ValidationResult => {
  const minResult = validateMin(value, min);
  if (!minResult.valid) return minResult;
  return validateMax(value, max);
};

export const validateNumber = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.number.test(value)) return { valid: false, message: MESSAGES.number };
  return { valid: true };
};

export const validateInteger = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.integer.test(value)) return { valid: false, message: MESSAGES.integer };
  return { valid: true };
};

export const validatePositiveNumber = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.positiveNumber.test(value)) return { valid: false, message: MESSAGES.positiveNumber };
  return { valid: true };
};

export const validateNegativeNumber = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.negativeNumber.test(value)) return { valid: false, message: MESSAGES.negativeNumber };
  return { valid: true };
};

export const validatePositiveDecimal = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.positiveDecimal.test(value)) return { valid: false, message: MESSAGES.positiveDecimal };
  return { valid: true };
};

export const validateDecimal = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.decimal.test(value)) return { valid: false, message: MESSAGES.decimal };
  return { valid: true };
};

export const validateNoWhitespace = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  if (REGEX.hasWhitespace.test(value)) return { valid: false, message: MESSAGES.noWhitespace };
  return { valid: true };
};

export const getCharTypeCount = (password: string): number => {
  let count = 0;
  if (REGEX.hasLowerCase.test(password)) count++;
  if (REGEX.hasUpperCase.test(password)) count++;
  if (REGEX.hasNumber.test(password)) count++;
  if (REGEX.hasSpecialChar.test(password)) count++;
  return count;
};

export const validatePassword = (password: string, minTypeCount: number = 3): ValidationResult => {
  if (!password) return { valid: false, message: MESSAGES.required };

  const lengthResult = validateLength(password, 8, 20);
  if (!lengthResult.valid) return lengthResult;

  const whitespaceResult = validateNoWhitespace(password);
  if (!whitespaceResult.valid) return whitespaceResult;

  const typeCount = getCharTypeCount(password);
  if (typeCount < minTypeCount) {
    return { valid: false, message: MESSAGES.charTypeCount(minTypeCount) };
  }

  return { valid: true };
};

export const validatePasswordWeak = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: MESSAGES.required };
  if (!REGEX.passwordWeak.test(password)) return { valid: false, message: MESSAGES.passwordWeak };
  return { valid: true };
};

export const validatePasswordConfirm = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) return { valid: false, message: MESSAGES.required };
  if (password !== confirmPassword) return { valid: false, message: MESSAGES.passwordConfirm };
  return { valid: true };
};

export const calculatePasswordSimilarity = (oldPassword: string, newPassword: string): number => {
  let matchCount = 0;
  const minLength = Math.min(oldPassword.length, newPassword.length);
  for (let i = 0; i < minLength; i++) {
    if (oldPassword[i] === newPassword[i]) {
      matchCount++;
    }
  }
  return minLength > 0 ? matchCount / minLength : 0;
};

export const validatePasswordNotSame = (oldPassword: string, newPassword: string, similarityThreshold: number = 0.6): ValidationResult => {
  if (!newPassword) return { valid: false, message: MESSAGES.required };
  if (oldPassword === newPassword) {
    return { valid: false, message: MESSAGES.passwordSameAsOld };
  }
  const similarity = calculatePasswordSimilarity(oldPassword, newPassword);
  if (similarity > similarityThreshold) {
    return { valid: false, message: MESSAGES.passwordTooSimilar };
  }
  return { valid: true };
};

export const validateChinese = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chinese.test(value)) return { valid: false, message: MESSAGES.chinese };
  return { valid: true };
};

export const validateChineseAndEnglish = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.chineseAndEnglish.test(value)) return { valid: false, message: MESSAGES.chineseAndEnglish };
  return { valid: true };
};

export const validateEnglish = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.english.test(value)) return { valid: false, message: MESSAGES.english };
  return { valid: true };
};

export const validateAlphanumeric = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.alphanumeric.test(value)) return { valid: false, message: MESSAGES.alphanumeric };
  return { valid: true };
};

export const validateAlphanumericWithUnderscore = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.alphanumericWithUnderscore.test(value)) return { valid: false, message: MESSAGES.alphanumericWithUnderscore };
  return { valid: true };
};

export const validateUrl = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.url.test(value)) return { valid: false, message: MESSAGES.url };
  return { valid: true };
};

export const validateHttpUrl = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.httpUrl.test(value)) return { valid: false, message: MESSAGES.httpUrl };
  return { valid: true };
};

export const validateIp = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.ip.test(value)) return { valid: false, message: MESSAGES.ip };
  return { valid: true };
};

export const validatePostcode = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.postcode.test(value)) return { valid: false, message: MESSAGES.postcode };
  return { valid: true };
};

export const validateQq = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.qq.test(value)) return { valid: false, message: MESSAGES.qq };
  return { valid: true };
};

export const validateWechat = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.wechat.test(value)) return { valid: false, message: MESSAGES.wechat };
  return { valid: true };
};

export const validateLicensePlate = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.licensePlate.test(value)) return { valid: false, message: MESSAGES.licensePlate };
  return { valid: true };
};

export const validateBankCard = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.bankCard.test(value)) return { valid: false, message: MESSAGES.bankCard };
  return { valid: true };
};

export const validateLongitude = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.longitude.test(value)) return { valid: false, message: MESSAGES.longitude };
  return { valid: true };
};

export const validateLatitude = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.latitude.test(value)) return { valid: false, message: MESSAGES.latitude };
  return { valid: true };
};

export const validateUsername = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.username.test(value)) return { valid: false, message: MESSAGES.username };
  return { valid: true };
};

export const validateVersion = (value: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!REGEX.version.test(value)) return { valid: false, message: MESSAGES.version };
  return { valid: true };
};

export const validatePattern = (value: string, pattern: RegExp, message?: string): ValidationResult => {
  if (!value) return { valid: false, message: MESSAGES.required };
  if (!pattern.test(value)) return { valid: false, message: message || MESSAGES.pattern };
  return { valid: true };
};

export const validateCustom = (value: any, validator: (value: any) => boolean, message?: string): ValidationResult => {
  if (!validator(value)) return { valid: false, message: message || MESSAGES.custom };
  return { valid: true };
};

export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  if (!startDate || !endDate) return { valid: true };
  if (new Date(endDate) < new Date(startDate)) {
    return { valid: false, message: MESSAGES.dateRange };
  }
  return { valid: true };
};

export const validateTimeRange = (startTime: string, endTime: string, startDate?: string, endDate?: string): ValidationResult => {
  if (!startTime || !endTime) return { valid: true };

  if (startDate && endDate && startDate !== endDate) {
    return { valid: true };
  }

  if (endTime < startTime) {
    return { valid: false, message: MESSAGES.timeRange };
  }
  return { valid: true };
};

export const validate = (value: any, validators: ValidatorFn[]): ValidationResult => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

export const validateAll = (values: Record<string, any>, rules: Record<string, ValidatorFn[]>): {
  valid: boolean;
  errors: Record<string, string>;
  firstError?: string;
  firstErrorField?: string;
} => {
  const errors: Record<string, string> = {};
  let firstError: string | undefined;
  let firstErrorField: string | undefined;

  for (const field of Object.keys(rules)) {
    const fieldValidators = rules[field];
    const value = values[field];

    for (const validator of fieldValidators) {
      const result = validator(value);
      if (!result.valid && result.message) {
        errors[field] = result.message;
        if (!firstError) {
          firstError = result.message;
          firstErrorField = field;
        }
        break;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    firstError,
    firstErrorField,
  };
};
