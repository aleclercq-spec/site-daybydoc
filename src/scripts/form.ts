type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Message d'erreur en français pour un champ (chaîne vide si le champ est valide). */
export function messageFor(field: Field): string {
  const v = field.validity;
  // Un champ obligatoire rempli d'espaces est considéré comme vide.
  if (v.valueMissing || (field.required && field.value.trim() === "")) return field.tagName === "SELECT" ? "Merci de faire un choix." : "Merci de renseigner ce champ.";
  if (v.typeMismatch && (field as HTMLInputElement).type === "email") return "Cette adresse e-mail ne semble pas valide.";
  return "";
}

function setError(field: Field, message: string): void {
  const box = document.getElementById(`err-${field.name}`);
  if (box) box.textContent = message;
  if (message) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
}

/**
 * Validation française avant envoi. `novalidate` est posé ici et non dans le HTML : sans JavaScript,
 * la validation native du navigateur reste active. L'envoi lui-même est laissé à Netlify Forms.
 */
export function initForm(form: HTMLFormElement): void {
  form.noValidate = true;
  const fields = (): Field[] =>
    Array.from(form.querySelectorAll<Field>("input, select, textarea")).filter(
      (f) => f.type !== "hidden" && f.name !== "bot-field",
    );

  form.addEventListener("submit", (event) => {
    const trap = form.querySelector<HTMLInputElement>('[name="bot-field"]');
    if (trap && trap.value) {
      event.preventDefault();
      return;
    }
    let first: Field | null = null;
    for (const f of fields()) {
      const message = messageFor(f);
      setError(f, message);
      if (message && !first) first = f;
    }
    if (first) {
      event.preventDefault();
      first.focus();
    }
  });

  const revalidate = (event: Event) => {
    const f = event.target as Field;
    if (f.getAttribute?.("aria-invalid") === "true") setError(f, messageFor(f));
  };
  form.addEventListener("input", revalidate);
  form.addEventListener("change", revalidate);
  form.addEventListener("focusout", (event) => {
    const f = event.target as Field;
    if (fields().includes(f) && f.value !== "") setError(f, messageFor(f));
  });
}
