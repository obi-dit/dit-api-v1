import { generate } from 'randomized-string';

export const brevoTemplateConfig = {
  Dit_Verify_Mail: 2,
  Comfirmation_After_Enrollment: 3,
  Notification_for_new_Student: 4,
};

export const generateEmailVerificationToken = () => {
  return generate({
    charset: 'number',
    length: 5,
  });
};
