export function CopyValue(value: string) {
  const input: HTMLTextAreaElement = document.createElement("textarea");
  input.style.display = "hidden";
  input.id = "made-input";
  input.value = value;
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}
