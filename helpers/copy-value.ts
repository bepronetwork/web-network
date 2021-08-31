export function CopyValue(value: string, inputId?: string) {
  let input: HTMLInputElement;

  if (!inputId) {
    input = document.createElement(`input`);
    input.style.display = `none`;
    document.body.appendChild(input)
  } else input = document.getElementById(inputId) as HTMLInputElement;

  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand('copy');

}
