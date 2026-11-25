import React, { useCallback, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { buildWhatsAppUrl, formatWhatsAppDisplay, WHATSAPP_TEMPLATES } from '../lib/whatsapp';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function BusinessLocationMap({
  lat,
  lng,
  address,
}: {
  lat: number;
  lng: number;
  address: string;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);
  const handleClose = useCallback(() => setInfoOpen(false), []);

  if (!MAPS_API_KEY) {
    return (
      <div className="w-full h-[380px] rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-8 h-8 text-blue-700 mb-2" />
        <div className="text-sm font-semibold text-slate-900">
          Bahawalpur, Punjab, Pakistan ({lat.toFixed(4)}, {lng.toFixed(4)})
        </div>
        <p className="mt-1 text-xs text-slate-600 max-w-md">
          Google Maps interactive preview renders when <code>VITE_GOOGLE_MAPS_API_KEY</code> is available in the environment.
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['marker']}
      language="en"
      region="PK"
    >
      <div className="w-full h-[380px] rounded-xl overflow-hidden border border-slate-200">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat, lng }}
          center={{ lat, lng }}
          defaultZoom={13}
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <AdvancedMarker
            ref={markerRef}
            position={{ lat, lng }}
            onClick={() => setInfoOpen(true)}
            title="Digital E-Commerce by ASIF — Bahawalpur"
          >
            <Pin background="#1D4ED8" borderColor="#0B162C" glyphColor="#FFFFFF" />
          </AdvancedMarker>
          {infoOpen && marker && (
            <InfoWindow anchor={marker} onCloseClick={handleClose} maxWidth={240}>
              <div className="text-xs text-slate-900 space-y-1 p-1">
                <div className="font-bold">Digital E-Commerce by ASIF</div>
                <div className="text-slate-600">{address}</div>
                <div className="text-slate-500">Bahawalpur, Punjab, Pakistan</div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}

export function ContactPage() {
  const { siteSettings, submitContactMessage, user } = useApp();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContactMessage({ name, email, whatsapp, subject, message });
      setSentOk(true);
      setSubject('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const whatsappDisplay = formatWhatsAppDisplay(siteSettings.whatsappNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <SeoHead
        title="Contact Us | WhatsApp 0300-6316551 — Digital E-Commerce by ASIF, Bahawalpur"
        description="Contact Digital E-Commerce by ASIF in Bahawalpur on WhatsApp 0300-6316551 or digital.solution.by.asif@gmail.com for direct orders, course admissions, and home tuition."
        keywords="contact Digital E-Commerce by ASIF, Bahawalpur WhatsApp 03006316551, digital.solution.by.asif@gmail.com"
      />
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Reach Digital E-Commerce by ASIF in Bahawalpur for orders, online skills courses, home tuition, or exam preparation support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Details + Map */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Business Information</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Business Name: </span>
                Digital E-Commerce by ASIF
              </div>
              <div>
                <span className="font-semibold text-slate-900">City & Country: </span>
                Bahawalpur, Punjab, Pakistan
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-slate-900">Address: </span>
                  {siteSettings.businessAddress}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">WhatsApp: </span>
                  {whatsappDisplay}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Email: </span>
                  {siteSettings.businessEmail}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">Phone: </span>
                  {siteSettings.businessPhone}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3">
              <a
                href={buildWhatsAppUrl(siteSettings.whatsappNumber, WHATSAPP_TEMPLATES.generalContact())}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Business Location Map (Bahawalpur, Pakistan)
              </h2>
              <span className="text-xs text-slate-500">Editable in Admin Settings</span>
            </div>
            <BusinessLocationMap
              lat={siteSettings.mapLat}
              lng={siteSettings.mapLng}
              address={siteSettings.businessAddress}
            />
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-display text-xl font-bold text-slate-900">Send a Message</h2>
          <p className="text-xs text-slate-600">
            Have a question about an order, syllabus, or home tutor availability? Send us a message directly.
          </p>

          {sentOk && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-medium rounded-lg">
              Your inquiry has been saved! Our team will reach out shortly.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Course inquiry / Order help / Tuition"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
