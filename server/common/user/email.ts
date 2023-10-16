import { addMinutes } from "date-fns";
import { NextApiRequest } from "next";
import getConfig from "next/config";
import { v4 as uuidv4 } from 'uuid';

import models from "db/models";

import { DISCORD_LINK, INSTAGRAM_LINK, LINKEDIN_LINK, TWITTER_LINK } from "helpers/constants";
import { lowerCaseCompare } from "helpers/string";
import { isValidEmail } from "helpers/validators/email";

import { UserTableScopes } from "interfaces/enums/api";
import { EmailConfirmationErrors } from "interfaces/enums/Errors";

import { HttpBadRequestError, HttpConflictError } from "server/errors/http-errors";
import { emailService } from "server/services/email";
import { EmailTemplates } from "server/templates";
import { TemplateProcessor } from "server/utils/template";

const { 
  publicRuntimeConfig: {
    urls: {
      home: homeUrl
    }
  },
  serverRuntimeConfig: {
    email: {
      verificationCodeExpiration
    }
  }
} = getConfig();

export async function get(req: NextApiRequest) {
  const { code, email } = req.query;

  if (!code || !email)
    throw new HttpBadRequestError(EmailConfirmationErrors.INVALID_LINK);

  const user = await models.user.scope(UserTableScopes.ownerOrGovernor).findOne({
    where: {
      email,
      emailVerificationCode: code
    }
  });

  if (!user)
    throw new HttpBadRequestError(EmailConfirmationErrors.INVALID_LINK);

  if (user.isEmailConfirmed)
    throw new HttpConflictError(EmailConfirmationErrors.ALREADY_CONFIRMED);

  const emailSentWithExpiration = addMinutes(user.emailVerificationSentAt, verificationCodeExpiration);

  if (emailSentWithExpiration < new Date())
    throw new HttpConflictError(EmailConfirmationErrors.EXPIRED_LINK); 

  user.isEmailConfirmed = true;
  user.emailVerificationCode = null;

  await user.save();
}

export async function put(req: NextApiRequest) {
  const { email, context } = req.body;
  const { user } = context;

  if (!email) {
    user.email = null;
    user.isEmailConfirmed = false;
    user.emailVerificationCode = null;
    user.emailVerificationSentAt = null;

    await user.save();

    return;
  }

  if (!isValidEmail(email))
    throw new HttpBadRequestError("Invalid email");

  if (lowerCaseCompare(user.email, email) && user.isEmailConfirmed)
    throw new HttpConflictError("Nothing to change");

  const verificationCode = uuidv4();

  const verifyLink = new URL(`/api/user/connect/confirm-email?code=${verificationCode}&email=${email}`, homeUrl);
  const templateData = {
    host: homeUrl,
    verifyLink: verifyLink.href,
    twitter: TWITTER_LINK,
    instagram: INSTAGRAM_LINK,
    discord: DISCORD_LINK,
    linkedin: LINKEDIN_LINK
  };

  const emailhtml = await new TemplateProcessor(EmailTemplates.EmailVerification).compile(templateData);

  await emailService.sendEmail("Verify your email", email, emailhtml);

  user.email = email;
  user.isEmailConfirmed = false;
  user.emailVerificationCode = verificationCode;
  user.emailVerificationSentAt = new Date();

  await user.save();
}