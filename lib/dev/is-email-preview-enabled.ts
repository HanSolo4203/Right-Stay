/** Gate /dev/email-preview so it is not exposed on production by default. */
export function isEmailPreviewEnabled(): boolean {
  if (process.env.ENABLE_DEV_EMAIL_PREVIEW === 'true') {
    return true;
  }
  return process.env.NODE_ENV === 'development';
}
