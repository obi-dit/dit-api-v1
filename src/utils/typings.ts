import { brevoTemplateConfig } from './helper';
export type Notification_for_new_Student_Payload = {
  studentName: string;
  email: string;
  course: string;
  enrollmentDate: string;
};

export type Comfirmation_After_Enrollment_Payload = {
  studentName: string;
  email: string;
  programName: string;
  startDate: string;
  location: string;
};

export type BrevoTemplateId =
  (typeof brevoTemplateConfig)[keyof typeof brevoTemplateConfig];

export type TemplatePayloadMap = {
  [brevoTemplateConfig.Comfirmation_After_Enrollment]: Comfirmation_After_Enrollment_Payload;
  [brevoTemplateConfig.Notification_for_new_Student]: Notification_for_new_Student_Payload;
  // Add more mappings here as needed
  [brevoTemplateConfig.Dit_Verify_Mail]: any; // You can define a type for this if available
};
