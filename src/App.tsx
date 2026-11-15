import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

// ВАЖНО: впишите сюда почту, на которую должны приходить письма.
// При первой отправке FormSubmit пришлёт на неё письмо с просьбой подтвердить адрес.
const RECIPIENT_EMAIL = "YOUR_EMAIL@example.com";

const TRANSCRIPT = `Привет, Дед Мороз! Честно! Я себя хорошо вёл и помогал маме, как мог! Я хочу чтобы у нас в семье было всё хорошо (хотя у нас и так отлично :)), я бы хотел на новый год на стол много конфет «Нильс» и «Рот фронт „Батончик“» (нильс такие разноцветные)! И именно мне снова две банки шоколадной пасты (и Амелии тоже). А подарочек хочу: Монитор 32" LG ULTRAGEAR 32GS60QA-B. Артикул на WB 1303721989. Ссылка: https://wildberries.ru/catalog/1303721989/detail.aspx?targetUrl=SN. Но самое главное про семью!!!
P.S. Забыл написать, что я полностью хотел на стол: 2 банки шоколадной пасты и конфет (описал выше). Дальше: 2 пачки чипсов: одна со вкусом сыра Lays и вторая со вкусом «Паприка») тоже Lays; Кола: любая, главное 2-е бутылки по 1,5 или 2 л; МНОГО ШОКОЛАДОК: 3 Snickers Super (которые двойные) и 3 Twix тоже больших! Вроде всё. Заранее спасибо. Кстати я хорошо разбираюсь в технике и в сфере IT, поэтому сделал для тебя сайт.`;

const WB_URL = "https://wildberries.ru/catalog/1303721989/detail.aspx?targetUrl=SN";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function useCountdown() {
  const calc = () => {
    const now = new Date();
    const target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Snow() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 14 + 10,
        duration: Math.random() * 5 + 6,
        delay: Math.random() * 6,
        drift: Math.random() * 80 - 40,
      })),
    []
  );
  return (
    <div aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={
            {
              left: `${f.left}vw`,
              fontSize: `${f.size}px`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        >
          ❄
        </span>
      ))}
    </div>
  );
}

type Status = "idle" | "sending" | "success" | "error";

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown();

  // ---------- Аудио ----------
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
      setAudioError(false);
    } catch {
      setAudioError(true);
      setPlaying(false);
    }
  };

  // ---------- Форма ----------
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // страница не перезагружается
    const form = e.currentTarget;
    const data = new FormData(form);

    if (RECIPIENT_EMAIL.startsWith("YOUR_EMAIL")) {
      setStatus("error");
      setErrorText("В коде не указана почта получателя (RECIPIENT_EMAIL в src/App.tsx).");
      return;
    }

    setStatus("sending");
    setErrorText("");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === "false" || json.success === false) {
        throw new Error(json.message || "Не удалось отправить сообщение");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Ошибка отправки");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-4 text-white">
      <Snow />

      <main className="relative z-10 my-6 w-full max-w-lg rounded-3xl border border-cyan-300/30 bg-white/10 p-6 text-center shadow-[0_0_40px_rgba(56,189,248,0.2)] backdrop-blur-md md:p-8">
        <div className="mb-3 text-5xl">🎅❄️</div>

        <h1 className="mb-2 text-3xl font-extrabold tracking-wide text-cyan-200">
          С Новым Годом!
        </h1>
        <p className="mb-5 text-sm text-blue-100/80">
          До наступления самого волшебного праздника осталось:
        </p>

        {/* Таймер */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {[
            { v: String(Math.max(0, days)), l: "дней" },
            { v: pad(hours), l: "часов" },
            { v: pad(minutes), l: "минут" },
            { v: pad(seconds), l: "секунд" },
          ].map((item) => (
            <div
              key={item.l}
              className="rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-3"
            >
              <div className="text-2xl font-black tabular-nums text-cyan-300 md:text-3xl">
                {item.v}
              </div>
              <div className="text-xs text-blue-200/70">{item.l}</div>
            </div>
          ))}
        </div>

        {/* Аудио */}
        <audio
          ref={audioRef}
          src="music.mp3"
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setAudioError(true)}
        />

        <button
          type="button"
          onClick={toggleAudio}
          aria-pressed={playing}
          className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-bold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500 active:scale-95"
        >
          <span>{playing ? "⏸️" : "▶️"}</span>
          <span>Аудио-расшифровка</span>
        </button>

        {audioError && (
          <p className="mb-3 text-sm text-rose-300">
            Не удалось воспроизвести аудиофайл. Проверьте, что music.mp3 лежит рядом с index.html.
          </p>
        )}

        <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/50 p-4 text-left text-sm leading-relaxed text-blue-50/90">
          <p className="whitespace-pre-line">{TRANSCRIPT}</p>
          <a
            href={WB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            🛒 Монитор LG UltraGear на Wildberries
          </a>
        </div>

        <div className="my-5 border-t border-cyan-300/20" />

        {/* Форма */}
        <h2 className="mb-3 text-xl font-bold text-cyan-200">✉️ Написать мне поздравление</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <input type="hidden" name="_subject" value="Новое сообщение с новогоднего сайта!" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          {/* honeypot от спама */}
          <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

          <input
            type="text"
            name="От_кого"
            required
            placeholder="От кого (твоё имя)"
            className="w-full rounded-xl border border-cyan-300/30 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-blue-200/50 focus:border-cyan-400 focus:outline-none"
          />
          <textarea
            name="Сообщение"
            rows={3}
            required
            placeholder="Напиши мне поздравление или сообщение..."
            className="w-full resize-none rounded-xl border border-cyan-300/30 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-blue-200/50 focus:border-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 font-bold text-white shadow-lg transition hover:from-emerald-400 hover:to-teal-500 active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            {status === "sending" ? "Отправляю… ✨" : "Отправить мне на почту 🎄"}
          </button>

          <div aria-live="polite">
            {status === "success" && (
              <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-center text-sm text-emerald-200">
                ✅ Сообщение отправлено! Спасибо за поздравление 🎁
              </p>
            )}
            {status === "error" && (
              <p className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-center text-sm text-rose-200">
                ⚠️ {errorText || "Не удалось отправить. Попробуйте ещё раз."}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
