import { useEffect, useState } from "react";
import { Copy, KeyRound, CheckCircle2 } from "lucide-react";

export default function Activation() {
  const [machineId, setMachineId] = useState("");
  const [license, setLicense] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.api.getMachineId().then(setMachineId);
  }, []);

    async function activate() {
        setError("");

        const ok = await window.api.activateLicense(license);

        if (ok) {
            window.location.reload();
        } else {
            setError("Cette licence est invalide ou ne correspond pas à cet ordinateur.");
        }
    }

  async function copyMachineId() {
    await navigator.clipboard.writeText(machineId);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl bg-white grid grid-cols-2">

        {/* Left panel */}

        <div className="bg-blue-600 text-white p-10 flex flex-col justify-between">

          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <KeyRound size={28} />
            </div>

            <h1 className="text-3xl font-bold mt-8">
              Auto École Manager
            </h1>

            <p className="mt-4 text-blue-100 leading-relaxed">
              Merci pour votre achat.
              <br />
              Cette application doit être activée avant sa première utilisation.
            </p>
          </div>

          <div className="text-sm text-blue-100 space-y-2">
            <p>✓ Activation unique par ordinateur</p>
            <p>✓ Fonctionne hors connexion après activation</p>
            <p>✓ Licence sécurisée</p>
          </div>

        </div>

        {/* Right panel */}

        <div className="p-10">

          <h2 className="text-2xl font-bold text-slate-800">
            Activation
          </h2>

          <p className="text-slate-500 mt-2">
            Envoyez cet identifiant au développeur pour recevoir votre licence.
          </p>

          <div className="mt-8">
            <label className="text-sm font-semibold text-slate-700">
              Identifiant de la machine
            </label>

            <div className="relative mt-2">
              <textarea
                readOnly
                value={machineId}
                className="w-full h-28 rounded-xl border bg-slate-50 p-4 pr-14 text-sm resize-none"
              />

              <button
                onClick={copyMachineId}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-200 transition"
              >
                {copied ? (
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />
                ) : (
                  <Copy
                    size={18}
                    className="text-slate-500"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-sm font-semibold text-slate-700">
              Clé de licence
            </label>

            <textarea
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="Collez ici la licence reçue..."
              className="w-full h-40 mt-2 rounded-xl border p-4 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {error && (
                <p className="mt-3 text-sm text-red-600">
                {error}
                </p>
            )}
          </div>

          <button
            onClick={activate}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 text-white font-semibold shadow-lg"
          >
            Activer le logiciel
          </button>

        </div>

      </div>
    </div>
  );
}