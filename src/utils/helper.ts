import { generate } from 'randomized-string';

export const brevoTemplateConfig = {
  Dit_Verify_Mail: 2,
};

export const generateEmailVerificationToken = () => {
  return generate({
    charset: 'number',
    length: 5,
  });
};
