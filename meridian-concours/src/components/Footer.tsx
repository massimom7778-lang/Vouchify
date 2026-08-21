export default function Footer() {
  return (
    <footer className="border-t border-rule-strong">
      <div className="mx-auto max-w-[84rem] px-md py-2xl md:px-xl">
        <div className="grid gap-xl md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="font-display text-[1.25rem] font-light">
              Meridian&nbsp;<span className="text-accent">Concours</span>
            </p>
            <p className="mt-sm max-w-[46ch] text-small text-muted">
              Appointment-only care for exotic and collector cars. Six cars on site
              at a time, and a written record for every one of them.
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-lg gap-y-xs">
            {[
              ["The record", "#record"],
              ["Engagements", "#tiers"],
              ["Standing", "#standing"],
              ["Questions", "#questions"],
              ["Enquire", "#enquiry"],
            ].map(([label, href]) => (
              <li key={href}>
                <a href={href} className="text-small text-muted transition-colors duration-[160ms] ease-out hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2xl flex flex-col gap-sm border-t border-rule pt-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="label">
            Demonstration build · address, registration, and insurance details to be supplied
          </p>
          <p className="label tnum">Ref MC-0412 · 2026</p>
        </div>
      </div>
    </footer>
  );
}
