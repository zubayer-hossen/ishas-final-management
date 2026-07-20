const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaDigits = (value) => String(value ?? '').replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
