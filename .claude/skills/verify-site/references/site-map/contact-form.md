# Contact form (`/contact`)

A privacy-aware message form plus direct contact details.

## Sub-features

- Fields: name (optional, `#name`), safest way to reach you (required, `#reach`), "Is it safe for us to leave a message?" pills (Yes / No / Not sure, default Not sure), message (required, `#message`).
- Validation: client-side; errors render below fields (`#reach-error`, `#message-error`), set `aria-invalid`, and focus moves to the first invalid field.
- Submit: builds a `mailto:` to doenation720@gmail.com with all fields in the body, then shows a `role=status` success panel with "Write another message".
- Side column: neon "hello" photo (`hello.jpg`, from the original site), phone, email, "Aurora, Colorado", address-not-public note.

## Where it lives

- Source: `src/components/ContactForm.tsx`, `src/app/contact/page.tsx`.

## Driving it with control-site

```bash
node $C goto /contact
node $C click 'role=button[name="Send message"]'      # empty submit → errors
node $C form-state                                    # invalidCount 2 (reach, message), focused "reach", choices.safe ["unsure"]
node $C type '#reach' '555-0100' && node $C type '#message' 'Hello'
node $C click 'label:has(input[value="no"])'          # pills are labels around sr-only radios
node $C click 'role=button[name="Send message"]'
node $C form-state                                    # form replaced: messages[0] starts "Your email app should now be open."
```

## Gotchas

- The Yes / No / Not sure pills are `<label>`s wrapping visually-hidden radios. Click the label (`label:has(input[value="yes|no|unsure"])`). `role=radio[name="No"]` is covered by its label and can't be clicked, and unquoted `text=No` is a substring match that hits "Now"/"Not sure".

- No backend: messages depend on the visitor having an email app. A server-side email service (for example Resend) is a possible future improvement.
- Fields use `autoComplete="off"` on purpose (shared devices).
