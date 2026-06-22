/**
 * validators.js
 * Form validation helper functions for frontend forms.
 */

export const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email) ? "" : "Please enter a valid email address";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return "";
};

export const validateMobile = (mobile) => {
  const re = /^[0-9]{10}$/;
  return re.test(mobile) ? "" : "Mobile number must be exactly 10 digits";
};

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.toString().trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
};

export const validateMinLength = (value, min, fieldName = "This field") => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return "";
};

/**
 * Validate the entire employee form.
 * Returns an errors object — empty values = valid.
 */
export const validateEmployeeForm = (data) => {
  const errors = {};

  const nameError = validateRequired(data.fullName, "Full name");
  if (nameError) errors.fullName = nameError;
  else if (data.fullName.length < 2) errors.fullName = "Name must be at least 2 characters";

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const mobileError = validateMobile(data.mobileNumber);
  if (mobileError) errors.mobileNumber = mobileError;

  const deptError = validateRequired(data.department, "Department");
  if (deptError) errors.department = deptError;

  const desigError = validateRequired(data.designation, "Designation");
  if (desigError) errors.designation = desigError;

  const dateError = validateRequired(data.joiningDate, "Joining date");
  if (dateError) errors.joiningDate = dateError;

  return errors;
};

/**
 * Validate the login form.
 */
export const validateLoginForm = (data) => {
  const errors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passError = validateRequired(data.password, "Password");
  if (passError) errors.password = passError;

  return errors;
};

/**
 * Validate the register form.
 */
export const validateRegisterForm = (data) => {
  const errors = {};

  const nameError = validateRequired(data.name, "Name");
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passError = validatePassword(data.password);
  if (passError) errors.password = passError;

  if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
