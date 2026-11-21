import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { readBoolean, readTextOr, type BlockData } from '../../../lib/homeBlock';
import { SeliaSection } from './SeliaSection';

/**
 * `home.selia-contact-form` — the store's message form.
 *
 * Selia posts the form to **Web3Forms**, a third-party relay, with a key the
 * merchant pastes in. That is kept, because it is the only way a static store
 * theme can receive mail without a backend — but the failure modes around it
 * are fixed here, because the original has two that lose real customers:
 *
 *  - **A form with no key looks like it worked.** Selia submits, Web3Forms
 *    answers `403`, and the block still shows the success message. Here a
 *    missing key or recipient is detected *before* rendering the form: the
 *    block shows the store's e-mail as a copyable address plate instead, so
 *    the customer has a route that actually reaches the merchant rather than a
 *    confirmation for a message nobody will ever read.
 *  - **The form validates nothing and says nothing.** Here the fields are
 *    required, the e-mail is checked for shape, errors are announced inline
 *    next to the field they belong to (`aria-invalid` + `aria-describedby`),
 *    the button is disabled while sending, and a network failure says so
 *    instead of pretending to succeed.
 *
 * A honeypot (`botcheck`) is included because the endpoint is public and the
 * relay's own spam filter is not enough on its own. It is hidden from sight
 * and from screen readers, and never validated — a human simply leaves it
 * empty.
 *
 * ── Layout ────────────────────────────────────────────────────────────────
 * The heading lives *inside* the block's own panel rather than in the shared
 * `SeliaSection` head. A contact block is a destination, not a strip in a
 * feed: the merchant's title is the first thing inside the card, next to the
 * address they can write to, so the two answer the same question in one
 * glance. Every other block keeps the shared head — this one opts out on
 * purpose and passes no `title`/`subtitle` up.
 */
const PREFIX = 'contact';
const ENDPOINT = 'https://api.web3forms.com/submit';
/** Counter ceiling. A support message longer than this is a phone call. */
const MESSAGE_LIMIT = 600;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/* ── icons ──────────────────────────────────────────────────────────────────
   Inline, not `sicon-*`: the theme font draws these at a stroke weight that
   changes with the size, so a 16px glyph next to 14px labels comes out either
   heavy or hairline. One `stroke-width` here keeps the row optically even. */
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

type IconName = 'mail' | 'phone' | 'clock' | 'send' | 'check' | 'copy' | 'spinner' | 'user' | 'pen' | 'alert';

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const style = { width: size, height: size, display: 'block' } as const;
  switch (name) {
    case 'alert':
      return (
        <svg {...svgProps} style={style}>
          <circle cx="12" cy="12" r="8.6" />
          <path d="M12 7.8v5" />
          <path d="M12 16.1h.01" />
        </svg>
      );
    case 'user':
      return (
        <svg {...svgProps} style={style}>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.9 20.3a7.2 7.2 0 0 1 14.2 0" />
        </svg>
      );
    case 'pen':
      return (
        <svg {...svgProps} style={style}>
          <path d="M4.2 19.8h3.9L19.7 8.2a2.6 2.6 0 0 0-3.7-3.7L4.6 16.1l-.4 3.7Z" />
          <path d="m14.9 6.1 3.2 3.2" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...svgProps} style={style}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m3.8 7.2 7.3 5.2a1.6 1.6 0 0 0 1.8 0l7.3-5.2" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...svgProps} style={style}>
          <path d="M6.2 3.5h2.6l1.5 3.7-1.9 1.4a12.4 12.4 0 0 0 5.5 5.5l1.4-1.9 3.7 1.5v2.6a2 2 0 0 1-2.2 2A16.3 16.3 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...svgProps} style={style}>
          <circle cx="12" cy="12" r="8.6" />
          <path d="M12 7.4V12l3.1 1.9" />
        </svg>
      );
    case 'send':
      return (
        <svg {...svgProps} style={style}>
          <path d="M4.5 12h14" />
          <path d="m12.8 6 6 6-6 6" />
        </svg>
      );
    case 'check':
      return (
        <svg {...svgProps} style={style} strokeWidth={2.1}>
          <path d="m5 12.6 4.6 4.5L19 7.4" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...svgProps} style={style}>
          <rect x="9" y="9" width="11.5" height="11.5" rx="2.4" />
          <path d="M15.2 5.4A2.4 2.4 0 0 0 12.8 3H6.4A2.4 2.4 0 0 0 4 5.4v6.4a2.4 2.4 0 0 0 2.4 2.4" />
        </svg>
      );
    case 'spinner':
      return (
        <svg {...svgProps} style={style}>
          <circle cx="12" cy="12" r="8.6" opacity="0.28" />
          <path d="M20.6 12a8.6 8.6 0 0 0-8.6-8.6" />
        </svg>
      );
  }
}

export function ContactForm({ data }: { data: BlockData }) {
  const { t } = useTranslation();
  const title = readTextOr(data, 'title', PREFIX, '');
  const subtitle = readTextOr(data, 'subtitle', PREFIX, '');
  const success = readTextOr(data, 'success_message', PREFIX, 'وصلتنا رسالتك، وسنعاود التواصل معك قريبًا.');
  const email = readTextOr(data, 'recipient', PREFIX, '').trim();
  const accessKey = readTextOr(data, 'access_key', PREFIX, '').trim();
  const layout = readTextOr(data, 'layout', PREFIX, 'split');
  const fullWidth = readBoolean(data, 'full_width', PREFIX, false);
  const phone = readTextOr(data, 'phone', PREFIX, '').trim();
  const hours = readTextOr(data, 'hours', PREFIX, '').trim();
  const privacy = readTextOr(data, 'privacy_note', PREFIX, '').trim();

  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [length, setLength] = useState(0);
  const [copied, setCopied] = useState(false);

  /* Two instances of this block on one page would otherwise share field ids,
     and every `<label for>` would point at the first copy's input. */
  const uid = useId();
  const id = (part: string) => `selia-contact-${uid}-${part}`;

  // No key, no relay: fall back to a real `mailto:` rather than a form that
  // cannot deliver. `recipient` is the merchant's own address, so this path
  // still reaches them — it just opens their mail app instead of a POST.
  const configured = !!accessKey && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const rows = [
    email && { key: 'mail', icon: 'mail' as const, label: 'البريد الإلكتروني', value: email, href: `mailto:${email}`, ltr: true },
    phone && { key: 'phone', icon: 'phone' as const, label: 'الهاتف', value: phone, href: `tel:${phone.replace(/[^\d+]/g, '')}`, ltr: true },
    hours && { key: 'hours', icon: 'clock' as const, label: 'ساعات العمل', value: hours, href: '', ltr: false },
  ].filter(Boolean) as Array<{ key: string; icon: IconName; label: string; value: string; href: string; ltr: boolean }>;

  const hasAside = !!(title || subtitle || rows.length);
  const stacked = layout !== 'split';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const mail = String(formData.get('email') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    const next: Errors = {};
    if (!name) next.name = 'اكتب اسمك من فضلك.';
    if (!mail) next.email = 'اكتب بريدك الإلكتروني من فضلك.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) next.email = 'صيغة البريد غير صحيحة.';
    if (!message) next.message = 'اكتب رسالتك من فضلك.';

    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    setState('sending');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `رسالة من ${name} — ${document.title}`,
          from_name: name,
          email: mail,
          message,
          botcheck: formData.get('botcheck') ?? '',
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error('relay rejected the message');
      setState('sent');
      setLength(0);
      form.reset();
    } catch {
      setState('failed');
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* Clipboard blocked (insecure context / denied): the address is already
         selectable text on screen, so there is nothing to recover from. */
    }
  }

  const field = (name: 'name' | 'email' | 'message') => ({
    invalid: (errors[name] ? 'true' : 'false') as 'true' | 'false',
    describedBy: errors[name] ? id(`${name}-error`) : undefined,
  });

  return (
    <SeliaSection variant="contact" bleed={fullWidth}>
      <div
        className="selia-contact"
        data-layout={stacked ? 'stacked' : 'split'}
        data-bare={hasAside ? '0' : '1'}
        data-mode={configured ? 'form' : 'direct'}
      >
        <span className="selia-contact__glow" aria-hidden="true" />

        {hasAside && (
          <aside className="selia-contact__aside">
            <span className="selia-contact__seal" aria-hidden="true">
              <Icon name="mail" size={20} />
            </span>

            {title && <h2 className="selia-contact__title">{title}</h2>}
            {subtitle && <p className="selia-contact__lede">{subtitle}</p>}
            {(title || subtitle) && <span className="selia-contact__rule" aria-hidden="true" />}

            {rows.length > 0 && (
              <ul className="selia-contact__rows">
                {rows.map((row) => (
                  <li className="selia-contact__row" key={row.key}>
                    <span className="selia-contact__ico" aria-hidden="true">
                      <Icon name={row.icon} />
                    </span>
                    <span className="selia-contact__rowtext">
                      <span className="selia-contact__rowlabel">{row.label}</span>
                      {row.href ? (
                        <a className="selia-contact__rowvalue" href={row.href} dir={row.ltr ? 'ltr' : undefined}>
                          {row.value}
                        </a>
                      ) : (
                        <span className="selia-contact__rowvalue">{row.value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}

        <div className="selia-contact__panel">
          {configured ? (
            state === 'sent' ? (
              <div className="selia-contact__done" role="status">
                <span className="selia-contact__check" aria-hidden="true">
                  <Icon name="check" size={30} />
                </span>
                <p className="selia-contact__donetitle">{success}</p>
                <button className="selia-cta selia-cta--ghost" type="button" onClick={() => setState('idle')}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form className="selia-contact__form" onSubmit={onSubmit} noValidate>
                <div className="selia-field">
                  <div className="selia-field__box">
                    <label className="selia-field__label" htmlFor={id('name')}>
                      <Icon name={errors.name ? 'alert' : 'user'} size={13} />
                      الاسم
                    </label>
                    <input
                      id={id('name')}
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="selia-field__input"
                      placeholder="مثال: نورة العتيبي"
                      aria-invalid={field('name').invalid}
                      aria-describedby={field('name').describedBy}
                    />
                  </div>
                  {errors.name && (
                    <p className="selia-field__error" id={id('name-error')}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="selia-field">
                  <div className="selia-field__box">
                    <label className="selia-field__label" htmlFor={id('email')}>
                      <Icon name={errors.email ? 'alert' : 'mail'} size={13} />
                      البريد الإلكتروني
                    </label>
                    <input
                      id={id('email')}
                      name="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      className="selia-field__input"
                      placeholder="name@example.com"
                      aria-invalid={field('email').invalid}
                      aria-describedby={field('email').describedBy}
                    />
                  </div>
                  {errors.email && (
                    <p className="selia-field__error" id={id('email-error')}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="selia-field selia-field--wide">
                  <div className="selia-field__box selia-field__box--area">
                    <label className="selia-field__label" htmlFor={id('message')}>
                      <Icon name={errors.message ? 'alert' : 'pen'} size={13} />
                      رسالتك
                    </label>
                    <textarea
                      id={id('message')}
                      name="message"
                      rows={4}
                      maxLength={MESSAGE_LIMIT}
                      className="selia-field__input selia-field__input--area"
                      placeholder="اكتب تفاصيل طلبك أو سؤالك…"
                      onChange={(event) => setLength(event.currentTarget.value.length)}
                      aria-invalid={field('message').invalid}
                      aria-describedby={field('message').describedBy}
                    />
                    <span className="selia-field__count" dir="ltr" aria-hidden="true">
                      {length} / {MESSAGE_LIMIT}
                    </span>
                  </div>
                  {errors.message && (
                    <p className="selia-field__error" id={id('message-error')}>
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* honeypot — off-screen, not `display:none` (some bots skip those),
                    and `aria-hidden` + `tabIndex=-1` so no keyboard user lands on it */}
                <input
                  className="selia-contact__trap"
                  type="text"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="selia-contact__actions">
                  <button className="selia-cta selia-cta--solid selia-contact__send" type="submit" disabled={state === 'sending'}>
                    <span>{state === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}</span>
                    <span className="selia-contact__sendico" aria-hidden="true">
                      <Icon name={state === 'sending' ? 'spinner' : 'send'} size={17} />
                    </span>
                  </button>
                  {privacy && <p className="selia-contact__privacy">{privacy}</p>}
                  <p className="selia-contact__status" role="status" aria-live="polite">
                    {state === 'failed' ? 'تعذّر الإرسال الآن. جرّب مرة أخرى بعد قليل.' : ''}
                  </p>
                </div>
              </form>
            )
          ) : (
            <div className="selia-contact__direct">
              <p className="selia-contact__directlede">
                {email ? 'راسلنا مباشرة، ونرد على كل رسالة في أقرب وقت.' : 'أضف بريدًا لاستقبال الرسائل من لوحة التحكم ليظهر هنا.'}
              </p>

              {email && (
                <div className="selia-contact__plate">
                  <span className="selia-contact__platecap">إلى</span>
                  <a className="selia-contact__addr" href={`mailto:${email}`} dir="ltr">
                    {email}
                  </a>
                  <button className="selia-contact__copy" type="button" onClick={copyAddress} aria-label={t('blocks.selia.copy_email', 'نسخ البريد الإلكتروني')}>
                    <Icon name={copied ? 'check' : 'copy'} size={15} />
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              )}

              <div className="selia-contact__pair">
                {email && (
                  <a className="selia-cta selia-cta--solid selia-contact__send" href={`mailto:${email}`}>
                    <span>افتح تطبيق البريد</span>
                    <span className="selia-contact__sendico" aria-hidden="true">
                      <Icon name="send" size={17} />
                    </span>
                  </a>
                )}

                {/* The phone is already a row on the aside, but a `tel:` tap
                    target is the whole point of that row on a phone — the
                    second action repeats it where the thumb already is. */}
                {phone && (
                  <a className="selia-cta selia-cta--ghost selia-contact__send selia-contact__send--ghost" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                    <span>اتصل بنا</span>
                    <span className="selia-contact__sendico" aria-hidden="true">
                      <Icon name="phone" size={16} />
                    </span>
                  </a>
                )}
              </div>

              {privacy && <p className="selia-contact__privacy">{privacy}</p>}

              <span className="selia-visually-hidden" role="status" aria-live="polite">
                {copied ? 'تم نسخ البريد الإلكتروني' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </SeliaSection>
  );
}
