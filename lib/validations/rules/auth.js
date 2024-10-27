const passwordMinLength = 6;

export const loginRules = {
  email: {
    isEmail: {
      message: 'Wrong email format',
    },
    notEmpty: {
      message: 'Email is required',
    },
  },
  password: {
    notEmpty: {
      message: 'Password is required',
    },
    isLength: {
      options: {
        min: passwordMinLength,
      },
      message: `Password must be at least ${passwordMinLength} characters long`,
    }
  }
};

export const registerRules = {
  email: {
    isEmail: {
      message: 'Wrong email format',
    },
    notEmpty: {
      message: 'Email is required',
    },
  },
  password: {
    notEmpty: {
      message: 'Password is required',
    },
    isLength: {
      options: {
        min: passwordMinLength,
      },
      message: `Password must be at least ${passwordMinLength} characters long`,
    }
  },
  // first_name: {
  //   notEmpty: {
  //     message: 'First name is required',
  //   },
  // },
  // last_name: {
  //   notEmpty: {
  //     message: 'Last name is required',
  //   },
  // },
};

export const registerFields = Object.keys(registerRules);
