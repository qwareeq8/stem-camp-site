import { Page, Btn } from "../ui.jsx";

export default function NotFound() {
  return (
    <Page eyebrow="404" title="Page not found" sub="That page is not in this notebook.">
      <Btn to="/" variant="accent">Back to home</Btn>
    </Page>
  );
}
