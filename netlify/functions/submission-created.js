// Fires automatically after every Netlify Forms submission on this site
// (naming convention: https://docs.netlify.com/forms/notifications/#trigger-a-function).
// Emails the enquiry to the team, auto-replies to the sender, and upserts the
// contact into HubSpot.

const RESEND_URL = 'https://api.resend.com/emails';
const HUBSPOT_URL = 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert';
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

async function upsertHubspotContact(token, { email, name, company, phone }) {
  const { firstname, lastname } = splitName(name);
  const res = await fetch(HUBSPOT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [
        {
          id: email,
          idProperty: 'email',
          properties: {
            email,
            firstname: firstname || undefined,
            lastname: lastname || undefined,
            company: company || undefined,
            phone: phone || undefined,
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    console.error('HubSpot error', res.status, await res.text());
  }
  return res;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const data = (body.payload && body.payload.data) || {};

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

    const tasks = [];

    if (resendKey) {
      tasks.push(
        sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: `Website enquiry from ${name || 'the contact form'}`,
          text: [
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
          subject: 'Thanks for reaching out to M2M Strategists',
          text: [
            `Hi ${name ? name.split(/\s+/)[0] : 'there'},`,
            '',
            "Thank you for getting in touch with M2M Growth, AI & Exit Strategists. We've received your message and our founder, Paul, will be in touch shortly.",
            '',
            'Best,',
            'The M2M Team',
          ].join('\n'),
        })
      );
    } else {
      console.error('RESEND_API_KEY not set; skipping emails');
    }

    if (hubspotToken) {
      tasks.push(upsertHubspotContact(hubspotToken, { email, name, company, phone }));
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
