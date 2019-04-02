import memoize from 'lru-memoize';
import { createValidator, required, integer } from 'utils/validation';

const smtpValidation = createValidator({
  SMTP_host: required,
  SMTP_port: [required, integer],
  auth_user: required,
  auth_password: required,
  IMAP_host: required,
  IMAP_port: required
});
export default memoize(10)(smtpValidation);
