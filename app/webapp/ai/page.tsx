import Script from "next/script";

export default function AI() {
  return (
    <>
      <iframe
        id="JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67"
        title="Axon: TaskFlow Guide"
        allow="geolocation; microphone; camera; fullscreen"
        src="https://eu.jotform.com/agent/01982cd8d8e7774fbebc0a2dd460c49e2c67?embedMode=iframe&background=0&shadow=1"
        className="w-full h-full border-none"
      ></iframe>
      <Script src="https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js"></Script>
      <Script id="jotform-embed-handler">
        {`window.jotformEmbedHandler("iframe[id='JotFormIFrame-01982cd8d8e7774fbebc0a2dd460c49e2c67']",
        "https://eu.jotform.com")`}
      </Script>
    </>
  );
}
