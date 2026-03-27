class ValidationUtils {
  constructor() {}

  validateRequired(value) {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }

  validateEmail(email) {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  }

  validateLength(value, min, max) {
    if (value === null || value === undefined) {
      return false;
    }
    const length = String(value).length;
    if (min !== undefined && length < min) {
      return false;
    }
    if (max !== undefined && length > max) {
      return false;
    }
    return true;
  }

  validateNumber(value, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return false;
    }
    if (min !== undefined && num < min) {
      return false;
    }
    if (max !== undefined && num > max) {
      return false;
    }
    return true;
  }

  validateInteger(value) {
    const num = parseInt(value);
    return !isNaN(num) && Number.isInteger(num);
  }

  validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  validateNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }

  validatePhone(phone) {
    // 简单的手机号验证，支持国内外格式
    const phoneRegex = /^[+]?[0-9\s-]{8,15}$/;
    return phoneRegex.test(phone);
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateDate(date) {
    return !isNaN(Date.parse(date));
  }

  validateFutureDate(date) {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  }

  validatePastDate(date) {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }

  validatePassword(password, options = {}) {
    const { minLength = 8, requireUppercase = false, requireLowercase = false, requireNumber = false, requireSpecial = false } = options;
    
    if (password.length < minLength) {
      return false;
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }
    
    if (requireNumber && !/[0-9]/.test(password)) {
      return false;
    }
    
    if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }
    
    return true;
  }

  validateConfirmPassword(password, confirmPassword) {
    return password === confirmPassword;
  }

  validateStrongPassword(password) {
    return this.validatePassword(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true
    });
  }

  validateCreditCard(cardNumber) {
    // 简单的信用卡号验证，使用Luhn算法
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^[0-9]{13,16}$/.test(cleaned)) {
      return false;
    }
    
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  validateCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }

  validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    if (expiryYear < currentYear) {
      return false;
    }
    
    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return false;
    }
    
    return expiryMonth >= 1 && expiryMonth <= 12;
  }

  validatePostalCode(postalCode, country = 'US') {
    const postalCodeRegexes = {
      US: /^\d{5}(-\d{4})?$/,
      UK: /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
      AU: /^\d{4}$/,
      DE: /^\d{5}$/
    };
    
    const regex = postalCodeRegexes[country] || postalCodeRegexes.US;
    return regex.test(postalCode);
  }

  validateIBAN(iban) {
    // 简单的IBAN验证
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
      return false;
    }
    
    // 移前4位到末尾
    const reordered = cleaned.substring(4) + cleaned.substring(0, 4);
    
    // 字母转换为数字
    let numeric = '';
    for (let i = 0; i < reordered.length; i++) {
      const char = reordered.charAt(i);
      if (/[0-9]/.test(char)) {
        numeric += char;
      } else {
        numeric += (char.charCodeAt(0) - 55).toString();
      }
    }
    
    // 模97计算
    let mod = 0;
    for (let i = 0; i < numeric.length; i++) {
      mod = (mod * 10 + parseInt(numeric.charAt(i))) % 97;
    }
    
    return mod === 1;
  }

  validateBIC(bic) {
    // BIC/SWIFT码验证
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.toUpperCase());
  }

  validateIPv4(ip) {
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  validateIPv6(ip) {
    const ipRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipRegex.test(ip);
  }

  validateMACAddress(mac) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  }

  validateHexColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  validateRGBColor(color) {
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const match = color.match(rgbRegex);
    if (!match) {
      return false;
    }
    return match.slice(1).every(val => parseInt(val) >= 0 && parseInt(val) <= 255);
  }

  validateRGBAColor(color) {
    const rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)\)$/;
    const match = color.match(rgbaRegex);
    if (!match) {
      return false;
    }
    const [, r, g, b, a] = match;
    return parseInt(r) >= 0 && parseInt(r) <= 255 &&
           parseInt(g) >= 0 && parseInt(g) <= 255 &&
           parseInt(b) >= 0 && parseInt(b) <= 255 &&
           parseFloat(a) >= 0 && parseFloat(a) <= 1;
  }

  validateForm(formData, rules) {
    const errors = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = formData[field];
      
      if (fieldRules.required && !this.validateRequired(value)) {
        errors[field] = fieldRules.requiredMessage || '此字段为必填项';
        return;
      }
      
      if (value !== null && value !== undefined && value !== '') {
        if (fieldRules.email && !this.validateEmail(value)) {
          errors[field] = fieldRules.emailMessage || '请输入有效的邮箱地址';
        } else if (fieldRules.length) {
          const { min, max } = fieldRules.length;
          if (!this.validateLength(value, min, max)) {
            errors[field] = fieldRules.lengthMessage || `长度必须在 ${min} 到 ${max} 之间`;
          }
        } else if (fieldRules.number) {
          const { min, max } = fieldRules.number;
          if (!this.validateNumber(value, min, max)) {
            errors[field] = fieldRules.numberMessage || '请输入有效的数字';
          }
        } else if (fieldRules.password) {
          if (!this.validatePassword(value, fieldRules.password)) {
            errors[field] = fieldRules.passwordMessage || '密码强度不足';
          }
        } else if (fieldRules.confirmPassword) {
          const confirmField = fieldRules.confirmPassword;
          if (!this.validateConfirmPassword(value, formData[confirmField])) {
            errors[field] = fieldRules.confirmPasswordMessage || '两次输入的密码不一致';
          }
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    return input;
  }

  sanitizeFormData(formData) {
    const sanitized = {};
    Object.entries(formData).forEach(([key, value]) => {
      sanitized[key] = this.sanitizeInput(value);
    });
    return sanitized;
  }
}

const validationUtils = new ValidationUtils();
export default validationUtils;