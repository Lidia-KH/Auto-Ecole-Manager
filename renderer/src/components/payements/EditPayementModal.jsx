import { useState, useEffect } from "react";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditPaymentModal({ payment, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!payment) return;

    setForm({
      montant: payment.montant ?? 0,
      motif: payment.motif ?? "autre",
      scope: payment.scope ?? "formation",
      date_payement: payment.date_payement ?? "",
      note: payment.note ?? "",
    });
  }, [payment]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    await window.api.updatePayment({
      id: payment.id,
      ...form,
    });

    setLoading(false);
    onSaved();
  }

  async function handleDelete() {
    setLoading(true);
    await window.api.deletePayment(payment.id);
    setLoading(false);
    onDeleted();
  }

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">Modifier paiement</h2>
            <p className="text-xs text-gray-400">#{payment.id}</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">

          <Field label="Montant">
            <input
              type="number"
              className={inputCls}
              value={form.montant}
              onChange={e => set("montant", Number(e.target.value))}
            />
          </Field>

          <Field label="Motif">
            <select
              className={inputCls}
              value={form.motif}
              onChange={e => set("motif", e.target.value)}
            >
              <option value="formation">Formation</option>
              <option value="examen">Examen</option>
              <option value="autre">Autre</option>
            </select>
          </Field>

          <Field label="Scope">
            <select
              className={inputCls}
              value={form.scope}
              onChange={e => set("scope", e.target.value)}
            >
              <option value="formation">Formation</option>
              <option value="session">Session</option>
              <option value="exam">Examen</option>
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              className={inputCls}
              value={form.date_payement}
              onChange={e => set("date_payement", e.target.value)}
            />
          </Field>

          <Field label="Note">
            <input
              className={inputCls}
              value={form.note}
              onChange={e => set("note", e.target.value)}
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-3 py-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl"
            >
              Supprimer
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-500 border rounded-xl"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl"
            >
              {loading ? "..." : "Enregistrer"}
            </button>
          </div>

          {/* confirm delete */}
          {confirming && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex justify-between items-center">
              <p className="text-xs text-red-700">Supprimer ce paiement ?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirming(false)}>
                  Non
                </button>
                <button type="button" onClick={handleDelete}>
                  Oui
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}