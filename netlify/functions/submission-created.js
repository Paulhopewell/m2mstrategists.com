// Fires automatically after every Netlify Forms submission on this site
// (naming convention: https://docs.netlify.com/forms/notifications/#trigger-a-function).
// Emails the enquiry to the team, auto-replies to the sender, and upserts the
// contact into HubSpot.

const RESEND_URL = 'https://api.resend.com/emails';
const HUBSPOT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
const HUBSPOT_PROPS_URL = 'https://api.hubapi.com/crm/v3/properties/contacts';
const LEAD_SOURCE_PROP = 'lead_source_form';
const ADMIN_EMAIL = 'team@m2mstrategists.com';
const FROM_EMAIL = 'M2M Strategists <team@m2mstrategists.com>';

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstname: parts[0] || '',
    lastname: parts.slice(1).join(' '),
  };
}

async function sendEmail(apiKey, payload) {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
  }
  return res;
}

function hubspotHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function hubspotUpsert(token, email, properties) {
  return fetch(HUBSPOT_URL, {
    method: 'POST',
    headers: hubspotHeaders(token),
    body: JSON.stringify({
      inputs: [{ id: email, idProperty: 'email', properties }],
    }),
  });
}

// Creates the custom contact property the first time it is needed, so no manual
// HubSpot setup is required. 409 = already exists, which is fine.
async function createLeadSourceProperty(token) {
  const res = await fetch(HUBSPOT_PROPS_URL, {
    method: 'POST',
    headers: hubspotHeaders(token),
    body: JSON.stringify({
      name: LEAD_SOURCE_PROP,
      label: 'Lead source (website form)',
      type: 'string',
      fieldType: 'text',
      groupName: 'contactinformation',
      description:
        'Which m2mstrategists.com form the contact last submitted: contact, keep-in-touch or book-enquiry.',
    }),
  });
  if (!res.ok && res.status !== 409) {
    console.error('HubSpot property create error', res.status, await res.text());
    return false;
  }
  return true;
}

async function upsertHubspotContact(token, { email, name, company, phone, formName }) {
  const { firstname, lastname } = splitName(name);
  const base = {
    email,
    firstname: firstname || undefined,
    lastname: lastname || undefined,
    company: company || undefined,
    phone: phone || undefined,
  };

  let res = await hubspotUpsert(token, email, { ...base, [LEAD_SOURCE_PROP]: formName });
  if (res.ok) return res;

  let errText = await res.text();
  if (res.status === 400 && errText.includes(LEAD_SOURCE_PROP)) {
    if (await createLeadSourceProperty(token)) {
      res = await hubspotUpsert(token, email, { ...base, [LEAD_SOURCE_PROP]: formName });
      if (res.ok) return res;
      errText = await res.text();
    }
    // Never lose the lead over the source stamp — capture the core details anyway.
    res = await hubspotUpsert(token, email, base);
    if (res.ok) {
      console.error('HubSpot: contact saved without lead source', errText);
      return res;
    }
  }
  console.error('HubSpot error', res.status, await res.text().catch(() => errText));
  return res;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Wraps the plain-text body in the site's branding: cream ground, coral rule,
// M2M badge, dark text, contact footer. The text version is still sent alongside.
function brandedHtml(bodyText) {
  const paragraphs = bodyText
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p style="margin:0 0 16px; font-family:Helvetica,Arial,sans-serif; font-size:15px; line-height:1.6; color:#1A1A1A;">${escapeHtml(line)}</p>`)
    .join('\n');

  return [
    '<div style="background:#F9F7F4; padding:32px 16px;">',
    '  <div style="max-width:560px; margin:0 auto; background:#FFFFFF; border-top:4px solid #C25D45; padding:40px 40px 32px;">',
    '    <img src="https://www.m2mstrategists.com/assets/images/m2m-badge.png" alt="M2M Growth, AI &amp; Exit Strategists" width="72" style="display:block; margin:0 0 28px;">',
    paragraphs,
    '  </div>',
    '  <div style="max-width:560px; margin:0 auto; padding:20px 40px 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; line-height:1.7; color:#806339;">',
    '    <p style="margin:0;">M2M Business Growth, AI &amp; Exit Strategists LLC</p>',
    '    <p style="margin:0;">Tornado Tower, Floor 22, West Bay, Doha, Qatar</p>',
    '    <p style="margin:0;"><a href="mailto:team@m2mstrategists.com" style="color:#AA513C;">team@m2mstrategists.com</a> &middot; <a href="https://www.m2mstrategists.com" style="color:#AA513C;">www.m2mstrategists.com</a></p>',
    '  </div>',
    '</div>',
  ].join('\n');
}

// Per-form email copy. Any form not listed falls back to the contact wording.
function emailCopy(formName, firstName) {
  if (formName === 'keep-in-touch') {
    return {
      adminSubject: (name) => `Keep-in-touch sign-up from ${name || 'the framework page'}`,
      clientSubject: "You're on the list — M2M Strategists",
      clientBody: [
        `Hello ${firstName || 'there'},`,
        '',
        'Thank you for signing up to keep in touch with M2M Growth, AI & Exit Strategists. From time to time we will send you practical material to help you move your business up the levels of the Miner to Millionaire (M2M) Framework.',
        '',
        'When you are ready to accelerate, our M2M Growth, AI & Exit Audit is the place to start.',
        '',
        'All the best,',
        '',
        'The Team at M2M Strategists',
      ].join('\n'),
    };
  }
  if (formName === 'book-enquiry') {
    return {
      adminSubject: (name) => `Book enquiry from ${name || 'the framework page'}`,
      clientSubject: "Miner to Millionaire — you're on the list",
      clientBody: [
        `Hello ${firstName || 'there'},`,
        '',
        "Thank you for your interest in 'Miner to Millionaire' - the book, by Paul Hopewell. It is currently under development and you are now on the list. We will be sure to let you know as soon as it launches!",
        '',
        'All the best,',
        '',
        'The Team at M2M Strategists',
      ].join('\n'),
    };
  }
  return {
    adminSubject: (name) => `Website enquiry from ${name || 'the contact form'}`,
    clientSubject: 'Thanks for reaching out to M2M Strategists',
    clientBody: [
      `Hello ${firstName || 'there'},`,
      '',
      "Thank you for getting in touch with M2M Strategists. We've received your message and someone from the team will be in touch soon!",
      '',
      'All the best,',
      '',
      'The Team at M2M Strategists',
    ].join('\n'),
  };
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const data = (body.payload && body.payload.data) || {};
    const formName = (body.payload && body.payload.form_name) || data['form-name'] || 'contact';

    if (data['bot-field']) {
      return { statusCode: 200, body: 'ignored: honeypot' };
    }

    const email = (data.email || '').trim();
    if (!email) {
      return { statusCode: 200, body: 'ignored: no email' };
    }

    const name = data.name || '';
    const company = data.company || '';
    const phone = data.phone || '';
    const message = data.message || '';

    const resendKey = process.env.RESEND_API_KEY;
    const hubspotToken = process.env.HUBSPOT_TOKEN;

    const copy = emailCopy(formName, name ? name.split(/\s+/)[0] : '');
    const tasks = [];

    if (resendKey) {
      tasks.push(
        sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: copy.adminSubject(name),
          text: [
            `Form: ${formName}`,
            `Name: ${name}`,
            `Company: ${company}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            '',
            message,
          ].join('\n'),
        })
      );

      tasks.push(
        sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: email,
          subject: copy.clientSubject,
          text: copy.clientBody,
          html: brandedHtml(copy.clientBody),
        })
      );
    } else {
      console.error('RESEND_API_KEY not set; skipping emails');
    }

    if (hubspotToken) {
      tasks.push(upsertHubspotContact(hubspotToken, { email, name, company, phone, formName }));
    } else {
      console.error('HUBSPOT_TOKEN not set; skipping HubSpot upsert');
    }

    await Promise.all(tasks);

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('submission-created failed', err);
    // Always 200 — this runs after the visitor's submission already succeeded.
    return { statusCode: 200, body: 'error logged' };
  }
};
