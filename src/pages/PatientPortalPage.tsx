import { type FormEvent, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Mic, MicOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const languageOptions = [
  { name: "English", native: "English", code: "en-IN" },
  { name: "Hindi", native: "हिंदी", code: "hi-IN" },
  { name: "Tamil", native: "தமிழ்", code: "ta-IN" },
  { name: "Telugu", native: "తెలుగు", code: "te-IN" },
  { name: "Marathi", native: "मराठी", code: "mr-IN" },
  { name: "Bengali", native: "বাংলা", code: "bn-IN" },
  { name: "Gujarati", native: "ગુજરાતી", code: "gu-IN" },
  { name: "Kannada", native: "ಕನ್ನಡ", code: "kn-IN" },
  { name: "Malayalam", native: "മലയാളം", code: "ml-IN" },
  { name: "Punjabi", native: "ਪੰਜਾਬੀ", code: "pa-IN" },
];

type FormState = {
  name: string;
  age: number;
  phone: string;
  aadhaar: string;
  language: string;
  symptoms: string;
};

type StepKey = "name" | "age" | "phone" | "aadhaar" | "symptoms";

type VoiceCopy = {
  intro: string;
  prompts: Record<StepKey, string>;
  noInputRetry: string;
  invalidPhone: string;
  invalidAadhaar: string;
  captured: (label: string, value: string) => string;
  completed: string;
};

type SpeechRecognitionType = {
  start: () => void;
  stop: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionType;
};

export function PatientPortalPage() {
  const { registerPatient } = useAppContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"select" | "voice" | "manual">("select");
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStepIndex, setVoiceStepIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ token: string; doctorName: string; department: string; severity: number } | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", age: 0, phone: "", aadhaar: "", language: languageOptions[0].name, symptoms: "" });
  const sessionRef = useRef(0);

  const steps = useMemo(
    () => [
      { key: "name" as const, label: "Name", timeout: 9000 },
      { key: "age" as const, label: "Age", timeout: 8000 },
      { key: "phone" as const, label: "Phone", timeout: 12000 },
      { key: "aadhaar" as const, label: "Aadhaar", timeout: 14000 },
      { key: "symptoms" as const, label: "Symptoms", timeout: 12000 },
    ],
    [],
  );

  const activeStep = steps[voiceStepIndex];

  const voiceCopy = useMemo<VoiceCopy>(() => {
    const packs: Record<string, VoiceCopy> = {
      English: {
        intro: "Voice registration started. I will ask each detail one by one.",
        prompts: {
          name: "Please tell me your name.",
          age: "Please tell me your age in years.",
          phone: "Please tell your 10 digit phone number.",
          aadhaar: "Please tell your 12 digit Aadhaar number.",
          symptoms: "Please describe your symptoms.",
        },
        noInputRetry: "I could not hear you clearly. Please say it again.",
        invalidPhone: "Phone number must be 10 digits. Please say the phone number again.",
        invalidAadhaar: "Aadhaar must be 12 digits. Please say the Aadhaar number again.",
        captured: (label, value) => `I have filled ${label} as ${value}.`,
        completed: "Voice registration completed. Please review your details.",
      },
      Hindi: {
        intro: "Voice registration shuru ho gaya hai. Main ek ek detail poochunga.",
        prompts: {
          name: "Kripya apna naam batayein.",
          age: "Kripya apni umr batayein.",
          phone: "Kripya 10 ank ka phone number batayein.",
          aadhaar: "Kripya 12 ank ka Aadhaar number batayein.",
          symptoms: "Kripya apne lakshan batayein.",
        },
        noInputRetry: "Awaaz clear nahi aayi. Kripya dobara boliye.",
        invalidPhone: "Phone number 10 ank ka hona chahiye. Kripya dobara boliye.",
        invalidAadhaar: "Aadhaar 12 ank ka hona chahiye. Kripya dobara boliye.",
        captured: (label, value) => `${label} ${value} fill kar diya gaya hai.`,
        completed: "Voice registration poora ho gaya. Kripya details check karein.",
      },
      Tamil: {
        intro: "Voice registration தொடங்கியது. நான் ஒவ்வொரு விவரத்தையும் கேட்கிறேன்.",
        prompts: {
          name: "தயவுசெய்து உங்கள் பெயரை சொல்லுங்கள்.",
          age: "தயவுசெய்து உங்கள் வயதை சொல்லுங்கள்.",
          phone: "தயவுசெய்து 10 இலக்க தொலைபேசி எண்ணை சொல்லுங்கள்.",
          aadhaar: "தயவுசெய்து 12 இலக்க ஆதார் எண்ணை சொல்லுங்கள்.",
          symptoms: "தயவுசெய்து உங்கள் அறிகுறிகளை சொல்லுங்கள்.",
        },
        noInputRetry: "உங்கள் குரல் தெளிவாக இல்லை. மீண்டும் சொல்லுங்கள்.",
        invalidPhone: "தொலைபேசி எண் 10 இலக்கமாக இருக்க வேண்டும். மீண்டும் சொல்லுங்கள்.",
        invalidAadhaar: "ஆதார் எண் 12 இலக்கமாக இருக்க வேண்டும். மீண்டும் சொல்லுங்கள்.",
        captured: (label, value) => `${label} ${value} பதிவு செய்யப்பட்டது.`,
        completed: "Voice registration முடிந்தது. விவரங்களை சரிபார்க்கவும்.",
      },
      Telugu: {
        intro: "Voice registration prarambham ayyindi. Nenu details okkati okkati adugutanu.",
        prompts: {
          name: "Dayachesi mee peru cheppandi.",
          age: "Dayachesi mee vayasu cheppandi.",
          phone: "Dayachesi 10 ankel phone number cheppandi.",
          aadhaar: "Dayachesi 12 ankel Aadhaar number cheppandi.",
          symptoms: "Dayachesi mee lakshanalu cheppandi.",
        },
        noInputRetry: "Mee voice clear ga vinipinchaledu. Malli cheppandi.",
        invalidPhone: "Phone number 10 ankel undali. Malli cheppandi.",
        invalidAadhaar: "Aadhaar 12 ankel undali. Malli cheppandi.",
        captured: (label, value) => `${label} ${value} fill chesanu.`,
        completed: "Voice registration ayipoyindi. Dayachesi details check cheyandi.",
      },
      Marathi: {
        intro: "Voice registration suru zhale aahe. Mi ek ek mahiti vicharen.",
        prompts: {
          name: "Krupaya tumche nav sanga.",
          age: "Krupaya tumche vay sanga.",
          phone: "Krupaya 10 anki phone number sanga.",
          aadhaar: "Krupaya 12 anki Aadhaar number sanga.",
          symptoms: "Krupaya tumchi lakshane sanga.",
        },
        noInputRetry: "Tumcha awaaz spasht ala nahi. Krupaya punha sanga.",
        invalidPhone: "Phone number 10 ankicha pahije. Krupaya punha sanga.",
        invalidAadhaar: "Aadhaar 12 ankicha pahije. Krupaya punha sanga.",
        captured: (label, value) => `${label} ${value} bharla aahe.`,
        completed: "Voice registration purna zhale. Krupaya details tapasaa.",
      },
      Bengali: {
        intro: "Voice registration shuru hoyeche. Ami ek ek kore proshno korbo.",
        prompts: {
          name: "Doya kore apnar naam bolun.",
          age: "Doya kore apnar boyosh bolun.",
          phone: "Doya kore 10 digit phone number bolun.",
          aadhaar: "Doya kore 12 digit Aadhaar number bolun.",
          symptoms: "Doya kore apnar lokkho bolun.",
        },
        noInputRetry: "Ami bhalo kore shunte parini. Abar bolun.",
        invalidPhone: "Phone number 10 digit hote hobe. Abar bolun.",
        invalidAadhaar: "Aadhaar 12 digit hote hobe. Abar bolun.",
        captured: (label, value) => `${label} ${value} bhora hoyeche.`,
        completed: "Voice registration shesh. Doya kore details check korun.",
      },
      Gujarati: {
        intro: "Voice registration sharu thayu chhe. Hu ek pachi ek detail puchish.",
        prompts: {
          name: "Krupa kari tamaru naam bolo.",
          age: "Krupa kari tamari umar bolo.",
          phone: "Krupa kari 10 anko no phone number bolo.",
          aadhaar: "Krupa kari 12 anko no Aadhaar number bolo.",
          symptoms: "Krupa kari tamara lakshano bolo.",
        },
        noInputRetry: "Tamaro awaaz spasht nathi. Krupa kari fari bolo.",
        invalidPhone: "Phone number 10 anko no hovo joie. Fari bolo.",
        invalidAadhaar: "Aadhaar 12 anko no hovo joie. Fari bolo.",
        captured: (label, value) => `${label} ${value} bhari didhu chhe.`,
        completed: "Voice registration purn thayu. Krupa kari details check karo.",
      },
      Kannada: {
        intro: "Voice registration prarambha aagide. Naanu ondu ondu vivara keluttene.",
        prompts: {
          name: "Dayavittu nimma hesaru heli.",
          age: "Dayavittu nimma vayassu heli.",
          phone: "Dayavittu 10 ankada phone number heli.",
          aadhaar: "Dayavittu 12 ankada Aadhaar number heli.",
          symptoms: "Dayavittu nimma lakshanagalu heli.",
        },
        noInputRetry: "Nimma dhwani spashtavagilla. Dayavittu mathe heli.",
        invalidPhone: "Phone number 10 ankagalu irabeku. Mathe heli.",
        invalidAadhaar: "Aadhaar 12 ankagalu irabeku. Mathe heli.",
        captured: (label, value) => `${label} ${value} bharisalagide.`,
        completed: "Voice registration mugidide. Dayavittu details nodi.",
      },
      Malayalam: {
        intro: "Voice registration thudangi. Njan oronnayi chodikam.",
        prompts: {
          name: "Dayavayi ningalude peru parayuka.",
          age: "Dayavayi ningalude vayassu parayuka.",
          phone: "Dayavayi 10 digit phone number parayuka.",
          aadhaar: "Dayavayi 12 digit Aadhaar number parayuka.",
          symptoms: "Dayavayi ningalude lakshanangal parayuka.",
        },
        noInputRetry: "Ningal paranjathu clear alla. Dayavayi veendum parayuka.",
        invalidPhone: "Phone number 10 digit aayirikanam. Veendum parayuka.",
        invalidAadhaar: "Aadhaar 12 digit aayirikanam. Veendum parayuka.",
        captured: (label, value) => `${label} ${value} fill cheythu.`,
        completed: "Voice registration kazhinju. Dayavayi details parishodhikkuka.",
      },
      Punjabi: {
        intro: "Voice registration shuru ho gaya hai. Main ik ik detail puchanga.",
        prompts: {
          name: "Kirpa karke apna naam daso.",
          age: "Kirpa karke apni umar daso.",
          phone: "Kirpa karke 10 ank da phone number daso.",
          aadhaar: "Kirpa karke 12 ank da Aadhaar number daso.",
          symptoms: "Kirpa karke apne symptoms daso.",
        },
        noInputRetry: "Main thik tarah nahi suneya. Kirpa karke dubara bolo.",
        invalidPhone: "Phone number 10 ank da hona chahida. Dubara bolo.",
        invalidAadhaar: "Aadhaar 12 ank da hona chahida. Dubara bolo.",
        captured: (label, value) => `${label} ${value} fill kar ditta gaya hai.`,
        completed: "Voice registration mukammal ho gaya. Kirpa karke details check karo.",
      },
    };
    return packs[selectedLanguage.name] ?? packs.English;
  }, [selectedLanguage]);

  const speak = (message: string) =>
    new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = selectedLanguage.code;
      utterance.rate = 0.95;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });

  const sanitizeDigits = (input: string) => input.replace(/\D/g, "");

  const listenOnce = (SpeechCtor: new () => SpeechRecognitionType, timeoutMs: number) =>
    new Promise<string>((resolve, reject) => {
      const recognition = new SpeechCtor();
      recognition.lang = selectedLanguage.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      let resolved = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolved = true;
        resolve(transcript.trim());
      };

      recognition.onerror = () => {
        if (!resolved) reject(new Error("Voice capture failed"));
      };

      recognition.onend = () => {
        if (!resolved) resolve("");
      };

      recognition.start();
      window.setTimeout(() => recognition.stop(), timeoutMs);
    });

  const validateVoiceInput = (key: StepKey, raw: string) => {
    const clean = raw.trim();
    if (!clean) return { valid: false, value: "" };
    if (key === "age") {
      const digits = sanitizeDigits(clean);
      if (!digits) return { valid: false, value: "" };
      return { valid: true, value: String(Math.max(1, Number(digits))) };
    }
    if (key === "phone") {
      const digits = sanitizeDigits(clean);
      return { valid: digits.length === 10, value: digits.slice(0, 10) };
    }
    if (key === "aadhaar") {
      const digits = sanitizeDigits(clean);
      return { valid: digits.length === 12, value: digits.slice(0, 12) };
    }
    return { valid: true, value: clean };
  };

  const applyStepValue = (key: StepKey, value: string) => {
    setForm((prev) => ({
      ...prev,
      language: selectedLanguage.name,
      name: key === "name" ? value : prev.name,
      age: key === "age" ? Number(value) : prev.age,
      phone: key === "phone" ? value : prev.phone,
      aadhaar: key === "aadhaar" ? value : prev.aadhaar,
      symptoms: key === "symptoms" ? value : prev.symptoms,
    }));
  };

  const startGuidedVoice = async () => {
    const SpeechCtor = (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechCtor) {
      setError("Voice input is unavailable in this browser. Please enter details manually.");
      return;
    }

    const sessionId = Date.now();
    sessionRef.current = sessionId;

    setVoiceActive(true);
    setError("");
    setVoiceStepIndex(0);

    await speak(voiceCopy.intro);

    try {
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
        if (sessionRef.current !== sessionId) return;

        const step = steps[stepIndex];
        setVoiceStepIndex(stepIndex);

        let valid = false;
        let filledValue = "";

        while (!valid) {
          if (sessionRef.current !== sessionId) return;

          await speak(voiceCopy.prompts[step.key]);
          const response = await listenOnce(SpeechCtor, step.timeout);
          const parsed = validateVoiceInput(step.key, response);

          if (!parsed.valid) {
            if (!response.trim()) {
              await speak(voiceCopy.noInputRetry);
            } else if (step.key === "phone") {
              await speak(voiceCopy.invalidPhone);
            } else if (step.key === "aadhaar") {
              await speak(voiceCopy.invalidAadhaar);
            } else {
              await speak(voiceCopy.noInputRetry);
            }
            continue;
          }

          filledValue = parsed.value;
          valid = true;
          applyStepValue(step.key, filledValue);
          await speak(voiceCopy.captured(step.label, filledValue));
        }

        setVoiceStepIndex(stepIndex + 1);
      }

      await speak(voiceCopy.completed);
    } catch {
      setError("Voice registration was interrupted. Please retry or fill manually.");
    } finally {
      if (sessionRef.current === sessionId) {
        setVoiceActive(false);
      }
    }
  };

  const voiceComplete = voiceStepIndex >= steps.length;

  const resetVoice = () => {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setVoiceStepIndex(0);
    setVoiceActive(false);
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.aadhaar || !form.symptoms) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      const payload = await registerPatient(form);
      setResult(payload);
      const tokenPath = `/token/${payload.token}`;
      const popup = window.open(tokenPath, "_blank", "noopener,noreferrer");
      if (!popup) {
        navigate(tokenPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-200 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-sm md:p-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" /> Back to Home
        </Link>

        {mode === "select" && (
          <section>
            <h1 className="text-5xl font-black text-slate-900">Patient Registration</h1>
            <p className="mt-3 text-2xl text-slate-600">Select your preferred language</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {languageOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setSelectedLanguage(option);
                    setForm((prev) => ({ ...prev, language: option.name }));
                  }}
                  className={`rounded-2xl border-2 p-6 text-center transition ${
                    selectedLanguage.name === option.name ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <p className="text-4xl font-bold text-slate-900">{option.name}</p>
                  <p className="mt-2 text-3xl text-slate-600">{option.native}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  setMode("voice");
                  resetVoice();
                }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-2xl font-semibold text-white"
              >
                <Mic className="h-7 w-7" /> Voice Registration
              </button>
              <button
                onClick={() => setMode("manual")}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-blue-500 px-6 py-5 text-2xl font-semibold text-blue-600"
              >
                <FileText className="h-7 w-7" /> Manual Entry
              </button>
            </div>
          </section>
        )}

        {mode === "voice" && (
          <section>
            <h2 className="text-5xl font-black text-slate-900">Voice Registration</h2>
            <div className="mt-6 rounded-3xl bg-slate-200 p-10 text-center">
              <p className="text-4xl text-slate-700">
                {voiceComplete ? "All voice steps captured" : voiceCopy.prompts[(activeStep?.key ?? "name") as StepKey]}
              </p>
              <button
                onClick={startGuidedVoice}
                disabled={voiceActive}
                className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-indigo-700 text-white disabled:opacity-50"
              >
                {voiceActive ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
              </button>
              <p className="mt-5 text-3xl text-slate-600">{voiceActive ? "Listening and auto-filling..." : "One click starts complete voice flow"}</p>
            </div>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => {
                const value =
                  step.key === "name"
                    ? form.name
                    : step.key === "age"
                      ? String(form.age || "")
                      : step.key === "phone"
                        ? form.phone
                        : step.key === "aadhaar"
                          ? form.aadhaar
                          : form.symptoms;
                const done = index < voiceStepIndex || (voiceComplete && Boolean(value));
                return (
                  <div key={step.key} className="flex items-center justify-between rounded-2xl bg-slate-100 px-6 py-4">
                    <p className="text-4xl font-semibold text-slate-800">{step.label}</p>
                    <p className={`text-3xl ${done ? "text-emerald-600" : "text-slate-500"}`}>
                      {value ? value : done ? "Done" : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>

            {error && <p className="mt-4 text-lg text-rose-600">{error}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setMode("select")} className="rounded-xl border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700">
                Cancel
              </button>
              <button
                onClick={() => setMode("manual")}
                className="rounded-xl border border-blue-300 px-6 py-3 text-lg font-semibold text-blue-700"
              >
                Review in Manual Form
              </button>
            </div>
          </section>
        )}

        {mode === "manual" && (
          <section>
            <h2 className="text-4xl font-black text-slate-900">Manual Registration</h2>
            <p className="mt-2 text-slate-600">Language: {selectedLanguage.name}</p>
            <form onSubmit={submit} className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="rounded-lg border p-3" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="rounded-lg border p-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="rounded-lg border p-3" placeholder="Aadhaar" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} />
              <input className="rounded-lg border p-3" type="number" min={0} placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
              <select className="rounded-lg border p-3" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                {languageOptions.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setMode("voice")} className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 p-3 font-medium text-blue-700">
                <Mic className="h-4 w-4" /> Continue with Voice
              </button>
              <textarea
                className="md:col-span-2 min-h-28 rounded-lg border p-3"
                placeholder="Symptoms"
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              />
              {error && <p className="md:col-span-2 text-sm text-rose-600">{error}</p>}
              <button type="submit" className="md:col-span-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-3 font-semibold text-white">
                Generate Token
              </button>
            </form>
          </section>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col gap-4 rounded-xl border bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Token Number</p>
              <p className="text-3xl font-bold text-blue-700">{result.token}</p>
              <p className="text-slate-700">Doctor: {result.doctorName}</p>
              <p className="text-slate-700">Department: {result.department}</p>
              <p className="text-slate-700">Severity: {result.severity}/10</p>
            </div>
            <QRCodeSVG value={result.token} size={112} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
