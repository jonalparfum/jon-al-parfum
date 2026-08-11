const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "password",
  "password1",
  "contraseña",
  "admin123",
  "qwerty123",
  "jonalparfum",
  "jon-al-parfum",
]);

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  if (password.length > 128) {
    return "La contraseña no puede superar 128 caracteres";
  }

  if (!/[a-z]/.test(password)) {
    return "La contraseña debe incluir al menos una letra minúscula";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe incluir al menos una letra mayúscula";
  }

  if (!/[0-9]/.test(password)) {
    return "La contraseña debe incluir al menos un número";
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Esa contraseña es demasiado común. Elige otra más segura";
  }

  return null;
}

export const PASSWORD_REQUIREMENTS_HINT =
  "Mínimo 8 caracteres, con mayúscula, minúscula y número";
