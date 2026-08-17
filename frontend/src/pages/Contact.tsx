import { useState, type FormEvent } from 'react';
import { CheckCircle, Envelope, MapPin, Phone, WarningCircle } from '@phosphor-icons/react';
import { PageHeader } from '../components/landing/PageHeader';
import { useSection } from '../hooks/useSiteSettings';
import { usePageMeta } from '../hooks/usePageMeta';
import { siteDefaults } from '../data/siteDefaults';
import { contact } from '../services/api';
import { errMsg } from '../lib/utils';

export function Contact() {
  usePageMeta(
    'Contact Us',
    'Get in touch with PENSA-UENR — find us at UENR, Sunyani, or reach us by phone and email.',
    '/contact',
  );
  const data = useSection('contact', siteDefaults.contact);
  const header = data.header ?? siteDefaults.contact.header;
  const contactDetails = [
    { icon: <MapPin size={20} />, label: 'Address', value: data.address },
    { icon: <Phone size={20} />, label: 'Hotline', value: data.phone },
    { icon: <Envelope size={20} />, label: 'Email', value: data.email },
  ];
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await contact.send({
        name: String(data.get('name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        subject: String(data.get('subject') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
      });
      form.reset();
      setSubmitted(true);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        backgroundImage={data.backgroundImage}
      />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1120px] px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-[0.9fr_1.1fr] gap-10">
          <div>
            <h2 className="mb-6 font-display font-extrabold text-ink text-2xl md:text-3xl leading-tight">
              Contact details
            </h2>
            <div className="space-y-4">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center gap-4 border border-ink/15 rounded-[18px] px-6 py-5"
                >
                  <span
                    className="w-[48px] h-[48px] rounded-[14px] bg-royal/12 grid place-items-center text-royal flex-shrink-0"
                    aria-hidden="true"
                  >
                    {detail.icon}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-ink-soft">
                      {detail.label}
                    </p>
                    <p className="font-semibold text-ink">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-ink border border-ink-3 rounded-[18px] px-8 py-10 md:px-10">
            <h2 className="mb-6 font-display font-extrabold text-white text-2xl md:text-3xl leading-tight">
              Send us a message
            </h2>
            {submitted ? (
              <div className="rounded-[14px] bg-royal/15 border border-royal-400/40 px-6 py-6 text-white">
                <p className="flex items-center gap-2 font-display font-extrabold mb-1">
                  <CheckCircle size={18} weight="bold" /> Thank you!
                </p>
                <p className="text-white/80">
                  Your message has been received. The executive committee will get back to you
                  soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-bold text-accent-cream hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-sm font-bold text-white/85">
                      Your name
                    </label>
                    <input
                      id="c-name"
                      name="name"
                      type="text"
                      placeholder="Full name"
                      required
                      className="w-full rounded-[12px] border border-white/20 bg-ink-2 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent-cream focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-sm font-bold text-white/85">
                      Email
                    </label>
                    <input
                      id="c-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-[12px] border border-white/20 bg-ink-2 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent-cream focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-subject" className="mb-1.5 block text-sm font-bold text-white/85">
                    Subject
                  </label>
                  <input
                    id="c-subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    required
                    className="w-full rounded-[12px] border border-white/20 bg-ink-2 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent-cream focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="c-message" className="mb-1.5 block text-sm font-bold text-white/85">
                    Message
                  </label>
                  <textarea
                    id="c-message"
                    name="message"
                    rows={5}
                    placeholder="Write your message..."
                    required
                    className="w-full rounded-[12px] border border-white/20 bg-ink-2 px-4 py-3 text-white placeholder:text-white/40 focus:border-accent focus:outline-none resize-none"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2.5 bg-danger/15 border border-danger/40 text-white rounded-[12px] px-4 py-3 text-sm">
                    <WarningCircle size={18} className="shrink-0 mt-0.5" />
                    <span>
                      <span className="font-bold">Message not sent.</span>{' '}
                      {error}
                    </span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary inline-flex items-center justify-center rounded-full bg-accent-cream text-ink px-7 py-3.5 font-display font-extrabold text-[15px] hover:bg-accent-cream-hover transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}